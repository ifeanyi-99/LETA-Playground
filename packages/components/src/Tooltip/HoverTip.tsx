import * as React from 'react';
import { createPortal } from 'react-dom';
import { Tooltip } from './Tooltip.js';

export interface HoverTipProps {
  /** Tooltip label (the Small Tooltip's single text line). */
  label: string;
  /** The hover/focus trigger. Wrapped in an inline-flex span. */
  children: React.ReactNode;
  /** Delay before showing, ms. Default 120 (avoids flicker on pass-through). */
  delay?: number;
  /** Wrapper span style overrides. */
  style?: React.CSSProperties;
}

// Same micro-animation language as the dropdown/Popover overlays (per the
// interface-polish convention): a quick fade + subtle rise/scale on enter
// (140ms, ease-out) and a softer, shorter fade-out (100ms). Reserved keyframes
// (run once on mount / once on hide) — the show/hide toggle mounts & unmounts.
const HOVERTIP_STYLE_ID = 'leta-hovertip-motion';
const HOVERTIP_CSS = `
@keyframes leta-hovertip-in  { from { opacity: 0; transform: translateY(4px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes leta-hovertip-out { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(2px) scale(0.98); } }
.leta-hovertip { animation: leta-hovertip-in 140ms cubic-bezier(0.16, 1, 0.3, 1); will-change: transform, opacity; }
.leta-hovertip.exiting { animation: leta-hovertip-out 100ms cubic-bezier(0.4, 0, 1, 1) forwards; }
@media (prefers-reduced-motion: reduce) { .leta-hovertip, .leta-hovertip.exiting { animation: none; } }
`;
function ensureHoverTipStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(HOVERTIP_STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = HOVERTIP_STYLE_ID;
  el.textContent = HOVERTIP_CSS;
  document.head.appendChild(el);
}

/** Above the trigger (caret points down) unless there isn't room, then below (caret up). */
type Placement = 'above' | 'below';
interface Pos { top: number; left: number; placement: Placement }

const GAP = 4; // clearance between trigger and tooltip; the caret bridges it

/**
 * HoverTip — wires the presentational `Tooltip` (Small variant, dark surface)
 * to a hover/focus trigger: the tooltip portals into `document.body` centered
 * on the trigger with its caret pointing at it, per the wireframes' hover
 * overlays (order-row provenance icons, Copy ID, SLA status icons,
 * finished-duration icons — and the same icons in the order-detail header).
 *
 * **Placement mirrors the dropdown/Popover logic:** prefers **above** (caret
 * down), but **flips below** (caret up) when there isn't room above the
 * viewport; the horizontal centre is clamped to an 8px viewport margin. It
 * measures the rendered tooltip first (hidden for one frame) so the flip/clamp
 * uses the true size.
 *
 * Shows after a short `delay` on mouseenter/focus; on mouseleave/blur it plays
 * the exit animation, then unmounts. The tooltip is `pointer-events: none` (never
 * traps the cursor) and `aria-hidden` — callers keep the trigger's own accessible
 * name (e.g. the Copy button's `aria-label`); for plain decorative icons the
 * label is also exposed via `aria-label` on the wrapper.
 */
export function HoverTip({ label, children, delay = 120, style }: HoverTipProps): React.ReactElement {
  ensureHoverTipStyles();
  const wrapRef = React.useRef<HTMLSpanElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const showTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = React.useState(false);
  const [exiting, setExiting] = React.useState(false);
  const [pos, setPos] = React.useState<Pos | null>(null);

  const show = () => {
    if (exitTimerRef.current) { clearTimeout(exitTimerRef.current); exitTimerRef.current = null; }
    setExiting(false);
    if (open || showTimerRef.current) return;
    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null;
      setPos(null); // hide for one frame until measured
      setOpen(true);
    }, delay);
  };
  const hide = () => {
    if (showTimerRef.current) { clearTimeout(showTimerRef.current); showTimerRef.current = null; }
    if (!open || exiting) return;
    setExiting(true);
    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null;
      setOpen(false);
      setExiting(false);
      setPos(null);
    }, 110);
  };

  // Position once open + measured — prefer above, flip below on top overflow,
  // clamp horizontally (same rules as the Popover). Positioning is done purely
  // with numeric left/top (NOT a CSS transform) so it never collides with the
  // enter/exit animation's own transform — `left` is the panel's left EDGE
  // (centre − width/2), `top` its top edge.
  React.useLayoutEffect(() => {
    if (!open) return;
    const trigger = wrapRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const t = trigger.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    const margin = 8;
    const cx = t.left + t.width / 2;
    const left = Math.max(margin, Math.min(cx - p.width / 2, window.innerWidth - margin - p.width));
    const fitsAbove = t.top - GAP - p.height >= margin;
    const placement: Placement = fitsAbove ? 'above' : 'below';
    const top = placement === 'above' ? t.top - GAP - p.height : t.bottom + GAP;
    setPos({ top, left, placement });
  }, [open, label]);

  React.useEffect(() => () => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
  }, []);

  return (
    <span
      ref={wrapRef}
      aria-label={label}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      style={{ display: 'inline-flex', ...style }}
    >
      {children}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            aria-hidden
            // Animation class applied only once positioned (mirrors the Popover),
            // so the enter animation starts exactly when the tooltip becomes
            // visible — and its transform never fights the positioning (which is
            // pure left/top). transform-origin points at the trigger edge.
            className={pos ? `leta-hovertip${exiting ? ' exiting' : ''}` : undefined}
            style={{
              position: 'fixed',
              left: pos?.left ?? -9999,
              top: pos?.top ?? -9999,
              transformOrigin: pos?.placement === 'below' ? 'top center' : 'bottom center',
              zIndex: 4000,
              pointerEvents: 'none',
              visibility: pos ? 'visible' : 'hidden',
            }}
          >
            <Tooltip
              variant="small"
              text={label}
              caretSide={pos?.placement === 'below' ? 'top' : 'bottom'}
              caretAlign="center"
            />
          </div>,
          document.body,
        )}
    </span>
  );
}
