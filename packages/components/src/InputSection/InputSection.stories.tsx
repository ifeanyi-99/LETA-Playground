import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputSection, InputGroup } from './InputSection.js';

/**
 * Input Section (`10557:36087`) — a titled, **collapsible**, multi-group form organism.
 * A section header (title + description + collapse chevron) sits above the "Forms" slot:
 * a vertical stack of Input Groups, each a `group-header` Content Primitive over a
 * 2-column grid of `InputField`s, separated by dashed demarcators.
 *
 * Two Figma variants — **Open** (header + Forms, `Chevron-Up`) and **Close**
 * (header only, `Chevron-Down`); the chevron toggles between them. The form body
 * is the Figma "Forms" SLOT, exposed as `children` (default = two groups).
 */
const meta: Meta<typeof InputSection> = {
  title: 'Organisms/Forms/Input Section',
  component: InputSection,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof InputSection>;

/** Open — the canonical Input Section: two groups of fields, dashed demarcator (chevron-up). */
export const Default: Story = {};

/** Close — collapsed to the section header only (chevron-down). Click the chevron to expand. */
export const Closed: Story = {
  args: { defaultOpen: false },
};

/** `showChevron={false}` — drops the trailing collapse chevron from the section header. */
export const WithoutChevron: Story = {
  args: { showChevron: false },
};

/** The exported `<InputGroup>` rendered standalone — a group-header over a 2-column field grid. */
export const SingleGroup: StoryObj<typeof InputGroup> = {
  render: () => <InputGroup />,
};
