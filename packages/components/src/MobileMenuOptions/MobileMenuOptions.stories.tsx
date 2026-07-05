import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileMenuOptions } from './MobileMenuOptions.js';

/**
 * Mobile Menu Options (`8338:35033`) — touch menu/list rows (Idle/Pressed/Active/
 * Disabled; no hover). 4 Types: Combobox, Mobile Day Cell, Checkbox Selection, Radio
 * Button Selection.
 */
const meta: Meta<typeof MobileMenuOptions> = {
  title: 'Molecules/Menu Options/Mobile',
  component: MobileMenuOptions,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof MobileMenuOptions>;

const Col = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
);

export const Combobox: Story = {
  render: () => (
    <Col>
      <MobileMenuOptions type="combobox" label="Insert Text" />
      <MobileMenuOptions type="combobox" label="Insert Text" active />
      <MobileMenuOptions type="combobox" label="Insert Text" disabled />
    </Col>
  ),
};

export const MobileDayCell: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      {[1, 2, 3, 4, 5].map((d) => (
        <MobileMenuOptions key={d} type="mobile-day-cell" label={String(d)} active={d === 3} />
      ))}
      <MobileMenuOptions type="mobile-day-cell" label="6" disabled />
    </div>
  ),
};

export const CheckboxSelection: Story = {
  render: () => (
    <Col>
      <MobileMenuOptions type="checkbox-selection" label="Label" />
      <MobileMenuOptions type="checkbox-selection" label="Label" selected />
      <MobileMenuOptions type="checkbox-selection" label="Label" disabled />
    </Col>
  ),
};

export const RadioButtonSelection: Story = {
  render: () => (
    <Col>
      <MobileMenuOptions type="radio-selection" label="Label" />
      <MobileMenuOptions type="radio-selection" label="Label" selected />
      <MobileMenuOptions type="radio-selection" label="Label" disabled />
    </Col>
  ),
};
