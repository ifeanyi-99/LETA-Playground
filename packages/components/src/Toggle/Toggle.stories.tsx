import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Toggle } from './Toggle.js';

const meta: Meta<typeof Toggle> = {
  title: 'Atoms/Toggle',
  component: Toggle,
  argTypes: {
    checked: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Toggle>;

export const Off: Story = { args: { defaultChecked: false }, render: (a) => <Toggle aria-label="Off" {...a} /> };
export const On: Story = { args: { defaultChecked: true }, render: (a) => <Toggle aria-label="On" {...a} /> };
export const Disabled: Story = { args: { disabled: true }, render: (a) => <Toggle aria-label="Disabled" {...a} /> };

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '120px auto', gap: 16, alignItems: 'center' }}>
      <span className="text-label-m-medium">Off</span>
      <Toggle aria-label="Off" />
      <span className="text-label-m-medium">On</span>
      <Toggle aria-label="On" defaultChecked />
      <span className="text-label-m-medium">Disabled</span>
      <Toggle aria-label="Disabled" disabled />
    </div>
  ),
};
