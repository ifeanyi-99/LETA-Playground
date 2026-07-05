import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';

const CLASSES = [
  'text-body-l-bold',
  'text-body-l-semibold',
  'text-body-l-medium',
  'text-body-l-regular',
  'text-body-m-bold',
  'text-body-m-semibold',
  'text-body-m-medium',
  'text-body-m-regular',
  'text-body-s-bold',
  'text-body-s-semibold',
  'text-body-s-medium',
  'text-body-s-regular',
];

const BodyView: React.FC = () => (
  <div>
    <p style={{ color: 'var(--text-default-helper)', maxWidth: 640, margin: '0 0 24px' }}>
      Body text styles. Resize the preview to see Tablet (≤1023px) and Mobile (≤767px) variants.
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

const meta: Meta<typeof BodyView> = {
  title: 'Foundations/Tokens/Typography/Body',
  component: BodyView,
};

export default meta;
type Story = StoryObj<typeof BodyView>;

export const All: Story = {};
