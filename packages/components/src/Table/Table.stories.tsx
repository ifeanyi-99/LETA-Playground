import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, type TableColumn, type TableRow } from './Table.js';
import { ORDER_TABLE_COLUMNS, ALL_ORDER_COLUMNS } from './columnPresets.js';

/**
 * Table (`2192:8107`) — a full LETA data table: a bordered, rounded card stacking
 * a column header, a body of Data Rows, and a Pagination footer. Columns are
 * defined once and shared by the header + every row so they stay aligned.
 * **Selection is interactive** — the header checkbox selects/clears all rows
 * (indeterminate when only some are selected); per-row checkboxes toggle one.
 * The body can scroll under a sticky header via `maxBodyHeight`.
 *
 * The table fills its container width (here, the Storybook viewport) — in a real
 * app it expands to the page/frame it lives in. The Figma fixed width is the
 * design canvas, not a constraint.
 */
const meta: Meta<typeof Table> = {
  title: 'Organisms/Tables/Table',
  component: Table,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Table>;

/** The canonical table — Basic rows. Try the header checkbox (selects all) and row checkboxes. */
export const Default: Story = {
  render: () => {
    const [page, setPage] = React.useState(1);
    return <Table page={page} pageCount={10} onPageChange={setPage} />;
  },
};

const COMPLEX_COLUMNS: TableColumn[] = [
  { label: 'Order' }, { label: 'Driver' }, { label: 'Route' },
  { label: 'Date', width: 120 }, { label: 'Status', width: 107 }, { label: '', width: 67 },
];
const COMPLEX_ROWS: TableRow[] = Array.from({ length: 6 }, () => ({
  cells: [
    { type: 'manual-order' }, { type: 'driver-cell' }, { type: 'address-cell' },
    { type: 'date', width: 120 }, { type: 'status', width: 107 }, { type: 'actions', width: 67 },
  ],
}));

/** Complex (80px) Data Rows — manual-order / driver / address / date. Selection works the same. */
export const ComplexRows: Story = {
  render: () => {
    const [page, setPage] = React.useState(1);
    return (
      <Table rowVariant="complex" columns={COMPLEX_COLUMNS} rows={COMPLEX_ROWS} countLabel="Showing 6 of 124" pageCount={13} page={page} onPageChange={setPage} />
    );
  },
};

/** A long table with a fixed body height — the body scrolls under the sticky header & footer. */
export const Scrolling: Story = {
  render: () => {
    const rows: TableRow[] = Array.from({ length: 24 }, () => ({
      cells: [
        { type: 'sample' }, { type: 'sample' }, { type: 'sample' }, { type: 'sample' }, { type: 'sample' },
        { type: 'status', width: 107 }, { type: 'actions', width: 67 },
      ],
    }));
    const [page, setPage] = React.useState(1);
    return <Table rows={rows} maxBodyHeight={400} countLabel="Showing 24 of 180" pageCount={8} page={page} onPageChange={setPage} />;
  },
};

// One order row for every column in ORDER_TABLE_COLUMNS (checkbox added by `selectable`).
const ORDER_ROWS: TableRow[] = Array.from({ length: 8 }, (_, i) => ({
  cells: [
    { type: 'manual-order', orderId: `ORD-10023${i}` },
    { type: 'sample', text: `TRP-${88 + i}` },
    { type: 'driver-cell', name: 'Alex Kamau' },
    { type: 'address-cell', pickup: 'Arc Kitisuru Depot', dropoff: '3B Mango Lane, Kilimani' },
    { type: 'list-item', title: 'Java House Gigiri', subtext: '+254 720 100 002' },
    { type: 'duration', durationVariant: 'active', durationStatus: 'on-target', durationTime: '12m' },
    { type: 'date', date: 'Jun 29\n08:30' },
    { type: 'status' },
    { type: 'actions' },
  ],
}));

const ALL_ROWS: TableRow[] = Array.from({ length: 8 }, (_, i) => ({
  cells: [
    { type: 'manual-order', orderId: `ORD-10023${i}` },
    { type: 'address-cell', pickup: 'Arc Kitisuru Depot', dropoff: '3B Mango Lane, Kilimani' },
    { type: 'list-item', title: 'Java House Gigiri', subtext: '+254 720 100 002' },
    { type: 'duration', durationVariant: 'active', durationStatus: 'on-target', durationTime: '12m' },
    { type: 'date', date: 'Jun 29\n08:30' },
    { type: 'status' },
  ],
}));

/**
 * **Pinned anchors on horizontal scroll (spec §4.3).** In `scrollX` mode, columns
 * hold their widths and the table scrolls sideways when they overflow the viewport
 * (here forced by an 820px-wide wrapper). The `pinned` columns stay stuck to their
 * edge while the middle scrolls:
 * - **Order table** (`ORDER_TABLE_COLUMNS`, `selectable`) pins the **checkbox +
 *   Order ID left** and **Actions right** — scroll horizontally to see the middle
 *   columns slide under them.
 * - **All view** (`ALL_ORDER_COLUMNS`, no checkbox/actions) pins **Order ID only**.
 *
 * In flex-fill mode (no `scrollX`, e.g. the playground) `pinned` is a no-op.
 */
export const ScrollPinned: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const [p1, setP1] = React.useState(1);
    const [p2, setP2] = React.useState(1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong>Order table — checkbox + Order ID pin left, Actions pins right</strong>
          <div style={{ width: 820, maxWidth: '100%' }}>
            <Table
              rowVariant="complex"
              selectable
              scrollX
              columns={ORDER_TABLE_COLUMNS}
              rows={ORDER_ROWS}
              countLabel="Showing 8 of 124"
              pageCount={13}
              page={p1}
              onPageChange={setP1}
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong>All view — Order ID pins left only (no checkbox, no Actions)</strong>
          <div style={{ width: 820, maxWidth: '100%' }}>
            <Table
              rowVariant="complex"
              selectable={false}
              scrollX
              columns={ALL_ORDER_COLUMNS}
              rows={ALL_ROWS}
              countLabel="Showing 8 of 210"
              pageCount={27}
              page={p2}
              onPageChange={setP2}
            />
          </div>
        </div>
      </div>
    );
  },
};
