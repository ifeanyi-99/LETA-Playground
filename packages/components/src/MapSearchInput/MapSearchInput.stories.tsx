import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapSearchInput } from './MapSearchInput.js';

const meta: Meta<typeof MapSearchInput> = {
  title: 'Molecules/Form Controls/Map Search Input/Desktop',
  component: MapSearchInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Web-map search (the `Search Input` type of Data Entry `38:42`, Web Map variant): a 480px ' +
          '`--surface-neutral-alt-search-field` field with an attached results dropdown. The `state` prop ' +
          'drives the panel — Idle / No History / Active History / Empty Results / Active Results — and the ' +
          'list slots default to `DesktopMenuOptions` rows. A trailing clear (×) shows whenever the panel ' +
          'is open (and as soon as the closed field has text). Mobile is `Map Search Input/Mobile`.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 520 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof MapSearchInput>;

/** Active Results — field + filter chips + "Results (N)" + results list (the `state` prop switches panels). */
export const Default: Story = { args: { state: 'active-results', defaultValue: 'Nairobi', onClear: () => {}, resultsCount: 5 } };
