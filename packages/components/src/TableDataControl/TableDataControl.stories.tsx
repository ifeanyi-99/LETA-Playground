import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableDataControl } from './TableDataControl.js';

/**
 * Table Data Control (`7575:36637`) — the toolbar above a data table. Five
 * layouts across three variants: Search + Create (default and active-filter),
 * Search + Column Control (default and active-filter), and Top Filters +
 * Column Control. Left/right sections are slot props with Figma-faithful defaults
 * (Search Input, Button, Top Filter Section).
 *
 * The right-hand column-control group is a row count + a Secondary **icon-only**
 * Columns button (outlined `Columns` glyph, no text label).
 *
 * When `filterCount > 0` the Filter button condenses to a 40×40 icon-only control
 * with a Coral Red (Alt) count badge overlaid at the top-right corner, and Sort By
 * also condenses to icon-only. Use this to communicate active filter state without
 * opening the filter panel.
 */
const meta: Meta<typeof TableDataControl> = {
  title: 'Organisms/Tables/Table Data Control',
  component: TableDataControl,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof TableDataControl>;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 1451 }}>{children}</div>
);

export const SearchAndCreate: Story = {
  name: 'Search + Create',
  render: () => <Frame><TableDataControl variant="search-create" /></Frame>,
};

export const SearchAndCreateActiveFilter: Story = {
  name: 'Search + Create (Active Filter)',
  parameters: {
    docs: {
      description: {
        story:
          'Figma node `10697:60514`. When `filterCount > 0` the Filter button condenses ' +
          'to a 40×40 icon-only control with a Coral Red (Alt) count badge at the top-right ' +
          'corner; Sort By also condenses to icon-only. Use this to show the user that filters ' +
          'are applied without opening the filter panel.',
      },
    },
  },
  render: () => <Frame><TableDataControl variant="search-create" filterCount={3} /></Frame>,
};

export const SearchAndColumnControl: Story = {
  name: 'Search + Column Control',
  render: () => <Frame><TableDataControl variant="search-column" /></Frame>,
};

export const SearchAndColumnControlActive: Story = {
  name: 'Search + Column Control (Active)',
  parameters: {
    docs: {
      description: {
        story:
          'Figma node `10697:60683`. Same active-filter treatment as "Search + Create ' +
          '(Active Filter)" but with the column-control group (row count + Columns button) ' +
          'on the right instead of the Add Order / Import-Export CTAs.',
      },
    },
  },
  render: () => <Frame><TableDataControl variant="search-column" filterCount={3} /></Frame>,
};

export const FiltersAndColumnControl: Story = {
  name: 'Top Filters + Column Control',
  render: () => <Frame><TableDataControl variant="filters-column" /></Frame>,
};

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: 1451 }}>
      <TableDataControl variant="search-create" />
      <TableDataControl variant="search-create" filterCount={3} />
      <TableDataControl variant="search-column" />
      <TableDataControl variant="search-column" filterCount={3} />
      <TableDataControl variant="filters-column" />
    </div>
  ),
};
