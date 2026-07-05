import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapIcon } from './MapIcon.js';

const meta: Meta<typeof MapIcon> = {
  title: 'Atoms/MapIcon',
  component: MapIcon,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof MapIcon>;

/* ------------------------------------------------------------------ */
/*  Individual variant stories — one per Figma variant                */
/* ------------------------------------------------------------------ */

export const ObjectPin: Story = {
  name: 'Object Pin',
  args: {
    variant: 'object-pin',
    icon: 'User',
  },
};

export const NumericPin: Story = {
  name: 'Numeric Pin',
  args: {
    variant: 'numeric-pin',
    text: '5',
  },
};

export const Badge: Story = {
  name: 'Badge',
  args: {
    variant: 'badge',
    text: '5',
  },
};

export const BadgeWithIcon: Story = {
  name: 'Badge (Icon)',
  args: {
    variant: 'badge',
    icon: 'User',
  },
};

export const EventPin: Story = {
  name: 'Event Pin',
  args: {
    variant: 'event-pin',
  },
};

export const BikeDelivery: Story = {
  name: 'Bike Delivery',
  args: {
    variant: 'bike-delivery',
  },
};

/* ------------------------------------------------------------------ */
/*  Catalog — full matrix                                             */
/* ------------------------------------------------------------------ */

export const Catalog: Story = {
  name: 'Catalog',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <div
          className="text-label-m-semibold"
          style={{ color: 'var(--text-default-heading)', marginBottom: 12 }}
        >
          Object Pin
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'end' }}>
          <MapIcon variant="object-pin" icon="User" />
          <MapIcon variant="object-pin" icon="Scooter" color="var(--primitive-colors-grass-default)" />
          <MapIcon variant="object-pin" icon="Scooter" color="var(--primitive-colors-yellow-default)" />
          <MapIcon variant="object-pin" icon="Orders" color="var(--primitive-colors-skyblue-default)" />
          <MapIcon variant="object-pin" icon="Depot" color="var(--primitive-colors-coral-red-default)" />
        </div>
      </div>

      <div>
        <div
          className="text-label-m-semibold"
          style={{ color: 'var(--text-default-heading)', marginBottom: 12 }}
        >
          Numeric Pin
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'end' }}>
          <MapIcon variant="numeric-pin" text="1" />
          <MapIcon variant="numeric-pin" text="3" color="var(--primitive-colors-skyblue-default)" />
          <MapIcon variant="numeric-pin" text="7" color="var(--primitive-colors-orange-default)" />
          <MapIcon variant="numeric-pin" text="9" color="var(--primitive-colors-grass-default)" />
        </div>
      </div>

      <div>
        <div
          className="text-label-m-semibold"
          style={{ color: 'var(--text-default-heading)', marginBottom: 12 }}
        >
          Badge
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'end' }}>
          <MapIcon variant="badge" text="5" />
          <MapIcon variant="badge" text="5" color="var(--primitive-colors-skyblue-default)" />
          <MapIcon variant="badge" text="5" color="var(--primitive-colors-grass-default)" />
          <MapIcon variant="badge" icon="User" color="var(--primitive-colors-orange-default)" />
        </div>
      </div>

      <div>
        <div
          className="text-label-m-semibold"
          style={{ color: 'var(--text-default-heading)', marginBottom: 12 }}
        >
          Event Pin
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'end' }}>
          <MapIcon variant="event-pin" />
          <MapIcon variant="event-pin" color="var(--primitive-colors-coral-red-default)" />
        </div>
      </div>

      <div>
        <div
          className="text-label-m-semibold"
          style={{ color: 'var(--text-default-heading)', marginBottom: 12 }}
        >
          Bike Delivery
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'end' }}>
          <MapIcon variant="bike-delivery" />
        </div>
      </div>
    </div>
  ),
};
