import * as React from 'react';

export interface MobileSegmentProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Segment label text. */
  label: string;
  /**
   * Caller-controlled active (selected) state. Maps to Figma `State=Active`.
   * When true: elevated white fill + 3-layer shadow + full-contrast text.
   * When false: idle gray fill + muted text.
   */
  active?: boolean;
}

const STYLE_ID = 'leta-mobile-segment-styles';
const STYLES = `
  .leta-mobile-segment:focus-visible {
    outline: var(--stroke-sm) solid var(--border-secondary-component-focus);
    outline-offset: 4px;
  }
`;

function ensureStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = STYLES;
  document.head.appendChild(el);
}

/**
 * Mobile Segment — pill-shaped segmented-control tab for mobile interfaces.
 *
 * Figma `3038:38166` — 2 variants (Default / Active). Mobile-only, so no hover.
 * `active` is caller-controlled — typically wired into a parent Segmented
 * Control molecule's selection state.
 *
 * Default: idle gray fill (`--surface-neutral-segment-idle`) + muted text.
 * Active: white fill (`--surface-neutral-segment-selected`) + 3-layer shadow
 * + full-contrast text.
 */
export const MobileSegment = React.forwardRef<HTMLButtonElement, MobileSegmentProps>(
  function MobileSegment(
    { label, active = false, className, style, ...rest },
    ref,
  ) {
    ensureStyles();

    const bg = active
      ? 'var(--surface-neutral-segment-selected)'
      : 'var(--surface-neutral-segment-idle)';

    const color = active
      ? 'var(--text-default-label)'
      : 'var(--text-default-label-idle)';

    return (
      <button
        ref={ref}
        type="button"
        className={`text-label-m-semibold leta-mobile-segment${className ? ` ${className}` : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: 'var(--padding-12px)',
          paddingRight: 'var(--padding-12px)',
          paddingTop: 'var(--padding-6px)',
          paddingBottom: 'var(--padding-6px)',
          borderRadius: 'var(--rounding-round)',
          backgroundColor: bg,
          color,
          border: 'none',
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          boxShadow: active ? 'var(--shadow-neutral-2)' : undefined,
          transition: 'background-color 150ms ease-out, box-shadow 150ms ease-out, color 150ms ease-out',
          ...style,
        }}
        {...rest}
      >
        {label}
      </button>
    );
  },
);
