import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';

const CLASSES = [
  'text-label-l-bold',
  'text-label-l-semibold',
  'text-label-l-medium',
  'text-label-l-regular',
  'text-label-m-bold',
  'text-label-m-semibold',
  'text-label-m-medium',
  'text-label-m-regular',
  'text-label-s-bold',
  'text-label-s-semibold',
  'text-label-s-medium',
  'text-label-s-regular',
];

const LabelView: React.FC = () => (
  <div>
    <p style={{ color: 'var(--text-default-helper)', maxWidth: 640, margin: '0 0 24px' }}>
      Label text styles. Resize the preview to see Tablet (≤1023px) and Mobile (≤767px) variants.
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

const meta: Meta<typeof LabelView> = {
  title: 'Foundations/Tokens/Typography/Label',
  component: LabelView,
};

export default meta;
type Story = StoryObj<typeof LabelView>;

export const All: Story = {};
