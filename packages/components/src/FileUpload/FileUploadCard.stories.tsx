import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileUploadCard } from './FileUploadCard.js';

/**
 * File Upload Cards (`7359:18098`) — a single row of the file-upload queue. Used by
 * the File Upload field (Form Controls) to list selected files. Two states:
 * `uploading` (Loading glyph + progress bar) and `uploaded` (Check-Circle-Outline,
 * no bar). `--surface-neutral-bg-muted` card with a trailing Ghost remove ×.
 */
const meta: Meta<typeof FileUploadCard> = {
  title: 'Molecules/Cards/File Upload Card',
  component: FileUploadCard,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof FileUploadCard>;

/** Uploading — Loading glyph + a progress bar at the current percentage. */
export const Uploading: Story = {
  args: { status: 'uploading', filename: 'filename.png', size: '32MB', progress: 50 },
};

/** Uploaded — Check-Circle-Outline glyph, no progress bar. */
export const Uploaded: Story = {
  args: { status: 'uploaded', filename: 'filename.png', size: '32MB' },
};
