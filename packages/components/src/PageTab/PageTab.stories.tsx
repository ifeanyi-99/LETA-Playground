import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageTab } from './PageTab.js';

const meta: Meta<typeof PageTab> = {
  title: 'Atoms/PageTab',
  component: PageTab,
  parameters: { layout: 'centered' },
  argTypes: {
    active: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof PageTab>;

export const Default: Story = {
  args: { label: 'Overview' },
};

export const Active: Story = {
  args: { label: 'Overview', active: true },
};

export const Catalog: Story = {
  name: 'Catalog',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 16, alignItems: 'start' }}>
      <PageTab label="Idle" style={{ justifySelf: 'start' }} />
      <PageTab label="Hover (simulated)" style={{ justifySelf: 'start', color: 'var(--text-default-label)' }} />
      <PageTab label="Pressed (simulated)" style={{ justifySelf: 'start', color: 'var(--text-secondary-label)' }} />
      <PageTab label="Active" active style={{ justifySelf: 'start' }} />
    </div>
  ),
};
