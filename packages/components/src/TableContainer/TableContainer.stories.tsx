import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableContainer } from './TableContainer.js';

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

/** Populated table — two control rows (Search+Create, Top Filters+Column) above the Table. */
export const Default: Story = {
  render: () => <Frame><TableContainer variant="default" /></Frame>,
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

/** Both states. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48, width: '100%' }}>
      <TableContainer variant="default" />
      <div style={{ height: 520 }}><TableContainer variant="empty" /></div>
    </div>
  ),
};
