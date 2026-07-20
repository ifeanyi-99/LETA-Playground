import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  Badge,
  Button,
  ContentCard,
  ContentPrimitives,
  DesktopMenuOptions,
  DOORSTEP_DELIVERY_IMAGE,
  EmptyState,
  FooterFrame,
  HoverTip,
  ModalDialog,
  ModalHeaders,
  ModalShell,
  NotificationBanner,
  PageTabsControl,
  Pagination,
  SIGNATURE_IMAGE,
} from '@leta/components';
import { Icon, type IconName } from '@leta/icons';
import { useStore } from '../../store/useStore.js';
import type { ClientConfig, Driver, Order, OrderStatus } from '../../store/types.js';
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from '../../store/types.js';
import { Popover, MenuPanel, MenuDivider } from '../Popover.js';
import { buildOrderDetail, fmtClock, slaHeadline, type OrderDetailModel, type ProofFile } from './detailModel.js';
import { ExpandedMapOverlay, OrderMiniMap } from './OrderDetailMap.js';

/**
 * View Order drawer (Order Detail View, OM §7) — the Overview tab of the
 * per-status wireframes `320:99590` (all 12 screens are this ONE component
 * driven by the live order's status + provenance + client config; enumerated
 * 2026-07-20, see design-parity/view-order-overview-inventory.md).
 *
 * Right-anchored full-height side sheet (the AddOrderDrawer pattern): scrim +
 * 768px `ModalShell fillHeight` with `ModalHeaders` (status badge + provenance
 * icons + Order ID / Tracking Link CTAs + Overview·Activity·Dispatch Logs
 * tabs), the state-driven Overview body, and the per-status `FooterFrame`
 * (§12.7 + the v2.8 Update-Status scoping). Activity + Dispatch Logs render an
 * empty-state placeholder until their wireframes are built.
 */

// Drawer motion (mirrors the AddOrderDrawer's side-sheet choreography) is
// driven by inline styles from the `entered`/`closing` state — deterministic
// regardless of stylesheet lifecycle.

/** Footer/actions surface for a status (§12.7 drawer footer + v2.8 ruling). */
function footerFor(status: OrderStatus): {
  leading: 'cancel' | 'return' | null;
  trailing: ('addToTrip' | 'changeDriver' | 'editOrder' | 'dispatch' | 'updateStatus' | 'addComment')[];
  overflow: ('updateStatus' | 'reschedule' | 'addComment')[];
} {
  switch (status) {
    case 'assigned':
    case 'at-depot':
      return { leading: 'cancel', trailing: ['addToTrip', 'changeDriver', 'editOrder'], overflow: ['updateStatus', 'reschedule', 'addComment'] };
    case 'in-transit':
    case 'arrived':
      return { leading: 'return', trailing: ['updateStatus'], overflow: ['addComment'] };
    case 'returning':
      return { leading: null, trailing: ['addComment'], overflow: [] };
    case 'delivered':
    case 'cancelled':
      return { leading: null, trailing: [], overflow: [] };
    case 'returned':
      // Returned keeps the Ready footer but its ⋯ drops Update Status (OM v2.8).
      return { leading: 'cancel', trailing: ['addToTrip', 'editOrder', 'dispatch'], overflow: ['reschedule', 'addComment'] };
    default:
      return { leading: 'cancel', trailing: ['addToTrip', 'editOrder', 'dispatch'], overflow: ['updateStatus', 'reschedule', 'addComment'] };
  }
}

/** 1s heartbeat while `active` — drives the live counters (drawer-only, §7.2). */
function useTicker(active: boolean): number {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, [active]);
  return tick;
}

// ── Local building blocks (wireframe ad-hoc pieces — see adhoc-registry.json) ────

/** White section card with a section-heading + collapse chevron (the wireframes'
 *  "List Section" frames compose ContentPrimitives directly — so do we). */
function Section({
  title,
  count,
  children,
  defaultOpen = true,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}): React.ReactElement {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: open ? 'var(--spacing-12px)' : 0,
        width: '100%',
        backgroundColor: 'var(--surface-neutral-bg-default)',
        borderRadius: 'var(--rounding-xl)',
        border: 'var(--stroke-xs) solid var(--border-neutral-default)',
        padding: 'var(--padding-20px)',
      }}
    >
      <ContentPrimitives
        type="section-heading"
        text={
          count != null ? (
            <>
              {title}{' '}
              <span className="text-body-l-regular" style={{ color: 'var(--text-default-sub-body)' }}>
                ({count})
              </span>
            </>
          ) : (
            title
          )
        }
        showSubtext={false}
        showVisualAnchor={false}
        showTrailingContent
        showPassiveElements={false}
        showInteractiveElements
        interactiveElements={
          <Button
            variant="ghost"
            size="medium"
            iconOnly={open ? 'Chevron-Up' : 'Chevron-Down'}
            aria-label={open ? 'Collapse section' : 'Expand section'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          />
        }
      />
      {open && children}
    </div>
  );
}

/** One label + icon+value field (the wireframes' vertical-list-row CP). */
function Field({ label, value, icon }: { label: string; value: string; icon?: IconName }): React.ReactElement {
  return (
    <ContentPrimitives
      type="vertical-list-row"
      titleName={label}
      listRowText={value}
      showDescriptionLeadingIcon={!!icon}
      descriptionLeadingIcon={icon ?? 'Question'}
      showInteractiveElements={false}
      style={{ flex: '1 0 0', minWidth: 0 }}
    />
  );
}

/** Two fields per row (the wireframes' 2-col List Row grid). */
function FieldRows({ fields }: { fields: React.ReactNode[] }): React.ReactElement {
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < fields.length; i += 2) rows.push(fields.slice(i, i + 2));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20px)', width: '100%' }}>
      {rows.map((pair, i) => (
        <div key={i} style={{ display: 'flex', gap: 'var(--spacing-16px)', width: '100%' }}>
          {pair}
          {pair.length === 1 && <div style={{ flex: '1 0 0' }} />}
        </div>
      ))}
    </div>
  );
}

/** Proof-image row: thumbnail + label/filename + View (POP / POD / signature). */
function ProofRow({ file, onView }: { file: ProofFile; onView: (f: ProofFile) => void }): React.ReactElement {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-12px)', flex: '1 0 0', minWidth: 0 }}>
      <img
        src={file.src}
        alt={file.label}
        style={{
          width: 48,
          height: 32,
          objectFit: 'cover',
          borderRadius: 'var(--rounding-sm)',
          border: 'var(--stroke-xs) solid var(--border-neutral-default)',
          flexShrink: 0,
          backgroundColor: 'var(--surface-neutral-bg-default)',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: '1 0 0' }}>
        <span className="text-label-m-semibold" style={{ color: 'var(--text-default-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {file.label}
        </span>
        <span className="text-label-s-regular" style={{ color: 'var(--text-default-sub-body)' }}>{file.fileName}</span>
      </div>
      <Button variant="secondary" size="small" onClick={() => onView(file)}>View</Button>
    </div>
  );
}

/** The SLA block (summary card top): eyebrow + ⓘ, counter, trailing badge. */
function SlaBlock({ model, elapsed }: { model: OrderDetailModel; elapsed: number }): React.ReactElement {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4px)' }}>
          <span className="text-label-m-regular" style={{ color: 'var(--text-default-eyebrow-text)' }}>
            {slaHeadline(model.order.status)}
          </span>
          <HoverTip label="Time spent fulfilling this order, against its SLA.">
            <span style={{ display: 'flex', color: 'var(--icons-neutral-idle)' }}>
              <Icon name="Question" outlined size={16} />
            </span>
          </HoverTip>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-4px)' }}>
          <span className="text-heading-s-semibold" style={{ color: 'var(--text-default-heading)' }}>
            {fmtClock(elapsed)}
          </span>
          <span className="text-body-m-regular" style={{ color: 'var(--text-default-sub-body)' }}> / 30m SLA</span>
        </div>
      </div>
      {model.slaBadge && <Badge color={model.slaBadge.color} label={model.slaBadge.label} />}
    </div>
  );
}

// ── The drawer ───────────────────────────────────────────────────────────────────

export interface OrderDetailActions {
  dispatch: (id: string) => void;
  requestCancel: (ids: string[]) => void;
  requestUpdateStatus: (ids: string[]) => void;
  requestReschedule: (ids: string[]) => void;
  requestEdit: (id: string) => void;
  /** Unbuilt actions (Add To Trip / Change Driver / Return Order / Add Comment / Tracking Link). */
  stub: (title: string) => void;
}

export function OrderDetailDrawer({
  orderId,
  onClose,
  actions,
}: {
  /** The order to show; null renders nothing. */
  orderId: string | null;
  onClose: () => void;
  actions: OrderDetailActions;
}): React.ReactElement | null {
  const orders = useStore((s) => s.orders);
  const getDriver = useStore((s) => s.getDriver);
  const config = useStore((s) => s.client.config);

  const order = orderId ? (orders.find((o) => o.id === orderId) ?? null) : null;

  // Enter/exit choreography (kept mounted through the exit).
  const [entered, setEntered] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  React.useEffect(() => {
    if (order) {
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    setClosing(false);
    return undefined;
  }, [!!order]);
  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 220);
  };

  // Tab state resets per order.
  const [tab, setTab] = React.useState(0);
  React.useEffect(() => setTab(0), [orderId]);

  if (!order) return null;

  return (
    <DrawerBody
      key={order.id}
      order={order}
      driverId={order.driverId}
      getDriver={getDriver}
      configKey={config}
      entered={entered}
      closing={closing}
      tab={tab}
      setTab={setTab}
      onClose={close}
      actions={actions}
    />
  );
}

function DrawerBody({
  order,
  driverId,
  getDriver,
  configKey: config,
  entered,
  closing,
  tab,
  setTab,
  onClose,
  actions,
}: {
  order: Order;
  driverId: string | null;
  getDriver: (id: string | null | undefined) => Driver | undefined;
  configKey: ClientConfig;
  entered: boolean;
  closing: boolean;
  tab: number;
  setTab: (i: number) => void;
  onClose: () => void;
  actions: OrderDetailActions;
}): React.ReactElement {
  const driver = driverId ? (getDriver(driverId) ?? null) : null;
  const model = React.useMemo(
    () => buildOrderDetail(order, driver, config, { photo: DOORSTEP_DELIVERY_IMAGE, signature: SIGNATURE_IMAGE }),
    [order, driver, config],
  );
  const status = order.status;
  const footer = footerFor(status);

  // Live counters (drawer-only, §7.2): elapsed fulfilment + summary sub-copy.
  const openedAt = React.useRef(Date.now());
  const tick = useTicker(model.ticks || model.summary.live != null);
  void tick;
  const liveSeconds = Math.floor((Date.now() - openedAt.current) / 1000);
  const elapsed = model.ticks ? model.elapsedBase + liveSeconds : model.elapsedBase;
  const summarySub = (() => {
    const s = model.summary;
    if (s.live === 'seconds-elapsed') return `${(s.liveBase ?? 0) + liveSeconds} seconds elapsed.`;
    if (s.live === 'minutes-until-broadcast' || s.live === 'minutes-to-broadcast') {
      const n = Math.max(1, (s.liveBase ?? 1) - Math.floor(liveSeconds / 60));
      const unit = n === 1 ? 'minute' : 'minutes';
      return `${n} ${unit} ${s.live === 'minutes-until-broadcast' ? 'until' : 'to'} broadcast.`;
    }
    return s.sub;
  })();

  // Overlays
  const [mapExpanded, setMapExpanded] = React.useState(false);
  const [proofView, setProofView] = React.useState<ProofFile | null>(null);
  const [menuAnchor, setMenuAnchor] = React.useState<DOMRect | null>(null);
  const [assignBanner, setAssignBanner] = React.useState(true);
  const [itemsPage, setItemsPage] = React.useState(1);

  const depotName = model.depot?.name ?? order.depot ?? order.pickup.label;
  const depotAddress = model.depot?.address ?? order.pickup.label;

  const summaryCta = () => {
    const kind = model.summary.cta;
    if (kind === 'dispatch') actions.dispatch(order.id);
    else if (kind === 'view-logs') setTab(2);
    else setTab(1);
  };

  // Items pagination — 5 per page (wireframe).
  const pageCount = Math.max(1, Math.ceil(model.itemLines.length / 5));
  const pageItems = model.itemLines.slice((itemsPage - 1) * 5, itemsPage * 5);

  const runAction = (key: string) => {
    switch (key) {
      case 'cancel': return actions.requestCancel([order.id]);
      case 'return': return actions.stub('Return Order');
      case 'addToTrip': return actions.stub('Add To Trip');
      case 'changeDriver': return actions.stub('Change Driver');
      case 'editOrder': return actions.requestEdit(order.id);
      case 'dispatch': return actions.dispatch(order.id);
      case 'updateStatus': return actions.requestUpdateStatus([order.id]);
      case 'reschedule': return actions.requestReschedule([order.id]);
      case 'addComment': return actions.stub('Add Comment');
    }
  };

  const TRAILING: Record<string, { label: string; icon: IconName; outlined?: boolean }> = {
    addToTrip: { label: 'Add To Trip', icon: 'Add', outlined: true },
    changeDriver: { label: 'Change Driver', icon: 'Swap' },
    editOrder: { label: 'Edit Order', icon: 'Edit', outlined: true },
    dispatch: { label: 'Dispatch', icon: 'Proceed' },
    updateStatus: { label: 'Update Status', icon: 'Update' },
    addComment: { label: 'Add Comment', icon: 'Comment', outlined: true },
  };
  const OVERFLOW: Record<string, { label: string; icon: IconName }> = {
    updateStatus: { label: 'Update Status', icon: 'Update' },
    reschedule: { label: 'Reschedule Order', icon: 'Calendar' },
    addComment: { label: 'Add Comment', icon: 'Comment' },
  };

  // Header status icons — same glyphs/colors/tooltips as the table's Order-ID cell.
  const headerIcons = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8px)' }}>
      <Badge color={ORDER_STATUS_BADGE[status]} label={ORDER_STATUS_LABEL[status]} />
      <HoverTip label={model.provenanceIcon.tooltip}>
        <span style={{ display: 'flex', color: model.provenanceIcon.icon === 'Manual-Touch' ? 'var(--icons-caution-badge)' : 'var(--icons-notice-badge)' }}>
          <Icon name={model.provenanceIcon.icon} outlined={model.provenanceIcon.outlined} size={16} />
        </span>
      </HoverTip>
      {model.scheduledOrigin && (
        <HoverTip label={model.scheduledTooltip}>
          <span style={{ display: 'flex', color: 'var(--icons-information-badge)' }}>
            <Icon name="Calendar" size={16} />
          </span>
        </HoverTip>
      )}
    </div>
  );

  const overviewBody = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20px)', padding: 'var(--padding-24px) var(--padding-16px)' }}>
      {/* Auto-broadcast assignment banner (§7.2) — dismissible, Assigned only. */}
      {status === 'assigned' && assignBanner && driver && (
        <NotificationBanner
          type="highlight"
          variant="filled"
          description={`This order was automatically assigned to ${driver.name}.`}
          onDismiss={() => setAssignBanner(false)}
        />
      )}

      {/* Order Overview Card — mini map + status summary. */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: 168,
          borderRadius: 'var(--rounding-xl)',
          border: 'var(--stroke-xs) solid var(--border-neutral-default)',
          overflow: 'hidden',
          backgroundColor: 'var(--surface-neutral-bg-default)',
          flexShrink: 0,
        }}
      >
        <div style={{ width: '50%', flexShrink: 0 }}>
          <OrderMiniMap order={order} depotName={depotName} depotAddress={depotAddress} onExpand={() => setMapExpanded(true)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, padding: 'var(--padding-16px) var(--padding-20px)', gap: 'var(--spacing-12px)' }}>
          <SlaBlock model={model} elapsed={elapsed} />
          <div style={{ height: 0, borderTop: 'var(--stroke-xs) solid var(--border-neutral-default)', width: '100%' }} />
          <ContentPrimitives
            type="utility"
            text={model.summary.main}
            subtext={summarySub}
            showVisualAnchor={false}
            showPassiveElements={false}
            showInteractiveElements
            interactiveElements={
              <Button variant="secondary" size="medium" onClick={summaryCta}>
                {model.summary.ctaLabel}
              </Button>
            }
          />
        </div>
      </div>

      {/* Pickup Code card (pickup confirmation config; Ready + Assigned/At Depot). */}
      {model.showPickupCode && (
        <ContentCard style={{ padding: 'var(--padding-16px) var(--padding-20px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-24px)', width: '100%' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-8px)', flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', paddingTop: 2, color: 'var(--icons-neutral-default)', flexShrink: 0 }}>
                <Icon name="Lock" size={16} />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-label-m-semibold" style={{ color: 'var(--text-default-heading)' }}>Pickup Code</span>
                <span className="text-body-m-regular" style={{ color: 'var(--text-default-sub-body)' }}>Share with the driver at pickup</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-16px)' }}>
              <div style={{ display: 'flex', gap: 'var(--spacing-8px)' }}>
                {model.pickupCode.split('').map((d, i) => (
                  <span
                    key={i}
                    className="text-label-m-semibold"
                    style={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--rounding-lg)',
                      backgroundColor: 'var(--surface-neutral-bg-tertiary)',
                      color: 'var(--text-default-label)',
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
              <HoverTip label="Copy pickup code">
                <Button
                  variant="ghost"
                  size="small"
                  iconOnly="Copy"
                  iconOutlined
                  aria-label="Copy pickup code"
                  onClick={() => void navigator.clipboard.writeText(model.pickupCode)}
                />
              </HoverTip>
            </div>
          </div>
        </ContentCard>
      )}

      {/* Driver + Trip cards (driver-held / concluded-with-driver states). */}
      {model.showDriverCards && driver && (
        <div style={{ display: 'flex', gap: 'var(--spacing-16px)', width: '100%' }}>
          <ContentCard style={{ flex: 1, minWidth: 0 }}>
            <ContentPrimitives
              type="utility"
              text={driver.name}
              subtext={driver.phone.replace(/\s/g, '')}
              showVisualAnchor
              showLeadingIcon={false}
              showAvatar
              avatarName={driver.name}
              showPassiveElements={false}
              showInteractiveElements
              interactiveElements={
                <div style={{ display: 'flex', gap: 'var(--spacing-8px)' }}>
                  <HoverTip label="Change driver">
                    <Button variant="secondary" size="small" iconOnly="Swap" aria-label="Change driver" onClick={() => actions.stub('Change Driver')} />
                  </HoverTip>
                  <HoverTip label="Call driver">
                    <Button variant="secondary" size="small" iconOnly="Phone" iconOutlined aria-label="Call driver" onClick={() => actions.stub('Call Driver')} />
                  </HoverTip>
                </div>
              }
            />
          </ContentCard>
          <ContentCard style={{ flex: 1, minWidth: 0 }}>
            <ContentPrimitives
              type="utility"
              text={order.tripId ?? 'TRP-000'}
              subtext={`${(model.itemLines.length % 10) + 3} orders`}
              showVisualAnchor
              showLeadingIcon={false}
              showFeaturedIcon
              featuredIconName="Proceed"
              showPassiveElements={false}
              showInteractiveElements
              interactiveElements={
                <HoverTip label="Open trip">
                  <Button variant="secondary" size="small" iconOnly="Open" aria-label="Open trip" onClick={() => actions.stub('View Trip')} />
                </HoverTip>
              }
            />
          </ContentCard>
        </div>
      )}

      {/* Pickup From */}
      <Section title="Pickup From">
        <FieldRows
          fields={[
            <Field key="d" label="Depot" value={depotName} icon="Depot" />,
            <Field key="a" label="Pickup address" value={depotAddress} icon="Location" />,
          ]}
        />
        {model.showProofOfPickup && (
          <>
            <div style={{ height: 0, borderTop: 'var(--stroke-xs) solid var(--border-neutral-default)', width: '100%' }} />
            <ProofRow file={model.proofOfPickupFile} onView={setProofView} />
          </>
        )}
      </Section>

      {/* Proof of Delivery (Delivered only, POD config) */}
      {model.showProofOfDelivery && (
        <Section title="Proof of Delivery">
          <FieldRows
            fields={[
              <Field key="n" label="Recipient Name" value={model.pod.receivedBy} icon="User-Available" />,
              <Field key="p" label="Phone number" value={model.pod.phone} icon="Phone" />,
              <Field key="i" label="Recipient ID/Passport number" value={model.pod.idNumber} icon="ID" />,
              <Field key="r" label="Payment reference" value={model.pod.paymentRef} icon="Receipt" />,
            ]}
          />
          <div style={{ height: 0, borderTop: 'var(--stroke-xs) solid var(--border-neutral-default)', width: '100%' }} />
          <div style={{ display: 'flex', gap: 'var(--spacing-16px)', width: '100%' }}>
            {model.proofFiles.map((f) => (
              <ProofRow key={f.label} file={f} onView={setProofView} />
            ))}
          </div>
        </Section>
      )}

      {/* Deliver To */}
      <Section title="Deliver To">
        <FieldRows
          fields={[
            <Field key="n" label="Recipient name" value={order.customer} icon="User-Available" />,
            <Field key="a" label="Delivery address" value={order.dropoff.label} icon="Location" />,
            <Field key="p" label="Phone number" value={order.phone} icon="Phone" />,
            <Field key="e" label="Recipient email" value={model.recipientEmail} icon="Mail" />,
            <Field key="d" label="Delivery date" value={model.deliveryDateLabel} icon="Calendar" />,
            <Field key="r" label="Order reference" value={model.orderReference} />,
            <Field key="i" label="Delivery instructions" value={model.instructions} icon="Note" />,
          ]}
        />
      </Section>

      {/* Items */}
      <Section title="Items" count={model.itemLines.length}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20px)', width: '100%' }}>
          {pageItems.map((line, i) => (
            <ContentPrimitives
              key={`${itemsPage}-${i}`}
              type="utility"
              text={line.name}
              subtext={`${line.units} Unit${line.units === 1 ? '' : 's'}`}
              showVisualAnchor
              showLeadingIcon={false}
              showFeaturedIcon
              featuredIconName="Inventory"
              showPassiveElements={false}
              showInteractiveElements={false}
              showTrailingContent={false}
            />
          ))}
          {pageCount > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination variant="stacked-list" page={itemsPage} pageCount={pageCount} onPageChange={setItemsPage} />
            </div>
          )}
        </div>
      </Section>

      {/* Payment Information */}
      <Section title="Payment Information">
        {model.payment.available ? (
          <>
            <FieldRows
              fields={[
                <Field key="t" label="Payment type" value={model.payment.type} icon="Payment" />,
                <Field key="m" label="Payment Type" value={model.payment.method} />,
                <Field key="p" label="Product total" value={`KES ${model.payment.productTotal.toLocaleString()}`} icon="Orders" />,
                <Field key="f" label="Delivery fee" value={`KES ${model.payment.deliveryFee.toLocaleString()}`} icon="Wallet" />,
              ]}
            />
            <div style={{ height: 0, borderTop: 'var(--stroke-xs) solid var(--border-neutral-default)', width: '100%' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-label-m-semibold" style={{ color: 'var(--text-default-heading)' }}>Total</span>
                <span className="text-body-m-regular" style={{ color: 'var(--text-default-sub-body)' }}>VAT Incl.</span>
              </div>
              <span className="text-body-l-semibold" style={{ color: 'var(--text-default-heading)' }}>
                KES {model.payment.total.toLocaleString()}
              </span>
            </div>
          </>
        ) : (
          <FieldRows
            fields={[
              <Field key="m" label="Payment method" value="N/A" icon="Payment" />,
              <Field key="r" label="Reference number" value="N/A" />,
              <Field key="p" label="Product total" value="N/A" icon="Orders" />,
              <Field key="f" label="Delivery fee" value="N/A" icon="Wallet" />,
            ]}
          />
        )}
      </Section>

      {/* More Information */}
      <Section title="More Information">
        {model.showReturnedBanner && (
          <NotificationBanner
            type="neutral"
            variant="filled"
            description="Check the activity tab for more information on the last delivery attempt."
            cta={
              <Button variant="secondary" size="small" onClick={() => setTab(1)}>
                View Activity
              </Button>
            }
          />
        )}
        <FieldRows
          fields={[
            <Field key="c" label="Created" value={model.createdLabel} icon="Calendar" />,
            <Field key="cb" label="Created By" value={model.createdByLabel} icon={model.createdByIcon.icon} />,
            <Field key="d" label="Dispatched" value={model.dispatchedLabel} icon="Calendar" />,
            <Field key="db" label="Dispatched By" value={model.dispatchedByLabel} icon="User-Available" />,
            <Field key="dl" label="Delivered" value={model.deliveredLabel} icon="Calendar" />,
            <Field key="w" label="Weight" value="N/A" icon="Weight" />,
          ]}
        />
      </Section>
    </div>
  );

  const placeholderBody = (label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 480, padding: 'var(--padding-24px)' }}>
      <EmptyState
        type="no-data"
        size="desktop"
        heading="Nothing here yet"
        description={`The ${label} tab is coming soon.`}
      />
    </div>
  );

  const hasFooter = footer.leading != null || footer.trailing.length > 0 || footer.overflow.length > 0;

  return (
    <>
      {/* Scrim — motion driven inline (class-driven transforms proved flaky
          under HMR; inline state is deterministic). */}
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(16,16,16,0.4)',
          zIndex: 1500,
          opacity: entered && !closing ? 1 : 0,
          transition: closing ? 'opacity 200ms ease-in' : 'opacity 300ms ease-out',
        }}
      />
      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100dvh',
          zIndex: 1501,
          transform: entered && !closing ? 'translateX(0)' : 'translateX(100%)',
          transition: closing
            ? 'transform 220ms cubic-bezier(0.4, 0, 1, 1)'
            : 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
        }}
      >
        <ModalShell
          width={768}
          rounded={false}
          fillHeight
          role="dialog"
          aria-label={`Order ${order.id}`}
          onEscape={onClose}
          header={
            <ModalHeaders
              variant="with-tabs"
              title={order.id}
              onClose={onClose}
              showSecondaryContent
              secondaryLeading={headerIcons}
              secondaryTrailing={
                <div style={{ display: 'flex', gap: 'var(--spacing-8px)' }}>
                  <Button
                    variant="secondary"
                    size="small"
                    iconLeft="Copy"
                    iconOutlined
                    onClick={() => void navigator.clipboard.writeText(order.id)}
                  >
                    Order ID
                  </Button>
                  <Button variant="secondary" size="small" iconLeft="Link" onClick={() => actions.stub('Tracking Link')}>
                    Tracking Link
                  </Button>
                </div>
              }
              tabs={
                <PageTabsControl
                  tabs={[{ label: 'Overview' }, { label: 'Activity' }, { label: 'Dispatch Logs' }]}
                  value={tab}
                  onChange={setTab}
                />
              }
            />
          }
          footer={
            hasFooter ? (
              <FooterFrame
                variant="tertiary-action"
                leading={
                  footer.leading ? (
                    <Button
                      variant="ghost-error"
                      size="medium"
                      iconLeft={footer.leading === 'cancel' ? 'Delete' : 'Undo'}
                      iconOutlined
                      onClick={() => runAction(footer.leading!)}
                    >
                      {footer.leading === 'cancel' ? 'Cancel Order' : 'Return Order'}
                    </Button>
                  ) : undefined
                }
              >
                {footer.trailing.map((key) => (
                  <Button
                    key={key}
                    variant="secondary"
                    size="medium"
                    iconLeft={TRAILING[key]!.icon}
                    iconOutlined={TRAILING[key]!.outlined}
                    onClick={() => runAction(key)}
                  >
                    {TRAILING[key]!.label}
                  </Button>
                ))}
                {footer.overflow.length > 0 && (
                  <Button
                    variant="secondary"
                    size="medium"
                    iconOnly="More"
                    aria-label="More actions"
                    onClick={(e) => setMenuAnchor((e.currentTarget as HTMLElement).getBoundingClientRect())}
                  />
                )}
              </FooterFrame>
            ) : null
          }
          bodyStyle={{ backgroundColor: 'var(--surface-neutral-bg-muted)' }}
        >
          {tab === 0 ? overviewBody : tab === 1 ? placeholderBody('Activity') : placeholderBody('Dispatch Logs')}
        </ModalShell>
      </div>

      {/* Footer ⋯ overflow (§12.7; Returned drops Update Status per v2.8). */}
      {menuAnchor && (
        <Popover anchorRect={menuAnchor} onClose={() => setMenuAnchor(null)} placement="top-end">
          <MenuPanel width={220}>
            {footer.overflow.map((key, i) => (
              <React.Fragment key={key}>
                {/* Update Status sits alone above a divider (wireframe `133:71299`). */}
                {i === 1 && footer.overflow[0] === 'updateStatus' && <MenuDivider />}
                <DesktopMenuOptions
                  type="dropdown-basic"
                  label={OVERFLOW[key]!.label}
                  showLeadingIcon
                  leadingIcon={OVERFLOW[key]!.icon}
                  showChevron={false}
                  onSelect={() => {
                    setMenuAnchor(null);
                    runAction(key);
                  }}
                />
              </React.Fragment>
            ))}
          </MenuPanel>
        </Popover>
      )}

      {/* Expanded map (§7.2 expanded mode) — portaled: the drawer panel is a
          transformed ancestor, which would otherwise re-anchor these fixed
          overlays to itself instead of the viewport. */}
      {mapExpanded && createPortal(
        <ExpandedMapOverlay
          order={order}
          depotName={depotName}
          depotAddress={depotAddress}
          banner={
            order.driverId && driver
              ? {
                  text:
                    status === 'returning'
                      ? `${driver.name} is returning to the depot.`
                      : status === 'in-transit' || status === 'arrived'
                        ? `${driver.name} is on the way to ${order.customer.split(' ')[0]}.`
                        : `${driver.name} is on the way to the depot.`,
                  ctaLabel: 'View Activity',
                  onCta: () => {
                    setMapExpanded(false);
                    setTab(1);
                  },
                }
              : {
                  text: 'Dispatch now to generate a delivery route.',
                  ctaLabel: 'Dispatch',
                  onCta: () => {
                    setMapExpanded(false);
                    actions.dispatch(order.id);
                  },
                }
          }
          onClose={() => setMapExpanded(false)}
        />,
        document.body,
      )}

      {/* Proof viewers (Recipient Signature / Proof of Pickup / Proof of Delivery). */}
      {proofView && createPortal(
        <>
          <div aria-hidden onClick={() => setProofView(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(16,16,16,0.4)', zIndex: 1700 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1701 }}>
            <ModalDialog
              variant={proofView.viewer}
              title={proofView.title}
              imageSrc={proofView.src}
              signatureSrc={proofView.src}
              cancelLabel="Close"
              showConfirm={false}
              onCancel={() => setProofView(null)}
              onClose={() => setProofView(null)}
            />
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
