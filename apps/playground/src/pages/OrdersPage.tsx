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
  type FilterGroupDimension,
  type TableColumn,
  type TableRow,
  type TopFilterSectionItem,
} from '@leta/components';
import type { IconName } from '@leta/icons';
import { useStore } from '../store/useStore.js';
import type { NewOrderInput } from '../store/useStore.js';
import type { DepotOption, Order, OrderStatus } from '../store/types.js';
import { ORDER_STATUS_BADGE, ORDER_STATUS_ICON, ORDER_STATUS_LABEL } from '../store/types.js';
import { Popover, MenuPanel, MenuDivider } from '../components/Popover.js';
import { SkeletonTableRows } from '../components/SkeletonTableRows.js';
import { AddOrderDrawer } from '../components/AddOrderDrawer.js';
import { CancelOrderModal } from '../components/CancelOrderModal.js';
import { UpdateStatusModal, type UpdateStatusTarget } from '../components/UpdateStatusModal.js';
import { RescheduleModal } from '../components/RescheduleModal.js';

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

// Rows-per-page (Doc 3 §6): default 10, selector offers 10/25/50, and the
// choice persists per user across sessions (localStorage) — a dispatcher who
// picks 50 sees 50 next time they log in.
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const PAGE_SIZE_STORAGE_KEY = 'leta.playground.rowsPerPage';
function loadRowsPerPage(): number {
  if (typeof window === 'undefined') return 10;
  const stored = Number(window.localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(stored) ? stored : 10;
}
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

// ── Client-scoped pickup depot (Route cell) ──────────────────────────────────────
// MOCK_ORDERS is a single shared pool (switching clients doesn't swap the order
// list — only the account config), and its seed `depot` field is drawn from a
// large client-agnostic pool for mock variety, unrelated to any client's actual
// depot access. That's wrong: the Route cell's pickup must only ever be a depot
// the ACTIVE client's dispatcher can actually access — a single-depot client
// (Naivas, Java House) should show that ONE depot for every order. An order the
// dispatcher created themselves (via Add Order) already stores a real depot from
// their own client's list — that's kept as-is; only a seed order whose depot
// name isn't one of the active client's own is remapped, deterministically (by
// order id, so it's stable) onto one of the client's depots.
function depotForOrder(order: Order, depots: DepotOption[]): DepotOption | undefined {
  if (depots.length === 0) return undefined;
  const owned = depots.find((d) => d.name === order.depot);
  if (owned) return owned;
  return depots.length === 1 ? depots[0] : depots[idHash(order.id) % depots.length];
}

// ── Created By label (Table spec §2.2 — also the Created By filter dimension) ────
// Deterministic per order (same hash the Created By column already used inline);
// factored out so the filter dimension and the column cell can't drift apart.
function creatorFor(order: Order): Creator {
  return CREATORS[order.id.charCodeAt(0) % CREATORS.length]!;
}
function creatorLabelFor(order: Order): string {
  const c = creatorFor(order);
  return c.source === 'human' ? c.name : c.source === 'storefront' ? 'Storefront' : 'API';
}

// ── Order provenance (the Order ID cell's Interactive Elements + tooltips) ──────
// Wireframe `1334:178838`: a manually-created order renders the Manual-Touch
// icon ("Created manually"), an integration-created one the Integration icon
// ("Created via integration"); scheduled-origin orders add the Calendar icon
// ("Scheduled: {date, time}") and auto-broadcast orders the Broadcast icon
// ("Auto-broadcast"). Origin flags are deterministic mock values until the
// order model carries real provenance fields.
function scheduledOriginFor(o: Order): boolean {
  return o.status === 'scheduled' || idHash(o.id) % 2 === 0;
}
function autoBroadcastFor(o: Order): boolean {
  return idHash(o.id) % 3 === 0;
}
/** The mock scheduled delivery slot for a scheduled-origin order — 2 days after
 *  creation at 12:30 PM (the same value the Order-ID Calendar tooltip shows). */
function scheduledDateFor(o: Order): Date {
  const d = new Date(o.createdAt);
  if (isNaN(d.getTime())) return nextHourToday();
  d.setDate(d.getDate() + 2);
  d.setHours(12, 30, 0, 0);
  return d;
}
/** "Scheduled: 09 Jun 2027, 12:30 PM" — mock scheduled slot 2 days after creation. */
function scheduledLabelFor(o: Order): string {
  const d = scheduledDateFor(o);
  const day = d.getDate().toString().padStart(2, '0');
  return `Scheduled: ${day} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, 12:30 PM`;
}

// ── Reschedule anchor (OM §11.2, per the user's rules) ────────────────────────────
// Today at the next full hour (e.g. 9:xx → 10:00) — the manual-reschedule default
// for an unscheduled single order or any multi-order reschedule.
function nextHourToday(): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}
// The Reschedule modal's opening state (OM §11.2 + 2026-07-17 changelog):
//  - anchor    → manual-field default: a single scheduled order uses its own
//    slot; unscheduled single / any bulk uses today's next full hour.
//  - chipBase  → what the +1h/+4h/+8h/tomorrow chips compute from: a single
//    order's own time; a bulk set computes from "now".
//  - noOp      → the value that would be a no-op (single scheduled order's time),
//    so the confirm starts disabled; null for unscheduled single / bulk.
//  - hasDriverHeld → any selected order is Assigned/At Depot → show the
//    "rescheduling will unassign orders from their current drivers" warning.
interface RescheduleData { anchor: Date; chipBase: Date; noOp: Date | null; hasDriverHeld: boolean }
function rescheduleData(selected: Order[]): RescheduleData {
  const single = selected.length === 1 ? selected[0]! : null;
  const scheduledSingle = single && single.status === 'scheduled' ? scheduledDateFor(single) : null;
  const anchor = scheduledSingle ?? nextHourToday();
  const chipBase = single ? anchor : new Date();
  const hasDriverHeld = selected.some((o) => o.status === 'assigned' || o.status === 'at-depot');
  return { anchor, chipBase, noOp: scheduledSingle, hasDriverHeld };
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
// short, at-risk near the SLA boundary, delayed/beyond past it. Exposed as a
// raw second count (`durationSecondsFor`) too, so the Sort dropdown's
// "Duration" field can order by the exact same value the column displays.
function durationSecondsFor(o: Order, sla: SlaState, finished: boolean): number {
  const h = idHash(o.id);
  const seconds = (h * 7) % 60;
  let minutes: number;
  if (finished) minutes = sla === 'delayed' ? 30 + (h % 31) : 8 + (h % 25);
  else if (sla === 'delayed') minutes = 13 + (h % 22);
  else if (sla === 'at-risk') minutes = 9 + (h % 5);
  else minutes = 2 + (h % 10);
  return minutes * 60 + seconds;
}
function mockDurationFor(o: Order, sla: SlaState, finished: boolean): string {
  const total = durationSecondsFor(o, sla, finished);
  const minutes = Math.floor(total / 60);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m ${total % 60}s`;
}

// ── Sort (Table spec's Sort dropdown — Created / Duration / Last modified) ───
// "Last modified" has no distinct field in this mock data (the Last Updated
// *column* already just aliases createdAt too — see the cellByLabel map
// below), so it orders by the same value as Created; that's consistent with
// what's actually displayed, not a stand-in for a missing feature.
type SortField = 'created' | 'duration' | 'lastModified';
const SORT_FIELDS: SortField[] = ['created', 'duration', 'lastModified'];
function sortValueFor(o: Order, field: SortField): number {
  if (field === 'duration') {
    const isFinished = o.status === 'delivered' || o.status === 'cancelled';
    const rawSla = slaStateFor(o);
    const sla: SlaState = isFinished && rawSla === 'at-risk' ? 'on-target' : rawSla;
    return durationSecondsFor(o, sla, isFinished);
  }
  return new Date(o.createdAt).getTime();
}

// ── Overlay model ────────────────────────────────────────────────────────────────
type OverlayKind = 'created' | 'filter' | 'sort' | 'importExport' | 'subStatus' | 'rowActions' | 'selection' | 'columns' | 'rowsPerPage' | 'bulkOverflow';
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
  const updateOrder = useStore((s) => s.updateOrder);
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
  // The Filter Group (Doc 3 §9): `appliedFilters` is what actually narrows the
  // table (AND across dimensions); `draftFilters` is the panel's live/uncommitted
  // selection while it's open, only committed to `appliedFilters` on "Show
  // Results" — checking boxes must not reflow the table on every tick. Both are
  // keyed by dimension LABEL (not index) since which dimensions exist varies by
  // status view/client. `filterPreviewCount` is what the footer's "N results"
  // shows while the panel is open — a live preview of `draftFilters`, computed
  // against the status-scoped order pool (independent of the free-text search).
  const [appliedFilters, setAppliedFilters] = React.useState<Record<string, Set<string>>>({});
  const [draftFilters, setDraftFilters] = React.useState<Record<string, Set<string>>>({});
  const [filterPreviewCount, setFilterPreviewCount] = React.useState(0);
  // Sort — null field = no active sort (the natural order); only becomes active
  // once the user actually picks a field/direction from the Sort dropdown, so
  // opening it doesn't silently reorder the table the user hasn't touched yet.
  const [sortFieldIndex, setSortFieldIndex] = React.useState<number | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');
  // Rows-per-page (Doc 3 §6) — seeded from the persisted per-user choice;
  // changing it re-paginates from page 1 and persists for future sessions.
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(loadRowsPerPage);
  const handleRowsPerPage = (size: number) => {
    setRowsPerPage(size);
    setPage(1);
    try { window.localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(size)); } catch { /* private mode */ }
  };
  // The Orders view boots into the Empty State (wireframe 1176:171818); the
  // populated table appears only after a load is triggered (Import).
  const [loaded, setLoaded] = React.useState(false);
  // Loading pattern (applies going forward, not just here): a FIRST load, with
  // nothing to show yet, blocks behind the page-level LoadingOverlay scrim — the
  // LETA loader holds until it completes a full animation cycle, then the table
  // reveals. A SUBSEQUENT update to already-visible content (filter, sort, tab
  // switch, table refresh) never uses that scrim — it shows Skeleton rows in the
  // table region only, so the toolbars/search/filters stay mounted and fully
  // usable throughout. These are two distinct pieces of state on purpose: they
  // drive different visual treatments and can't be unified into one boolean.
  const [firstLoading, setFirstLoading] = React.useState(false);
  const firstLoadTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const runFirstLoad = () => {
    if (firstLoading) return;
    setFirstLoading(true);
    firstLoadTimer.current = setTimeout(() => {
      setFirstLoading(false);
      setLoaded(true);
      setTableKey((k) => k + 1);
    }, 2000);
  };
  // Every "subsequent update" trigger shares this one flash — status/sub-status
  // switch, Filter Group apply, sort pick, search (debounced), and the manual
  // Refresh button. Restarts the timer rather than ignoring a re-trigger (e.g.
  // picking a sort field then a direction in quick succession still reflects
  // the latest action) — the trailing tableKey bump remounts the real Table
  // (replaying its enter animation, reseeding index-based selection) exactly
  // when the Skeleton swaps back out, not before.
  const [tableRefreshing, setTableRefreshing] = React.useState(false);
  const tableRefreshTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTableLoading = (duration = 450) => {
    if (tableRefreshTimer.current) clearTimeout(tableRefreshTimer.current);
    setTableRefreshing(true);
    tableRefreshTimer.current = setTimeout(() => {
      tableRefreshTimer.current = null;
      setTableRefreshing(false);
      setTableKey((k) => k + 1);
    }, duration);
  };
  // A manual Refresh is a more deliberate action than an automatic re-filter —
  // slightly longer so it reads as "did something", not just a flicker.
  const handleRefresh = () => flashTableLoading(1200);
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
  React.useEffect(() => () => {
    if (firstLoadTimer.current) clearTimeout(firstLoadTimer.current);
    if (tableRefreshTimer.current) clearTimeout(tableRefreshTimer.current);
  }, []);
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
  // Search debounces ~300ms after the last keystroke (Doc 3 §8) before it
  // actually re-filters — `search` itself stays instant (the field's own typed
  // value), only the value that drives `query`/the Skeleton flash is delayed.
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const searchDebounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);
    searchDebounceTimer.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => { if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current); };
  }, [search]);
  // Search matches the field's promise ("Search orders by ID or recipient"):
  // Order ID, recipient name, or recipient phone — case-insensitive substring;
  // phones compare digits-only so "0712 345" matches "+254 712 345 678".
  const query = debouncedSearch.trim().toLowerCase();
  const queryDigits = query.replace(/\D/g, '');

  // Orders in the current status view (filterTab + subStatus), before search or
  // the Filter Group — the pool the filter dimensions' option lists and live
  // preview count are drawn from.
  const ordersInView = React.useMemo(
    () => orders.filter((o) => (filterTab === 'all' || GROUP_STATUSES[filterTab].includes(o.status)) && (!subStatus || o.status === subStatus)),
    [orders, filterTab, subStatus],
  );

  // AND-across-dimensions predicate for the Filter Group's applied selections.
  const matchesFilters = React.useCallback((o: Order, filters: Record<string, Set<string>>): boolean => {
    if (filters['Recipient']?.size && !filters['Recipient'].has(o.customer)) return false;
    if (filters['Created By']?.size && !filters['Created By'].has(creatorLabelFor(o))) return false;
    if (filters['Depot']?.size) {
      const name = depotForOrder(o, clientConfig.depots)?.name;
      if (!name || !filters['Depot'].has(name)) return false;
    }
    if (filters['Driver']?.size) {
      const name = getDriver(o.driverId)?.name;
      if (!name || !filters['Driver'].has(name)) return false;
    }
    return true;
  }, [clientConfig.depots, getDriver]);

  // Filter Group dimensions — Recipient + Created By always; Depot only for a
  // multi-depot client (single-depot clients have nothing to filter by there —
  // every order shows the same one); Driver only where orders actually have an
  // assigned driver (Dispatched/Finished — Unassigned has none yet, All mixes
  // too many statuses to stay meaningful).
  const filterGroups = React.useMemo(() => {
    const dims: { label: string; options: string[] }[] = [];
    dims.push({ label: 'Recipient', options: [...new Set(ordersInView.map((o) => o.customer))] });
    dims.push({ label: 'Created By', options: [...new Set(ordersInView.map(creatorLabelFor))] });
    if (clientConfig.depots.length > 1) {
      dims.push({ label: 'Depot', options: clientConfig.depots.map((d) => d.name) });
    }
    if (filterTab === 'dispatched' || filterTab === 'finished') {
      const driverNames = [...new Set(ordersInView.map((o) => getDriver(o.driverId)?.name).filter((n): n is string => Boolean(n)))];
      if (driverNames.length) dims.push({ label: 'Driver', options: driverNames });
    }
    return dims;
  }, [ordersInView, clientConfig.depots, filterTab, getDriver]);

  const filtered = React.useMemo(() => {
    return orders.filter((o) => {
      if (filterTab !== 'all' && !GROUP_STATUSES[filterTab].includes(o.status)) return false;
      if (subStatus && o.status !== subStatus) return false;
      if (!matchesFilters(o, appliedFilters)) return false;
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
  }, [orders, filterTab, subStatus, query, queryDigits, matchesFilters, appliedFilters]);

  // Sort — applied on top of the filtered set, ahead of pagination; the count
  // (`filtered.length`) and dimension option lists are unaffected by it.
  const sortedFiltered = React.useMemo(() => {
    if (sortFieldIndex == null) return filtered;
    const field = SORT_FIELDS[sortFieldIndex]!;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => (sortValueFor(a, field) - sortValueFor(b, field)) * dir);
  }, [filtered, sortFieldIndex, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const clampedPage = Math.min(page, pageCount);
  const pageOrders = sortedFiltered.slice((clampedPage - 1) * rowsPerPage, clampedPage * rowsPerPage);

  // Status/sub-status switch (Doc 3 §9's "tab switch") — reset page + clear
  // selection immediately, but the Skeleton flash owns the actual table
  // remount (see `flashTableLoading`): it lands at the end of the flash, not
  // the moment the tab changes, so the swap-back and the flash finishing
  // coincide instead of remounting the (still-hidden) Table early.
  React.useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
    flashTableLoading();
  }, [filterTab, subStatus]);

  // Which dimensions exist depends on the status view — a filter applied on one
  // view (e.g. a Driver selection while in Dispatched) has no meaning on another
  // (Unassigned has no Driver dimension at all), so switching views clears both
  // the applied and draft filter state.
  React.useEffect(() => {
    setAppliedFilters({});
    setDraftFilters({});
  }, [filterTab, subStatus]);

  // On (debounced) search change: back to page 1; the Skeleton flash owns the
  // table remount that reseeds the Table's index-based internal selection
  // against the new row slice. Selection itself is KEPT (it's ID-based across
  // pages) — matching rows stay checked, and orders filtered out of view
  // remain selected in the bulk toolbar.
  React.useEffect(() => {
    setPage(1);
    flashTableLoading();
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

  // Cancel Order (row + bulk) is destructive and irreversible — Doc 3 §5
  // rules this "required, no exceptions". Both entry points open the Cancel
  // Order modal (Figma `1382:104119`): reason checkboxes + optional note,
  // destructive confirm disabled until ≥1 reason ("Other" additionally
  // requires the note, OM §11.1). On confirm, a SUCCESS toast reports the
  // outcome count-led ("1 order cancelled" / "10 orders cancelled") — no CTA,
  // per the wireframe (ruled 2026-07-16).
  const [cancelConfirm, setCancelConfirm] = React.useState<string[] | null>(null);
  const requestCancel = (ids: string[]) => setCancelConfirm(ids);
  const confirmCancel = (reasons: string[], note: string) => {
    const ids = cancelConfirm ?? [];
    ids.forEach((id) => cancelOrder(id, reasons, note));
    setCancelConfirm(null);
    const n = ids.length;
    if (n === 0) return;
    pushToast({
      type: 'success',
      title: `${n} order${n === 1 ? '' : 's'} cancelled`,
      subtitle: `Your order${n === 1 ? ' has' : 's have'} been cancelled.`,
    });
    if (n > 1) clearSelection();
  };
  const bulkCancel = () => requestCancel(selectedOrders().map((o) => o.id));

  // Update Status (OM §12.6) + Reschedule (OM §11.2) — both reachable from the row
  // ⋯ menu (1 order) and the bulk toolbar's ⋯ (N selected). Each holds the order
  // id(s) awaiting the modal; the modals themselves are rendered once, below.
  const [updateStatusFor, setUpdateStatusFor] = React.useState<string[] | null>(null);
  const [rescheduleFor, setRescheduleFor] = React.useState<string[] | null>(null);
  const requestUpdateStatus = (ids: string[]) => setUpdateStatusFor(ids);
  const requestReschedule = (ids: string[]) => setRescheduleFor(ids);
  // Frozen at open time (keyed on the selection) so the bulk "chips-from-now"
  // base + the 1s duration tick don't shift the suggestions while the modal is open.
  const rescheduleInfo = React.useMemo(
    () => (rescheduleFor ? rescheduleData(orders.filter((o) => rescheduleFor.includes(o.id))) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- freeze on open; orders is current at that moment
    [rescheduleFor],
  );
  const confirmUpdateStatus = (target: UpdateStatusTarget) => {
    const ids = updateStatusFor ?? [];
    ids.forEach((id) => updateOrderStatus(id, target));
    setUpdateStatusFor(null);
    const n = ids.length;
    if (n === 0) return;
    // Toast subtitle names the target status (wireframe 1408:237553 / 1239:108227).
    pushToast({
      type: 'success',
      title: `${n} order${n === 1 ? '' : 's'} updated`,
      subtitle: `Your order${n === 1 ? ' has' : 's have'} been marked as ${target}.`,
    });
    if (n > 1) clearSelection();
  };
  const confirmReschedule = () => {
    // Reschedule → the order lands in Scheduled (OM §11.2). The picked date is
    // captured by the modal; the mock store tracks status only, so we move each
    // to 'scheduled' and report the outcome.
    const ids = rescheduleFor ?? [];
    ids.forEach((id) => updateOrderStatus(id, 'scheduled'));
    setRescheduleFor(null);
    const n = ids.length;
    if (n === 0) return;
    pushToast({ type: 'success', title: `${n} order${n === 1 ? '' : 's'} rescheduled`, subtitle: `Your order${n === 1 ? ' has' : 's have'} been rescheduled.` });
    if (n > 1) clearSelection();
  };

  // Edit Order (OM §8, Figma 350:38360) — reuses the Add Order drawer in edit
  // mode, prefilled. Editable only for Ready/at-depot statuses; In Transit and
  // beyond are frozen (the recourse is a disruption action, not an edit).
  const EDITABLE_STATUSES: OrderStatus[] = ['scheduled', 'pending', 'broadcasted', 'assigned', 'at-depot'];
  const [editOrderId, setEditOrderId] = React.useState<string | null>(null);
  const editingOrder = editOrderId ? orders.find((o) => o.id === editOrderId) ?? null : null;
  const requestEdit = (orderId: string) => {
    const o = orders.find((x) => x.id === orderId);
    if (!o) return;
    if (!EDITABLE_STATUSES.includes(o.status)) {
      pushToast({ type: 'warning', title: 'Editing is blocked', subtitle: 'This order has left the depot — use Return instead.' });
      return;
    }
    setEditOrderId(orderId);
  };
  const handleOrderEdited = (input: NewOrderInput) => {
    if (!editingOrder) return;
    const status = editingOrder.status;
    updateOrder(editingOrder.id, {
      customer: input.customer,
      phone: input.phone,
      depot: input.depot,
      pickup: input.pickup,
      dropoff: input.dropoff,
      package: input.package,
      items: input.items,
    });
    const notify = status === 'assigned' || status === 'at-depot';
    setEditOrderId(null);
    pushToast({
      type: 'success',
      title: 'Order updated',
      subtitle: notify ? 'Your changes are saved and the driver has been notified.' : 'Your changes have been saved.',
    });
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
          iconLeft="Document"
          iconOutlined
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
            variant="secondary"
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
    const creator = creatorFor(o);
    const scheduledOrigin = scheduledOriginFor(o);
    const cellByLabel: Record<string, TableRow['cells'][number]> = {
      // Order ID cell — manual vs automatic per the order's creation source
      // (§2.2), with the wireframes' provenance icons + hover tooltips
      // (`1334:178838`): Copy ID · Created manually / Created via integration ·
      // Scheduled: {slot} (scheduled-origin only) · Auto-broadcast.
      'Order ID': {
        type: creator.source === 'human' ? 'manual-order' : 'automatic-order',
        orderId: o.id,
        onCopyOrderId: () => navigator.clipboard.writeText(o.id),
        showScheduledIcon: scheduledOrigin,
        scheduledTooltip: scheduledOrigin ? scheduledLabelFor(o) : undefined,
        showBroadcastIcon: autoBroadcastFor(o),
      },
      'Batch ID': { type: 'sample', text: o.batchId ?? '—' }, // Broadcasted view only
      // Trip cell — a Plain button ("TRP-103 ↗", trailing Open icon, no
      // underline) once a trip exists; "--" for orders cancelled before
      // assignment (wireframes `852:166434` / `1213:98975`). The trip surface
      // itself is a future build, so the button stubs with a toast.
      'Trip': o.tripId
        ? {
            type: 'actions',
            actions: (
              <Button
                variant="plain"
                size="medium"
                iconRight="Open"
                showUnderline={false}
                onClick={(e) => {
                  e.stopPropagation();
                  pushToast({ type: 'success', title: `${o.tripId} — coming soon`, subtitle: 'Trip details are in progress.' });
                }}
              >
                {o.tripId}
              </Button>
            ),
          }
        : { type: 'sample', text: '--' },
      // Driver cell: a real driver renders the driver-cell (Swap/Call buttons on
      // active orders; name-only, centered, for finished ones — a terminal
      // order's driver can't be swapped/called). No driver (cancelled before
      // assignment) → "--", matching the empty Trip cell.
      'Driver': driver
        ? { type: 'driver-cell', name: driver.name, showDriverActions: !isFinished }
        : { type: 'sample', text: '--' },
      'Route': { type: 'address-cell', pickup: depotForOrder(o, clientConfig.depots)?.name ?? o.pickup.label, dropoff: o.dropoff.label },
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
            // Finished rows: hover tooltip on the leading Within/Beyond-OFT icon.
            durationIconTooltip: isFinished
              ? sla === 'delayed' ? 'Delivery delayed' : 'Delivery on time'
              : undefined,
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
        // Spec pairing (warning → At Risk, error → Delayed) — the wireframe's
        // crossed prototype connections were ruled a mistake (2026-07-16).
        statusIconTooltip: sla === 'at-risk' ? 'At Risk' : sla === 'delayed' ? 'Delayed' : undefined,
      },
      '': actionsCell,
    };
    const cells: TableRow['cells'] = columns.map((c) => cellByLabel[c.label ?? ''] ?? { type: 'sample', text: '' });

    return { selected: selectedIds.has(o.id), cells };
  });

  // The "Filter" toolbar button badge reflects the total applied Filter Group
  // selections across every dimension (not the status sub-filter, which shows
  // as the badge on the Unassigned/Dispatched/Finished pill instead).
  const activeFilterCount = Object.values(appliedFilters).reduce((n, s) => n + s.size, 0);

  // Opens the Filter Group, seeding its draft + live preview count from whatever
  // is currently applied (the panel remounts fresh each open, so this is what
  // makes a previously-applied filter still show checked/reflected on reopen).
  const handleOpenFilter = () => {
    setDraftFilters(appliedFilters);
    setFilterPreviewCount(ordersInView.filter((o) => matchesFilters(o, appliedFilters)).length);
    openFromFocus('filter');
  };

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
                  onFilterClick={handleOpenFilter}
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
                  onFilterClick={handleOpenFilter}
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
              tableRefreshing ? (
                // Subsequent update (Refresh) — Skeleton rows only, no scrim; the
                // toolbars above stay mounted and interactive throughout.
                <SkeletonTableRows
                  columns={columns}
                  selectable={filterTab !== 'all' && filterTab !== 'finished'}
                  rows={Math.min(rowsPerPage, pageOrders.length || rowsPerPage)}
                />
              ) : (
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
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageClick={() => openFromFocus('rowsPerPage')}
                  fillHeight
                />
                </div>
              )
            }
          />
          )}

          {/* First-load overlay (Import from empty) — contained: dims only this
              table region, holds until the loader completes a full cycle. Top edge
              extends up through the page column's 24px gap to sit 1px below the
              Title row (its divider stays undimmed). Never shown for a Refresh —
              that's a subsequent update, handled by the Skeleton rows above. */}
          <LoadingOverlay contained open={firstLoading} style={{ top: 'calc(-1 * var(--spacing-24px) + 1px)' }} />
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
              onOverflowClick={() => openFromFocus('bulkOverflow')}
              onClose={clearSelection}
            />
          </div>
        </div>
      )}

      {/* Overlays */}
      {overlay && (
        <OverlayHost
          overlay={overlay}
          onClose={() => setOverlay(null)}
          pushToast={pushToast}
          onRequestCancel={requestCancel}
          subStatus={subStatus}
          onPickStatus={handlePickStatus}
          countByStatus={countByStatus}
          selectedOrderList={selectedOrders()}
          deselect={deselect}
          onCreatedLabel={setCreatedLabel}
          extraCols={extraCols}
          onToggleColumn={(k) => setExtraCols((p) => ({ ...p, [k]: !p[k] }))}
          filterGroups={filterGroups}
          appliedFilters={appliedFilters}
          filterPreviewCount={filterPreviewCount}
          onFilterSelectionChange={(selected) => {
            const next: Record<string, Set<string>> = {};
            filterGroups.forEach((g, i) => { next[g.label] = new Set(selected[i] ?? []); });
            setDraftFilters(next);
            setFilterPreviewCount(ordersInView.filter((o) => matchesFilters(o, next)).length);
          }}
          onFilterApply={() => { setAppliedFilters(draftFilters); setOverlay(null); flashTableLoading(); }}
          onFilterReset={() => {
            setDraftFilters({});
            setFilterPreviewCount(ordersInView.length);
          }}
          onImport={runFirstLoad}
          rowsPerPage={rowsPerPage}
          onRowsPerPage={(size) => { handleRowsPerPage(size); setOverlay(null); }}
          onSortChange={(sel) => { setSortFieldIndex(sel.index); setSortDir(sel.direction); flashTableLoading(); }}
          onRequestUpdateStatus={requestUpdateStatus}
          onRequestReschedule={requestReschedule}
          onRequestEdit={requestEdit}
        />
      )}

      {/* Add Order side drawer — config-aware order creation. */}
      <AddOrderDrawer
        open={addOrderOpen}
        config={clientConfig}
        onClose={() => setAddOrderOpen(false)}
        onSubmit={handleOrderCreated}
      />

      {/* Edit Order drawer — the same drawer in edit mode, prefilled (OM §8). */}
      <AddOrderDrawer
        mode="edit"
        open={Boolean(editOrderId)}
        config={clientConfig}
        editOrder={editingOrder}
        orderStatus={editingOrder?.status}
        onClose={() => setEditOrderId(null)}
        onSubmit={() => {}}
        onSave={handleOrderEdited}
      />

      {/* Cancel Order modal (Doc 3 §5 / OM §11.1, Figma 1382:104119) — reason
          capture gating every cancellation; reused for a single order and a
          bulk selection. */}
      {cancelConfirm && (
        <CancelOrderModal
          orderIds={cancelConfirm}
          onClose={() => setCancelConfirm(null)}
          onConfirm={confirmCancel}
        />
      )}

      {/* Update Status modal (OM §12.6, Figma 1239:108227) — status-gated options. */}
      {updateStatusFor && (
        <UpdateStatusModal
          orderIds={updateStatusFor}
          statuses={orders.filter((o) => updateStatusFor.includes(o.id)).map((o) => o.status)}
          onClose={() => setUpdateStatusFor(null)}
          onConfirm={confirmUpdateStatus}
        />
      )}

      {/* Reschedule modal (OM §11.2, Figma 1239:108226 bulk / 1408:237256 single). */}
      {rescheduleFor && rescheduleInfo && (
        <RescheduleModal
          orderIds={rescheduleFor}
          anchorDate={rescheduleInfo.anchor}
          chipBase={rescheduleInfo.chipBase}
          noOpDate={rescheduleInfo.noOp}
          hasDriverHeld={rescheduleInfo.hasDriverHeld}
          onClose={() => setRescheduleFor(null)}
          onConfirm={confirmReschedule}
        />
      )}
    </div>
  );
}

// ── Overlay host ──────────────────────────────────────────────────────────────

interface OverlayHostProps {
  overlay: OverlayState;
  onClose: () => void;
  pushToast: (t: { type: 'success' | 'warning' | 'error'; title: string; subtitle?: string }) => void;
  onRequestCancel: (ids: string[]) => void;
  subStatus: OrderStatus | null;
  onPickStatus: (group: Exclude<FilterTab, 'all'>, status: OrderStatus) => void;
  countByStatus: Record<OrderStatus, number>;
  selectedOrderList: Order[];
  deselect: (id: string) => void;
  onCreatedLabel: (label: string) => void;
  extraCols: Record<ExtraColumnKey, boolean>;
  onToggleColumn: (key: ExtraColumnKey) => void;
  filterGroups: FilterGroupDimension[];
  appliedFilters: Record<string, Set<string>>;
  filterPreviewCount: number;
  onFilterSelectionChange: (selected: string[][]) => void;
  onFilterApply: () => void;
  onFilterReset: () => void;
  /** "Import" clicked (Import/Export dropdown) — a dev-convenience stand-in for a real
   * data import: populates/refreshes the table via the same load-and-reveal path as
   * Refresh, rather than requiring an Add Order submission first. */
  onImport: () => void;
  /** A Sort field/direction pick — DesktopDropdowns fires this on every pick (field
   * and direction are independently selectable, panel stays open, per its own design). */
  onSortChange: (sel: { index: number; label: string; direction: 'asc' | 'desc' }) => void;
  /** The current rows-per-page (marks the active option in the selector). */
  rowsPerPage: number;
  /** A rows-per-page pick (10/25/50, Doc 3 §6) — close-on-select. */
  onRowsPerPage: (size: number) => void;
  /** Open the Update Status modal for the given order id(s) (OM §12.6). */
  onRequestUpdateStatus: (ids: string[]) => void;
  /** Open the Reschedule modal for the given order id(s) (OM §11.2). */
  onRequestReschedule: (ids: string[]) => void;
  /** Open the Edit Order drawer for the given order (OM §8). */
  onRequestEdit: (orderId: string) => void;
}

function OverlayHost({ overlay, onClose, pushToast, onRequestCancel, subStatus, onPickStatus, countByStatus, selectedOrderList, deselect, onCreatedLabel, extraCols, onToggleColumn, filterGroups, appliedFilters, filterPreviewCount, onFilterSelectionChange, onFilterApply, onFilterReset, onImport, onSortChange, rowsPerPage, onRowsPerPage, onRequestUpdateStatus, onRequestReschedule, onRequestEdit }: OverlayHostProps): React.ReactElement {
  const { kind, anchor, orderId, group } = overlay;

  if (kind === 'rowsPerPage') {
    // Rows-per-page selector (Doc 3 §6) — a small close-on-select combobox of
    // the three page sizes, opened from the Pagination's "N rows per page"
    // trigger; the picked size persists per user across sessions.
    return (
      <Popover anchorRect={anchor} onClose={onClose} placement="bottom-start">
        <MenuPanel width={120}>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <DesktopMenuOptions
              key={size}
              type="combobox"
              label={String(size)}
              active={size === rowsPerPage}
              onSelect={() => onRowsPerPage(size)}
            />
          ))}
        </MenuPanel>
      </Popover>
    );
  }

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
    // Stays open on its own (field and direction are independently selectable —
    // DesktopDropdowns' own design, not something this call site controls).
    return (
      <Popover anchorRect={anchor} onClose={onClose} placement="bottom-start">
        <DesktopDropdowns variant="sort" onSortChange={onSortChange} />
      </Popover>
    );
  }

  if (kind === 'filter') {
    // Doc 3 §9: 1 dimension → Basic Filter Search, 2+ → Filter Group. Every
    // status view has at least Recipient + Created By, so Filter Group always
    // applies here — Basic Filter Search stays available in the DS for a future
    // screen with genuinely only one dimension.
    return (
      <Popover anchorRect={anchor} onClose={onClose} placement="bottom-start">
        <DesktopDropdowns
          variant="filter-group"
          groups={filterGroups}
          initialGroupSelections={filterGroups.map((g) => [...(appliedFilters[g.label] ?? [])])}
          resultsText={`${filterPreviewCount} results`}
          onGroupSelectionChange={onFilterSelectionChange}
          onApply={onFilterApply}
          onReset={onFilterReset}
        />
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
              onSelect={() => {
                // Import is a dev-convenience stand-in for a real data import: it
                // populates/refreshes the table (same load-and-reveal path as
                // Refresh) instead of requiring an Add Order submission first.
                // Export has no real target yet, so it stays a placeholder toast.
                if (label === 'Import') onImport();
                else pushToast({ type: 'success', title: label, subtitle: 'This feature is in progress.' });
                onClose();
              }}
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
                  onSelect={() => {
                    onClose();
                    if (a.label === 'Update Status') onRequestUpdateStatus([orderId]);
                    else if (a.label === 'Reschedule Order') onRequestReschedule([orderId]);
                    else if (a.label === 'Edit Order') onRequestEdit(orderId);
                    else pushToast({ type: 'success', title: a.label, subtitle: 'This action is coming soon.' });
                  }}
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
            onSelect={() => { onClose(); onRequestCancel([orderId]); }}
          />
        </MenuPanel>
      </Popover>
    );
  }

  if (kind === 'bulkOverflow') {
    // Bulk toolbar's ⋯ — the secondary bulk actions (Update Status, Reschedule)
    // for every selected order. Opens above the bottom-fixed toolbar (top-end).
    const ids = selectedOrderList.map((o) => o.id);
    return (
      <Popover anchorRect={anchor} onClose={onClose} placement="top-end">
        <MenuPanel width={220}>
          <DesktopMenuOptions
            type="dropdown-basic"
            label="Update Status"
            showLeadingIcon
            leadingIcon="Update"
            showChevron={false}
            onSelect={() => { onClose(); onRequestUpdateStatus(ids); }}
          />
          <DesktopMenuOptions
            type="dropdown-basic"
            label="Reschedule Order"
            showLeadingIcon
            leadingIcon="Calendar"
            showChevron={false}
            onSelect={() => { onClose(); onRequestReschedule(ids); }}
          />
        </MenuPanel>
      </Popover>
    );
  }

  return <></>;
}
