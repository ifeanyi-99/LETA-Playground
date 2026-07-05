import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';

const CLASSES = [
  'text-display-l-bold',
  'text-display-l-semibold',
  'text-display-m-bold',
  'text-display-m-semibold',
  'text-display-s-bold',
  'text-display-s-semibold',
];

const DisplayView: React.FC = () => (
  <div>
    <p style={{ color: 'var(--text-default-helper)', maxWidth: 640, margin: '0 0 24px' }}>
      Display text styles. Resize the preview to see Tablet (≤1023px) and Mobile (≤767px) variants.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {CLASSES.map((cls) => (
        <div
          key={cls}
          style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            gap: 16,
            alignItems: 'baseline',
          }}
        >
          <code style={{ fontSize: 11, color: 'var(--text-default-helper)' }}>.{cls}</code>
          <span className={cls}>The quick brown fox jumps over the lazy dog</span>
        </div>
      ))}
    </div>
  </div>
);

const meta: Meta<typeof DisplayView> = {
  title: 'Foundations/Tokens/Typography/Display',
  component: DisplayView,
};

export default meta;
type Story = StoryObj<typeof DisplayView>;

export const All: Story = {};
