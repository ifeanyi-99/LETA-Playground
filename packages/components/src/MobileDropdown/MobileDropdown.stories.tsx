import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileDropdown } from './MobileDropdown.js';

/**
 * Mobile Dropdown (`8338:35339`) — the dropdown panel that stacks Mobile Menu
 * Options rows. Used by the mobile map search and mobile selects.
 */
const meta: Meta<typeof MobileDropdown> = {
  title: 'Molecules/Drop downs/Mobile',
  component: MobileDropdown,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 300 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof MobileDropdown>;

const OPTIONS = [
  { label: 'LTA-ID-001' },
  { label: 'LTA-ID-002' },
  { label: 'Michael', active: true },
  { label: 'Kitisuru' },
  { label: 'Westlands' },
  { label: 'Karen' },
];

export const Default: Story = { args: { options: OPTIONS } };
export const Selection: Story = {
  args: {
    options: [
      { label: 'Option A', type: 'checkbox-selection', selected: true },
      { label: 'Option B', type: 'checkbox-selection' },
      { label: 'Option C', type: 'checkbox-selection' },
    ],
  },
};
