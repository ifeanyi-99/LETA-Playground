import * as React from 'react';
import { useEscapeLayer } from './useEscapeLayer.js';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus trap for modals/drawers (Doc 3 §10 — "Modals and drawers trap focus
 * while open" + "focus returns to the triggering element"). While `active`:
 * Tab/Shift+Tab cycle within `containerRef`'s subtree, initial focus lands on
 * its first focusable descendant (falling back to the container itself),
 * Escape calls `onEscape` (via the shared {@link useEscapeLayer} stack — only
 * the topmost overlay reacts), and focus returns to whatever had it before
 * the trap engaged once `active` goes false / the component unmounts.
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean,
  onEscape?: () => void,
): void {
  useEscapeLayer(active, () => onEscape?.());

  const returnFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    returnFocusRef.current = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] =>
      container ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];

    if (container && !container.contains(document.activeElement)) {
      (focusables()[0] ?? container).focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (els.length === 0) {
        e.preventDefault();
        return;
      }
      const first = els[0]!;
      const last = els[els.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    container?.addEventListener('keydown', onKeyDown);

    return () => {
      container?.removeEventListener('keydown', onKeyDown);
      returnFocusRef.current?.focus?.();
    };
  }, [active, containerRef]);
}
