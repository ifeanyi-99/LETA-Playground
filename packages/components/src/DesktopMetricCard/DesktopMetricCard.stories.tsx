import type { Meta, StoryObj } from '@storybook/react-vite';
import { DesktopMetricCard } from './DesktopMetricCard.js';

const meta: Meta<typeof DesktopMetricCard> = {
  title: 'Molecules/Cards/Metric Card',
  component: DesktopMetricCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'An interactive KPI card for dashboards. Wraps a Metrics Content Primitive ' +
          'inside a bordered card with hover/pressed states.' +
          '\n\n' +
          'Figma `4239:74634`. 3 states (Default / Hover / Pressed) × 4 variance ' +
          '(None / Neutral / Positive / Negative) = 12 variants. The variance badge ' +
          'maps Neutral → neutral, Positive → success + Up-Arrow, Negative → error + Down-Arrow.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 414 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof DesktopMetricCard>;

/** Default — no variance badge. */
export const Default: Story = {
  args: {
    metric: '10',
    eyebrowText: 'This week',
    variance: 'none',
  },
};

/** Neutral variance — gray badge, no icon. */
export const NeutralVariance: Story = {
  args: {
    metric: '10',
    eyebrowText: 'This week',
    variance: 'neutral',
    varianceLabel: '0%',
  },
};

/** Positive variance — green badge with an up arrow. */
export const PositiveVariance: Story = {
  args: {
    metric: '10',
    eyebrowText: 'This week',
    variance: 'positive',
    varianceLabel: '20%',
  },
};

/** Negative variance — red badge with a down arrow. */
export const NegativeVariance: Story = {
  args: {
    metric: '10',
    eyebrowText: 'This week',
    variance: 'negative',
    varianceLabel: '20%',
  },
};

/** Hover — soft drop shadow, no heavier border. */
export const Hover: Story = {
  args: {
    metric: '10',
    eyebrowText: 'This week',
    variance: 'neutral',
    varianceLabel: '0%',
    state: 'hover',
  },
};

/** Pressed — darker 1.5px border, no shadow. */
export const Pressed: Story = {
  args: {
    metric: '10',
    eyebrowText: 'This week',
    variance: 'neutral',
    varianceLabel: '0%',
    state: 'pressed',
  },
};

/** Focus — idle body + the standard 1.5px focus ring at 4px offset. */
export const Focus: Story = {
  args: {
    metric: '10',
    eyebrowText: 'This week',
    variance: 'neutral',
    varianceLabel: '0%',
    state: 'focus',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Forced focus state. In real use the ring appears via `:focus-visible` ' +
          'when the card is keyboard-focused.',
      },
    },
  },
};

/** Full matrix — 4 states (Default / Hover / Pressed / Focus) × 4 variance (None / Neutral / Positive / Negative). */
export const Catalog: Story = {
  render: () => {
    const states = ['default', 'hover', 'pressed', 'focus'] as const;
    const variances = [
      { variance: 'none' as const, label: undefined },
      { variance: 'neutral' as const, label: '0%' },
      { variance: 'positive' as const, label: '20%' },
      { variance: 'negative' as const, label: '20%' },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {states.map((state) => (
          <div key={state} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span
              className="text-label-s-semibold"
              style={{ color: 'var(--text-default-label-idle)', textTransform: 'capitalize' }}
            >
              {state}
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 414px)',
                gap: 24,
              }}
            >
              {variances.map(({ variance, label }) => (
                <DesktopMetricCard
                  key={variance}
                  metric="10"
                  eyebrowText="This week"
                  variance={variance}
                  varianceLabel={label}
                  state={state}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
