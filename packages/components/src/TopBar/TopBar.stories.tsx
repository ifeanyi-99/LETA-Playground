import type { Meta, StoryObj } from '@storybook/react-vite';
import { TopBar } from './TopBar.js';

/**
 * Top Bar (`7519:27364`) — the persistent application header: breadcrumb
 * wayfinding on the left; notifications + User-Menu on the right. The Active
 * variant shows an unread-notification dot on the bell. Composes Breadcrumbs,
 * Button, and User-Menu.
 *
 * The bar fills its container width (here, the Storybook viewport) — in a real
 * app it expands to the frame/window it lives in. The Figma 1200px is the design
 * canvas, not a constraint.
 */
const meta: Meta<typeof TopBar> = {
  title: 'Organisms/Navigation/Top Bar',
  component: TopBar,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof TopBar>;

// `layout: 'fullscreen'` (above) makes the global decorator drop its 16px padding,
// so the bar renders edge-to-edge / full-viewport-width on its own (it's `width:100%`).

export const Default: Story = {
  render: () => <TopBar variant="default" />,
};

export const Active: Story = {
  render: () => <TopBar variant="active" />,
};

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <TopBar variant="default" />
      <TopBar variant="active" />
    </div>
  ),
};
