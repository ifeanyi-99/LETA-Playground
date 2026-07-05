import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContentCard } from './ContentCard.js';
import { StackedCards } from './StackedCards.js';

/**
 * Content Card (`9896:25095`) — a bordered white card that wraps a single Content
 * Primitive (the `children` slot). Stacked Cards (`2794:28551`) lays several of them
 * out in a 16px-gap column.
 */
const meta: Meta<typeof ContentCard> = {
  title: 'Molecules/Cards/Content Card',
  component: ContentCard,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 700 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ContentCard>;

/** A single Content Card with its default Utility primitive (title + subtext + Dispatch). */
export const Default: Story = {};

/** Stacked Cards — several Content Cards stacked with a 16px gap. */
export const Stacked: StoryObj = {
  render: () => <StackedCards />,
};
