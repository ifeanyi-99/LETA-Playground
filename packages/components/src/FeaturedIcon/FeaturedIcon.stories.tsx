import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeaturedIcon } from './FeaturedIcon.js';
import type { FeaturedIconColor, FeaturedIconSize } from './FeaturedIcon.js';

const meta: Meta<typeof FeaturedIcon> = {
  title: 'Atoms/FeaturedIcon',
  component: FeaturedIcon,
  parameters: { layout: 'centered' },
  argTypes: {
    color: {
      control: 'select',
      options: ['information', 'highlight', 'error', 'success', 'neutral', 'warning', 'teal'] satisfies FeaturedIconColor[],
    },
    size: {
      control: 'radio',
      options: ['medium', 'large'] satisfies FeaturedIconSize[],
    },
  },
};

export default meta;
type Story = StoryObj<typeof FeaturedIcon>;

export const Default: Story = {
  args: {
    icon: 'Orders',
    color: 'information',
    size: 'medium',
  },
};

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <FeaturedIcon icon="Orders" color="information" size="medium" />
      <FeaturedIcon icon="Orders" color="information" size="large" />
    </div>
  ),
};

export const Colors: Story = {
  name: 'Colors',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <FeaturedIcon icon="Orders"        color="information" size="medium" />
      <FeaturedIcon icon="Star"           color="highlight"   size="medium" />
      <FeaturedIcon icon="Error"         color="error"       size="medium" />
      <FeaturedIcon icon="Check-Circle"  color="success"     size="medium" />
      <FeaturedIcon icon="Orders"        color="neutral"     size="medium" />
      <FeaturedIcon icon="Warning"       color="warning"     size="medium" />
      <FeaturedIcon icon="Integration"   color="teal"        size="medium" />
    </div>
  ),
};

const ALL_COLORS: FeaturedIconColor[] = [
  'information',
  'highlight',
  'error',
  'success',
  'neutral',
  'warning',
  'teal',
];

const COLOR_ICONS: Record<FeaturedIconColor, string> = {
  information: 'Orders',
  highlight:   'Star',
  error:       'Error',
  success:     'Check-Circle',
  neutral:     'Orders',
  warning:     'Warning',
  teal:        'Integration',
};

const ALL_SIZES: FeaturedIconSize[] = ['medium', 'large'];

export const Catalog: Story = {
  name: 'Catalog',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${ALL_SIZES.length}, auto)`,
        gap: 16,
        alignItems: 'start',
      }}
    >
      {ALL_COLORS.flatMap((color) =>
        ALL_SIZES.map((size) => (
          <FeaturedIcon
            key={`${color}-${size}`}
            icon={COLOR_ICONS[color] as Parameters<typeof FeaturedIcon>[0]['icon']}
            color={color}
            size={size}
            style={{ justifySelf: 'start' }}
          />
        )),
      )}
    </div>
  ),
};
