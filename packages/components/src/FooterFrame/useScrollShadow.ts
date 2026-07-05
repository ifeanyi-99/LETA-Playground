import * as React from 'react';

/**
 * Tracks whether a scrollable container has content still below the visible
 * viewport — the signal to show a footer scroll-affordance shadow.
 *
 * Returns `true` whenever `el.scrollTop + el.clientHeight < el.scrollHeight - 1`,
 * i.e. there is content below the fold. Becomes `false` once the user reaches the
 * bottom, or when the container does not overflow at all.
 *
 * Re-evaluates on:
 * - every `scroll` event on the container
 * - every `ResizeObserver` notification (content added/removed, window resize)
 *
 * **Usage with `FooterFrame`:**
 * ```tsx
 * const bodyRef = useRef<HTMLDivElement>(null);
 * const scrollShadow = useScrollShadow(bodyRef);
 *
 * <div ref={bodyRef} style={{ overflowY: 'auto', maxHeight: 300 }}>
 *   {items}
 * </div>
 * <FooterFrame scrollShadow={scrollShadow}>
 *   <Button variant="primary">Apply</Button>
 * </FooterFrame>
 * ```
 *
 * **Note:** `FooterFrame` also accepts `scrollShadow` as a plain `boolean` — pass
 * `true` directly when the container is always scrollable (e.g. Desktop Dropdowns)
 * and you don't need the dynamic on/off behaviour.
 *
 * **Not needed inside `ModalShell`:** the shell manages the header + footer shadows
 * internally via this same hook; just set `bodyHeight` or `fillHeight` and the
 * shell handles it automatically.
 */
export function useScrollShadow(containerRef: React.RefObject<HTMLElement | null>): boolean {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setShow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);

    return () => {
      el.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, [containerRef]);

  return show;
}
