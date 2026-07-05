import type { Meta, StoryObj } from '@storybook/react-vite';
import { GroupedInput } from './GroupedInput.js';

/**
 * Grouped Input (`5146:845211`) — lays out several data-entry fields together as one
 * unit. Three layouts: Multi-Field (a row of fields + a trailing element), Range
 * Input (two fields joined by a → arrow), and Time Input Stepper (an editable label
 * over Hours / Minutes / Seconds steppers).
 */
const meta: Meta<typeof GroupedInput> = {
  title: 'Molecules/Form Controls/Grouped Input',
  component: GroupedInput,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 860 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof GroupedInput>;

/** Multi-Field — a row of input fields ending in a trailing dropdown element. */
export const MultiField: Story = { args: { variant: 'multi-field' } };

/** Range Input — two fields joined by a → arrow (from → to). */
export const RangeInput: Story = {
  args: { variant: 'range-input' },
  decorators: [(Story) => <div style={{ width: 500 }}><Story /></div>],
};

/** Time Input Stepper — editable label over Hours / Minutes / Seconds steppers. */
export const TimeInputStepper: Story = {
  args: { variant: 'time-input-stepper' },
  decorators: [(Story) => <div style={{ width: 600 }}><Story /></div>],
};
