import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DesktopMenuOptions, type DesktopMenuOptionState } from './DesktopMenuOptions.js';
import { Badge } from '../Badge/Badge.js';

/**
 * Desktop Menu Options (`1531:5056`) — the universal desktop menu/list-item row,
 * all 14 Types. Hover/pressed are runtime; `active`/`selected`/`disabled` are
 * caller-controlled; the `state` prop forces a visual state for these catalogs.
 */
const meta: Meta<typeof DesktopMenuOptions> = {
  title: 'Molecules/Menu Options/Desktop',
  component: DesktopMenuOptions,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof DesktopMenuOptions>;

const Col = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
);
const Lab = ({ s }: { s: string }) => (
  <code style={{ fontSize: 10, color: 'var(--text-default-label-idle)' }}>{s}</code>
);
/** Render one type across a list of forced states. */
function States({ type, states, ...rest }: { type: any; states: DesktopMenuOptionState[]; [k: string]: unknown }) {
  return (
    <Col>
      {states.map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Lab s={s} />
          <DesktopMenuOptions type={type} state={s} {...rest} />
        </div>
      ))}
    </Col>
  );
}

const ROW_STATES: DesktopMenuOptionState[] = ['idle', 'hover', 'pressed', 'disabled'];
const SELECT_STATES: DesktopMenuOptionState[] = ['idle', 'hover', 'pressed', 'idle-selected', 'hover-selected', 'pressed-selected', 'disabled'];
const CELL_STATES: DesktopMenuOptionState[] = ['idle', 'hover', 'pressed', 'active', 'disabled'];
const NAV_STATES: DesktopMenuOptionState[] = ['idle', 'hover', 'pressed', 'active'];

export const Combobox: Story = { render: () => <States type="combobox" label="Insert Text" states={['idle', 'hover', 'pressed', 'active', 'disabled']} /> };
export const DropdownBasic: Story = { render: () => <States type="dropdown-basic" label="Insert Text" states={ROW_STATES} /> };
export const DropdownAdvanced: Story = { render: () => <States type="dropdown-advanced" label="Title" subtext="Enter description here" states={ROW_STATES} /> };
export const DropdownDestructive: Story = { render: () => <States type="dropdown-destructive" label="Delete" states={ROW_STATES} /> };
export const CheckboxSelection: Story = { render: () => <States type="checkbox-selection" label="Label" states={SELECT_STATES} /> };
export const RadioButtonSelection: Story = { render: () => <States type="radio-selection" label="Label" states={SELECT_STATES} /> };

export const DayCell: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      {CELL_STATES.map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <DesktopMenuOptions type="day-cell" label="1" state={s} /><Lab s={s} />
        </div>
      ))}
    </div>
  ),
};

export const TimePicker: Story = { render: () => <States type="time-picker" label="12:00 AM" states={CELL_STATES} /> };

export const FilterGroup: Story = {
  render: () => (
    <Col>
      <States type="filter-group" label="Table Filter" states={['idle', 'hover', 'pressed', 'active']} />
      <Lab s="active-selected (3 options selected → count chip)" />
      <DesktopMenuOptions type="filter-group" label="Table Filter" state="active-selected" selectedCount={3} onDeselectAll={() => {}} />
    </Col>
  ),
};

export const SideBarMainNavigation: Story = {
  render: () => <States type="sidebar-main" label="Module 1" leadingIcon="Orders" showLeadingIcon showChevron states={NAV_STATES} />,
};

export const SideBarMainNavigationIconOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      {NAV_STATES.map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <DesktopMenuOptions type="sidebar-main-icon" leadingIcon="Orders" state={s} /><Lab s={s} />
        </div>
      ))}
    </div>
  ),
};

export const SideBarSubNavigation: Story = { render: () => <States type="sidebar-sub" label="Sub-Module 1" states={NAV_STATES} /> };
export const SideTabNavigation: Story = { render: () => <States type="side-tab" label="Tab Name" badge={<Badge color="information" label="3" />} states={NAV_STATES} /> };

export const Pagination: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      {CELL_STATES.map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <DesktopMenuOptions type="pagination" label="1" state={s} /><Lab s={s} />
        </div>
      ))}
    </div>
  ),
};
