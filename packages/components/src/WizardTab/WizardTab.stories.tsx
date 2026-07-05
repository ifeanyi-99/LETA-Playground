import type { Meta, StoryObj } from '@storybook/react-vite';
import { WizardTab } from './WizardTab.js';

const meta: Meta<typeof WizardTab> = {
  title: 'Atoms/WizardTab',
  component: WizardTab,
  parameters: { layout: 'centered' },
  argTypes: {
    active: { control: 'boolean' },
    inactive: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof WizardTab>;

export const Default: Story = {
  args: { label: 'Details', step: 1 },
};

export const Active: Story = {
  args: { label: 'Details', step: 1, active: true },
};

export const Inactive: Story = {
  args: { label: 'Review', step: 3, inactive: true },
};

export const AllStates: Story = {
  name: 'All States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
        Idle, Active and Inactive render at rest. Hover and Pressed are interaction states —
        hover (or press-and-hold) the middle tabs to see them. Inactive is non-interactive.
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, auto)', gap: 16, alignItems: 'start' }}>
        <WizardTab label="Idle" step={1} style={{ justifySelf: 'start' }} />
        <WizardTab label="Hover me" step={2} style={{ justifySelf: 'start' }} />
        <WizardTab label="Press me" step={3} style={{ justifySelf: 'start' }} />
        <WizardTab label="Active" step={4} active style={{ justifySelf: 'start' }} />
        <WizardTab label="Inactive" step={5} inactive style={{ justifySelf: 'start' }} />
      </div>
    </div>
  ),
};

export const Catalog: Story = {
  name: 'Catalog',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 16, alignItems: 'start' }}>
      <WizardTab label="Step Idle" step={1} style={{ justifySelf: 'start' }} />
      <WizardTab label="Step Active" step={2} active style={{ justifySelf: 'start' }} />
      <WizardTab label="Step Inactive" step={3} inactive style={{ justifySelf: 'start' }} />
    </div>
  ),
};
