import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Checkbox } from './Checkbox.js';

const meta: Meta<typeof Checkbox> = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  argTypes: {
    checked: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = { args: { defaultChecked: false }, render: (a: React.ComponentProps<typeof Checkbox>) => <Checkbox aria-label="Unchecked" {...a} /> };
export const Checked: Story = { args: { defaultChecked: true }, render: (a: React.ComponentProps<typeof Checkbox>) => <Checkbox aria-label="Checked" {...a} /> };
export const Indeterminate: Story = { args: { indeterminate: true }, render: (a: React.ComponentProps<typeof Checkbox>) => <Checkbox aria-label="Indeterminate" {...a} /> };
export const Disabled: Story = { args: { disabled: true }, render: (a: React.ComponentProps<typeof Checkbox>) => <Checkbox aria-label="Disabled" {...a} /> };

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '160px auto', gap: 16, alignItems: 'center' }}>
      <span className="text-label-m-medium">Idle</span>
      <Checkbox aria-label="Idle" />
      <span className="text-label-m-medium">Active</span>
      <Checkbox aria-label="Active" defaultChecked />
      <span className="text-label-m-medium">Indeterminate</span>
      <Checkbox aria-label="Indeterminate" indeterminate />
      <span className="text-label-m-medium">Disabled</span>
      <Checkbox aria-label="Disabled" disabled />
    </div>
  ),
};
