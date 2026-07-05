import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileFileUpload } from './MobileFileUpload.js';

// Realistic deterministic sample photos (picsum.photos seeded — render real images online).
const IMAGES = [
  { src: 'https://picsum.photos/seed/leta-doc/222/208', alt: 'Uploaded document' },
  { src: 'https://picsum.photos/seed/leta-food/222/208', alt: 'Uploaded food photo' },
  { src: 'https://picsum.photos/seed/leta-goods/222/208', alt: 'Uploaded product photo' },
];

const meta: Meta<typeof MobileFileUpload> = {
  title: 'Molecules/Form Controls/Mobile File Upload',
  component: MobileFileUpload,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Mobile file upload (the `File Upload` type of Data Entry `38:42`, Mobile variant). ' +
          'A 3-up grid of 111×104 tiles: "Add Photo" placeholders (filled `Image-Upload` icon + label on ' +
          '`--surface-neutral-input-field` with a **dashed** border) and uploaded image thumbnails with a ' +
          'red `Delete` badge. The desktop drag-and-drop zone is the separate `FileUpload` component.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof MobileFileUpload>;

/** Empty State — three "Add Photo" tiles. */
export const EmptyState: Story = {
  args: { label: 'Attach an image', tag: 'optional', onAdd: () => {} },
};

/** Uploaded — uploaded image thumbnails with delete badges. */
export const Uploaded: Story = {
  args: { label: 'Attach an image', tag: 'optional', images: IMAGES, onRemove: () => {} },
};

/** Both states. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 350 }}>
      <MobileFileUpload label="Empty State" onAdd={() => {}} />
      <MobileFileUpload label="Uploaded" images={IMAGES} onRemove={() => {}} />
    </div>
  ),
};
