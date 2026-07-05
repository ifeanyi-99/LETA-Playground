import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileSearchInput } from './MobileSearchInput.js';

const meta: Meta<typeof MobileSearchInput> = {
  title: 'Molecules/Form Controls/Search Input/Mobile',
  component: MobileSearchInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Mobile search field (the `Search Input` type of Data Entry `38:42`, Mobile variant): ' +
          'a pill `--rounding-round` field on `--surface-neutral-input-field`. Leading Search icon + ' +
          'input; a trailing clear (×) appears as soon as you type and clears the field on click. ' +
          'Desktop is `Search Input/Desktop`.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof MobileSearchInput>;

/** Type to reveal the clear (×) button. */
export const Default: Story = { args: { placeholder: 'Search here...' } };
