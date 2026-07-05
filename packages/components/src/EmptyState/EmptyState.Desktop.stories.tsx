import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState.js';

/**
 * Desktop (full-page) empty states — the `Size=Desktop` variants of Figma `7339:29150`
 * (100px illustration, `heading-s-semibold`). One story per Figma desktop type.
 */
const meta: Meta<typeof EmptyState> = {
  title: 'Molecules/EmptyState/Desktop',
  component: EmptyState,
  parameters: { layout: 'padded' },
  args: { size: 'desktop' },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoResults: Story = { args: { type: 'no-results' } };
/** "No Results (No Icon)" — the text-only variant used inside dropdown overlays (Combobox-Search-Empty, Filter Group Empty). */
export const NoResultsNoIcon: Story = { args: { type: 'no-results', showIcon: false } };
export const NoReviews: Story = { args: { type: 'no-reviews' } };
export const NoBroadcastLogs: Story = { args: { type: 'no-broadcast-logs' } };
export const NoOrders: Story = { args: { type: 'no-orders' } };
export const NoData: Story = { args: { type: 'no-data' } };
export const NoTrips: Story = { args: { type: 'no-trips' } };
export const NoDrivers: Story = { args: { type: 'no-drivers' } };
export const NoProducts: Story = { args: { type: 'no-products' } };
