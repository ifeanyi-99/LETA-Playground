import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SideBar } from './SideBar.js';

/**
 * Side Bar (`3714:35743`) — the product's primary navigation. Expanded (240px,
 * labelled) or Collapsed (72px, icon-only): header (logo + collapse toggle),
 * Global Search, divider-separated nav groups, footer (utility links + version).
 * Composes Leta Logo / Collapsed Sidebar Logo, Search Input, Button, sidebar
 * Desktop Menu Options.
 */
const meta: Meta<typeof SideBar> = {
  title: 'Organisms/Navigation/Side Bar',
  component: SideBar,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof SideBar>;

const Frame = ({ children }: { children: React.ReactNode }) => (
  // The SideBar carries its own 1px right border (the rail→content demarcator),
  // so the frame only constrains height — no decorative border (would double up).
  <div style={{ height: 760, display: 'inline-flex' }}>{children}</div>
);

export const Expanded: Story = {
  render: () => <Frame><SideBar variant="expanded" /></Frame>,
};

export const Collapsed: Story = {
  render: () => <Frame><SideBar variant="collapsed" /></Frame>,
};

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <Frame><SideBar variant="expanded" /></Frame>
      <Frame><SideBar variant="collapsed" /></Frame>
    </div>
  ),
};
