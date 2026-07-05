import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Button } from './Button.js';
import { VariantCatalog } from './Button.shared.js';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button/Desktop',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'Desktop Button variants per Figma node `28:38245`. Each story renders one Variant across every (Size × Type) cell that exists in Figma — rows are Sizes, columns are Types, with a Disabled column appended (skipped for FAB, which Figma defines without a Disabled state). Hover, press, and focus surface via real CSS pseudo-classes — interact with any cell to see Hover / Pressed / Focus states.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  render: () => <VariantCatalog variant="primary" platform="desktop" />,
};

export const Secondary: Story = {
  render: () => <VariantCatalog variant="secondary" platform="desktop" />,
};

export const Ghost: Story = {
  render: () => <VariantCatalog variant="ghost" platform="desktop" />,
};

export const GhostError: Story = {
  render: () => <VariantCatalog variant="ghost-error" platform="desktop" />,
};

export const Dashed: Story = {
  render: () => <VariantCatalog variant="dashed" platform="desktop" />,
};

export const Destructive: Story = {
  render: () => <VariantCatalog variant="destructive" platform="desktop" />,
};

export const Plain: Story = {
  render: () => <VariantCatalog variant="plain" platform="desktop" />,
};
