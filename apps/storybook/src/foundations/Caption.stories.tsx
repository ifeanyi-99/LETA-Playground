import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';

const CLASSES = [
  'text-caption-l-bold',
  'text-caption-l-semibold',
  'text-caption-l-medium',
  'text-caption-l-regular',
  'text-caption-l-light',
];

const CaptionView: React.FC = () => (
  <div>
    <p style={{ color: 'var(--text-default-helper)', maxWidth: 640, margin: '0 0 24px' }}>
      Caption text styles. Resize the preview to see Tablet (≤1023px) and Mobile (≤767px) variants.
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

const meta: Meta<typeof CaptionView> = {
  title: 'Foundations/Tokens/Typography/Caption',
  component: CaptionView,
};

export default meta;
type Story = StoryObj<typeof CaptionView>;

export const All: Story = {};
