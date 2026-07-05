import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page } from './Page.js';

/**
 * Page (`9626:14490`) — a full desktop application page: a collapsed Side Bar
 * rail beside a viewport of a Top Bar and a scrolling body (page Title + Page
 * Tabs Control + an info Notification Banner + the variant's main content).
 * Composition only — every region is an already-built organism / molecule.
 */
const meta: Meta<typeof Page> = {
  title: 'Pages/Page',
  component: Page,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Page>;

/** Data Table — a Table Container (toolbar + table + pagination) page. */
export const DataTable: Story = {
  name: 'Data Table',
  args: { variant: 'data-table' },
};

/** Configuration — a Sidetab nav beside a column of Configuration Cards. */
export const Configuration: Story = {
  args: { variant: 'configuration' },
};
