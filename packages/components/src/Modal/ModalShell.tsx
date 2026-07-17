import * as React from 'react';
import { useScrollShadow } from '../FooterFrame/useScrollShadow.js';
import { useFocusTrap } from './useFocusTrap.js';

export interface ModalShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fixed modal width in px (e.g. 480 / 512 / 768 / 1024). */
  width: number;
  /** Round the root corners (`--rounding-xl` = 12). Drawer modals pass false (square). Default true. */
  rounded?: boolean;
  /** The header region — typically a `<ModalHeaders>`. */
  header: React.ReactNode;
  /** The footer region — typically a `<FooterFrame>`. */
  footer: React.ReactNode;
  /** The body region content. */
  children?: React.ReactNode;
  /** Style overrides for the body wrapper (padding / gap / layout / sizing). */
  bodyStyle?: React.CSSProperties;
  /**
   * Fixed body height in px. When set, the body region is locked to this height
   * and scrolls vertically when its content overflows.
   */
  bodyHeight?: number;
  /**
   * Stretch the shell to the full viewport height (`100dvh`) — a drawer / side
   * sheet. The header and footer stay fixed (sticky) and only the body scrolls.
   * Overrides `bodyHeight`.
   */
  fillHeight?: boolean;
  /**
   * Called when Escape is pressed while this modal is the topmost overlay
   * (Doc 3 §10) — typically the same handler as the header's close button
   * (`onClose ?? onCancel`). While mounted, this shell also traps Tab focus
   * within itself and returns focus to the trigger on unmount.
   */
  onEscape?: () => void;
}

// Subtle scroll-affordance shadows (Figma `--shadow-neutral-1`, mirrored upward
// for the footer). Shown only while the body can still scroll in that direction.
const HEADER_SHADOW = 'var(--shadow-neutral-1)';
const FOOTER_SHADOW = '0px -4px 10px -4px rgb(0 0 0 / 0.04), 1px 0px 8px -8px rgb(0 0 0 / 0.04)';

/**
 * Internal shell shared by the modal templates. Mirrors the Figma modal root
 * frame: a vertical column (header + body + footer), `--surface-neutral-bg-default`
 * fill, and a 1px `--border-neutral-default` stroke painted OUTSIDE via a
 * `box-shadow` ring (so the border never shrinks the content area), clipped to
 * the corner radius.
 *
 * With `fillHeight`, the shell becomes a full-viewport-height drawer: the header
 * and footer are pinned (sticky) and the body is the only scroll region.
 *
 * **Scroll affordance:** the Footer Frame no longer has a top outline, so when the
 * body overflows, the header gets a downward drop shadow once scrolled from the
 * top, and the footer gets an upward drop shadow while more content sits below —
 * both subtle (`--shadow-neutral-1`), both hidden at the respective scroll ends.
 *
 * Not part of the public surface — the four template components compose it.
 */
export const ModalShell = React.forwardRef<HTMLDivElement, ModalShellProps>(
  function ModalShell(
    { width, rounded = true, header, footer, children, bodyStyle, bodyHeight, fillHeight = false, onEscape, style, ...rest },
    ref,
  ) {
    const bodyRef = React.useRef<HTMLDivElement | null>(null);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    React.useImperativeHandle(ref, () => rootRef.current!);
    // Mounting IS opening for every ModalShell consumer (each conditionally
    // renders the template only while its modal is open) — the trap is
    // active for the shell's whole lifetime.
    useFocusTrap(rootRef, true, onEscape);
    const scrolls = fillHeight || bodyHeight != null;

    // Header shadow: show once the body has scrolled away from the top.
    const [atTop, setAtTop] = React.useState(true);
    React.useEffect(() => {
      if (!scrolls) return;
      const el = bodyRef.current;
      if (!el) return;
      const update = () => setAtTop(el.scrollTop <= 0);
      update();
      el.addEventListener('scroll', update, { passive: true });
      const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
      ro?.observe(el);
      return () => { el.removeEventListener('scroll', update); ro?.disconnect(); };
    }, [scrolls, children]);

    // Footer shadow: delegated to the shared hook — true while content remains below.
    const footerShadow = useScrollShadow(bodyRef);

    return (
      <div
        ref={rootRef}
        tabIndex={-1}
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          width,
          // Full-height drawer: pin to the viewport so header/footer stay put
          // and only the body scrolls.
          ...(fillHeight ? { height: '100dvh', maxHeight: '100dvh' } : null),
          backgroundColor: 'var(--surface-neutral-bg-default)',
          borderRadius: rounded ? 'var(--rounding-xl)' : 0,
          boxShadow: '0 0 0 var(--stroke-xs) var(--border-neutral-default)',
          overflow: 'hidden',
          ...style,
        }}
        {...rest}
      >
        {/* Header — fixed (sticky); casts a downward shadow once the body scrolls. */}
        <div
          style={{
            flexShrink: 0,
            position: 'relative',
            zIndex: 1,
            boxShadow: scrolls && !atTop ? HEADER_SHADOW : 'none',
            transition: 'box-shadow 150ms ease',
          }}
        >
          {header}
        </div>
        <div
          ref={bodyRef}
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            flex: fillHeight || bodyHeight == null ? '1 1 auto' : undefined,
            height: fillHeight ? undefined : bodyHeight,
            minHeight: 0,
            overflowY: scrolls ? 'auto' : undefined,
            overscrollBehavior: scrolls ? 'contain' : undefined,
            backgroundColor: 'var(--surface-neutral-bg-default)',
            ...bodyStyle,
          }}
        >
          {children}
        </div>
        {/* Footer — fixed (sticky); casts an upward shadow while more is below. */}
        <div
          style={{
            flexShrink: 0,
            position: 'relative',
            zIndex: 1,
            boxShadow: scrolls && footerShadow ? FOOTER_SHADOW : 'none',
            transition: 'box-shadow 150ms ease',
          }}
        >
          {footer}
        </div>
      </div>
    );
  },
);
