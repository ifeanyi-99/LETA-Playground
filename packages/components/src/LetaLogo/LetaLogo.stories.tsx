import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { LetaLogo } from './LetaLogo.js';

const meta: Meta<typeof LetaLogo> = {
  title: 'Atoms/LetaLogo',
  component: LetaLogo,
  argTypes: {
    type: { control: 'select', options: ['symbol', 'wordmark'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
};
export default meta;
type Story = StoryObj<typeof LetaLogo>;

export const SymbolSmall: Story = { args: { type: 'symbol', size: 'small' } };
export const SymbolMedium: Story = { args: { type: 'symbol', size: 'medium' } };
export const SymbolLarge: Story = { args: { type: 'symbol', size: 'large' } };
export const Wordmark: Story = { args: { type: 'wordmark' } };

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <LetaLogo type="symbol" size="small" />
          <span className="text-label-s-regular">Symbol / Small (24)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <LetaLogo type="symbol" size="medium" />
          <span className="text-label-s-regular">Symbol / Medium (56)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <LetaLogo type="symbol" size="large" />
          <span className="text-label-s-regular">Symbol / Large (120)</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <LetaLogo type="wordmark" />
        <span className="text-label-s-regular">Wordmark (67.58 × 16)</span>
      </div>
    </div>
  ),
};
