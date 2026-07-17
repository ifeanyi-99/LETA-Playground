import * as React from 'react';
import { ModalShell } from '../Modal/ModalShell.js';
import { ModalHeaders } from '../ModalHeaders/ModalHeaders.js';
import { FooterFrame } from '../FooterFrame/FooterFrame.js';
import { Button } from '../Button/Button.js';
import { PageTabsControl } from '../PageTabsControl/PageTabsControl.js';
import { InputSection, InputGroup, FormDemarcator } from '../InputSection/InputSection.js';
import { ListSection } from '../ListSection/ListSection.js';
import { TableSection } from '../TableSection/TableSection.js';
import { SelectionControl } from '../SelectionControl/SelectionControl.js';

export type LargeModalVariant =
  | 'single-column-form'
  | 'dual-column-form'
  | 'drawer-read'
  | 'centered';

export interface LargeModalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Which large-modal treatment. Default `centered`. */
  variant?: LargeModalVariant;
  /** Modal title. Default "Title". */
  title?: string;
  /**
   * The header tab row (drawer variants use the `with-tabs` header). Defaults to
   * a 3-tab `PageTabsControl`. Ignored for `centered` (default header, no tabs).
   */
  tabs?: React.ReactNode;
  /** Body override — replaces the variant's default scrolling body. */
  children?: React.ReactNode;
  /** Footer leading content (the `preference` footer's persistent control). */
  footerLeading?: React.ReactNode;
  /** Cancel label. Default "Close" (centered) / "Cancel" (drawers). */
  cancelLabel?: string;
  /** Confirm label. Default "Confirm" (centered) / "Save" (drawers). */
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  /** Header close handler. Falls back to `onCancel`. */
  onClose?: () => void;
  /**
   * Number of active filter rules. Forwarded to the default `centered` variant's
   * `TableSection`. Ignored when `children` is overridden. Default 0.
   */
  filterCount?: number;
}

/** Default header tabs — a small self-contained controlled PageTabsControl. */
function DefaultTabs() {
  const [active, setActive] = React.useState(0);
  return (
    <PageTabsControl
      tabs={[{ label: 'Default' }, { label: 'Default' }, { label: 'Default' }]}
      value={active}
      onChange={setActive}
    />
  );
}

function defaultBody(variant: LargeModalVariant, filterCount: number): React.ReactNode {
  // The inner form column is taller than the body slot → the body scrolls.
  // pad-bottom 100 mirrors Figma's trailing scroll space.
  switch (variant) {
    case 'single-column-form':
      // Short form: one vertical column of stacked Input Sections.
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 100, width: '100%' }}>
          <InputSection />
          <InputSection />
          <InputSection />
        </div>
      );
    case 'dual-column-form':
      // Long form split into 2+ independent groups → two columns separated by a
      // vertical solid demarcator that runs the full body height (down to the
      // footer), even when the columns are short. `flex: 1 0 auto` fills the body
      // when content is short and grows past it when content scrolls.
      return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 20, width: '100%', alignItems: 'stretch', flex: '1 0 auto', minHeight: 0 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 100 }}>
            <InputSection />
          </div>
          <div style={{ width: 0, flexShrink: 0, borderLeft: 'var(--stroke-xs) solid var(--border-neutral-default)' }} />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 100 }}>
            <InputSection />
          </div>
        </div>
      );
    case 'drawer-read':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 100, width: '100%' }}>
          <ListSection defaultOpen />
          <ListSection defaultOpen />
          <ListSection defaultOpen />
        </div>
      );
    case 'centered':
      // Figma centered = a compact Input Section (one group, two fields) + dashed
      // demarcator + a Table Section, both collapsible.
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 100, width: '100%' }}>
          <InputSection title="Text">
            <InputGroup
              fields={[
                { variant: 'basic', label: 'Label Text', placeholder: 'Field Text', showHelper: false },
                { variant: 'basic', label: 'Label Text', placeholder: 'Field Text', showHelper: false },
              ]}
            />
          </InputSection>
          <FormDemarcator />
          <TableSection defaultOpen filterCount={filterCount} />
        </div>
      );
  }
}

/**
 * Large Modal (`228:11413`) — 768px-wide modal with a **scrolling** body.
 * - **single-column-form** — square drawer; `with-tabs` header; one vertical column
 *   of stacked `InputSection`s. For **short forms** where the user doesn't have to
 *   work through 4+ accordions nesting text fields.
 * - **dual-column-form** — square drawer; two columns of `InputSection`s split by a
 *   full-height vertical **solid** demarcator (it runs to the footer even when the
 *   columns are collapsed). For **long forms** where a single column means heavy
 *   scrolling and the fields fall into 2+ independent groups.
 * - **drawer-read** — square drawer; `with-tabs` header; body = stacked `ListSection`s.
 * - **centered** — radius 12; default header; body = `InputSection` + demarcator + `TableSection`.
 *
 * Drawers are 768-wide, **full viewport height** (square side-sheets) with a
 * sticky header/footer and a scrolling body; centered is 768×768 (rounded). All
 * use the `preference` footer.
 */
export const LargeModal = React.forwardRef<HTMLDivElement, LargeModalProps>(
  function LargeModal(
    {
      variant = 'centered',
      title = 'Title',
      tabs,
      children,
      footerLeading,
      cancelLabel,
      confirmLabel,
      onCancel,
      onConfirm,
      onClose,
      filterCount = 0,
      ...rest
    },
    ref,
  ) {
    const isDrawer = variant !== 'centered';
    const isCentered = variant === 'centered';
    // Drawers fill the viewport height (sticky header/footer, scrolling body);
    // centered is a fixed 768×768 with a 608px body.
    const bodyHeight = isDrawer ? undefined : 768 - 80 - 80;

    // Centered uses Close/Confirm + a "Don't show this again" preference toggle;
    // drawers use Cancel/Save with no leading control.
    const resolvedCancel = cancelLabel ?? (isCentered ? 'Close' : 'Cancel');
    const resolvedConfirm = confirmLabel ?? (isCentered ? 'Confirm' : 'Save');
    const resolvedLeading =
      footerLeading ??
      (isCentered ? <SelectionControl variant="checkbox" label="Don't show this again" /> : undefined);

    return (
      <ModalShell
        ref={ref}
        width={768}
        rounded={!isDrawer}
        role="dialog"
        aria-label={title}
        onEscape={onClose ?? onCancel}
        header={
          <ModalHeaders
            variant={isDrawer ? 'with-tabs' : 'default'}
            title={title}
            onClose={onClose ?? onCancel}
            showSecondaryContent={false}
            tabs={isDrawer ? tabs ?? <DefaultTabs /> : undefined}
          />
        }
        footer={
          <FooterFrame variant="preference" leading={resolvedLeading}>
            <Button variant="secondary" size="medium" onClick={onCancel}>
              {resolvedCancel}
            </Button>
            <Button variant="primary" size="medium" onClick={onConfirm}>
              {resolvedConfirm}
            </Button>
          </FooterFrame>
        }
        bodyHeight={bodyHeight}
        fillHeight={isDrawer}
        bodyStyle={{ padding: '24px 16px', gap: 24, alignItems: 'center' }}
        {...rest}
      >
        {children ?? defaultBody(variant, filterCount)}
      </ModalShell>
    );
  },
);
