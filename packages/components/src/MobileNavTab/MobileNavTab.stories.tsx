import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileNavTab } from './MobileNavTab.js';

const meta: Meta<typeof MobileNavTab> = {
  title: 'Atoms/MobileNavTab',
  component: MobileNavTab,
  parameters: {
    docs: {
      description: {
        component:
          'Mobile Nav Tab (Figma `8417:23519`). Bottom-navigation tab — vertical icon-over-label cell. ' +
          '2 variants (Idle / Active). Idle = muted gray, Active = LETA red.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    icon: { control: 'text' },
    active: { control: 'boolean' },
  },
  args: {
    label: 'Home',
    icon: 'Home',
    active: false,
  },
};

export default meta;
type Story = StoryObj<typeof MobileNavTab>;

export const Idle: Story = {
  args: { label: 'Home', icon: 'Home', active: false },
};

export const Active: Story = {
  args: { label: 'Home', icon: 'Home', active: true },
};

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Full variant matrix · Figma <code>8417:23519</code>
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
          Idle
        </span>
        <MobileNavTab label="Home" icon="Home" style={{ justifySelf: 'start' }} />

        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
          Active
        </span>
        <MobileNavTab label="Home" icon="Home" active style={{ justifySelf: 'start' }} />
      </div>
    </div>
  ),
};
