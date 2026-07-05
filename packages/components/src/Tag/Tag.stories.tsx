import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from './Tag.js';

const meta: Meta<typeof Tag> = {
  title: 'Atoms/Tag',
  component: Tag,
  parameters: {
    docs: {
      description: {
        component:
          'Tag variants per Figma node `7751:28982`. ' +
          'Single color (Sky Blue / information) × 3 visual states (Idle / Hover / Pressed) × ' +
          'optional trailing remove icon. ' +
          'Outer element is a non-interactive <span>; only the remove button is focusable.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    removeLabel: { control: 'text' },
  },
  args: {
    label: 'Label',
  },
};
export default meta;
type Story = StoryObj<typeof Tag>;

/* ============================================================================
 * Figma variant stories
 * ========================================================================== */

export const WithoutRemove: Story = {
  args: { label: 'Label' },
};

export const WithRemove: Story = {
  args: {
    label: 'Label',
    onRemove: () => {},
  },
};

/* ============================================================================
 * Catalog — Figma variant matrix
 * ========================================================================== */

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Full variant matrix · Figma <code>7751:28982</code>
      </h2>
      <p className="text-label-s-regular" style={{ color: 'var(--text-default-helper)', margin: 0 }}>
        Hover and press each tag to see state transitions.
      </p>

      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(2, auto)', gap: 24, alignItems: 'center' }}>
        <span />
        <span className="text-label-m-semibold">Show Trailing Icon = false</span>
        <span className="text-label-m-semibold">Show Trailing Icon = true</span>
      </div>

      {/* Sky Blue row */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(2, auto)', gap: 24, alignItems: 'center' }}>
        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
          Color = Sky Blue
        </span>
        <Tag label="Label" style={{ justifySelf: 'start' }} />
        <Tag label="Label" onRemove={() => {}} style={{ justifySelf: 'start' }} />
      </div>
    </div>
  ),
};
