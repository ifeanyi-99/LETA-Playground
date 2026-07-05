import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputField } from './InputField.js';
import { LeadingInputFieldElement } from '../LeadingInputFieldElement/LeadingInputFieldElement.js';
import { TrailingInputFieldElement } from '../TrailingInputFieldElement/TrailingInputFieldElement.js';

const meta: Meta<typeof InputField> = {
  title: 'Molecules/Form Controls/Input Field',
  component: InputField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A labelled text-entry field — the core form input. The `Input Field` type of ' +
          'Data Entry `38:42`. Variants: Basic / Leading Element / Trailing Element. States ' +
          '(Idle/Active/Focus/Warning/Error/Disabled) are runtime, driven by focus + ' +
          '`error`/`warning`/`disabled`. Leading/Trailing compose the element molecules via ' +
          'ReactNode slots. Select / Stepper Input / Search Input / Text Area / File Upload ' +
          'are separate sibling types of Data Entry.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof InputField>;

/** Basic — label + field + helper. */
export const Basic: Story = {
  args: { variant: 'basic', label: 'Label Text', placeholder: 'Field Text', helperText: 'Helper text goes here' },
};

/** Leading Element — a leading selector (country/dial-code) before the field. */
export const Leading: Story = {
  args: {
    variant: 'leading',
    label: 'Label Text',
    placeholder: 'Field Text',
    helperText: 'Helper text goes here',
    leadingElement: <LeadingInputFieldElement variant="multiple" countryCode="KE" dialCode="+254" aria-label="Select country" />,
  },
};

/** Trailing Element — a trailing dropdown/unit selector after the field. */
export const Trailing: Story = {
  args: {
    variant: 'trailing',
    label: 'Label Text',
    placeholder: 'Field Text',
    helperText: 'Helper text goes here',
    trailingElement: <TrailingInputFieldElement variant="dropdown" label="Text" />,
  },
};

/** The runtime states (Idle / Filled / Warning / Error / Disabled). */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 350 }}>
      <InputField label="Idle" placeholder="Field Text" helperText="Helper text goes here" />
      <InputField label="Filled" defaultValue="Field Text" helperText="Helper text goes here" />
      <InputField label="Warning" defaultValue="Field Text" warning="Please ensure condition has been fulfilled" />
      <InputField label="Error" defaultValue="Field Text" error="Enter a valid character/value" />
      <InputField label="Disabled" placeholder="Field Text" disabled helperText="Helper text goes here" />
    </div>
  ),
};

/** With a character counter. */
export const WithCounter: Story = {
  args: {
    variant: 'basic',
    label: 'Label Text',
    defaultValue: 'Field Text',
    showCounter: true,
    maxLength: 100,
    helperText: 'Helper text goes here',
  },
};

/** All three variants together. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 350 }}>
      <InputField variant="basic" label="Basic" placeholder="Field Text" />
      <InputField
        variant="leading"
        label="Leading Element"
        placeholder="Field Text"
        leadingElement={<LeadingInputFieldElement variant="multiple" countryCode="KE" dialCode="+254" aria-label="Select country" />}
      />
      <InputField
        variant="trailing"
        label="Trailing Element"
        placeholder="Field Text"
        trailingElement={<TrailingInputFieldElement variant="dropdown" label="Text" />}
      />
    </div>
  ),
};
