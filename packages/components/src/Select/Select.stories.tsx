import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select.js';

const meta: Meta<typeof Select> = {
  title: 'Molecules/Form Controls/Select',
  component: Select,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A select trigger — a read-only field box with a trailing chevron that opens a ' +
          'menu/overlay (owned by the consumer). The `Select` type of Data Entry `38:42` ' +
          '(Variant=Basic). States (Idle/Active/Focus/Error/Disabled) are runtime, driven by ' +
          'focus + `error`/`disabled`. Clicking the field fires `onSelectClick`.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Select>;

/** Idle — placeholder + chevron. */
export const Default: Story = {
  args: { label: 'Label Text', placeholder: 'Field Text', helperText: 'Helper text goes here', onSelectClick: () => {} },
};

/** Filled — a value selected. */
export const Filled: Story = {
  args: { label: 'Label Text', defaultValue: 'Selected option', helperText: 'Helper text goes here', onSelectClick: () => {} },
};

/** Warning — warning icon + message, border unchanged. */
export const Warning: Story = {
  args: { label: 'Label Text', defaultValue: 'Selected option', warning: 'Please ensure condition has been fulfilled', onSelectClick: () => {} },
};

/** Error. */
export const Error: Story = {
  args: { label: 'Label Text', defaultValue: 'Selected option', error: 'Enter a valid character/value', onSelectClick: () => {} },
};

/** Disabled. */
export const Disabled: Story = {
  args: { label: 'Label Text', placeholder: 'Field Text', disabled: true, helperText: 'Helper text goes here' },
};

/** All states. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 350 }}>
      <Select label="Idle" placeholder="Field Text" helperText="Helper text goes here" onSelectClick={() => {}} />
      <Select label="Filled" defaultValue="Selected option" helperText="Helper text goes here" onSelectClick={() => {}} />
      <Select label="Warning" defaultValue="Selected option" warning="Please ensure condition has been fulfilled" onSelectClick={() => {}} />
      <Select label="Error" defaultValue="Selected option" error="Enter a valid character/value" onSelectClick={() => {}} />
      <Select label="Disabled" placeholder="Field Text" disabled helperText="Helper text goes here" />
    </div>
  ),
};
