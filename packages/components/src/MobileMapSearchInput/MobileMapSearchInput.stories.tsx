import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileMapSearchInput } from './MobileMapSearchInput.js';

const meta: Meta<typeof MobileMapSearchInput> = {
  title: 'Molecules/Form Controls/Map Search Input/Mobile',
  component: MobileMapSearchInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Mobile-map search (the `Search Input` type of Data Entry `38:42`, Mobile Map variant): a pill ' +
          '`--surface-neutral-alt-search-field` field with an attached `MobileDropdown` results panel of ' +
          '`MobileMenuOptions` rows. A trailing clear (×) shows whenever the panel is open (and as soon as ' +
          'the closed field has text). Desktop is `Map Search Input/Desktop`.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof MobileMapSearchInput>;

/** Open with results (`open={false}` collapses to the field only). */
export const Default: Story = { args: { open: true, defaultValue: 'Nairobi', onClear: () => {} } };
