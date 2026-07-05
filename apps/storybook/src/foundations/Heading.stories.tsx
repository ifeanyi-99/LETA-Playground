import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';

const CLASSES = [
  'text-heading-l-bold',
  'text-heading-l-semibold',
  'text-heading-m-bold',
  'text-heading-m-semibold',
  'text-heading-s-bold',
  'text-heading-s-semibold',
  'text-heading-s-medium',
];

const HeadingView: React.FC = () => (
  <div>
    <p style={{ color: 'var(--text-default-helper)', maxWidth: 640, margin: '0 0 24px' }}>
      Heading text styles. Resize the preview to see Tablet (≤1023px) and Mobile (≤767px) variants.
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

const meta: Meta<typeof HeadingView> = {
  title: 'Foundations/Tokens/Typography/Heading',
  component: HeadingView,
};

export default meta;
type Story = StoryObj<typeof HeadingView>;

export const All: Story = {};
