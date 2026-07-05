import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertDialog } from './AlertDialog.js';

/**
 * Alert Dialog (`1106:2868`) — the smallest modal template (480×256): a
 * confirmation / destructive-action prompt. ModalHeaders + body message +
 * FooterFrame (Close / Confirm). The `warning` variant adds a header icon.
 */
const meta: Meta<typeof AlertDialog> = {
  title: 'Templates/Alert Dialog',
  component: AlertDialog,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof AlertDialog>;

/** Basic — title + message + Close/Confirm. */
export const Basic: Story = {
  render: () => <AlertDialog variant="basic" />,
};

/** Warning — adds a leading warning icon in the header. */
export const Warning: Story = {
  render: () => <AlertDialog variant="warning" />,
};

/** Both variants side by side. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <AlertDialog variant="basic" />
      <AlertDialog variant="warning" />
    </div>
  ),
};
