import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileSegment } from './MobileSegment.js';

const meta: Meta<typeof MobileSegment> = {
  title: 'Atoms/MobileSegment',
  component: MobileSegment,
  parameters: {
    docs: {
      description: {
        component:
          'Mobile Segment (Figma `3038:38166`). Pill-shaped segmented-control tab. ' +
          '2 variants: Default (idle gray) and Active (elevated white with shadow). ' +
          'Mobile-only — no hover state.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    active: { control: 'boolean' },
  },
  args: {
    label: 'Title',
    active: false,
  },
};

export default meta;
type Story = StoryObj<typeof MobileSegment>;

export const Default: Story = {
  args: { label: 'Title', active: false },
};

export const Active: Story = {
  args: { label: 'Title', active: true },
};

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Full variant matrix · Figma <code>3038:38166</code>
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px auto',
          gap: '12px 24px',
          alignItems: 'center',
        }}
      >
        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
          Default
        </span>
        <MobileSegment label="Title" style={{ justifySelf: 'start' }} />

        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
          Active
        </span>
        <MobileSegment label="Title" active style={{ justifySelf: 'start' }} />
      </div>
    </div>
  ),
};
