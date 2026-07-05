import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressTracker } from './ProgressTracker.js';

const meta: Meta<typeof ProgressTracker> = {
  title: 'Atoms/ProgressTracker',
  component: ProgressTracker,
  parameters: {
    docs: {
      description: {
        component:
          'Progress Tracker (Figma `5608:216176`). Tiny 14×14 circular progress indicator. ' +
          'Gray track ring + green progress arc starting at 12 o\'clock. ' +
          'Figma defines 4 variants (10/50/75/100%); the React component supports any `value` 0–100.',
      },
    },
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
  args: { value: 10 },
};

export default meta;
type Story = StoryObj<typeof ProgressTracker>;

export const Default: Story = {};

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Full variant matrix · Figma <code>5608:216176</code>
      </h2>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 32,
        }}
      >
        {[10, 50, 75, 100].map((v) => (
          <div
            key={v}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ProgressTracker value={v} />
            <span
              className="text-label-s-regular"
              style={{ color: 'var(--text-default-helper)' }}
            >
              {v}%
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};
