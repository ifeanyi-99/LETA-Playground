import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableSection } from './TableSection.js';
import { TableContainer } from '../TableContainer/TableContainer.js';

/**
 * Table Section (`4818:152180`) — a collapsible section organism with no card chrome
 * (edge-to-edge, no background or border). A Section-Heading Content Primitive (title +
 * description + collapse chevron) sits above the "Container" slot — a `TableContainer`
 * instance (search/filter toolbar + table). Open / Closed variants.
 */
const meta: Meta<typeof TableSection> = {
  title: 'Organisms/Forms/Table Section',
  component: TableSection,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof TableSection>;

/** Open — section header + a populated Table Container (toolbar + table). */
export const Default: Story = {
  render: () => (
    <TableSection title="Orders" subtext="All orders assigned to this account" />
  ),
};

/** Collapsed — only the section header is visible. */
export const Closed: Story = {
  render: () => (
    <TableSection
      title="Orders"
      subtext="All orders assigned to this account"
      defaultOpen={false}
    />
  ),
};

/** Active filters — section with 3 active rules: Filter collapses to icon+badge, Sort to icon-only. */
export const ActiveFilter: Story = {
  name: 'Active Filter (filterCount=3)',
  render: () => (
    <TableSection title="Orders" subtext="All orders assigned to this account" filterCount={3} />
  ),
};

/** Empty state — the default TableContainer with no data. */
export const EmptyState: Story = {
  render: () => (
    <div style={{ minHeight: 760 }}>
      <TableSection title="Orders" subtext="All orders assigned to this account">
        <TableContainer variant="empty" />
      </TableSection>
    </div>
  ),
};

/** Both Open and Closed states. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <TableSection title="Open" subtext="Expanded — section header + table container" />
      <TableSection title="Closed" subtext="Collapsed — only the section header" defaultOpen={false} />
    </div>
  ),
};
