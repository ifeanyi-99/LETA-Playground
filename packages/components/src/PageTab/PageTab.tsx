import * as React from 'react';

export interface PageTabProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Tab label text. */
  label: string;
  /** When true the tab renders in the Active (selected) state with underline indicator. */
  active?: boolean;
}

const STYLE_ID = 'leta-page-tab-styles';
const TAB_STYLES = `
  .leta-page-tab:focus-visible {
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
 * Page Tab — standard page-level tab with bottom underline indicator.
 *
 * 4 visual states: Idle, Hover, Pressed, Active.
 * Active state includes a 2px bottom indicator bar.
 */
export const PageTab = React.forwardRef<HTMLButtonElement, PageTabProps>(
  function PageTab(
    {
      label,
      active = false,
      className,
      style,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      ...rest
    },
    ref,
  ) {
    ensureStyles();
    const [hovered, setHovered] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);

    const textColor = active || pressed
      ? 'var(--text-secondary-label)'
      : hovered
        ? 'var(--text-default-label)'
        : 'var(--text-default-label-idle)';

    return (
      <button
        ref={ref}
        type="button"
        className={`text-label-m-semibold leta-page-tab${className ? ` ${className}` : ''}`}
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
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          color: textColor,
          padding: 0,
          transition: 'color 150ms ease-out',
          ...style,
        }}
        onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e); }}
        onMouseLeave={(e) => { setHovered(false); setPressed(false); onMouseLeave?.(e); }}
        onMouseDown={(e) => { setPressed(true); onMouseDown?.(e); }}
        onMouseUp={(e) => { setPressed(false); onMouseUp?.(e); }}
        {...rest}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '1 0 0',
            minHeight: 1,
            paddingLeft: 'var(--padding-12px)',
            paddingRight: 'var(--padding-12px)',
          }}
        >
          {label}
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
