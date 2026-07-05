import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast } from './Toast.js';
import { Button } from '../Button/Button.js';

const meta: Meta<typeof Toast> = {
  title: 'Molecules/Toast',
  component: Toast,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A transient, auto-dismissing notification confirming the outcome of an action. ' +
          'Anchored bottom-right of the screen, persists ~7s (set `duration`). ' +
          'Figma `68:36772`. 3 types (Success / Warning / Error), optional title / subtitle / CTA, always dismissable.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Toast>;

/** Success — completed action. */
export const Success: Story = {
  args: {
    type: 'success',
    title: 'Toast Title',
    subtitle: 'Subtitle goes here. More info is provided',
    onDismiss: () => {},
  },
};

/** Warning — cautionary outcome. */
export const Warning: Story = {
  args: {
    type: 'warning',
    title: 'Toast Title',
    subtitle: 'Subtitle goes here. More info is provided',
    onDismiss: () => {},
  },
};

/** Error — failed action. */
export const Error: Story = {
  args: {
    type: 'error',
    title: 'Toast Title',
    subtitle: 'Subtitle goes here. More info is provided',
    onDismiss: () => {},
  },
};

/** With a trailing CTA button. */
export const WithCTA: Story = {
  args: {
    type: 'success',
    title: 'Toast Title',
    subtitle: 'Subtitle goes here. More info is provided',
    showCTA: true,
    onDismiss: () => {},
    children: (
      <Button variant="secondary" size="small">
        Dispatch
      </Button>
    ),
  },
};

/** All three types stacked. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Toast type="success" title="Toast Title" subtitle="Subtitle goes here. More info is provided" onDismiss={() => {}} />
      <Toast type="warning" title="Toast Title" subtitle="Subtitle goes here. More info is provided" onDismiss={() => {}} />
      <Toast type="error" title="Toast Title" subtitle="Subtitle goes here. More info is provided" onDismiss={() => {}} />
    </div>
  ),
};
