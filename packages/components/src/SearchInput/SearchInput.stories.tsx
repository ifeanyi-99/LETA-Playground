import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchInput } from './SearchInput.js';

const meta: Meta<typeof SearchInput> = {
  title: 'Molecules/Form Controls/Search Input/Desktop',
  component: SearchInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Desktop search field (the `Search Input` type of Data Entry `38:42`, Desktop variant). ' +
          '`--rounding-lg` field on `--surface-neutral-search-field`; leading Search icon + input; ' +
          'focus → component-focus border. A trailing clear (×) appears as soon as you type and clears ' +
          'the field on click (the Mobile variant is `Search Input/Mobile`).',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof SearchInput>;

/** Type to reveal the clear (×) button. */
export const Default: Story = { args: { placeholder: 'Search here...' } };

/** Error state (Figma Desktop/Error) — error-colored border + an error message row below. */
export const Error: Story = {
  args: { defaultValue: 'Invalid value', error: true, errorMessage: 'Enter a valid character/value' },
};
