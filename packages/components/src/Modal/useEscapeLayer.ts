import * as React from 'react';
import { popOverlay, pushOverlay } from './overlayStack.js';

/**
 * Registers this overlay on the shared {@link pushOverlay} stack while
 * `active`, so Escape closes only the topmost overlay (Doc 3 §10) no matter
 * how dropdowns and modals/drawers are nested. `onEscape` is read fresh on
 * every call — no need to memoize it.
 */
export function useEscapeLayer(active: boolean, onEscape: () => void): void {
  const idRef = React.useRef<symbol | null>(null);
  if (!idRef.current) idRef.current = Symbol('overlay');
  const onEscapeRef = React.useRef(onEscape);
  onEscapeRef.current = onEscape;

  React.useEffect(() => {
    if (!active) return;
    const id = idRef.current!;
    pushOverlay(id, () => onEscapeRef.current());
    return () => popOverlay(id);
  }, [active]);
}
