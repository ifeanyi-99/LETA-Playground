import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from './TextArea.js';

const meta: Meta<typeof TextArea> = {
  title: 'Molecules/Form Controls/Text Area',
  component: TextArea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A multi-line text-entry field (the Text Area type of Data Entry `38:42`). ' +
          'Label + a 120px multi-line field with an in-field character counter + helper/message. ' +
          'States (Idle/Active/Focus/Warning/Error/Disabled) are runtime. `variant="rich"` adds a ' +
          'formatting-toolbar footer (Bold / Italic / Underline + Attach / Send).',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof TextArea>;

/** Basic — empty (placeholder). */
export const Basic: Story = {
  args: { label: 'Label Text', helperText: 'Helper text goes here', maxLength: 100 },
};

/** Filled. */
export const Filled: Story = {
  args: { label: 'Label Text', defaultValue: 'Some descriptive text here would be very nice to see', maxLength: 100, helperText: 'Helper text goes here' },
};

/** Error. */
export const Error: Story = {
  args: { label: 'Label Text', defaultValue: 'Some descriptive text', maxLength: 100, error: 'Enter a valid character/value' },
};

/** Disabled. */
export const Disabled: Story = {
  args: { label: 'Label Text', disabled: true, maxLength: 100, helperText: 'Helper text goes here' },
};

/** Rich — with a formatting-toolbar footer (Bold / Italic / Underline + Attach / Send). */
export const Rich: Story = {
  args: {
    variant: 'rich',
    label: 'Label Text',
    defaultValue: 'Some descriptive text here would be very nice to see',
    showCounter: false,
    showHelper: false,
  },
};

/** All states. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 350 }}>
      <TextArea label="Idle" maxLength={100} helperText="Helper text goes here" />
      <TextArea label="Filled" defaultValue="Some descriptive text here would be very nice to see" maxLength={100} helperText="Helper text goes here" />
      <TextArea label="Warning" defaultValue="Some text" maxLength={100} warning="Please ensure condition has been fulfilled" />
      <TextArea label="Error" defaultValue="Some text" maxLength={100} error="Enter a valid character/value" />
      <TextArea label="Disabled" disabled maxLength={100} helperText="Helper text goes here" />
    </div>
  ),
};
