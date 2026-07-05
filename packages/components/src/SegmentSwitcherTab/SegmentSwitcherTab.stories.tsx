import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentSwitcherTab } from './SegmentSwitcherTab.js';

const meta: Meta<typeof SegmentSwitcherTab> = {
  title: 'Atoms/SegmentSwitcherTab',
  component: SegmentSwitcherTab,
  parameters: { layout: 'centered' },
  argTypes: {
    active: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentSwitcherTab>;

export const Default: Story = {
  args: { label: 'Overview' },
};

export const WithLeadingIcon: Story = {
  args: { label: 'Overview', leadingIcon: 'Analytics' },
};

export const Active: Story = {
  args: { label: 'Overview', active: true },
};

export const ActiveWithLeadingIcon: Story = {
  args: { label: 'Overview', leadingIcon: 'Analytics', active: true },
};

export const Catalog: Story = {
  name: 'Catalog',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 16, alignItems: 'start' }}>
      <SegmentSwitcherTab label="Default" style={{ justifySelf: 'start' }} />
      <SegmentSwitcherTab label="Hover (simulated)" style={{ justifySelf: 'start', backgroundColor: 'var(--surface-neutral-segment-hover)' }} />
      <SegmentSwitcherTab label="Active" active style={{ justifySelf: 'start' }} />
      <SegmentSwitcherTab label="With Icon" leadingIcon="Analytics" style={{ justifySelf: 'start' }} />
      <SegmentSwitcherTab label="With Icon" leadingIcon="Analytics" style={{ justifySelf: 'start', backgroundColor: 'var(--surface-neutral-segment-hover)' }} />
      <SegmentSwitcherTab label="With Icon" leadingIcon="Analytics" active style={{ justifySelf: 'start' }} />
    </div>
  ),
};
