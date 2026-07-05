import * as React from 'react';
import { Button } from '../Button/Button.js';

export interface BulkActionsToolbarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Leading selection-count label. Default "10 selected". */
  selectionLabel?: string;
  /** Fired when the selection button is clicked (typically clears the selection). */
  onSelectionClick?: () => void;
  /**
   * Structured weight/volume metadata shown between the selection and actions.
   * Each item renders its `value` in SemiBold and `unit` in Regular, separated
   * by a Regular " · ". Omit for the common case (no summary). Used only for
   * weight/size metadata — never for displaying a selection count.
   */
  summaryItems?: Array<{ value: string; unit: string }>;
  /**
   * The action buttons (Center group). Default = two Ghost "Action" + one
   * Ghost-Error "Action" (all leading ↗). Pass your own row-level action Buttons.
   *
   * **Use outlined icons by default.** When composing actions, pass `iconOutlined`
   * to each `Button` so its glyph renders as the outlined library variant (the
   * filled variant is only a fallback when no outline exists, e.g. `Proceed`).
   * This keeps the toolbar visually correct across every screen it is dropped into.
   */
  actions?: React.ReactNode;
  /** Show the overflow "More" (⋯) button after the actions. Default true. */
  showOverflow?: boolean;
  /** Fired when the overflow (More) button is clicked. */
  onOverflowClick?: () => void;
  /** Fired when the close (✕) button is clicked. */
  onClose?: () => void;
  /**
   * Apply the real placement — `position: fixed`, centered, 80px from the
   * viewport bottom (per the Figma annotation). Default false (consumer owns
   * placement, like Toast).
   */
  fixed?: boolean;
}

// Action icons use `iconOutlined` so they render the outlined library variant by
// default (Proceed has no outline glyph, so it falls back to its filled form).
const DefaultActions = () => (
  <>
    <Button variant="ghost" size="medium" iconLeft="Proceed" iconOutlined>Action</Button>
    <Button variant="ghost" size="medium" iconLeft="Proceed" iconOutlined>Action</Button>
    <Button variant="ghost-error" size="medium" iconLeft="Proceed" iconOutlined>Action</Button>
  </>
);

const Divider = () => (
  <div
    aria-hidden
    style={{ alignSelf: 'center', width: 'var(--stroke-xs)', height: 32, backgroundColor: 'var(--border-neutral-default)', flexShrink: 0 }}
  />
);

/**
 * Bulk Actions Toolbar — the floating action bar that appears when rows are
 * selected in a table. A centered white pill grouping the selection control (+
 * optional summary), the available bulk actions (with a "More" overflow), and a
 * close control, separated by vertical dividers. Per the design it is fixed to
 * the viewport 80px from the bottom, centered, capped at 800px, in a single
 * non-wrapping row — pass `fixed` to apply that placement, or place it yourself.
 *
 * The selection control is a Ghost button with a **trailing `Chevron-Down`**
 * ("10 selected ⌄") — a dropdown affordance for selection-scope options — not a
 * leading checkbox.
 *
 * **Icon convention — outlined by default.** Every icon-bearing Button in this
 * toolbar (the default actions, and any `actions` you supply) should pass
 * `iconOutlined` so glyphs render as the outlined library variant; the filled
 * variant is only a fallback for glyphs with no outline (e.g. `Proceed`, `More`,
 * `Cancel`). This guarantees the toolbar renders correctly on every screen.
 *
 * **When to use:** acting on a multi-row selection in a `Table`.
 * **When not to use:** a single row's actions (the row's `actions` cell); page-level
 * primary actions (Table Data Control CTAs); transient feedback (Toast).
 */
export const BulkActionsToolbar = React.forwardRef<HTMLDivElement, BulkActionsToolbarProps>(
  function BulkActionsToolbar(
    {
      selectionLabel = '10 selected',
      onSelectionClick,
      summaryItems,
      actions,
      showOverflow = true,
      onOverflowClick,
      onClose,
      fixed = false,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label="Bulk actions"
        className={['leta-bulk-actions-toolbar', className].filter(Boolean).join(' ')}
        style={{
          boxSizing: 'border-box',
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: 'var(--spacing-16px)',
          maxWidth: 800,
          padding: 'var(--padding-12px)',
          borderRadius: 'var(--rounding-xl)',
          backgroundColor: 'var(--surface-neutral-bg-default)',
          boxShadow: 'inset 0 0 0 var(--stroke-xs) var(--border-neutral-default), var(--shadow-neutral-3)',
          ...(fixed
            ? { position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }
            : null),
          ...style,
        }}
        {...rest}
      >
        {/* Left — selection + summary */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'var(--spacing-12px)' }}>
          <Button variant="ghost" size="medium" iconRight="Chevron-Down" onClick={onSelectionClick}>
            {selectionLabel}
          </Button>
          {summaryItems && summaryItems.length > 0 && (
            <span style={{ color: 'var(--text-default-label)', whiteSpace: 'nowrap' }}>
              {summaryItems.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-label-m-regular"> · </span>}
                  <span className="text-label-m-semibold">{item.value}</span>
                  <span className="text-label-m-regular"> {item.unit}</span>
                </React.Fragment>
              ))}
            </span>
          )}
        </div>

        <Divider />

        {/* Center — actions + overflow */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'var(--spacing-12px)' }}>
          {actions ?? <DefaultActions />}
          {showOverflow && (
            <Button variant="ghost" size="medium" prominent iconOnly="More" aria-label="More actions" onClick={onOverflowClick} />
          )}
        </div>

        <Divider />

        {/* Right — close */}
        <Button variant="ghost" size="medium" prominent iconOnly="Cancel" aria-label="Clear selection" onClick={onClose} />
      </div>
    );
  },
);
