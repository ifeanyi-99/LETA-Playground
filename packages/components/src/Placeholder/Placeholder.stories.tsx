import type { Meta, StoryObj } from '@storybook/react-vite';
import { Placeholder } from './Placeholder.js';

const meta: Meta<typeof Placeholder> = {
  title: 'Molecules/Placeholder',
  component: Placeholder,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A temporary visual stand-in for a not-yet-built component (dashed neutral box + muted label). ' +
          'Used inside the Map search results panel in place of the Desktop Menu Options list until that ' +
          'component is built.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Placeholder>;

export const Default: Story = { args: { label: 'Placeholder' } };
export const Labeled: Story = { args: { label: 'Desktop Menu Options' } };
