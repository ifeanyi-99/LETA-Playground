import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableContainer } from './TableContainer.js';
import { Skeleton } from '../Skeleton/Skeleton.js';

/**
 * Table Container (`1524:40283`) — the full data-table section: the control
 * toolbar(s) stacked above either the populated Table (Default) or a centered
 * Empty State (Empty State). Composes Table Data Control, Table, and Empty State.
 */
const meta: Meta<typeof TableContainer> = {
  title: 'Organisms/Tables/Table Container',
  component: TableContainer,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof TableContainer>;

// The container (and its Table) is width:100% — fills the viewport here.
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '100%' }}>{children}</div>
);

// ── Loading story helpers ────────────────────────────────────────────────────
// A skeleton-row arrangement standing in for the real Table while a subsequent
// update is in flight (Loading pattern: first load with nothing to show yet →
// LoadingOverlay scrim; an update to already-visible content — filter, sort, tab
// switch, refresh — → skeleton rows only, no scrim). Column proportions mirror
// the Order table's real shape (checkbox / Order ID / Route / Recipient /
// Duration / Created / Status / Actions) — fixed widths for identifier/utility
// columns, flex weights for the two primary columns — without depending on the
// Table Column Layout spec's actual presets, since this is a generic placeholder
// shape, not a specific instance.
const SKELETON_COLS: { label?: string; flex?: number; width?: number }[] = [
  { width: 20 }, // checkbox
  { label: 'Order ID', width: 140 },
  { label: 'Route', flex: 1.48 },
  { label: 'Recipient', flex: 1 },
  { label: 'Duration', width: 90 },
  { label: 'Created', width: 110 },
  { label: 'Status', width: 90 },
  { width: 64 }, // Actions — no visible label in the real table either
];

function cellFlexStyle(col: (typeof SKELETON_COLS)[number]): React.CSSProperties {
  return { flex: col.flex != null ? `${col.flex} 1 0` : `0 0 ${col.width}px` };
}

function SkeletonCell({ col, height }: { col: (typeof SKELETON_COLS)[number]; height: number }) {
  return (
    <div style={{ ...cellFlexStyle(col), minWidth: 0, display: 'flex', alignItems: 'center', padding: '0 var(--padding-12px)', boxSizing: 'border-box' }}>
      <Skeleton height={height} width="70%" />
    </div>
  );
}

function SkeletonTableRows({ rows = 6 }: { rows?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        border: 'var(--stroke-xs) solid var(--border-neutral-default)',
        borderRadius: 'var(--rounding-xl)',
        overflow: 'hidden',
      }}
    >
      {/* The header row shows its real labels immediately, not skeleton blocks —
          column names are static, already-known content, never actually
          "loading" (and a shimmering block here read as invisible anyway: the
          header's background, `--surface-neutral-table-header-idle`, resolves
          to the exact same color as the skeleton's own base token). */}
      <div style={{ display: 'flex', height: 40, backgroundColor: 'var(--surface-neutral-table-header-idle)' }}>
        {SKELETON_COLS.map((c, i) => (
          <div key={i} style={{ ...cellFlexStyle(c), minWidth: 0, display: 'flex', alignItems: 'center', padding: '0 var(--padding-12px)', boxSizing: 'border-box' }}>
            {c.label && (
              <span className="text-label-s-semibold" style={{ color: 'var(--text-default-sub-heading)' }}>
                {c.label}
              </span>
            )}
          </div>
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} style={{ display: 'flex', height: 72, borderTop: 'var(--stroke-xs) solid var(--border-neutral-default)' }}>
          {SKELETON_COLS.map((c, i) => <SkeletonCell key={i} col={c} height={16} />)}
        </div>
      ))}
    </div>
  );
}

/** Populated table — two control rows (Search+Create, Top Filters+Column) above the Table. */
export const Default: Story = {
  render: () => <Frame><TableContainer variant="default" /></Frame>,
};

/**
 * Loading — a subsequent update to already-visible content (filter change,
 * sort, tab switch, table refresh), not a first load. Both toolbars stay
 * mounted and interactive; only the table region swaps for shimmering
 * `Skeleton` rows — no page-level scrim, so the rest of the screen stays fully
 * usable and calm. (A *first* load, with nothing to show yet, is the
 * `LoadingOverlay` instead — that's a page-level concern, not this component's.)
 */
export const Loading: Story = {
  render: () => <Frame><TableContainer variant="default" table={<SkeletonTableRows />} /></Frame>,
};

/** Active filters — Search+Create toolbar with 3 active rules: Filter collapses to icon+badge, Sort to icon-only. */
export const ActiveFilter: Story = {
  name: 'Active Filter (filterCount=3)',
  render: () => <Frame><TableContainer variant="default" filterCount={3} /></Frame>,
};

/** No data — a Search+Create control above a centered Empty State with an Add Order CTA. */
export const EmptyStateStory: Story = {
  name: 'Empty State',
  render: () => <Frame><div style={{ height: 560 }}><TableContainer variant="empty" /></div></Frame>,
};

/** Zero results — both toolbars stay (the active search/filters caused the state) above the No Matching Results Empty State. */
export const NoResults: Story = {
  name: 'No Results',
  render: () => <Frame><TableContainer variant="no-results" /></Frame>,
};

/** Both states. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48, width: '100%' }}>
      <TableContainer variant="default" />
      <div style={{ height: 520 }}><TableContainer variant="empty" /></div>
    </div>
  ),
};
