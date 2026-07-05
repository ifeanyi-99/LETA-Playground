import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExtraLargeModal } from './ExtraLargeModal.js';

/**
 * Extra Large Modal (`7900:165088`) — a 1024×768 two-panel picker: a left table
 * panel (group heading + Table) and a right map panel (map + zoom control),
 * with ModalHeaders + a default footer.
 */
const meta: Meta<typeof ExtraLargeModal> = {
  title: 'Templates/Extra Large Modal',
  component: ExtraLargeModal,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof ExtraLargeModal>;

/** The full two-panel picker modal. */
export const Default: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <ExtraLargeModal title="Assign orders" />
    </div>
  ),
};

/** Single-instance catalog wrapper. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', padding: 24 }}>
      <ExtraLargeModal title="Assign orders" />
    </div>
  ),
};
