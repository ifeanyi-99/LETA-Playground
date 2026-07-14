import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DesktopDropdowns } from './DesktopDropdowns.js';

/**
 * Desktop Dropdowns (`8230:26475`) — assembled dropdown/overlay panels that compose
 * Desktop Menu Options rows + other molecules. One story per Figma variant.
 */
const meta: Meta<typeof DesktopDropdowns> = {
  title: 'Molecules/Drop downs/Desktop',
  component: DesktopDropdowns,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof DesktopDropdowns>;

export const Combobox: Story = { args: { variant: 'combobox', activeIndex: 2 } };
export const ComboboxEmpty: Story = { args: { variant: 'combobox-empty' } };
export const ComboboxSearch: Story = { args: { variant: 'combobox-search' } };
export const ComboboxSearchEmpty: Story = { args: { variant: 'combobox-search-empty' } };
export const ComboboxCreate: Story = { args: { variant: 'combobox-create' } };
export const ComboboxCreateEmpty: Story = { args: { variant: 'combobox-create-empty' } };
export const ActionsDropdown: Story = { args: { variant: 'actions', options: ['Edit', 'Duplicate', 'Move', 'Share', 'Rename'] } };
export const UserMenu: Story = { args: { variant: 'user-menu' } };
export const Sort: Story = { args: { variant: 'sort' } };
export const SortNumericField: Story = {
  name: 'Sort (Duration field)',
  args: {
    variant: 'sort',
    sortOptions: [
      { label: 'Created', ascLabel: 'Oldest to Newest', descLabel: 'Newest to Oldest' },
      { label: 'Duration', ascLabel: 'Low to High', descLabel: 'High to Low' },
      { label: 'Last modified', ascLabel: 'Oldest to Newest', descLabel: 'Newest to Oldest' },
    ],
  },
};
export const Timepicker: Story = { args: { variant: 'timepicker' } };
export const StackedList: Story = { args: { variant: 'stacked-list', options: ['a', 'b', 'c', 'd'] } };

/**
 * The filter panels are interactive: ticking options updates the count and (via
 * `onSelectionChange`) the footer result total — mirroring how a host table's
 * matching-row count narrows as filters are applied.
 */
function FilterDemo({ variant }: { variant: 'basic-filter' | 'basic-filter-search' | 'basic-filter-search-empty' | 'filter-group' | 'filter-group-empty' }) {
  const [count, setCount] = React.useState(variant === 'filter-group' ? 3 : 0);
  const results = Math.max(1, 30 - count * 4);
  return (
    <DesktopDropdowns
      variant={variant}
      resultsText={`${results} results`}
      onSelectionChange={setCount}
    />
  );
}

export const BasicFilter: Story = { render: () => <FilterDemo variant="basic-filter" /> };
export const BasicFilterSearch: Story = { render: () => <FilterDemo variant="basic-filter-search" /> };
export const BasicFilterSearchEmpty: Story = { render: () => <FilterDemo variant="basic-filter-search-empty" /> };
export const FilterGroup: Story = { render: () => <FilterDemo variant="filter-group" /> };
export const FilterGroupEmpty: Story = { render: () => <FilterDemo variant="filter-group-empty" /> };
