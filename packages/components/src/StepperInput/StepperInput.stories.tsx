import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepperInput } from './StepperInput.js';

const meta: Meta<typeof StepperInput> = {
  title: 'Molecules/Form Controls/Stepper Input',
  component: StepperInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A labelled numeric stepper field — the `Stepper Input` type of Data Entry `38:42` ' +
          '(Variant=Basic): the label + helper chrome of a Data Entry field with a `<Stepper>` ' +
          '(its building block) in place of the text field box. Renders an internal `<Stepper>` ' +
          'with the forwarded props, or accepts a `stepper` slot to inject a configured one.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof StepperInput>;

/** Default — discrete stepper. */
export const Default: Story = {
  args: { label: 'Label Text', helperText: 'Helper text goes here', defaultValue: 0, min: 0, max: 99 },
};

/** Discrete variant (bordered field + hover spinner). */
export const Discrete: Story = {
  args: { label: 'Label Text', helperText: 'Helper text goes here', stepperVariant: 'discrete', defaultValue: 0, min: 0, max: 99 },
};

/** Segmented variant ([−] [count] [+]). */
export const Segmented: Story = {
  args: { label: 'Label Text', helperText: 'Helper text goes here', stepperVariant: 'segmented', defaultValue: 0, min: 0, max: 99 },
};

/** All variants. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 350 }}>
      <StepperInput label="Discrete" stepperVariant="discrete" defaultValue={0} min={0} max={99} />
      <StepperInput label="Segmented" stepperVariant="segmented" defaultValue={0} min={0} max={99} />
    </div>
  ),
};
