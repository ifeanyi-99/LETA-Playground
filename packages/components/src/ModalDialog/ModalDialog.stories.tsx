import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModalDialog } from './ModalDialog.js';

/**
 * Modal Dialog (`1317:4855`) — a 512px-wide single-purpose modal. ModalHeaders +
 * body + FooterFrame (Close / Confirm). Five variants set the body: Comment
 * (TextArea), Form (2-col Input Fields), Signature (canvas), Image (preview),
 * Multi-choice (Option Cards).
 */
const meta: Meta<typeof ModalDialog> = {
  title: 'Templates/Modal Dialog',
  component: ModalDialog,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ModalDialog>;

/** Comment — a single TextArea (counter on). */
export const Comment: Story = {
  render: () => <ModalDialog variant="comment" title="Add a comment" />,
};

/** Form — a two-column row of Input Fields. */
export const Form: Story = {
  render: () => <ModalDialog variant="form" title="Edit details" />,
};

/** Signature — a bordered signature canvas (480×304). */
export const Signature: Story = {
  render: () => <ModalDialog variant="signature" title="Signature" />,
};

/** Image — an image preview (480×304). */
export const Image: Story = {
  render: () => <ModalDialog variant="image" title="Proof of delivery" />,
};

/** Multi-choice — a vertical list of Option Cards. */
export const MultiChoice: Story = {
  render: () => <ModalDialog variant="multi-choice" title="Choose an option" />,
};

/** All five variants. */
export const Catalog: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start', padding: 24 }}>
      <ModalDialog variant="comment" title="Add a comment" />
      <ModalDialog variant="form" title="Edit details" />
      <ModalDialog variant="signature" title="Signature" />
      <ModalDialog variant="image" title="Proof of delivery" />
      <ModalDialog variant="multi-choice" title="Choose an option" />
    </div>
  ),
};
