import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FooterFrame } from './FooterFrame.js';
import { useScrollShadow } from './useScrollShadow.js';
import { Button } from '../Button/Button.js';
import { SelectionControl } from '../SelectionControl/SelectionControl.js';
import { NotificationBanner } from '../NotificationBanner/NotificationBanner.js';

const meta: Meta<typeof FooterFrame> = {
  title: 'Molecules/FooterFrame',
  component: FooterFrame,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The bottom action region of modals, cards, and panels — a horizontal shell with optional ' +
          'leading content on the left and a right-aligned row of action buttons on the right.' +
          '\n\n' +
          'Figma `6448:32008`. Slot-based: `variant` sets height/padding/background; the caller slots ' +
          '`leading` content and the action `children`. **default** (actions only) · **tertiary-action** ' +
          '(a Button set apart) · **data-summary** (stat blocks, 72px) · **preference** (a Selection ' +
          'Control) · **validation** (an error Notification Banner) · **card** (compact 40px, transparent).' +
          '\n\n' +
          '_Validation / Card use a Subtle NotificationBanner in the leading slot._' +
          '\n\n' +
          '**Scroll behaviour:** when the footer pins below a scrollable region, set `scrollShadow` ' +
          'to show a subtle upward drop shadow that separates it from the content scrolling underneath. ' +
          'This applies to **every variant except `card`** (Card footers are flush/transparent and never ' +
          'carry the shadow — passing `scrollShadow` on a card is a no-op).',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof FooterFrame>;

/** The standard trailing action set: two Secondary + one Primary. */
const Actions = () => (
  <>
    <Button variant="secondary" size="medium">Action</Button>
    <Button variant="secondary" size="medium">Action</Button>
    <Button variant="primary" size="medium">Action</Button>
  </>
);

/** One Data Summary stat block: a big number over muted subtext. */
const Stat = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4px)', alignItems: 'flex-start' }}>
    <span className="text-label-l-semibold" style={{ color: 'var(--text-default-heading)' }}>10</span>
    <span className="text-body-s-regular" style={{ color: 'var(--text-default-label-idle)' }}>Enter text</span>
  </div>
);

const Demarcator = () => (
  <div style={{ alignSelf: 'stretch', width: 'var(--stroke-xs)', backgroundColor: 'var(--border-neutral-default)' }} />
);

const DataSummaryRow = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-12px)' }}>
    <Stat />
    <Demarcator />
    <Stat />
    <Demarcator />
    <Stat />
    <Demarcator />
    <Stat />
  </div>
);

const ValidationBanner = ({ type }: { type: 'error' | 'info' }) => (
  <NotificationBanner
    type={type}
    variant="subtle"
    description="Validation goes here. Keep it short"
    showContentButtons={false}
  />
);

export const Default: Story = {
  render: () => (
    <FooterFrame variant="default">
      <Actions />
    </FooterFrame>
  ),
};

export const TertiaryAction: Story = {
  render: () => (
    <FooterFrame variant="tertiary-action" leading={<Button variant="secondary" size="medium">Action</Button>}>
      <Actions />
    </FooterFrame>
  ),
};

export const DataSummary: Story = {
  render: () => (
    <FooterFrame variant="data-summary" leading={<DataSummaryRow />}>
      <Actions />
    </FooterFrame>
  ),
};

export const Preference: Story = {
  render: () => (
    <FooterFrame
      variant="preference"
      leading={<SelectionControl variant="checkbox" label="Don’t show this again" />}
    >
      <Actions />
    </FooterFrame>
  ),
};

export const Validation: Story = {
  render: () => (
    <FooterFrame variant="validation" leading={<ValidationBanner type="error" />}>
      <Actions />
    </FooterFrame>
  ),
};

export const Card: Story = {
  render: () => (
    <FooterFrame variant="card" leading={<ValidationBanner type="info" />}>
      <Button variant="secondary" size="medium">Action</Button>
      <Button variant="primary" size="medium">Action</Button>
    </FooterFrame>
  ),
};

/**
 * **Static** `scrollShadow` — pass `true` when the container is always scrollable
 * and you don't need dynamic on/off behaviour (e.g. Desktop Dropdowns whose lists
 * always overflow). The shadow shows unconditionally.
 */
export const ScrollShadowStatic: Story = {
  name: 'Scroll Shadow (static)',
  render: () => (
    <div style={{ width: 420, border: 'var(--stroke-xs) solid var(--border-neutral-default)', borderRadius: 'var(--rounding-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 120, overflowY: 'auto', padding: 'var(--padding-16px)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12px)' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="text-body-m-regular" style={{ color: 'var(--text-default-body)' }}>Scrollable item {i + 1}</span>
        ))}
      </div>
      <FooterFrame variant="default" scrollShadow style={{ flexShrink: 0 }}>
        <Actions />
      </FooterFrame>
    </div>
  ),
};

/**
 * **Dynamic** `scrollShadow` via `useScrollShadow(ref)` — the shadow appears only
 * while there is content below the fold, and disappears once the user scrolls to the
 * bottom. Use this pattern in any surface where the list may or may not overflow
 * (panels, configuration cards, playground screens).
 *
 * ```tsx
 * const bodyRef = useRef<HTMLDivElement>(null);
 * const scrollShadow = useScrollShadow(bodyRef);
 *
 * <div ref={bodyRef} style={{ overflowY: 'auto', maxHeight: 120 }}>{items}</div>
 * <FooterFrame scrollShadow={scrollShadow}>…</FooterFrame>
 * ```
 *
 * Scroll the list to the bottom — the shadow disappears. Scroll back up — it returns.
 * Try resizing the panel (the `ResizeObserver` inside the hook re-evaluates on
 * every layout change, not just scroll events).
 */
export const ScrollShadowDynamic: Story = {
  name: 'Scroll Shadow (dynamic via useScrollShadow)',
  render: () => {
    const bodyRef = React.useRef<HTMLDivElement>(null);
    const scrollShadow = useScrollShadow(bodyRef);
    return (
      <div style={{ width: 420, border: 'var(--stroke-xs) solid var(--border-neutral-default)', borderRadius: 'var(--rounding-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div
          ref={bodyRef}
          style={{ height: 120, overflowY: 'auto', padding: 'var(--padding-16px)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12px)' }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="text-body-m-regular" style={{ color: 'var(--text-default-body)' }}>Scrollable item {i + 1}</span>
          ))}
        </div>
        <FooterFrame variant="default" scrollShadow={scrollShadow} style={{ flexShrink: 0 }}>
          <Actions />
        </FooterFrame>
      </div>
    );
  },
};

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FooterFrame variant="default"><Actions /></FooterFrame>
      <FooterFrame variant="tertiary-action" leading={<Button variant="secondary" size="medium">Action</Button>}>
        <Actions />
      </FooterFrame>
      <FooterFrame variant="data-summary" leading={<DataSummaryRow />}><Actions /></FooterFrame>
      <FooterFrame variant="preference" leading={<SelectionControl variant="checkbox" label="Don’t show this again" />}>
        <Actions />
      </FooterFrame>
      <FooterFrame variant="validation" leading={<ValidationBanner type="error" />}><Actions /></FooterFrame>
      <FooterFrame variant="card" leading={<ValidationBanner type="info" />}>
        <Button variant="secondary" size="medium">Action</Button>
        <Button variant="primary" size="medium">Action</Button>
      </FooterFrame>
    </div>
  ),
};
