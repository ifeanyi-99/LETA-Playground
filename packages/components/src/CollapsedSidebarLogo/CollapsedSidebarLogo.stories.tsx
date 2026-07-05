import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { CollapsedSidebarLogo } from './CollapsedSidebarLogo.js';

const meta: Meta<typeof CollapsedSidebarLogo> = {
  title: 'Atoms/CollapsedSidebarLogo',
  component: CollapsedSidebarLogo,
  args: {
    'aria-label': 'Expand sidebar',
  },
};
export default meta;
type Story = StoryObj<typeof CollapsedSidebarLogo>;

export const Idle: Story = {};

export const Hover: Story = {
  render: (args: React.ComponentProps<typeof CollapsedSidebarLogo>) => (
    <CollapsedSidebarLogo {...args} data-force-state="hover" />
  ),
};

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 48 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <CollapsedSidebarLogo aria-label="Expand sidebar" />
        <span className="text-label-s-regular">Idle</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <CollapsedSidebarLogo aria-label="Expand sidebar" data-force-state="hover" />
        <span className="text-label-s-regular">Hover (forced)</span>
      </div>
    </div>
  ),
};

export const Live: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <CollapsedSidebarLogo
        aria-label="Expand sidebar"
        onClick={() => {
          // eslint-disable-next-line no-console
          console.log('[CollapsedSidebarLogo] expand sidebar clicked');
        }}
      />
      <span className="text-label-s-regular">
        Hover or Tab to swap; click / Enter / Space fires <code>onClick</code>.
      </span>
    </div>
  ),
};
