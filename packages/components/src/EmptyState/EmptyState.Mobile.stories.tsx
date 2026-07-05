import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState.js';

/**
 * Mobile (compact) empty states — the `Size=Mobile` variants of Figma `7339:29150`
 * (64px illustration, `body-l-semibold`). One story per Figma mobile type.
 */
const meta: Meta<typeof EmptyState> = {
  title: 'Molecules/EmptyState/Mobile',
  component: EmptyState,
  parameters: { layout: 'padded' },
  args: { size: 'mobile' },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoResults: Story = { args: { type: 'no-results' } };
export const NoResultsNoIcon: Story = { args: { type: 'no-results', showIcon: false } };
export const NoReviews: Story = { args: { type: 'no-reviews' } };
export const ImageUpload: Story = { args: { type: 'image-upload' } };
export const FileUpload: Story = { args: { type: 'file-upload' } };
export const NoSuspensions: Story = { args: { type: 'no-suspensions' } };
export const NoItems: Story = { args: { type: 'no-items' } };
export const NoOrders: Story = { args: { type: 'no-orders' } };
export const NoNetwork: Story = { args: { type: 'no-network' } };
export const NewUpdate: Story = { args: { type: 'new-update' } };
