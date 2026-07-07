import * as React from 'react';
import { Cell, type CellProps, type CellState } from '../Cell/Cell.js';

/**
 * Row density. `basic` is a 52px row of simple cells; `complex` is an 80px row
 * that accommodates rich cells (manual-order, driver, address) — per the Figma
 * annotation "Basic rows max-height 52px, Complex rows max-height 80px".
 */
export type DataRowsVariant = 'basic' | 'complex';

/** Row interaction state. `active` is the caller-selected row. */
export type DataRowsState = 'idle' | 'hover' | 'pressed' | 'active';

/** One column's cell. Any `Cell` prop, plus an optional fixed column width. */
export interface DataRowCell extends CellProps {
  /**
   * Fixed column width (px or any CSS width). Omit → the column flexes to fill
   * an equal share of the remaining row width (Figma "Fill Container" cells).
   */
  width?: number | string;
  /**
   * Proportional flex weight (flex-grow). When set (and no `width`), the cell
   * takes a share of the remaining width proportional to its weight. Ignored if
   * `width` is set.
   */
  flex?: number;
  /**
   * Minimum width (floor) for a flexible cell so its content truncates instead of
   * collapsing (per the Table Column Layout spec's truncation rules). Ignored if
   * `width` is set. Defaults to 0.
   */
  minWidth?: number | string;
  /**
   * Maximum width for a bounded-flexible cell (spec §3.3) — caps its growth so
   * surplus width goes to the primary flexible cells. Ignored if `width` is set.
   */
  maxWidth?: number | string;
  /**
   * Pin (sticky) this cell to an edge during horizontal scroll (spec §4.3). Set by
   * `Table` on the anchor columns (Order ID left, Actions right; checkbox pins
   * left with Order ID) only when the table is in `scrollX` mode. `pinInset` is the
   * px offset from that edge (the summed width of preceding same-side pinned cells).
   */
  pinned?: 'left' | 'right';
  /** Px offset from the pinned edge — set alongside `pinned` by `Table`. */
  pinInset?: number;
}

export interface DataRowsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Row density — `basic` (52px) or `complex` (80px). Default `basic`. */
  variant?: DataRowsVariant;
  /** Force a visual state (catalog/showcase) — overrides interaction + `selected`. */
  state?: DataRowsState;
  /** Caller-controlled selected (active) row. */
  selected?: boolean;
  /**
   * Data-driven cells. Each entry is a `Cell` (its `type` chooses the renderer)
   * plus an optional fixed `width`. Defaults to a representative set for the
   * `variant`. The row drives every cell's state, so per-cell `state` is ignored.
   */
  cells?: DataRowCell[];
  /**
   * Escape hatch — raw cell nodes laid out in the row instead of `cells`. When
   * provided, the row does NOT force a shared state onto them (you own that).
   */
  children?: React.ReactNode;
}

const ROW_HEIGHT: Record<DataRowsVariant, number> = { basic: 52, complex: 80 };

/** Default cell set per variant — mirrors the Figma Data Rows instances. */
const DEFAULT_CELLS: Record<DataRowsVariant, DataRowCell[]> = {
  basic: [
    { type: 'default-checkbox', width: 52 },
    { type: 'sample' },
    { type: 'sample' },
    { type: 'sample' },
    { type: 'sample' },
    { type: 'sample' },
    { type: 'status', width: 107 },
    { type: 'actions', width: 67 },
  ],
  complex: [
    { type: 'default-checkbox', width: 52 },
    { type: 'manual-order' },
    { type: 'driver-cell' },
    { type: 'address-cell' },
    { type: 'date', width: 120 },
    { type: 'status', width: 107 },
    { type: 'actions', width: 67 },
  ],
};

/**
 * True when the event target is (inside) an interactive control — so the row's
 * pressed state is suppressed when the user clicks a button / link / input /
 * checkbox / menu item inside a cell. Pressing those isolates from the row; only
 * pressing a non-interactive cell area drives the row's pressed state.
 */
function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return !!target.closest(
    'button, a, input, select, textarea, label, [role="button"], [role="menuitem"], [role="checkbox"], [role="switch"], [role="link"], [role="tab"]',
  );
}

/** Row state → the Cell state every column renders. */
function toCellState(
  state: DataRowsState | undefined,
  selected: boolean,
  hover: boolean,
  press: boolean,
): CellState {
  const s = state ?? (selected ? 'active' : press ? 'pressed' : hover ? 'hover' : 'idle');
  return s === 'active' ? 'selected' : s === 'hover' ? 'hover' : s === 'pressed' ? 'pressed' : 'idle';
}

/**
 * Data Rows — one row of a LETA data table: a horizontal run of `Cell`s laid
 * flush (no gaps) so they read as a single, uniformly-coloured row. The row owns
 * the interaction state (Idle / Hover / Pressed / Active) and pushes it to every
 * cell, so hovering anywhere highlights the whole row. Columns either take a fixed
 * `width` (checkbox, status, date, actions) or flex to fill an equal share.
 *
 * **When to use:** as the repeating body row inside `Table` (or any list of
 * tabular records).
 * **When not to use:** the column header row (that's a row of `Cell type="header"`,
 * owned by `Table`); non-tabular content blocks → Content Card.
 */
export const DataRows = React.forwardRef<HTMLDivElement, DataRowsProps>(function DataRows(
  { variant = 'basic', state, selected = false, cells, children, className, style, ...rest },
  ref,
) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);

  const items = cells ?? DEFAULT_CELLS[variant];
  const cellState = toCellState(state, selected, hover, press);

  return (
    <div
      ref={ref}
      role="row"
      className={['leta-data-rows', className].filter(Boolean).join(' ')}
      data-variant={variant}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        width: '100%',
        height: ROW_HEIGHT[variant],
        ...style,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={(e) => { if (!isInteractiveTarget(e.target)) setPress(true); }}
      onMouseUp={() => setPress(false)}
      {...rest}
    >
      {children ??
        items.map(({ width, flex, minWidth, maxWidth, pinned, pinInset, style: cellStyle, ...cellProps }, i) => (
          <div
            key={i}
            // Pinned cells carry the Table's edge-fade class (`leta-table-pin-*`,
            // styles injected by Table): a soft gradient over the scrolling middle
            // replaces the old hard box-shadow, hidden at the scroll extremes.
            className={pinned ? `leta-table-pin-${pinned}` : undefined}
            style={{
              display: 'flex',
              minWidth: minWidth ?? 0,
              maxWidth,
              // Floor as flex-basis (spec §4.1: floors first, surplus by weight) —
              // must mirror the header Col's sizing exactly or columns drift.
              ...(width != null
                ? { width, flexShrink: 0 }
                : flex != null
                ? { flex: `${flex} 1 ${typeof minWidth === 'number' ? `${minWidth}px` : '0'}` }
                : { flex: '1 1 0' }),
              // Sticky anchor during horizontal scroll (spec §4.3). The Cell paints
              // an opaque state background that fills the wrapper, occluding the
              // scrolling middle.
              ...(pinned
                ? {
                    position: 'sticky',
                    [pinned]: pinInset ?? 0,
                    zIndex: 2,
                    backgroundColor: 'var(--surface-neutral-bg-default)',
                  }
                : null),
            }}
          >
            <Cell {...cellProps} state={cellState} style={{ height: '100%', ...cellStyle }} />
          </div>
        ))}
    </div>
  );
});
