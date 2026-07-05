import * as React from 'react';
import { Button } from '../Button/Button.js';

export type TrailingInputFieldElementVariant = 'basic' | 'dropdown';

export interface TrailingInputFieldElementProps {
  /**
   * `basic` — a simple presentational trailing affordance (unit text, status
   * icon, clear "×"). `dropdown` — a Secondary Button with a trailing chevron
   * that opens a selector overlay.
   */
  variant: TrailingInputFieldElementVariant;
  /** Text label — `basic`: the unit/status text; `dropdown`: the button label. */
  label?: string;
  /** `basic` only — custom content (icon, "×", unit text) that overrides `label`. */
  children?: React.ReactNode;
  disabled?: boolean;
  /** `dropdown` — fired when activated (opens the overlay). */
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

/**
 * Trailing Input Field Element — an adornment that sits at the **trailing** edge
 * inside an input field.
 *
 * **When to use:** inside inputs needing a trailing action or selector.
 *
 * **When NOT to use:** standalone, outside an input.
 *
 * `4478:344281`: **Basic** — a presentational content slot (unit text / status
 * icon / clear "×"); **Dropdown** — a Secondary Button with a trailing
 * `Chevron-Down` that opens a selector. Dropdown reuses the Desktop {@link Button} atom.
 */
export const TrailingInputFieldElement = React.forwardRef<
  HTMLElement,
  TrailingInputFieldElementProps
>(function TrailingInputFieldElement(
  { variant, label, children, disabled = false, onClick, className, style, 'aria-label': ariaLabel },
  ref,
) {
  if (variant === 'dropdown') {
    return (
      <Button
        ref={ref as React.Ref<HTMLButtonElement>}
        variant="secondary"
        size="medium"
        iconRight="Chevron-Down"
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
        className={className}
        style={style}
      >
        {label}
      </Button>
    );
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={className}
      aria-label={ariaLabel}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-8px)', ...style }}
    >
      {children ?? (
        <span className="text-label-m-regular" style={{ color: 'var(--text-default-label-idle)' }}>
          {label}
        </span>
      )}
    </span>
  );
});
