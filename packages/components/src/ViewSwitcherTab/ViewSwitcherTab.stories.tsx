import type { Meta, StoryObj } from '@storybook/react-vite';
import { ViewSwitcherTab } from './ViewSwitcherTab.js';

const meta: Meta<typeof ViewSwitcherTab> = {
  title: 'Atoms/ViewSwitcherTab',
  component: ViewSwitcherTab,
  parameters: { layout: 'centered' },
  argTypes: {
    active: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ViewSwitcherTab>;

export const Default: Story = {
  args: { label: 'Grid' },
};

export const WithLeadingIcon: Story = {
  args: { label: 'Grid', leadingIcon: 'Apps' },
};

export const Active: Story = {
  args: { label: 'Grid', active: true },
};

export const ActiveWithLeadingIcon: Story = {
  args: { label: 'Grid', leadingIcon: 'Apps', active: true },
};

export const Catalog: Story = {
  name: 'Catalog',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 16, alignItems: 'start' }}>
      <ViewSwitcherTab label="Default" style={{ justifySelf: 'start' }} />
      <ViewSwitcherTab label="Hover (simulated)" style={{ justifySelf: 'start', backgroundColor: 'var(--surface-neutral-segment-hover)' }} />
      <ViewSwitcherTab label="Active" active style={{ justifySelf: 'start' }} />
      <ViewSwitcherTab label="With Icon" leadingIcon="Apps" style={{ justifySelf: 'start' }} />
      <ViewSwitcherTab label="With Icon" leadingIcon="Apps" style={{ justifySelf: 'start', backgroundColor: 'var(--surface-neutral-segment-hover)' }} />
      <ViewSwitcherTab label="With Icon" leadingIcon="Apps" active style={{ justifySelf: 'start' }} />
    </div>
  ),
};
