import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfigurationCard, ConfigurationCardRow } from './ConfigurationCard.js';
import { Button } from '../Button/Button.js';

const meta: Meta<typeof ConfigurationCard> = {
  title: 'Molecules/Cards/Configuration Card',
  component: ConfigurationCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A toggle-able configuration section. The header (title + description + Toggle) is ' +
          'always shown; when enabled, the body rows and footer actions are revealed.' +
          '\n\n' +
          'Figma `9617:18100`. 2 states (Enabled / Disabled). Ships with the ' +
          '`ConfigurationCardRow` sub-component for the white body rows.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 720 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ConfigurationCard>;

const SampleRows = () => (
  <>
    <ConfigurationCardRow
      title="Text"
      description="Enter description here"
      trailing={<Button variant="secondary">Dispatch</Button>}
    />
    <ConfigurationCardRow
      title="Text"
      description="Enter description here"
      trailing={<Button variant="secondary">Dispatch</Button>}
    />
  </>
);

/** Enabled — header toggle on, body rows + footer shown. */
export const Enabled: Story = {
  render: () => {
    const [enabled, setEnabled] = React.useState(true);
    return (
      <ConfigurationCard
        title="Text"
        description="Enter description here"
        enabled={enabled}
        onToggle={setEnabled}
        footerMessage="Validation goes here. Keep it short"
        cancelLabel="Action"
        submitLabel="Action"
      >
        <SampleRows />
      </ConfigurationCard>
    );
  },
};

/** Disabled — collapsed to just the header with the toggle off. */
export const Disabled: Story = {
  render: () => {
    const [enabled, setEnabled] = React.useState(false);
    return (
      <ConfigurationCard
        title="Text"
        description="Enter description here"
        enabled={enabled}
        onToggle={setEnabled}
      >
        <SampleRows />
      </ConfigurationCard>
    );
  },
};

/** Both states side by side. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 720 }}>
      <ConfigurationCard
        title="Text"
        description="Enter description here"
        enabled
        footerMessage="Validation goes here. Keep it short"
        cancelLabel="Action"
        submitLabel="Action"
      >
        <SampleRows />
      </ConfigurationCard>
      <ConfigurationCard title="Text" description="Enter description here" enabled={false}>
        <SampleRows />
      </ConfigurationCard>
    </div>
  ),
};
