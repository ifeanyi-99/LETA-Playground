import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Button } from './Button.js';
import { VariantCatalog } from './Button.shared.js';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button/Mobile',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'Mobile Button variants per Figma node `2887:26272`. Each story renders one Variant across every (Size × Type) cell that exists in Figma — rows are Sizes, columns are Types, with a Disabled column appended (skipped for FAB). Hover / Pressed / Focus surface via real CSS pseudo-classes on interaction. Mobile is missing a dedicated Focus variant in Figma; the React component currently shares the Desktop focus treatment until the designer adds one.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  render: () => <VariantCatalog variant="primary" platform="mobile" />,
};

export const Secondary: Story = {
  render: () => <VariantCatalog variant="secondary" platform="mobile" />,
};

export const Ghost: Story = {
  render: () => <VariantCatalog variant="ghost" platform="mobile" />,
};

export const GhostError: Story = {
  render: () => <VariantCatalog variant="ghost-error" platform="mobile" />,
};

export const Dashed: Story = {
  render: () => <VariantCatalog variant="dashed" platform="mobile" />,
};

export const Destructive: Story = {
  render: () => <VariantCatalog variant="destructive" platform="mobile" />,
};

export const Success: Story = {
  render: () => <VariantCatalog variant="success" platform="mobile" />,
};

export const Plain: Story = {
  render: () => <VariantCatalog variant="plain" platform="mobile" />,
};
