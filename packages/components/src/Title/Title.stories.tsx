import type { Meta, StoryObj } from '@storybook/react-vite';
import { Title } from './Title.js';

const meta: Meta<typeof Title> = {
  title: 'Atoms/Title',
  component: Title,
  parameters: {
    docs: {
      description: {
        component:
          'Title — non-interactive heading from Figma `6767:26920`. Two variants: ' +
          '`page-dialog` (24px Heading/M/SemiBold) and `card` (16px Body/L/SemiBold). ' +
          'Use the `as` prop to control the semantic HTML element independent of the visual size.',
      },
    },
  },
  argTypes: {
    text: { control: 'text' },
    variant: {
      control: 'select',
      options: ['page-dialog', 'card'],
    },
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
  },
  args: {
    text: 'Heading 1',
    variant: 'page-dialog',
    as: 'h2',
  },
};

export default meta;
type Story = StoryObj<typeof Title>;

/* ------------------------------------------------------------------ */
/*  Interactive default — edit text, variant, and `as` via controls   */
/* ------------------------------------------------------------------ */

export const Default: Story = {};

/* ------------------------------------------------------------------ */
/*  Catalog — both Figma variants stacked vertically with token names */
/* ------------------------------------------------------------------ */

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span
          className="text-label-s-regular"
          style={{ color: 'var(--text-default-helper)' }}
        >
          Page &amp; Dialog Title · Heading/M/SemiBold · 24/28 · -0.4
        </span>
        <Title text="Heading 1" variant="page-dialog" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span
          className="text-label-s-regular"
          style={{ color: 'var(--text-default-helper)' }}
        >
          Card Title · Body/L/SemiBold · 16/24 · -0.28
        </span>
        <Title text="Heading 1" variant="card" />
      </div>
    </div>
  ),
};
