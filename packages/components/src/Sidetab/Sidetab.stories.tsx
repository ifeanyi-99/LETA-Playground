import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sidetab } from './Sidetab.js';

/**
 * Sidetab (`7751:26369`) — secondary, in-module navigation: a 160px column of
 * side-tab menu options (one active). Data-driven via `tabs` + `value`/`onChange`,
 * composing the side-tab Desktop Menu Options.
 */
const meta: Meta<typeof Sidetab> = {
  title: 'Organisms/Navigation/Sidetab',
  component: Sidetab,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Sidetab>;

/** The Figma sidetab — five tabs, first active; clicking switches the active tab. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState(0);
    return <Sidetab value={value} onChange={setValue} />;
  },
};
