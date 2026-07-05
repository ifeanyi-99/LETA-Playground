import * as React from 'react';
import { TopFilter } from '../TopFilter/TopFilter.js';

/** A single filter entry within a Top Filter Section. */
export interface TopFilterSectionItem {
  /** Filter label. Defaults to "Status" if omitted (matches TopFilter). */
  label?: string;
  /** When true, this filter renders the Advanced (Chevron-Down) affordance. */
  advanced?: boolean;
  /** When true, this filter is currently applied. Caller-controlled. */
  selected?: boolean;
  /** Optional badge (e.g. Delivery Badge) shown inside Advanced filters when selected. */
  badge?: React.ReactNode;
}

export interface TopFilterSectionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The filters to render, left to right. */
  filters: TopFilterSectionItem[];
  /** Fired when any filter is clicked, with that filter's index. */
  onFilterClick?: (index: number) => void;
  /**
   * Animate the active (selected) border: instead of the border switching pills
   * instantly, a floating ring slides with easing from the previously-selected
   * filter to the newly-selected one. A delight detail for **single-active**
   * filter rows (e.g. the Orders status bar) — it engages only while EXACTLY ONE
   * filter is `selected` (the row's contract allows independent multi-selection,
   * which one ring can't represent; those rows keep static per-pill borders).
   * The ring re-measures when pill widths change (a sub-status badge appearing
   * shifts everything after it) and respects `prefers-reduced-motion`.
   * Default `false`.
   */
  animatedSelection?: boolean;
}

const STYLE_ID = 'leta-top-filter-section-styles';
const SECTION_STYLES = `
  .leta-top-filter-ring {
    transition: left 300ms cubic-bezier(0.2, 0, 0, 1), width 300ms cubic-bezier(0.2, 0, 0, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    .leta-top-filter-ring { transition: none; }
  }
`;

function ensureStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = SECTION_STYLES;
  document.head.appendChild(el);
}

/**
 * Top Filter Section — the filter bar that holds a horizontal row of
 * {@link TopFilter} controls in a table toolbar.
 *
 * **When to use:**
 * - As the status-filter row above/within a data table.
 *
 * **When NOT to use:**
 * - For a single filter — use {@link TopFilter} directly.
 * - For navigation — use Page Tabs Control.
 * - For view switching — use Desktop Segment Control.
 *
 * Data-driven: pass a `filters` array; each entry becomes a `TopFilter`.
 * Filters are **independent** (several can be applied at once) — selection state
 * lives in the caller's data, surfaced back through `onFilterClick(index)`.
 * For single-active rows, `animatedSelection` slides the active border between
 * pills instead of switching it instantly.
 *
 * Figma `9469:84304` (Basic / Advanced reflect which kind of filters the row
 * holds; the layout is identical). Renders a non-interactive `<div>` flex row.
 */
export const TopFilterSection = React.forwardRef<HTMLDivElement, TopFilterSectionProps>(
  function TopFilterSection(
    { filters, onFilterClick, animatedSelection = false, className, style, ...rest },
    ref,
  ) {
    ensureStyles();
    const rowRef = React.useRef<HTMLDivElement | null>(null);
    const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
    const [ring, setRing] = React.useState<{ left: number; width: number } | null>(null);
    // The slide transition is enabled by the FIRST actual selection change (and
    // stays on). Until then the ring applies measurements instantly — the initial
    // position and the correction once web fonts settle must snap, not slide; a
    // phantom "settle slide" on page load would read as a glitch. Gating on the
    // index change (not on font readiness) also can't race the font correction.
    const [motionReady, setMotionReady] = React.useState(false);
    const lastIndexRef = React.useRef(-1);

    const selectedIndices = filters.flatMap((f, i) => (f.selected ? [i] : []));
    const ringMode = animatedSelection && selectedIndices.length === 1;
    const activeIndex = ringMode ? selectedIndices[0]! : -1;

    // Keep the ring glued to the active pill. Re-measures on selection change and
    // whenever any pill resizes (a badge appearing/changing resizes that pill and
    // shifts every pill after it). `offsetLeft` is relative to the row (it is
    // `position: relative`), so no viewport math is needed. The ring mounts AT its
    // first position (transitions don't run on mount — no page-load slide) and
    // slides on every subsequent move; being a plain CSS transition it is
    // interruptible mid-flight if the user switches again quickly.
    React.useLayoutEffect(() => {
      if (!ringMode) {
        setRing(null);
        lastIndexRef.current = -1;
        return;
      }
      // A move to a DIFFERENT pill is a real selection change → animate it (this
      // enabling commit carries the new left/width, so the first slide eases too).
      if (lastIndexRef.current !== -1 && lastIndexRef.current !== activeIndex) {
        setMotionReady(true);
      }
      lastIndexRef.current = activeIndex;
      const measure = () => {
        const el = itemRefs.current[activeIndex];
        if (!el) {
          setRing(null);
          return;
        }
        setRing({ left: el.offsetLeft, width: el.offsetWidth });
      };
      measure();
      // The first measure can run against fallback-font metrics; the pills grow a
      // few px once the web font arrives, so re-measure when fonts settle.
      let cancelled = false;
      document.fonts?.ready.then(() => {
        if (!cancelled) measure();
      });
      if (typeof ResizeObserver === 'undefined') return () => {
        cancelled = true;
      };
      const ro = new ResizeObserver(measure);
      if (rowRef.current) ro.observe(rowRef.current);
      itemRefs.current.forEach((el) => {
        if (el) ro.observe(el);
      });
      return () => {
        cancelled = true;
        ro.disconnect();
      };
    }, [ringMode, activeIndex, filters]);

    return (
      <div
        ref={(node) => {
          rowRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-8px)',
          height: 40,
          boxSizing: 'border-box',
          // Anchors the sliding selection ring (harmless when the ring is off).
          position: 'relative',
          ...style,
        }}
        {...rest}
      >
        {filters.map((f, i) => (
          <TopFilter
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            label={f.label}
            advanced={f.advanced}
            selected={f.selected}
            badge={f.badge}
            // In ring mode the section paints (and slides) the active border.
            showSelectedBorder={!ringMode}
            onClick={() => onFilterClick?.(i)}
          />
        ))}
        {ring && (
          <div
            aria-hidden
            className="leta-top-filter-ring"
            style={{
              position: 'absolute',
              left: ring.left,
              width: ring.width,
              top: 0,
              height: '100%',
              boxSizing: 'border-box',
              borderRadius: 'var(--rounding-lg)',
              // Same inset ring TopFilter paints for its selected state.
              boxShadow: 'inset 0 0 0 var(--stroke-sm) var(--border-secondary-top-filter-tab-active)',
              pointerEvents: 'none',
              // Instant until fonts settle (see motionReady) — then the class's
              // left/width transition takes over for selection slides.
              ...(motionReady ? null : { transition: 'none' }),
            }}
          />
        )}
      </div>
    );
  },
);
