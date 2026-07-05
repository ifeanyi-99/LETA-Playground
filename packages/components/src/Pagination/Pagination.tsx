import * as React from 'react';
import { Button } from '../Button/Button.js';

export type PaginationVariant = 'table' | 'combobox' | 'stacked-list';

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * `table` — full data tables: count + page-number controls + rows-per-page
   * selector (taller). `stacked-list` — same controls, condensed height.
   * `combobox` — compact: count + prev/next only (no page numbers).
   */
  variant?: PaginationVariant;
  /** Current page (1-based). */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /**
   * Show the page-number navigation cluster (prev/next + numbered cells) on the
   * `table` / `stacked-list` variants. Mirrors the Figma `Show Pages` property.
   * Default true; set `false` for just the count + rows-per-page selector.
   */
  showPages?: boolean;
  /** Fired with the next page when a control is activated. */
  onPageChange: (page: number) => void;
  /** Count summary text (e.g. "Showing 10 of 180" or "1 - 10 of 10"). Caller-provided. */
  countLabel?: string;
  /** `table` / `stacked-list` — current rows-per-page value shown in the selector. */
  rowsPerPage?: number;
  /** `table` / `stacked-list` — fired when the rows-per-page selector is activated. */
  onRowsPerPageClick?: () => void;
}

const STYLE_ID = 'leta-pagination-styles';
const STYLES = `
.leta-page-cell { background-color: var(--surface-neutral-day-cell-idle); }
.leta-page-cell:hover { background-color: var(--surface-neutral-pagination-hover); }
.leta-page-cell:active { background-color: var(--surface-neutral-pagination-pressed); }
.leta-page-cell:focus-visible, .leta-page-cell-active:focus-visible {
  outline: var(--stroke-sm) solid var(--border-secondary-component-focus);
  outline-offset: 2px;
}
`;
function ensureStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = STYLES;
  document.head.appendChild(el);
}

/**
 * Page-cell window matching Figma's pattern (e.g. page 1 of N → `1 2 3 … N`):
 * near the start/end show the first/last three; in the middle show current ±1
 * between leading/trailing ellipses. Collapses to all pages when ≤ 7.
 */
function paginationRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 'ellipsis', total];
  if (current >= total - 2) return [1, 'ellipsis', total - 2, total - 1, total];
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

const CELL: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  width: 32,
  height: 32,
  borderRadius: 'var(--rounding-lg)',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
};

/**
 * Pagination — navigation for moving through paged data sets, in the layout that
 * fits its host surface.
 *
 * **When to use:** below tables, lists, or comboboxes with more results than fit
 * one view.
 *
 * **When NOT to use:** step-through wizards (use Page Tabs Control / Stepper) or
 * carousels (use Carousel Pagination).
 *
 * `7292:86007`: **Table** — count + page-number controls + rows-per-page selector;
 * **Stacked List** — same controls, condensed; **Combobox** — compact count +
 * prev/next only. Prev/next reuse Ghost icon Buttons; the page cell is a 32×32
 * numbered button (Active = `--surface-secondary-pagination-active`).
 */
export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(function Pagination(
  {
    variant = 'table',
    page,
    pageCount,
    showPages = true,
    onPageChange,
    countLabel,
    rowsPerPage,
    onRowsPerPageClick,
    className,
    style,
    ...rest
  },
  ref,
) {
  ensureStyles();

  const count = countLabel ? (
    <span className="text-label-m-regular" style={{ color: 'var(--text-default-label)', flexShrink: 0 }}>
      {countLabel}
    </span>
  ) : null;

  const prevNext = (dir: -1 | 1) => (
    <Button
      variant="ghost"
      size="small"
      iconOnly={dir === -1 ? 'Chevron-Left' : 'Chevron-Right'}
      aria-label={dir === -1 ? 'Previous page' : 'Next page'}
      disabled={dir === -1 ? page <= 1 : page >= pageCount}
      onClick={() => onPageChange(page + dir)}
    />
  );

  // Combobox — compact: count + prev/next only.
  if (variant === 'combobox') {
    return (
      <div
        ref={ref}
        role="navigation"
        aria-label="Pagination"
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--spacing-12px)',
          paddingTop: 'var(--padding-8px)',
          paddingBottom: 'var(--padding-8px)',
          boxSizing: 'border-box',
          backgroundColor: 'var(--surface-neutral-bg-default)',
          ...style,
        }}
        {...rest}
      >
        {count}
        {prevNext(-1)}
        {prevNext(1)}
      </div>
    );
  }

  // Table / Stacked List — count (leading) + [pages + rows-per-page] (trailing).
  const pages = paginationRange(page, pageCount).map((item, i) =>
    item === 'ellipsis' ? (
      <span
        key={`e${i}`}
        aria-hidden
        style={{ ...CELL, cursor: 'default', color: 'var(--text-default-label)' }}
        className="text-label-m-regular"
      >
        …
      </span>
    ) : (
      <button
        key={item}
        type="button"
        aria-label={`Page ${item}`}
        aria-current={item === page ? 'page' : undefined}
        onClick={() => onPageChange(item)}
        className={`text-label-m-regular ${item === page ? 'leta-page-cell-active' : 'leta-page-cell'}`}
        style={{
          ...CELL,
          ...(item === page
            ? { backgroundColor: 'var(--surface-secondary-pagination-active)', color: 'var(--text-on-color-label)' }
            : { color: 'var(--text-default-label)' }),
        }}
      >
        {item}
      </button>
    ),
  );

  const isTable = variant === 'table';
  return (
    <div
      ref={ref}
      role="navigation"
      aria-label="Pagination"
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-16px)',
        boxSizing: 'border-box',
        backgroundColor: 'var(--surface-neutral-bg-default)',
        ...(isTable
          ? {
              paddingLeft: 'var(--padding-16px)',
              paddingRight: 'var(--padding-16px)',
              paddingTop: 'var(--padding-10px)',
              paddingBottom: 'var(--padding-10px)',
              // Bordered footer attached under a table: top corners square, bottom rounded.
              boxShadow: 'inset 0 0 0 var(--stroke-xs) var(--border-neutral-default)',
              borderBottomLeftRadius: 'var(--rounding-xl)',
              borderBottomRightRadius: 'var(--rounding-xl)',
            }
          : null),
        ...style,
      }}
      {...rest}
    >
      {count}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-16px)' }}>
        {showPages && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-8px)' }}>
            {prevNext(-1)}
            {pages}
            {prevNext(1)}
          </div>
        )}
        {(rowsPerPage != null || onRowsPerPageClick) && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-12px)' }}>
            <Button
              variant="secondary"
              size="small"
              iconRight="Chevron-Down"
              aria-label="Rows per page"
              onClick={() => onRowsPerPageClick?.()}
            >
              {rowsPerPage}
            </Button>
            <span className="text-label-m-regular" style={{ color: 'var(--text-default-label)' }}>
              rows per page
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
