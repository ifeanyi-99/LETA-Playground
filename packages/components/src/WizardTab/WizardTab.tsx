import * as React from 'react';

export interface WizardTabProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Tab label text. */
  label: string;
  /** Step number or text displayed in the circle indicator. */
  step: string | number;
  /** When true the tab renders in the Active (selected) state with underline indicator. */
  active?: boolean;
  /**
   * When true the tab renders at 60% opacity AND is fully non-interactive:
   * no hover/pressed visual, not focusable (`tabIndex=-1`), not clickable,
   * `aria-disabled`. Used for future/unreached steps in a wizard flow — the user
   * hasn't completed the current step yet, so they can't jump ahead. Completed
   * steps stay in the Idle state (hoverable + clickable to go back).
   */
  inactive?: boolean;
}

const STYLE_ID = 'leta-wizard-tab-styles';
const TAB_STYLES = `
  .leta-wizard-tab:focus-visible {
    outline: var(--stroke-sm) solid var(--border-secondary-component-focus);
    outline-offset: 4px;
  }
`;

function ensureStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = TAB_STYLES;
  document.head.appendChild(el);
}

/**
 * Wizard Tab — step indicator tab for multi-step wizard flows.
 *
 * 5 visual states: Active, Hover, Idle, Pressed, Inactive.
 * Active/Hover/Pressed show a filled step circle; Idle/Inactive show a muted circle.
 * Inactive applies 60% opacity AND disables all interaction (no hover/pressed,
 * not focusable, not clickable) — future steps can't be hovered or jumped to.
 */
export const WizardTab = React.forwardRef<HTMLButtonElement, WizardTabProps>(
  function WizardTab(
    {
      label,
      step,
      active = false,
      inactive = false,
      className,
      style,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      onClick,
      tabIndex,
      ...rest
    },
    ref,
  ) {
    ensureStyles();
    const [hovered, setHovered] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);

    /* Circle is "filled" for active, hover, and pressed states — never when inactive. */
    const isFilledCircle = !inactive && (active || hovered || pressed);

    const textColor = inactive
      ? 'var(--text-default-label-idle)'
      : active || pressed
        ? 'var(--text-secondary-label)'
        : hovered
          ? 'var(--text-default-label)'
          : 'var(--text-default-label-idle)';

    const circleBg = isFilledCircle
      ? 'var(--surface-secondary-bg)'
      : 'var(--surface-neutral-bg-muted)';

    const circleTextColor = isFilledCircle
      ? 'var(--text-on-color-label)'
      : 'var(--text-default-label-idle)';

    return (
      <button
        ref={ref}
        type="button"
        className={`leta-wizard-tab${className ? ` ${className}` : ''}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          height: 40,
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: inactive ? 'default' : 'pointer',
          pointerEvents: inactive ? 'none' : undefined,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          color: textColor,
          opacity: inactive ? 0.6 : undefined,
          padding: 0,
          transition: 'color 150ms ease-out, opacity 150ms ease-out',
          ...style,
        }}
        aria-disabled={inactive || undefined}
        tabIndex={inactive ? -1 : tabIndex}
        onClick={inactive ? undefined : onClick}
        onMouseEnter={inactive ? undefined : (e) => { setHovered(true); onMouseEnter?.(e); }}
        onMouseLeave={inactive ? undefined : (e) => { setHovered(false); setPressed(false); onMouseLeave?.(e); }}
        onMouseDown={inactive ? undefined : (e) => { setPressed(true); onMouseDown?.(e); }}
        onMouseUp={inactive ? undefined : (e) => { setPressed(false); onMouseUp?.(e); }}
        {...rest}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '1 0 0',
            minHeight: 1,
            gap: 'var(--spacing-8px)',
            paddingLeft: 'var(--padding-12px)',
            paddingRight: 'var(--padding-12px)',
          }}
        >
          {/* Step circle */}
          <span
            aria-hidden
            className="text-body-s-medium"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: 'var(--rounding-round)',
              backgroundColor: circleBg,
              color: circleTextColor,
              flexShrink: 0,
              transition: 'background-color 150ms ease-out, color 150ms ease-out',
            }}
          >
            {String(step)}
          </span>
          {/* Label */}
          <span className="text-label-m-semibold">{label}</span>
        </span>
        {active && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: 'var(--icons-secondary-default)',
            }}
          />
        )}
      </button>
    );
  },
);
