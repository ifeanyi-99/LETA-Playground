import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  ModalShell,
  ModalHeaders,
  FooterFrame,
  InputGroup,
  FormDemarcator,
  InputField,
  Select,
  SearchInput,
  TextArea,
  Stepper,
  NotificationBanner,
  Button,
  DateTimePicker,
  LeadingInputFieldElement,
  DesktopMenuOptions,
} from '@leta/components';
import type { ClientConfig } from '../store/types.js';
import type { NewOrderInput } from '../store/useStore.js';
import { Popover, MenuPanel } from './Popover.js';

interface AddOrderDrawerProps {
  open: boolean;
  /** Active client config — drives which fields/sections render. */
  config: ClientConfig;
  onClose: () => void;
  /** Fired with the built order + whether it's scheduled (>1h out) vs immediate. */
  onSubmit: (order: NewOrderInput, scheduled: boolean) => void;
}

// Slide-in from the right edge (design-system overlay motion; honours reduced-motion).
const DRAWER_STYLE_ID = 'leta-add-order-drawer-motion';
const DRAWER_CSS = `
@keyframes leta-drawer-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes leta-drawer-scrim-in { from { opacity: 0; } to { opacity: 1; } }
.leta-drawer-panel { animation: leta-drawer-in 240ms cubic-bezier(0.16, 1, 0.3, 1); will-change: transform; }
.leta-drawer-scrim { animation: leta-drawer-scrim-in 200ms ease-out; }
@media (prefers-reduced-motion: reduce) { .leta-drawer-panel, .leta-drawer-scrim { animation: none; } }
`;
function ensureDrawerStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(DRAWER_STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = DRAWER_STYLE_ID;
  el.textContent = DRAWER_CSS;
  document.head.appendChild(el);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const NAIROBI = { lat: -1.286, lng: 36.817 };

interface ItemRow {
  key: number;
  /** manual mode: the typed item name. */
  name: string;
  /** product mode: the selected product id. */
  productId: string;
  qty: number;
}

/** Parse "8:00 AM" / "08:30 PM" into { h, m } 24h. */
function parseTime(time: string | null | undefined): { h: number; m: number } {
  if (!time) return { h: 12, m: 0 };
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(time);
  if (!match) return { h: 12, m: 0 };
  let h = parseInt(match[1]!, 10) % 12;
  if (/PM/i.test(match[3]!)) h += 12;
  return { h, m: parseInt(match[2]!, 10) };
}

/**
 * AddOrderDrawer — the config-aware order-creation form (OM Foundations Doc 1 §4),
 * a right-anchored full-viewport side sheet. Composes the design-system `ModalShell`
 * (`fillHeight`: sticky header/footer + scrolling body + scroll-shadows) with
 * `ModalHeaders` + `FooterFrame`, and builds the form from `InputGroup` sections +
 * the field atoms. What renders is driven by the active {@link ClientConfig}:
 *   - Pickup depot: 1 depot -> locked `InputField` (+ address helper); 2+ -> `Select` dropdown.
 *   - Items section: only if `items.enabled`; each row is a name field (manual -> `InputField`,
 *     product -> `Select`) + quantity `Stepper` + Remove; an error banner appears above Add Item
 *     when 0 items are entered on submit.
 *   - Payment Info: only if `payment.enabled`; Items value is editable (manual) or derived+locked
 *     (product = sum price*qty), plus Delivery fee, Payment type, and a Total (VAT Incl.) row.
 * Two columns when the right column has content, else single column.
 */
export function AddOrderDrawer({ open, config, onClose, onSubmit }: AddOrderDrawerProps): React.ReactElement | null {
  ensureDrawerStyles();

  const singleDepot = config.depots.length === 1;
  const hasRightColumn = config.items.enabled || config.payment.enabled;

  // form state
  const [depotId, setDepotId] = React.useState(config.depots[0]?.id ?? '');
  const [recipient, setRecipient] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [dateLabel, setDateLabel] = React.useState('');
  const [deliveryAt, setDeliveryAt] = React.useState<Date | null>(null);
  const [orderRef, setOrderRef] = React.useState('');
  const [instructions, setInstructions] = React.useState('');
  const [items, setItems] = React.useState<ItemRow[]>([]);
  const [manualValue, setManualValue] = React.useState('');
  const [deliveryFee, setDeliveryFee] = React.useState('');
  const [paymentType, setPaymentType] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [confirmExit, setConfirmExit] = React.useState(false);
  const itemSeq = React.useRef(0);

  // Reset whenever the drawer (re)opens or the client config changes.
  React.useEffect(() => {
    if (!open) return;
    setDepotId(config.depots[0]?.id ?? '');
    setRecipient(''); setAddress(''); setPhone(''); setEmail('');
    setDateLabel(''); setDeliveryAt(null); setOrderRef(''); setInstructions('');
    setItems([]); setManualValue(''); setDeliveryFee(''); setPaymentType('');
    setSubmitted(false); setDirty(false); setConfirmExit(false);
  }, [open, config]);

  // Single portal picker overlay (depot / product-row / payment-type / date).
  type Picker =
    | { kind: 'depot'; anchor: DOMRect }
    | { kind: 'product'; anchor: DOMRect; rowKey: number }
    | { kind: 'payment'; anchor: DOMRect }
    | { kind: 'date'; anchor: DOMRect };
  const [picker, setPicker] = React.useState<Picker | null>(null);
  const openPicker = (p: Picker) => setPicker(p);
  // `Select.onSelectClick` carries no event, so each picker field's wrapper captures
  // its own rect on click-capture (fires before onSelectClick) into this shared ref;
  // the picker Popover then anchors to it.
  const fieldRectRef = React.useRef<DOMRect | null>(null);
  const captureRect = (e: React.MouseEvent) => { fieldRectRef.current = (e.currentTarget as HTMLElement).getBoundingClientRect(); };
  const anchor = () => fieldRectRef.current ?? new DOMRect(0, 0, 320, 40);

  const touch = () => setDirty(true);

  if (!open) return null;

  // derived
  const products = config.products;
  const productMode = config.items.mode === 'product';
  const derivedItemsValue = items.reduce((sum, r) => {
    const p = products.find((x) => x.id === r.productId);
    return sum + (p ? p.price * r.qty : 0);
  }, 0);
  const itemsValueNum = productMode ? derivedItemsValue : parseFloat(manualValue) || 0;
  const feeNum = parseFloat(deliveryFee) || 0;
  const total = itemsValueNum + feeNum;

  const itemsMissing = config.items.enabled && config.items.valueRequired && items.length === 0;

  // item mutations
  const addItem = () => { touch(); setItems((rows) => [...rows, { key: ++itemSeq.current, name: '', productId: '', qty: 1 }]); };
  const removeItem = (key: number) => { touch(); setItems((rows) => rows.filter((r) => r.key !== key)); };
  const patchItem = (key: number, patch: Partial<ItemRow>) => { touch(); setItems((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r))); };

  // close / submit
  const attemptClose = () => { if (dirty) setConfirmExit(true); else onClose(); };

  const handleSubmit = () => {
    setSubmitted(true);
    const depot = config.depots.find((d) => d.id === depotId);
    const valid = Boolean(depot && recipient.trim() && address.trim() && phone.trim() && deliveryAt) && !itemsMissing;
    if (!valid) return;

    const scheduled = deliveryAt!.getTime() > Date.now() + 60 * 60 * 1000;
    const names = productMode
      ? items.map((r) => products.find((p) => p.id === r.productId)?.name).filter(Boolean).join(', ')
      : items.map((r) => r.name).filter(Boolean).join(', ');
    const order: NewOrderInput = {
      customer: recipient.trim(),
      phone: `+254 ${phone.trim()}`,
      depot: depot!.name,
      pickup: { label: depot!.name, ...NAIROBI },
      dropoff: { label: address.trim(), lat: NAIROBI.lat + 0.01, lng: NAIROBI.lng + 0.01 },
      package: names || 'Items',
      items: items.reduce((n, r) => n + r.qty, 0) || items.length,
      priority: 'standard',
      status: scheduled ? 'scheduled' : 'pending',
      createdAt: new Date().toISOString(),
    };
    onSubmit(order, scheduled);
  };

  const err = (v: string) => submitted && !v.trim();

  // sections
  const pickupField = singleDepot ? (
    <InputField
      variant="basic"
      showLabel={false}
      disabled
      value={config.depots[0]?.name ?? ''}
      helperText={config.depots[0]?.address}
      style={{ width: '100%' }}
      readOnly
    />
  ) : (
    <div data-picker-field onClickCapture={captureRect} style={{ position: 'relative' }}>
      <Select
        showLabel={false}
        leadingFieldIcon="Search"
        placeholder="Search depot"
        value={config.depots.find((d) => d.id === depotId)?.name ?? ''}
        showHelper={false}
        error={submitted && !depotId ? 'Select a depot' : undefined}
        onSelectClick={() => openPicker({ kind: 'depot', anchor: anchor() })}
        readOnly
        style={{ width: '100%' }}
      />
    </div>
  );

  const deliverFields = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20px)', width: '100%' }}>
      <SearchInput
        label="Recipient name"
        placeholder="Search or enter new recipient name"
        value={recipient}
        error={err(recipient)}
        errorMessage="Enter a recipient name"
        onChange={(e) => { touch(); setRecipient(e.target.value); }}
        onClear={() => setRecipient('')}
        style={{ width: '100%' }}
      />
      <SearchInput
        label="Delivery address"
        placeholder="Search address"
        value={address}
        error={err(address)}
        errorMessage="Enter a delivery address"
        onChange={(e) => { touch(); setAddress(e.target.value); }}
        onClear={() => setAddress('')}
        style={{ width: '100%' }}
      />
      <InputField
        variant="leading"
        label="Phone number"
        placeholder="70000000"
        inputMode="tel"
        value={phone}
        error={err(phone) ? 'Enter a phone number' : undefined}
        showHelper={submitted && err(phone)}
        onChange={(e) => { touch(); setPhone(e.target.value); }}
        leadingElement={<LeadingInputFieldElement variant="single" countryCode="KE" dialCode="+254" />}
        style={{ width: '100%' }}
      />
      <InputField
        variant="basic"
        label="Recipient email"
        tag="optional"
        placeholder="Enter recipient email address"
        inputMode="email"
        value={email}
        showHelper={false}
        onChange={(e) => { touch(); setEmail(e.target.value); }}
        style={{ width: '100%' }}
      />
      <div data-picker-field onClickCapture={captureRect} style={{ position: 'relative' }}>
        <Select
          label="Delivery date"
          leadingFieldIcon="Calendar"
          placeholder="Select delivery date & time"
          value={dateLabel}
          showHelper={false}
          error={submitted && !deliveryAt ? 'Select a delivery date' : undefined}
          onSelectClick={() => openPicker({ kind: 'date', anchor: anchor() })}
          readOnly
          style={{ width: '100%' }}
        />
      </div>
      <InputField
        variant="basic"
        label="Order reference"
        tag="optional"
        placeholder="E.g #001"
        helperText="For internal reference"
        value={orderRef}
        onChange={(e) => { touch(); setOrderRef(e.target.value); }}
        style={{ width: '100%' }}
      />
      <TextArea
        label="Delivery instructions"
        tag="optional"
        placeholder="Enter delivery instructions or apartment/suite number"
        maxLength={100}
        value={instructions}
        onChange={(e) => { touch(); setInstructions(e.target.value); }}
        style={{ width: '100%' }}
      />
    </div>
  );

  const leftColumn = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-32px)', flex: 1, minWidth: 0 }}>
      <InputGroup title="Pickup From">{pickupField}</InputGroup>
      <FormDemarcator />
      <InputGroup title="Deliver To">{deliverFields}</InputGroup>
    </div>
  );

  const itemsSection = config.items.enabled ? (
    <InputGroup title="Items">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16px)', width: '100%' }}>
        {itemsMissing && submitted && (
          <NotificationBanner
            type="error"
            variant="filled"
            description="You need at least one item to place an order."
          />
        )}
        {items.map((row) => (
          <div key={row.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8px)', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 'var(--spacing-8px)', width: '100%' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {productMode ? (
                  <div data-picker-field onClickCapture={captureRect} style={{ position: 'relative' }}>
                    <Select
                      showLabel={false}
                      showHelper={false}
                      placeholder="Select product"
                      value={products.find((p) => p.id === row.productId)?.name ?? ''}
                      onSelectClick={() => openPicker({ kind: 'product', anchor: anchor(), rowKey: row.key })}
                      readOnly
                      style={{ width: '100%' }}
                    />
                  </div>
                ) : (
                  <InputField
                    showLabel={false}
                    showHelper={false}
                    placeholder="Item name"
                    value={row.name}
                    onChange={(e) => patchItem(row.key, { name: e.target.value })}
                    style={{ width: '100%' }}
                  />
                )}
              </div>
              <Stepper value={row.qty} min={1} onChange={(v) => patchItem(row.key, { qty: v })} aria-label="Quantity" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Button variant="plain" size="medium" iconLeft="Delete" iconOutlined onClick={() => removeItem(row.key)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
        <div>
          <Button variant="dashed" size="medium" iconLeft="Add" onClick={addItem}>Add Item</Button>
        </div>
      </div>
    </InputGroup>
  ) : null;

  const paymentSection = config.payment.enabled ? (
    <InputGroup title="Payment Info">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20px)', width: '100%' }}>
        <InputField
          variant="basic"
          label="Items value"
          currency="KES"
          placeholder="0.00"
          inputMode="decimal"
          showHelper={false}
          disabled={productMode}
          value={productMode ? (derivedItemsValue ? String(derivedItemsValue) : '') : manualValue}
          onChange={(e) => { touch(); setManualValue(e.target.value); }}
          style={{ width: '100%' }}
        />
        <InputField
          variant="basic"
          label="Delivery fee"
          currency="KES"
          placeholder="0.00"
          inputMode="decimal"
          showHelper={false}
          value={deliveryFee}
          onChange={(e) => { touch(); setDeliveryFee(e.target.value); }}
          style={{ width: '100%' }}
        />
        <div data-picker-field onClickCapture={captureRect} style={{ position: 'relative' }}>
          <Select
            label="Payment type"
            tag="optional"
            placeholder="Select payment method"
            value={paymentType}
            showHelper={false}
            onSelectClick={() => openPicker({ kind: 'payment', anchor: anchor() })}
            readOnly
            style={{ width: '100%' }}
          />
        </div>
        {total > 0 && (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 'var(--spacing-4px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="text-label-l-semibold" style={{ color: 'var(--text-default-heading)' }}>Total</span>
              <span className="text-body-s-regular" style={{ color: 'var(--text-default-sub-body)' }}>VAT Incl.</span>
            </div>
            <span className="text-heading-s-semibold" style={{ color: 'var(--text-default-heading)' }}>
              KES {total.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </InputGroup>
  ) : null;

  const rightColumn = hasRightColumn ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-32px)', flex: 1, minWidth: 0 }}>
      {itemsSection}
      {paymentSection}
    </div>
  ) : null;

  const body = (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--spacing-20px)', width: '100%', alignItems: 'stretch', paddingBottom: 40 }}>
      {leftColumn}
      {rightColumn && (
        <>
          <div style={{ width: 0, flexShrink: 0, borderLeft: 'var(--stroke-xs) solid var(--border-neutral-default)' }} />
          {rightColumn}
        </>
      )}
    </div>
  );

  const PAYMENT_METHODS = ['Cash', 'M-Pesa', 'Card', 'Payment on Delivery'];

  return createPortal(
    <>
      <div
        aria-hidden
        className="leta-drawer-scrim"
        onClick={attemptClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(16,16,16,0.4)', zIndex: 1500 }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add Order"
        className="leta-drawer-panel"
        style={{ position: 'fixed', top: 0, right: 0, height: '100dvh', zIndex: 1501 }}
      >
        <ModalShell
          width={768}
          rounded={false}
          fillHeight
          bodyStyle={{ padding: 'var(--padding-24px) var(--padding-16px) 0' }}
          header={<ModalHeaders title="Add Order" showSecondaryContent={false} onClose={attemptClose} />}
          footer={
            <FooterFrame>
              <Button variant="secondary" size="medium" onClick={attemptClose}>Cancel</Button>
              <Button variant="primary" size="medium" onClick={handleSubmit}>Add Order</Button>
            </FooterFrame>
          }
        >
          {body}
        </ModalShell>
      </div>

      {picker?.kind === 'depot' && (
        <Popover anchorRect={picker.anchor} onClose={() => setPicker(null)} placement="bottom-start">
          <MenuPanel width={Math.max(280, picker.anchor.width)}>
            {config.depots.map((d) => (
              <DesktopMenuOptions
                key={d.id}
                type="combobox"
                label={d.name}
                active={d.id === depotId}
                onClick={() => { touch(); setDepotId(d.id); setPicker(null); }}
              />
            ))}
          </MenuPanel>
        </Popover>
      )}
      {picker?.kind === 'product' && (
        <Popover anchorRect={picker.anchor} onClose={() => setPicker(null)} placement="bottom-start">
          <MenuPanel width={Math.max(280, picker.anchor.width)}>
            {products.map((p) => (
              <DesktopMenuOptions
                key={p.id}
                type="combobox"
                label={`${p.name} - KES ${p.price}`}
                active={p.id === items.find((r) => r.key === picker.rowKey)?.productId}
                onClick={() => { patchItem(picker.rowKey, { productId: p.id }); setPicker(null); }}
              />
            ))}
          </MenuPanel>
        </Popover>
      )}
      {picker?.kind === 'payment' && (
        <Popover anchorRect={picker.anchor} onClose={() => setPicker(null)} placement="bottom-start">
          <MenuPanel width={Math.max(280, picker.anchor.width)}>
            {PAYMENT_METHODS.map((m) => (
              <DesktopMenuOptions
                key={m}
                type="combobox"
                label={m}
                active={m === paymentType}
                onClick={() => { touch(); setPaymentType(m); setPicker(null); }}
              />
            ))}
          </MenuPanel>
        </Popover>
      )}
      {picker?.kind === 'date' && (
        <Popover anchorRect={picker.anchor} onClose={() => setPicker(null)} placement="bottom-start">
          <DateTimePicker
            type="date-time"
            platform="desktop"
            onApply={(v) => {
              const d = v.date ?? null;
              if (d) {
                const { h, m } = parseTime(v.time);
                const dt = new Date(d);
                dt.setHours(h, m, 0, 0);
                setDeliveryAt(dt);
                const timeStr = v.time ?? '12:00 AM';
                setDateLabel(`${MONTHS[dt.getMonth()]} ${dt.getDate()} ${dt.getFullYear()}, ${timeStr}`);
                touch();
              }
              setPicker(null);
            }}
          />
        </Popover>
      )}

      {confirmExit && (
        <>
          <div aria-hidden onClick={() => setConfirmExit(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(16,16,16,0.4)', zIndex: 1600 }} />
          <div
            role="alertdialog"
            aria-label="Discard changes"
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1601,
              width: 420, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8px)',
              padding: 'var(--padding-24px)', backgroundColor: 'var(--surface-neutral-bg-default)',
              border: 'var(--stroke-xs) solid var(--border-neutral-default)', borderRadius: 'var(--rounding-xl)',
              boxShadow: 'var(--shadow-neutral-3)',
            }}
          >
            <span className="text-heading-s-semibold" style={{ color: 'var(--text-default-heading)' }}>Discard this order?</span>
            <span className="text-body-m-regular" style={{ color: 'var(--text-default-sub-body)' }}>
              You have unsaved changes. Are you sure you want to discard them?
            </span>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 'var(--spacing-8px)', marginTop: 'var(--spacing-12px)' }}>
              <Button variant="secondary" size="medium" onClick={() => setConfirmExit(false)}>Continue Editing</Button>
              <Button variant="primary" size="medium" onClick={() => { setConfirmExit(false); onClose(); }}>Discard</Button>
            </div>
          </div>
        </>
      )}
    </>,
    document.body,
  );
}
