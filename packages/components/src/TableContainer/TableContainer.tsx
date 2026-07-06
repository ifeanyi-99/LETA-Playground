import * as React from 'react';
import { Table } from '../Table/Table.js';
import { TableDataControl } from '../TableDataControl/TableDataControl.js';
import { EmptyState } from '../EmptyState/EmptyState.js';
import { Button } from '../Button/Button.js';

/**
 * `default` shows the populated table; `empty` swaps the table for an Empty
 * State (no data yet); `no-results` keeps both toolbars but swaps the table for
 * the No Matching Results Empty State (an active search/filter matched nothing).
 */
export type TableContainerVariant = 'default' | 'empty' | 'no-results';

export interface TableContainerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Which state to render. Default `default`. */
  variant?: TableContainerVariant;
  /**
   * The control row(s) above the table. Default mirrors Figma: `default` →
   * Search + Create then Top Filters + Column Control; `empty` → Search + Create only.
   */
  controls?: React.ReactNode;
  /** The table region (`default` variant). Default a full `Table`. */
  table?: React.ReactNode;
  /** The empty region (`empty` variant). Default an Empty State (No Orders + Add Order CTA). */
  empty?: React.ReactNode;
  /**
   * The no-results region (`no-results` variant). Default the No Matching
   * Results Empty State ("Try adjusting your filters & date.", per Figma
   * `1524:40283` Property 1=No Results).
   */
  noResults?: React.ReactNode;
  /** Fired by the default Empty State's Add Order CTA. */
  onAddOrder?: () => void;
  /**
   * Fill the available height of a flex-column parent (`flex: 1`): the table
   * region grows to the viewport and scrolls internally while its Pagination
   * stays pinned. Used by the Page so the table pagination is always visible
   * without page scroll. Forwarded to the default `Table`.
   */
  fillHeight?: boolean;
  /**
   * Number of active filter rules applied to the table. Forwarded to the default
   * Search + Create `TableDataControl` — when > 0 the Filter button condenses to
   * icon-only with a Coral Red (Alt) count badge. Ignored when `controls` is
   * overridden. Default 0.
   */
  filterCount?: number;
}

/**
 * Table Container — the full data-table section: a vertical stack of the control
 * toolbar(s) and either the populated `Table`, a centered Empty State (no data
 * yet), or the No Matching Results state (active search/filters matched
 * nothing — both toolbars stay). Composes Table Data Control, Table, and Empty
 * State; all regions are slot props with Figma-faithful defaults.
 *
 * **When to use:** the top-level shell for a table view (toolbar + table + empty state).
 * **When not to use:** just the grid (Table) or just the toolbar (Table Data Control).
 */
export const TableContainer = React.forwardRef<HTMLDivElement, TableContainerProps>(
  function TableContainer({ variant = 'default', controls, table, empty, noResults, onAddOrder, fillHeight = false, filterCount = 0, className, style, ...rest }, ref) {
    const isEmpty = variant === 'empty';
    const isNoResults = variant === 'no-results';

    // `empty` (nothing to show yet) drops the filter toolbar; `no-results` keeps
    // both toolbars — the user's active search/filters are what produced the
    // zero-state, so they must stay reachable (Figma No Results variant).
    const defaultControls = isEmpty ? (
      <TableDataControl variant="search-create" filterCount={filterCount} />
    ) : (
      <>
        <TableDataControl variant="search-create" filterCount={filterCount} />
        <TableDataControl variant="filters-column" />
      </>
    );

    const body = isEmpty ? (
      empty ?? (
        <div style={{ minHeight: 624, ...(fillHeight ? { flex: 1 } : null), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState type="no-orders" size="desktop">
            <Button variant="primary" size="medium" iconLeft="Add" onClick={onAddOrder}>Add Order</Button>
          </EmptyState>
        </div>
      )
    ) : isNoResults ? (
      noResults ?? (
        <div style={{ minHeight: 560, ...(fillHeight ? { flex: 1 } : null), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState type="no-results" size="desktop" description="Try adjusting your filters & date." />
        </div>
      )
    ) : (
      table ?? <Table fillHeight={fillHeight} />
    );

    return (
      <div
        ref={ref}
        className={['leta-table-container', className].filter(Boolean).join(' ')}
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-16px)',
          width: '100%',
          ...(fillHeight ? { flex: 1, minHeight: 0 } : null),
          ...style,
        }}
        {...rest}
      >
        {controls ?? defaultControls}
        {body}
      </div>
    );
  },
);
