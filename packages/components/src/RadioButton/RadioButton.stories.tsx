import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { RadioButton } from './RadioButton.js';

const meta: Meta<typeof RadioButton> = {
  title: 'Atoms/RadioButton',
  component: RadioButton,
  argTypes: {
    checked: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof RadioButton>;

export const Unchecked: Story = { args: { defaultChecked: false }, render: (a: React.ComponentProps<typeof RadioButton>) => <RadioButton aria-label="Unchecked" name="rb-unchecked" {...a} /> };
export const Checked: Story = { args: { defaultChecked: true }, render: (a: React.ComponentProps<typeof RadioButton>) => <RadioButton aria-label="Checked" name="rb-checked" {...a} /> };
export const Disabled: Story = { args: { disabled: true }, render: (a: React.ComponentProps<typeof RadioButton>) => <RadioButton aria-label="Disabled" name="rb-disabled" {...a} /> };

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '160px auto', gap: 16, alignItems: 'center' }}>
      <span className="text-label-m-medium">Idle</span>
      <RadioButton aria-label="Idle" name="catalog-1" />
      <span className="text-label-m-medium">Active</span>
      <RadioButton aria-label="Active" name="catalog-2" defaultChecked />
      <span className="text-label-m-medium">Disabled</span>
      <RadioButton aria-label="Disabled" name="catalog-3" disabled />
    </div>
  ),
};
