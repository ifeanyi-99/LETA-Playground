import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Cell, type CellType, type CellState } from './Cell.js';
import { Button } from '../Button/Button.js';

/**
 * Cell (`4444:45000`) — the building block of LETA data tables, all 18 Types.
 * Header types are 40px tall; body types are 72px. Hover/pressed are runtime;
 * `selected` is caller-controlled; the `state` prop forces a visual state for
 * these catalogs. Each cell fills its column — here every cell is wrapped in a
 * fixed-width, bordered box that stands in for the table column.
 */
const meta: Meta<typeof Cell> = {
  title: 'Molecules/Table Cells/Cell',
  component: Cell,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Cell>;

const Lab = ({ s }: { s: string }) => (
  <code style={{ fontSize: 10, color: 'var(--text-default-label-idle)' }}>{s}</code>
);

const BODY_STATES: CellState[] = ['idle', 'hover', 'pressed', 'selected'];
// Header & Header Checkbox have only an Idle state in Figma (no hover/pressed).
const HEADER_STATES: CellState[] = ['idle'];

/** Width of the column each Type sits in (mirrors the Figma variant widths). */
const CELL_W: Record<CellType, number> = {
  header: 140,
  'header-checkbox': 52,
  sample: 140,
  date: 140,
  'text-link': 180,
  status: 140,
  'default-checkbox': 52,
  actions: 64,
  'preview-chips': 200,
  duration: 160,
  'select-field': 220,
  'item-stepper': 160,
  'time-stepper': 540,
  'list-item': 300,
  'address-cell': 300,
  'manual-order': 300,
  'automatic-order': 300,
  'driver-cell': 300,
};

const Box = ({ width, children }: { width: number; children: React.ReactNode }) => (
  <div style={{ width, outline: '1px solid var(--border-neutral-default)' }}>{children}</div>
);

/** Render one Type stacked across the given states, each in its column box. */
function Variants({ type, states, ...rest }: { type: CellType; states?: CellState[]; [k: string]: unknown }) {
  const sts = states ?? (type === 'header' || type === 'header-checkbox' ? HEADER_STATES : BODY_STATES);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      {sts.map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Lab s={s} />
          <Box width={CELL_W[type]}>
            <Cell type={type} state={s} {...rest} />
          </Box>
        </div>
      ))}
    </div>
  );
}

export const Header: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <div>
        <Lab s="states" />
        <Variants type="header" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Lab s="showLeadingIcon" />
        <Box width={CELL_W.header}><Cell type="header" showLeadingIcon /></Box>
        <Lab s="showTrailingIcon" />
        <Box width={CELL_W.header}><Cell type="header" showTrailingIcon /></Box>
      </div>
    </div>
  ),
};
export const HeaderCheckbox: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Lab s="default (click to toggle)" />
        <Box width={CELL_W['header-checkbox']}><Cell type="header-checkbox" /></Box>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Lab s="checked" />
        <Box width={CELL_W['header-checkbox']}><Cell type="header-checkbox" checked /></Box>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Lab s="indeterminate (some rows selected)" />
        <Box width={CELL_W['header-checkbox']}><Cell type="header-checkbox" indeterminate /></Box>
      </div>
    </div>
  ),
};
export const Sample: Story = { render: () => <Variants type="sample" /> };
export const Date: Story = { render: () => <Variants type="date" /> };
export const TextLink: Story = { render: () => <Variants type="text-link" /> };
export const Status: Story = { render: () => <Variants type="status" /> };
export const DefaultCheckbox: Story = { render: () => <Variants type="default-checkbox" /> };
export const Actions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <Variants type="actions" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Lab s="multiple buttons" />
        <Box width={96}>
          <Cell
            type="actions"
            actions={
              <>
                <Button variant="ghost" size="small" iconOnly="More" aria-label="More" />
                <Button variant="ghost" size="small" iconOnly="Delete" aria-label="Delete" />
              </>
            }
          />
        </Box>
      </div>
    </div>
  ),
};
export const PreviewChips: Story = { render: () => <Variants type="preview-chips" /> };
export const Duration: Story = { render: () => <Variants type="duration" /> };
export const SelectField: Story = { render: () => <Variants type="select-field" /> };
export const ItemStepper: Story = { render: () => <Variants type="item-stepper" /> };
export const TimeStepper: Story = { render: () => <Variants type="time-stepper" states={['idle', 'selected']} /> };
export const ListItem: Story = { render: () => <Variants type="list-item" /> };
export const AddressCell: Story = { render: () => <Variants type="address-cell" /> };
export const ManualOrder: Story = { render: () => <Variants type="manual-order" /> };
export const AutomaticOrder: Story = { render: () => <Variants type="automatic-order" /> };
export const DriverCell: Story = { render: () => <Variants type="driver-cell" /> };

const ALL_TYPES: CellType[] = [
  'header', 'header-checkbox', 'sample', 'date', 'text-link', 'status', 'default-checkbox',
  'actions', 'preview-chips', 'duration', 'select-field', 'item-stepper', 'time-stepper',
  'list-item', 'address-cell', 'manual-order', 'automatic-order', 'driver-cell',
];

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
      {ALL_TYPES.map((t) => {
        const sts = t === 'header' || t === 'header-checkbox' ? HEADER_STATES : BODY_STATES;
        return (
          <div key={t} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <code style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-default-heading)' }}>{t}</code>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {sts.map((s) => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Lab s={s} />
                  <Box width={CELL_W[t]}><Cell type={t} state={s} /></Box>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  ),
};
