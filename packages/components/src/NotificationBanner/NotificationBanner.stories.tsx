import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationBanner } from './NotificationBanner.js';
import { Button } from '../Button/Button.js';
import type { NotificationBannerType } from './NotificationBanner.js';

const meta: Meta<typeof NotificationBanner> = {
  title: 'Molecules/NotificationBanner',
  component: NotificationBanner,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A status/notification banner with semantic color coding for different message types. ' +
          'Used for alerts, contextual information, warnings, and errors.' +
          '\n\n' +
          'Figma `3811:65015`. 5 types (Info / Neutral / Highlight / Warning / Error) × 2 variants ' +
          '(Filled / Subtle) = 10 Figma variants. **Filled** has colored background, border, title + ' +
          'description. **Subtle** is transparent with description only (no title).' +
          '\n\n' +
          'The Content Buttons slot (`children`) defaults to a "Learn more" Plain Button. ' +
          'The dismiss button renders when `onDismiss` is provided.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof NotificationBanner>;

const LearnMore = () => (
  <Button variant="plain" size="medium" showUnderline>
    Learn more
  </Button>
);

const ALL_TYPES: NotificationBannerType[] = [
  'info',
  'neutral',
  'highlight',
  'warning',
  'error',
];

/** Info Filled with title, description, "Learn more" action, and dismiss. */
export const Default: Story = {
  args: {
    type: 'info',
    variant: 'filled',
    title: 'Title',
    description: 'Enter Text',
    onDismiss: () => {},
    children: <LearnMore />,
  },
};

/** Info Subtle — no background, no title. */
export const Subtle: Story = {
  args: {
    type: 'info',
    variant: 'subtle',
    description: 'Enter Text',
    onDismiss: () => {},
    children: <LearnMore />,
  },
};

/** All 5 types in Filled variant. */
export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      {ALL_TYPES.map((t) => (
        <NotificationBanner
          key={t}
          type={t}
          variant="filled"
          title="Title"
          description="Enter Text"
          onDismiss={() => {}}
        >
          <LearnMore />
        </NotificationBanner>
      ))}
    </div>
  ),
};

/** All 5 types in Subtle variant. */
export const AllTypesSubtle: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      {ALL_TYPES.map((t) => (
        <NotificationBanner
          key={t}
          type={t}
          variant="subtle"
          description="Enter Text"
          onDismiss={() => {}}
        >
          <LearnMore />
        </NotificationBanner>
      ))}
    </div>
  ),
};

/** Full 5×2 matrix: all types × both variants. */
export const Catalog: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
        maxWidth: 1000,
      }}
    >
      {ALL_TYPES.map((t) =>
        (['filled', 'subtle'] as const).map((v) => (
          <div key={`${t}-${v}`} style={{ justifySelf: 'start', width: '100%' }}>
            <div
              className="text-body-s-medium"
              style={{
                color: 'var(--text-default-label-idle)',
                marginBottom: 8,
              }}
            >
              {t} / {v}
            </div>
            <NotificationBanner
              type={t}
              variant={v}
              title={v === 'filled' ? 'Title' : undefined}
              description="Enter Text"
              onDismiss={() => {}}
            >
              <LearnMore />
            </NotificationBanner>
          </div>
        )),
      )}
    </div>
  ),
};
