import type { Meta, StoryObj } from '@storybook/react-vite';
import { CarouselPagination } from './CarouselPagination.js';

const meta: Meta<typeof CarouselPagination> = {
  title: 'Atoms/CarouselPagination',
  component: CarouselPagination,
  parameters: {
    docs: {
      description: {
        component:
          'Carousel Pagination (Figma `8667:15335`). Horizontal row of indicators ' +
          'showing the current page in a carousel. Active indicator: 20×6 red pill. ' +
          'Inactive indicators: 6×6 gray circles. 8px gap. Generalised to support any ' +
          'page count — Figma defines 3 variants for the 3-page case.',
      },
    },
  },
  argTypes: {
    total: { control: { type: 'number', min: 1, max: 10, step: 1 } },
    current: { control: { type: 'number', min: 1, max: 10, step: 1 } },
  },
  args: {
    total: 3,
    current: 1,
  },
};

export default meta;
type Story = StoryObj<typeof CarouselPagination>;

/* Interactive default — edit `total` and `current` in Storybook controls. */
export const Default: Story = {};

/* All 3 Figma variants stacked. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Full variant matrix · Figma <code>8667:15335</code>
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px auto',
          gap: '16px 24px',
          alignItems: 'center',
        }}
      >
        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
          Page 1
        </span>
        <CarouselPagination total={3} current={1} style={{ justifySelf: 'start' }} />

        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
          Page 2
        </span>
        <CarouselPagination total={3} current={2} style={{ justifySelf: 'start' }} />

        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
          Page 3
        </span>
        <CarouselPagination total={3} current={3} style={{ justifySelf: 'start' }} />
      </div>
    </div>
  ),
};
