import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton.js';

/**
 * Skeleton — a shimmering placeholder rectangle for loading states. Compose
 * several to build any shape (a table row, a card) — see `TableContainer`'s
 * `Loading` story for a table-row arrangement.
 */
const meta: Meta<typeof Skeleton> = {
  title: 'Atoms/Skeleton',
  component: Skeleton,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

/** A single block on its own, at the component's defaults (width 100%, height 16, `--rounding-lg`). */
export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Skeleton />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Skeleton width={240} height={12} />
      <Skeleton width={180} height={16} />
      <Skeleton width={120} height={24} />
      <Skeleton width={48} height={48} borderRadius="var(--rounding-round)" />
    </div>
  ),
};
