import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserMenu, type UserMenuState } from './UserMenu.js';

/**
 * User-Menu (`7446:22541`) — the account trigger pill in the Top Bar: the user's
 * Avatar + a chevron. Opens the user menu on click. Hover/pressed are runtime;
 * `state` forces a visual state for the catalog.
 */
const meta: Meta<typeof UserMenu> = {
  title: 'Atoms/User-Menu',
  component: UserMenu,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof UserMenu>;

const STATES: UserMenuState[] = ['idle', 'hover', 'pressed'];

export const Default: Story = {
  render: () => <UserMenu name="Alex Smith" />,
};

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {STATES.map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
          <code style={{ fontSize: 10, color: 'var(--text-default-label-idle)' }}>{s}</code>
          <UserMenu name="Alex Smith" state={s} />
        </div>
      ))}
    </div>
  ),
};
