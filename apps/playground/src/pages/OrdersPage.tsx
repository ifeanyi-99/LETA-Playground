import * as React from 'react';
import {
  ALL_ORDER_COLUMNS,
  AVATAR_PHOTOS,
  Badge,
  BROADCASTED_ORDER_COLUMNS,
  BulkActionsToolbar,
  Button,
  CREATED_BY_COLUMN,
  DateTimePicker,
  DesktopDropdowns,
  DesktopMenuOptions,
  LAST_UPDATED_COLUMN,
  LoadingOverlay,
  ORDER_TABLE_COLUMNS,
  ORDER_TABLE_COLUMNS_FINISHED,
  SCHEDULED_ORDER_COLUMNS,
  Table,
  TableContainer,
  TableDataControl,
  Title,
  TopFilterSection,
  UNASSIGNED_ORDER_COLUMNS,
  type TableColumn,
  type TableRow,
  type TopFilterSectionItem,
} from '@leta/components';
import type { IconName } from '@leta/icons';
import { useStore } from '../store/useStore.js';
import type { NewOrderInput } from '../store/useStore.js';
import type { Order, OrderStatus } from '../store/types.js';
import { ORDER_STATUS_BADGE, ORDER_STATUS_ICON, ORDER_STATUS_LABEL } from '../store/types.js';
import { Popover, MenuPanel, MenuDivider } from '../components/Popover.js';
import { AddOrderDrawer } from '../components/AddOrderDrawer.js';

// ── Filter groups ───────────────────────────────────────────────────────────────
type FilterTab = 'unassigned' | 'dispatched' | 'finished' | 'all';

// Group → sub-statuses, mirroring the Figma status-filter dropdowns
// (Unassigned `606:138936`, Dispatched `608:74407`, Finished `852:166443`).
// Broadcasted is Unassigned; Assigned belongs to Dispatched (not Unassigned).
// Returned is Unassigned (the goods came back and need re-dispatching — no driver);
// `returning` (in-transit back) stays in Dispatched. Finished = terminal only.
const GROUP_STATUSES: Record<Exclude<FilterTab, 'all'>, OrderStatus[]> = {
  unassigned: ['scheduled', 'pending', 'broadcasted', 'returned'],
  dispatched: ['assigned', 'at-depot', 'in-transit', 'returning', 'arrived'],
  finished: ['delivered', 'cancelled'],
};

const ROWS_PER_PAGE = 10;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Optional columns (Columns control) ───────────────────────────────────────────
// Hidden by default — the Figma status tables don't render them. Toggled on from the
// Columns dropdown; any active extra splices in before Status and switches the table
// into horizontal-scroll mode (spec §4.3: pinned Order ID/Actions, middle scrolls).
// Both LAST_UPDATED_COLUMN and CREATED_BY_COLUMN are canonical presets from
// @leta/components — Created By renders the `user-cell` (avatar + name + email);
// the playground only supplies the per-row name/email/avatarSrc data below.
// Clustered/randomized creators — some carry a photo (the exact Figma Avatar
// Photo 1/2/3 images, shipped as @leta/components assets), the rest render the
// empty-teal avatar with their initials. Assigned deterministically per order.
// Two automated sources are mixed in (spec §2.2): "Storefront" orders (renders
// the `api-cell` default — Auto-created / From online store / Integration icon)
// and "API" orders (Auto-created / From connected app / Code icon — distinct
// from Integration, which stays reserved for Storefront/automatic-order use).
type Creator =
  | { source: 'human'; name: string; email: string; avatarSrc?: string }
  | { source: 'storefront' }
  | { source: 'api' };

const CREATORS: Creator[] = [
  { source: 'human', name: 'Aisha Mohamed', email: 'aisha.mohamed@leta.ai', avatarSrc: AVATAR_PHOTOS[0] },
  { source: 'human', name: 'Grace Wanjiru', email: 'grace.wanjiru@leta.ai' },
  { source: 'human', name: 'Samuel Mwangi', email: 'samuel.mwangi@leta.ai', avatarSrc: AVATAR_PHOTOS[1] },
  { source: 'human', name: 'Fatuma Hassan', email: 'fatuma.hassan@leta.ai' },
  { source: 'human', name: 'Peter Kamau', email: 'peter.kamau@leta.ai', avatarSrc: AVATAR_PHOTOS[2] },
  { source: 'storefront' },
  { source: 'api' },
];
type ExtraColumnKey = 'lastUpdated' | 'createdBy';
const EXTRA_COLUMN_OPTIONS: { key: ExtraColumnKey; label: string }[] = [
  { key: 'lastUpdated', label: 'Last Updated' },
  { key: 'createdBy', label: 'Created By' },
];

function formatCreated(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—\n';
  const date = `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${date}\n${h}:${m} ${ampm}`;
}

function canDispatch(o: Order): boolean {
  return GROUP_STATUSES.unassigned.includes(o.status);
}

// ── Mock SLA state + duration (Table spec §2.3, Doc 4) ───────────────────────────
// Deterministic per order until the Configuration spec (Doc 2) defines real SLA
// values — then slaStateFor/mockDurationFor are replaced by stage-clock logic.
// §2.3.1 in-progress: Status and Duration double the SAME three-state signal —
// At Risk → warning icon on the badge + warning-colored duration; Delayed →
// error icon + error-colored duration. §2.3.2 completed (Delivered/Cancelled):
// binary Within/Beyond OFT — no Status icon, finished DurationLabel only.
// Scheduled/Returned carry neither (no running SLA; counter reset on return).
type SlaState = 'on-target' | 'at-risk' | 'delayed';
function idHash(id: string): number {
  let s = 0;
  for (let i = 0; i < 5; i++) s += id.charCodeAt(i);
  return s;
}
function slaStateFor(o: Order): SlaState {
  const h = idHash(o.id) % 5;
  return h === 3 ? 'at-risk' : h === 4 ? 'delayed' : 'on-target';
}
// Plausible per-state mock times (echoing the wireframe samples): on-target
// short, at-risk near the SLA boundary, delayed/beyond past it.
function mockDurationFor(o: Order, sla: SlaState, finished: boolean): string {
  const h = idHash(o.id);
  const seconds = (h * 7) % 60;
  let minutes: number;
  if (finished) minutes = sla === 'delayed' ? 30 + (h % 31) : 8 + (h % 25);
  else if (sla === 'delayed') minutes = 13 + (h % 22);
  else if (sla === 'at-risk') minutes = 9 + (h % 5);
  else minutes = 2 + (h % 10);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m ${seconds}s`;
}

// ── Overlay model ────────────────────────────────────────────────────────────────
type OverlayKind = 'created' | 'filter' | 'sort' | 'importExport' | 'subStatus' | 'rowActions' | 'selection' | 'columns';
interface OverlayState {
  kind: OverlayKind;
  anchor: DOMRect | null;
  orderId?: string;
  group?: Exclude<FilterTab, 'all'>;
}

// Row overflow menu (Figma `202:90314`) — three divider-separated groups: the main
// actions, the "Special Options Group", then the destructive action. DesktopMenuOptions
// renders leading icons outlined automatically, so these are the base names.
const ROW_ACTION_GROUPS: { label: string; icon: IconName }[][] = [
  [
    { label: 'View Logs', icon: 'Document' },
    { label: 'Edit Order', icon: 'Edit' },
    { label: 'Add To Trip', icon: 'Add' },
    { label: 'Update Status', icon: 'Update' },
  ],
  [
    { label: 'Reschedule Order', icon: 'Calendar' },
    { label: 'Add Comment', icon: 'Comment' },
  ],
];

// Enter/exit motion for the floating Bulk Actions toolbar (slides up in / down out).
const BULKBAR_STYLE_ID = 'leta-bulkbar-motion';
const BULKBAR_CSS = `
@keyframes leta-bulkbar-in  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes leta-bulkbar-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(16px); } }
@keyframes leta-table-in    { from { opacity: 0; } to { opacity: 1; } }
.leta-bulkbar-enter { animation: leta-bulkbar-in 200ms cubic-bezier(0.16, 1, 0.3, 1); }
.leta-bulkbar-exit  { animation: leta-bulkbar-out 180ms cubic-bezier(0.4, 0, 1, 1) forwards; }
@media (prefers-reduced-motion: reduce) { .leta-bulkbar-enter, .leta-bulkbar-exit { animation: none; } }
`;
function ensureBulkbarStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(BULKBAR_STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = BULKBAR_STYLE_ID;
  el.textContent = BULKBAR_CSS;
  document.head.appendChild(el);
}

export function OrdersPage(): React.ReactElement {
  ensureBulkbarStyles();
  const orders = useStore((s) => s.orders);
  const getDriver = useStore((s) => s.getDriver);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);
  const cancelOrder = useStore((s) => s.cancelOrder);
  const pushToast = useStore((s) => s.pushToast);
  const addOrder = useStore((s) => s.addOrder);
  // Active client config — drives the Add Order drawer's fields/sections.
  const clientConfig = useStore((s) => s.client.config);

  // Optional columns from the Columns control (all off by default = the Figma tables).
  // Extras just join the flex-fill; the table (scrollX="auto", spec §4.3) flips to
  // h-scroll + pinned anchors ONLY if the column minimums exceed the container.
  const [extraCols, setExtraCols] = React.useState<Record<ExtraColumnKey, boolean>>({
    lastUpdated: false,
    createdBy: false,
  });
  const [filterTab, setFilterTab] = React.useState<FilterTab>('unassigned');
  // Default Unassigned view = the Scheduled sub-status (shows the badge), per Figma.
  const [subStatus, setSubStatus] = React.useState<OrderStatus | null>('scheduled');
  const [page, setPage] = React.useState(1);
  // Selection is keyed by order ID and persists across pages (the bulk toolbar +
  // its "N selected" overlay manage selections from every page, not just the
  // current one). The Table's own index-based selection is re-seeded per page
  // from this set (see the Table `key` + each row's `selected` flag).
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set());
  const [tableKey, setTableKey] = React.useState(0);
  const [createdLabel, setCreatedLabel] = React.useState('Created: Today');
  // Live search query — matches Order ID, recipient name, or recipient phone.
  const [search, setSearch] = React.useState('');
  // The Orders view boots into the Empty State (wireframe 1176:171818); the
  // populated table appears only after a load is triggered (Add Order/Refresh).
  const [loaded, setLoaded] = React.useState(false);
  // Region reload: Add Order / Refresh show the LETA loader over the table
  // region for a ~2s simulated re-fetch; the overlay itself holds until the
  // loader animation completes its full cycle, then the (re)loaded table shows.
  const [refreshing, setRefreshing] = React.useState(false);
  const refreshTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const runLoad = () => {
    if (refreshing) return;
    setRefreshing(true);
    refreshTimer.current = setTimeout(() => {
      setRefreshing(false);
      setLoaded(true);
      setTableKey((k) => k + 1);
    }, 2000);
  };
  const handleRefresh = runLoad;
  // Add Order — opens the config-aware side drawer (empty-state CTA + toolbar both
  // route here). Submitting creates the order, reveals the table, and toasts.
  const [addOrderOpen, setAddOrderOpen] = React.useState(false);
  const handleAddOrder = () => setAddOrderOpen(true);
  const handleOrderCreated = (input: NewOrderInput, scheduled: boolean) => {
    const created = addOrder(input);
    setAddOrderOpen(false);
    // Land the new order in the view it belongs to so it's visible.
    setFilterTab('unassigned');
    setSubStatus(scheduled ? 'scheduled' : 'pending');
    setPage(1);
    setLoaded(true);
    setTableKey((k) => k + 1);
    pushToast({
      type: 'success',
      title: 'Order created',
      subtitle: scheduled ? 'Your order is scheduled for delivery.' : 'Your order is ready for dispatch.',
      cta: {
        label: 'View Order',
        onClick: () => pushToast({ type: 'success', title: created.id, subtitle: 'Order detail view is coming soon.' }),
      },
    });
  };
  React.useEffect(() => () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); }, []);
  const [overlay, setOverlay] = React.useState<OverlayState | null>(null);

  // Live duration timer — recompute each second; `duration` cells re-render.
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Bulk toolbar mount lifecycle — keep it mounted briefly after deselect so its
  // exit animation can play before unmount.
  const bulkVisible = selectedIds.size > 0;
  const [bulkMounted, setBulkMounted] = React.useState(false);
  React.useEffect(() => {
    if (bulkVisible) { setBulkMounted(true); return; }
    if (!bulkMounted) return;
    const t = setTimeout(() => setBulkMounted(false), 200);
    return () => clearTimeout(t);
  }, [bulkVisible, bulkMounted]);

  // Close the "N selected" overlay once nothing is selected (its anchor — the
  // toolbar — is gone, and an empty list has nothing to manage).
  React.useEffect(() => {
    if (selectedIds.size === 0) setOverlay((o) => (o?.kind === 'selection' ? null : o));
  }, [selectedIds]);

  // ── Filtering + pagination ─────────────────────────────────────────────────
  // Search matches the field's promise ("Search orders by ID or recipient"):
  // Order ID, recipient name, or recipient phone — case-insensitive substring;
  // phones compare digits-only so "0712 345" matches "+254 712 345 678".
  const query = search.trim().toLowerCase();
  const queryDigits = query.replace(/\D/g, '');
  const filtered = React.useMemo(() => {
    return orders.filter((o) => {
      if (filterTab !== 'all' && !GROUP_STATUSES[filterTab].includes(o.status)) return false;
      if (subStatus && o.status !== subStatus) return false;
      if (query) {
        const idMatch = o.id.toLowerCase().includes(query);
        const nameMatch = o.customer.toLowerCase().includes(query);
        // Local-format queries ("0712...") also match the stored international
        // form ("+254 712...") — retry without the leading 0.
        const phoneDigits = o.phone.replace(/\D/g, '');
        const phoneMatch =
          queryDigits.length > 0 &&
          (phoneDigits.includes(queryDigits) ||
            (queryDigits.startsWith('0') && phoneDigits.includes(queryDigits.slice(1))));
        if (!idMatch && !nameMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [orders, filterTab, subStatus, query, queryDigits]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const clampedPage = Math.min(page, pageCount);
  const pageOrders = filtered.slice((clampedPage - 1) * ROWS_PER_PAGE, clampedPage * ROWS_PER_PAGE);

  // Reset page + clear selection (remount Table) when the filter changes.
  React.useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
    setTableKey((k) => k + 1);
  }, [filterTab, subStatus]);

  // On search change: back to page 1 and remount the Table so its index-based
  // internal selection re-seeds against the new row slice. Selection is KEPT
  // (it's ID-based across pages) — matching rows stay checked, and orders
  // filtered out of view remain selected in the bulk toolbar.
  React.useEffect(() => {
    setPage(1);
    setTableKey((k) => k + 1);
  }, [query]);

  const clearSelection = () => {
    setSelectedIds(new Set());
    setTableKey((k) => k + 1);
  };

  // Merge the current page's index-based selection (from the Table) into the
  // page-spanning `selectedIds`: drop this page's old ids, add its selected ones.
  const handleSelectionChange = (indices: number[]) => {
    const pageIds = pageOrders.map((o) => o.id);
    const pageIdSet = new Set(pageIds);
    const nowSelected = new Set(
      indices.map((i) => pageOrders[i]?.id).filter((id): id is string => Boolean(id)),
    );
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => !pageIdSet.has(id)));
      nowSelected.forEach((id) => next.add(id));
      return next;
    });
  };

  // Remove one order from the selection (the overlay's uncheck action). Re-seed the
  // Table so the row also unchecks if it's on the current page.
  const deselect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setTableKey((k) => k + 1);
  };

  // ── Per-status counts (for the sub-status dropdown) ─────────────────────────
  const countByStatus = React.useMemo(() => {
    const m = {} as Record<OrderStatus, number>;
    orders.forEach((o) => { m[o.status] = (m[o.status] ?? 0) + 1; });
    return m;
  }, [orders]);

  // Unique recipient names — drive the Basic Filter (Search) dropdown's checklist.
  const recipients = React.useMemo(
    () => [...new Set(orders.map((o) => o.customer))],
    [orders],
  );

  // ── Actions ────────────────────────────────────────────────────────────────
  const dispatchOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'broadcasted');
    pushToast({ type: 'success', title: 'Order dispatched', subtitle: `${orderId} is now broadcasted to nearby drivers.` });
  };

  const selectedOrders = (): Order[] => orders.filter((o) => selectedIds.has(o.id));

  const bulkDispatch = () => {
    const ids = selectedOrders().filter(canDispatch).map((o) => o.id);
    ids.forEach((id) => updateOrderStatus(id, 'broadcasted'));
    pushToast({ type: 'success', title: `${ids.length} order(s) dispatched`, subtitle: 'Broadcasted to nearby drivers.' });
    clearSelection();
  };

  const bulkCancel = () => {
    const ids = selectedOrders().map((o) => o.id);
    ids.forEach((id) => cancelOrder(id));
    pushToast({ type: 'error', title: `${ids.length} order(s) cancelled` });
    clearSelection();
  };

  const noop = (title = 'Coming soon') =>
    pushToast({ type: 'success', title, subtitle: 'This feature is in progress.' });

  // The toolbar / filter components fire handlers without the click event. Capture
  // the clicked control's rect in the click CAPTURE phase (fires before the handler,
  // for both real and programmatic clicks) so the overlay anchors to it regardless
  // of focus; fall back to the focused element.
  const triggerRectRef = React.useRef<DOMRect | null>(null);
  const captureTrigger = (e: React.MouseEvent) => {
    const btn = (e.target as HTMLElement).closest('button, [role="button"]');
    if (btn) triggerRectRef.current = btn.getBoundingClientRect();
  };
  const openFromFocus = (kind: OverlayKind, extra?: Partial<OverlayState>) => {
    const rect =
      triggerRectRef.current ??
      (document.activeElement instanceof HTMLElement ? document.activeElement.getBoundingClientRect() : null);
    setOverlay({ kind, anchor: rect, ...extra });
  };

  // ── Filter tabs ──────────────────────────────────────────────────────────────
  // The selected advanced filter shows its active sub-status as a delivery Badge
  // (Figma: "Unassigned [Scheduled]"). Clicking opens a status dropdown to pick a
  // sub-status within the group.
  // The pill badge is the SAME delivery badge as the table row uses for that status.
  const subBadge = (g: Exclude<FilterTab, 'all'>) =>
    filterTab === g && subStatus
      ? <Badge color={ORDER_STATUS_BADGE[subStatus]} label={ORDER_STATUS_LABEL[subStatus]} />
      : undefined;

  const TABS: TopFilterSectionItem[] = [
    { label: 'Unassigned', advanced: true, selected: filterTab === 'unassigned', badge: subBadge('unassigned') },
    { label: 'Dispatched', advanced: true, selected: filterTab === 'dispatched', badge: subBadge('dispatched') },
    { label: 'Finished', advanced: true, selected: filterTab === 'finished', badge: subBadge('finished') },
    { label: 'All', selected: filterTab === 'all' },
  ];

  const handleFilterClick = (index: number) => {
    const map: FilterTab[] = ['unassigned', 'dispatched', 'finished', 'all'];
    const next = map[index];
    if (!next) return;
    if (next === 'all') {
      // "All" isn't advanced — it filters to everything immediately, no dropdown.
      setFilterTab('all');
      setSubStatus(null);
      return;
    }
    // Advanced filters are pickers: clicking (in ANY state) only opens the dropdown
    // so the user sets which status to view. The table/selection change ONLY when a
    // sub-status is picked (see onPickStatus). Don't touch filterTab/subStatus here.
    openFromFocus('subStatus', { group: next });
  };

  // Commit a sub-status pick from a status dropdown: switch to its group + status.
  const handlePickStatus = (group: Exclude<FilterTab, 'all'>, status: OrderStatus) => {
    setFilterTab(group);
    setSubStatus(status);
  };

  // ── Columns + rows ─────────────────────────────────────────────────────────
  // Column set follows the order's lifecycle stage — each maps 1:1 to a Figma
  // wireframe instance (spec Part II Instances A–C), driven by the same
  // /table-column-layout spec used to set the wireframes:
  //  • All (search/triage) → ALL_ORDER_COLUMNS — no Checkbox/Driver/Trip/Batch/Actions;
  //    Order ID pins left on scroll; Duration shows "—" for scheduled rows.
  //  • Unassigned (no Driver/Trip; Actions = Dispatch + overflow, 154):
  //      – Scheduled/Returned → SCHEDULED_ORDER_COLUMNS (drops Duration & Batch;
  //        Returned shares this shape — no Trip/Batch/Duration — awaiting re-dispatch).
  //      – Broadcasted → BROADCASTED_ORDER_COLUMNS (adds Batch ID 90 after Order ID).
  //      – Pending → UNASSIGNED_ORDER_COLUMNS.
  //  • Dispatched → ORDER_TABLE_COLUMNS (full: Driver + Trip + Duration; Actions overflow-only, 64).
  //  • Finished (Delivered/Cancelled) → ORDER_TABLE_COLUMNS_FINISHED — same shape,
  //    but Actions renders a single "View Logs" button, no ⋯ menu (§2.1, 126px).
  const baseColumns: TableColumn[] =
    filterTab === 'all'
      ? ALL_ORDER_COLUMNS
      : filterTab === 'unassigned'
        ? subStatus === 'scheduled' || subStatus === 'returned'
          ? SCHEDULED_ORDER_COLUMNS
          : subStatus === 'broadcasted'
            ? BROADCASTED_ORDER_COLUMNS
            : UNASSIGNED_ORDER_COLUMNS
        : filterTab === 'finished'
          ? ORDER_TABLE_COLUMNS_FINISHED
          : ORDER_TABLE_COLUMNS;
  // Splice any active optional columns in between Created and Status (spec §4.3).
  const columns: TableColumn[] = React.useMemo(() => {
    const extras: TableColumn[] = [
      ...(extraCols.lastUpdated ? [LAST_UPDATED_COLUMN] : []),
      ...(extraCols.createdBy ? [CREATED_BY_COLUMN] : []),
    ];
    if (!extras.length) return baseColumns;
    const idx = baseColumns.findIndex((c) => c.label === 'Status');
    return idx === -1
      ? [...baseColumns, ...extras]
      : [...baseColumns.slice(0, idx), ...extras, ...baseColumns.slice(idx)];
  }, [baseColumns, extraCols]);

  const rows: TableRow[] = pageOrders.map((o) => {
    const driver = getDriver(o.driverId);
    const isFinished = o.status === 'delivered' || o.status === 'cancelled';
    // §2.3 SLA state — counting only for dispatched + pending/broadcasted rows;
    // finished rows keep their final verdict (at-risk collapses to on-target).
    const slaCounting = GROUP_STATUSES.dispatched.includes(o.status) || o.status === 'pending' || o.status === 'broadcasted';
    const rawSla = slaStateFor(o);
    const sla: SlaState = isFinished && rawSla === 'at-risk' ? 'on-target' : rawSla;
    const actionsCell: TableRow['cells'][number] = {
      type: 'actions',
      // Delivered/Cancelled are terminal — a single "View Logs" button replaces
      // the overflow menu entirely (no ⋯ in these states), per §2.1.
      actions: isFinished ? (
        <Button
          variant="secondary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            pushToast({ type: 'success', title: 'View Logs — coming soon', subtitle: 'This feature is in progress.' });
          }}
        >
          View Logs
        </Button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8px)' }}>
          {canDispatch(o) && (
            <Button
              variant="secondary"
              size="small"
              iconLeft="Proceed"
              onClick={(e) => { e.stopPropagation(); dispatchOrder(o.id); }}
            >
              Dispatch
            </Button>
          )}
          <Button
            variant="ghost"
            size="small"
            iconOnly="More"
            aria-label="More actions"
            onClick={(e) => {
              e.stopPropagation();
              setOverlay({ kind: 'rowActions', anchor: e.currentTarget.getBoundingClientRect(), orderId: o.id });
            }}
          />
        </div>
      ),
    };

    // One cell per possible column, keyed by the column's label, so the row always
    // aligns with whichever preset (`columns`) is active — added/removed columns
    // (Driver, Trip, Duration) just drop out. `''` is the no-label Actions column.
    // Duration falls back to '—' for scheduled orders that surface in a mixed view.
    const cellByLabel: Record<string, TableRow['cells'][number]> = {
      'Order ID': { type: 'manual-order', orderId: o.id, onCopyOrderId: () => navigator.clipboard.writeText(o.id) },
      'Batch ID': { type: 'sample', text: o.batchId ?? '—' }, // Broadcasted view only
      'Trip': { type: 'sample', text: '—' }, // no trip data in mock yet
      'Driver': { type: 'driver-cell', name: driver?.name ?? '—' },
      'Route': { type: 'address-cell', pickup: o.depot ?? o.pickup.label, dropoff: o.dropoff.label },
      'Recipient': { type: 'list-item', title: o.customer, subtext: o.phone },
      // Mock times until the Configuration spec lands (real stage-clock logic then).
      // Scheduled has no SLA yet; Returned's counter reset on return — both show "—"
      // when Duration surfaces in a mixed view (their own views drop the column).
      'Duration': o.status === 'scheduled' || o.status === 'returned'
        ? { type: 'sample', text: '—' }
        : {
            type: 'duration',
            durationVariant: isFinished ? 'finished' : 'active',
            durationStatus: sla,
            durationTime: mockDurationFor(o, sla, isFinished),
          },
      'Created': { type: 'date', date: formatCreated(o.createdAt) },
      'Last Updated': { type: 'date', date: formatCreated(o.createdAt) }, // toggle column
      'Created By': (() => {
        // toggle column → human (user-cell) or automated (api-cell) source (§2.2).
        // Storefront and API share the same Featured Icon (Integration, api-cell's
        // default) — only the subtext names the channel.
        const c = CREATORS[o.id.charCodeAt(0) % CREATORS.length]!;
        if (c.source === 'human') return { type: 'user-cell', name: c.name, email: c.email, avatarSrc: c.avatarSrc };
        if (c.source === 'storefront') return { type: 'api-cell', apiTitle: 'Auto-created', apiSubtext: 'From online store' };
        return { type: 'api-cell', apiTitle: 'Auto-created', apiSubtext: 'From connected app' };
      })(),
      'Status': {
        type: 'status',
        statusContent: <Badge color={ORDER_STATUS_BADGE[o.status]} label={ORDER_STATUS_LABEL[o.status]} />,
        // §2.3: SLA icon trails the badge only while the SLA is actively counting.
        statusIcon: slaCounting && sla === 'at-risk' ? 'warning' : slaCounting && sla === 'delayed' ? 'error' : undefined,
      },
      '': actionsCell,
    };
    const cells: TableRow['cells'] = columns.map((c) => cellByLabel[c.label ?? ''] ?? { type: 'sample', text: '' });

    return { selected: selectedIds.has(o.id), cells };
  });

  // The "Filter" toolbar button reflects advanced filter *rules* (its own dropdown),
  // not the status sub-filter (which shows as the badge on the Unassigned pill). No
  // advanced filter rules are applied yet → no count badge.
  const activeFilterCount = 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      onClickCapture={captureTrigger}
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-24px)',
        padding: '24px 24px 0',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Title text="Deliveries" variant="page-dialog" style={{ flexShrink: 0 }} />

      {/* Content frame — Figma pad [0,0,16,0]: reserves the 16px viewport gap below
          the table; the TableContainer fills it and the table scrolls internally.
          NOT keyed: the controls (search row + filter pills) must stay mounted
          across filter switches — the sliding active-filter ring can only animate
          between selections if TopFilterSection survives the switch. Only the
          table region below is keyed/remounted (replaying its enter animation).
          position:relative — the anchor for the contained LoadingOverlay, so the
          scrim dims only this region (toolbars + filters + table + pagination). */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', paddingBottom: 'var(--padding-16px)', position: 'relative' }}>
          {!loaded ? (
            // Boot state (wireframe 1176:171818): Search+Create toolbar only,
            // "No Orders Yet" + Add Order CTA. Add Order / Refresh trigger the
            // loader and reveal the populated table.
            <TableContainer
              fillHeight
              variant="empty"
              onAddOrder={handleAddOrder}
              controls={
                <TableDataControl
                  variant="search-create"
                  showAddOrder={false}
                  searchPlaceholder="Search by order or recipient..."
                  createdLabel={createdLabel}
                  onCreatedClick={() => openFromFocus('created')}
                  onFilterClick={() => openFromFocus('filter')}
                  onSortClick={() => openFromFocus('sort')}
                  onImportExportClick={() => openFromFocus('importExport')}
                />
              }
            />
          ) : (
          <TableContainer
            fillHeight
            // Zero matches (wireframe 945:210612): both toolbars stay — the
            // user's search/filters caused the state, so they must stay reachable.
            variant={filtered.length === 0 ? 'no-results' : 'default'}
            controls={
              <>
                <TableDataControl
                  variant="search-create"
                  searchPlaceholder="Search by order or recipient..."
                  searchValue={search}
                  onSearchChange={setSearch}
                  onSearchClear={() => setSearch('')}
                  filterCount={activeFilterCount}
                  createdLabel={createdLabel}
                  onCreatedClick={() => openFromFocus('created')}
                  onFilterClick={() => openFromFocus('filter')}
                  onSortClick={() => openFromFocus('sort')}
                  onAddOrderClick={handleAddOrder}
                  onImportExportClick={() => openFromFocus('importExport')}
                />
                <TableDataControl
                  variant="filters-column"
                  dataCount={`${filtered.length} Orders`}
                  onColumnsClick={() => openFromFocus('columns')}
                  onRefreshClick={handleRefresh}
                  filters={<TopFilterSection filters={TABS} onFilterClick={handleFilterClick} animatedSelection />}
                />
              </>
            }
            table={
              // Keyed wrapper: remounts (and replays the enter animation on) the
              // table alone when the view, page, or a reset changes — the controls
              // above stay mounted so the filter ring slides.
              <div
                key={`${filterTab}-${clampedPage}-${tableKey}`}
                style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'leta-table-in 200ms ease-in' }}
              >
              <Table
                rowVariant="complex"
                // No Checkbox on All (mixed statuses, no bulk actions) or Finished
                // (Delivered/Cancelled are terminal — nothing to bulk-action; matches
                // the Figma finished tables, which carry no checkbox column).
                selectable={filterTab !== 'all' && filterTab !== 'finished'}
                // §4.3 measured scroll: the table flips to h-scroll (pinned Order
                // ID/Actions) ONLY while its column minimums exceed the container —
                // e.g. optional columns on a dense view, or a narrowed window. On a
                // sparse view (Returned/Scheduled) extras just join the flex-fill.
                scrollX="auto"
                columns={columns}
                rows={rows}
                onSelectionChange={handleSelectionChange}
                page={clampedPage}
                pageCount={pageCount}
                onPageChange={setPage}
                countLabel={`Showing ${pageOrders.length} of ${filtered.length}`}
                rowsPerPage={ROWS_PER_PAGE}
                onRowsPerPageClick={() => noop('Rows per page')}
                fillHeight
              />
              </div>
            }
          />
          )}

          {/* Region reload overlay (Refresh) — contained: dims only this table
              region, holds until the loader completes a full cycle. Top edge
              extends up through the page column's 24px gap to sit 1px below the
              Title row (its divider stays undimmed). */}
          <LoadingOverlay contained open={refreshing} style={{ top: 'calc(-1 * var(--spacing-24px) + 1px)' }} />
        </div>

      {/* Bulk actions toolbar — slides up in / down out as the selection changes.
          Centered via flex (not translateX) so it doesn't fight the animation's
          transform; kept mounted through the exit by `bulkMounted`. */}
      {bulkMounted && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          <div className={bulkVisible ? 'leta-bulkbar-enter' : 'leta-bulkbar-exit'} style={{ pointerEvents: 'auto' }}>
            <BulkActionsToolbar
              selectionLabel={`${selectedIds.size} selected`}
              onSelectionClick={() => openFromFocus('selection')}
              actions={
                <>
                  <Button variant="ghost" size="medium" iconLeft="Proceed" onClick={bulkDispatch}>Dispatch</Button>
                  <Button variant="ghost" size="medium" iconLeft="Add" iconOutlined onClick={() => noop('Add To Trip')}>Add To Trip</Button>
                  <Button variant="ghost-error" size="medium" iconLeft="Delete" iconOutlined onClick={bulkCancel}>Cancel Order</Button>
                </>
              }
              onOverflowClick={() => noop()}
              onClose={clearSelection}
            />
          </div>
        </div>
      )}

      {/* Overlays */}
      {overlay && <OverlayHost overlay={overlay} onClose={() => setOverlay(null)} pushToast={pushToast} cancelOrder={cancelOrder} subStatus={subStatus} onPickStatus={handlePickStatus} countByStatus={countByStatus} recipients={recipients} selectedOrderList={selectedOrders()} deselect={deselect} onCreatedLabel={setCreatedLabel} extraCols={extraCols} onToggleColumn={(k) => setExtraCols((p) => ({ ...p, [k]: !p[k] }))} />}

      {/* Add Order side drawer — config-aware order creation. */}
      <AddOrderDrawer
        open={addOrderOpen}
        config={clientConfig}
        onClose={() => setAddOrderOpen(false)}
        onSubmit={handleOrderCreated}
      />
    </div>
  );
}

// ── Overlay host ──────────────────────────────────────────────────────────────

interface OverlayHostProps {
  overlay: OverlayState;
  onClose: () => void;
  pushToast: (t: { type: 'success' | 'warning' | 'error'; title: string; subtitle?: string }) => void;
  cancelOrder: (id: string) => void;
  subStatus: OrderStatus | null;
  onPickStatus: (group: Exclude<FilterTab, 'all'>, status: OrderStatus) => void;
  countByStatus: Record<OrderStatus, number>;
  recipients: string[];
  selectedOrderList: Order[];
  deselect: (id: string) => void;
  onCreatedLabel: (label: string) => void;
  extraCols: Record<ExtraColumnKey, boolean>;
  onToggleColumn: (key: ExtraColumnKey) => void;
}

function OverlayHost({ overlay, onClose, pushToast, cancelOrder, subStatus, onPickStatus, countByStatus, recipients, selectedOrderList, deselect, onCreatedLabel, extraCols, onToggleColumn }: OverlayHostProps): React.ReactElement {
  const { kind, anchor, orderId, group } = overlay;

  if (kind === 'selection') {
    // The bulk toolbar's "N selected ⌄" overlay (Figma `945:221486`): a 250px combobox
    // listing every selected order (across all pages) as a checked checkbox row;
    // unchecking removes it from the selection. Opens *above* the bottom-fixed toolbar
    // (top-start), bottom-anchored so it grows/shrinks upward as items are deselected.
    return (
      <Popover anchorRect={anchor} onClose={onClose} placement="top-start">
        <DesktopDropdowns variant="combobox" style={{ width: 250 }}>
          {/* No scrollbar chrome — the height is tuned so the 5th row is cut off
              mid-row, which IS the scroll affordance (per design direction). */}
          <div className="leta-popover-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4px)', padding: 'var(--padding-8px)', maxHeight: 248, overflowY: 'auto', overscrollBehavior: 'contain' }}>
            {selectedOrderList.map((o) => (
              <DesktopMenuOptions
                key={o.id}
                type="checkbox-selection"
                label={o.id}
                selected
                onSelect={() => deselect(o.id)}
              />
            ))}
          </div>
        </DesktopDropdowns>
      </Popover>
    );
  }

  if (kind === 'columns') {
    // The "Columns" control — a checkbox combobox of the optional columns hidden by
    // default (the Figma tables don't render them). Checking one adds it to the table
    // (before Status) and switches the table into horizontal-scroll mode with pinned
    // anchors (spec §4.3). Stays open so several can be toggled in one visit.
    return (
      <Popover anchorRect={anchor} onClose={onClose} placement="bottom-end">
        <DesktopDropdowns variant="combobox" style={{ width: 250 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4px)', padding: 'var(--padding-8px)' }}>
            {EXTRA_COLUMN_OPTIONS.map((opt) => (
              <DesktopMenuOptions
                key={opt.key}
                type="checkbox-selection"
                label={opt.label}
                selected={extraCols[opt.key]}
                onSelect={() => onToggleColumn(opt.key)}
              />
            ))}
          </div>
        </DesktopDropdowns>
      </Popover>
    );
  }

  if (kind === 'created') {
    return (
      <Popover anchorRect={anchor} onClose={onClose} placement="bottom-start">
        <DateTimePicker
          type="date-range"
          platform="desktop"
          onApply={({ preset, explicit }) => { if (preset) onCreatedLabel(`Created: ${preset}`); if (explicit) onClose(); }}
          onCancel={onClose}
        />
      </Popover>
    );
  }

  if (kind === 'sort') {
    return (
      <Popover anchorRect={anchor} onClose={onClose} placement="bottom-start">
        <DesktopDropdowns variant="sort" />
      </Popover>
    );
  }

  if (kind === 'filter') {
    return (
      <Popover anchorRect={anchor} onClose={onClose} placement="bottom-start">
        <DesktopDropdowns variant="basic-filter-search" options={recipients} resultsText={`${recipients.length} results`} />
      </Popover>
    );
  }

  if (kind === 'importExport') {
    return (
      <Popover anchorRect={anchor} onClose={onClose} placement="bottom-end">
        <MenuPanel width={200}>
          {['Import', 'Export'].map((label) => (
            <DesktopMenuOptions
              key={label}
              type="dropdown-basic"
              label={label}
              showLeadingIcon
              leadingIcon={label === 'Import' ? 'Download' : 'Upload'}
              showChevron={false}
              onSelect={() => { pushToast({ type: 'success', title: label, subtitle: 'This feature is in progress.' }); onClose(); }}
            />
          ))}
        </MenuPanel>
      </Popover>
    );
  }

  if (kind === 'subStatus' && group) {
    const statuses = GROUP_STATUSES[group];
    return (
      <Popover anchorRect={anchor} onClose={onClose} placement="bottom-start">
        <MenuPanel width={240}>
          {statuses.map((st) => (
            <DesktopMenuOptions
              key={st}
              type="combobox"
              showLeadingIcon
              leadingIcon={ORDER_STATUS_ICON[st]}
              label={`${ORDER_STATUS_LABEL[st]} (${countByStatus[st] ?? 0})`}
              active={subStatus === st}
              onSelect={() => { onPickStatus(group, st); onClose(); }}
            />
          ))}
        </MenuPanel>
      </Popover>
    );
  }

  if (kind === 'rowActions' && orderId) {
    return (
      <Popover anchorRect={anchor} onClose={onClose} placement="bottom-end">
        <MenuPanel width={220}>
          {ROW_ACTION_GROUPS.map((groupRows, gi) => (
            <React.Fragment key={gi}>
              {gi > 0 && <MenuDivider />}
              {groupRows.map((a) => (
                <DesktopMenuOptions
                  key={a.label}
                  type="dropdown-basic"
                  label={a.label}
                  showLeadingIcon
                  leadingIcon={a.icon}
                  showChevron={false}
                  onSelect={() => { pushToast({ type: 'success', title: a.label, subtitle: 'This action is coming soon.' }); onClose(); }}
                />
              ))}
            </React.Fragment>
          ))}
          <MenuDivider />
          <DesktopMenuOptions
            type="dropdown-destructive"
            label="Cancel Order"
            showLeadingIcon
            leadingIcon="Delete"
            onSelect={() => { cancelOrder(orderId); pushToast({ type: 'error', title: 'Order cancelled', subtitle: `${orderId} has been cancelled.` }); onClose(); }}
          />
        </MenuPanel>
      </Popover>
    );
  }

  return <></>;
}
