import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { MapIcon } from './MapIcon.js';

const meta: Meta = {
  title: 'Atoms/MapIcon/Delivery Map Icons',
  parameters: {
    docs: {
      description: {
        component:
          'Pre-configured MapIcon instances for delivery management (Figma `3129:23003`). ' +
          '15 delivery map icon presets — each maps a MapIcon variant + colour + icon ' +
          'to a specific delivery entity/state. No new component; uses `<MapIcon />` directly.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

/* ============================================================================
 * Shared layout helpers
 * ========================================================================== */

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ flexShrink: 0, width: 32, display: 'flex', justifyContent: 'center' }}>
      {children}
    </div>
    <span
      className="text-label-m-semibold"
      style={{ color: 'var(--text-default-label)' }}
    >
      {label}
    </span>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <h3 className="text-label-l-semibold" style={{ margin: 0, color: 'var(--text-default-heading)' }}>
      {title}
    </h3>
    {children}
  </section>
);

/* ============================================================================
 * Colour tokens (primitive colours from the design system)
 * ========================================================================== */

const COLOR = {
  grass:    'var(--primitive-colors-grass-default)',     // #50A20F — available / delivered / active
  yellow:   'var(--primitive-colors-yellow-default)',    // #F9B330 — busy / delayed / caution
  orange:   'var(--primitive-colors-orange-default)',    // #FB8500 — pending
  skyblue:  'var(--primitive-colors-skyblue-default)',   // #0883FF — assigned
  coralRed: 'var(--primitive-colors-coral-red-default)', // #FF3941 — inactive / transmission
  gray:     'var(--colors-neutral-400)',                 // #808080 — offline
} as const;

/* ============================================================================
 * All 15 statuses in one view
 * ========================================================================== */

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Delivery Map Icons &middot; Figma <code>3129:23003</code>
      </h2>
      <p className="text-label-s-regular" style={{ color: 'var(--text-default-helper)', margin: 0 }}>
        15 pre-configured map icon presets using the base MapIcon component.
        Each represents an entity on the LETA delivery map.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 16 }}>
        <Section title="Drivers">
          <Row label="Driver — Available">
            <MapIcon variant="object-pin" icon="Scooter" color={COLOR.grass} />
          </Row>
          <Row label="Driver — Busy">
            <MapIcon variant="object-pin" icon="Scooter" color={COLOR.yellow} />
          </Row>
          <Row label="Driver — Offline">
            <MapIcon variant="object-pin" icon="Scooter" color={COLOR.gray} />
          </Row>
        </Section>

        <Section title="Users">
          <Row label="User — Delivered">
            <MapIcon variant="object-pin" icon="User" color={COLOR.grass} />
          </Row>
          <Row label="User — Pending">
            <MapIcon variant="object-pin" icon="User" color={COLOR.orange} />
          </Row>
          <Row label="User — Delayed">
            <MapIcon variant="object-pin" icon="User" color={COLOR.yellow} />
          </Row>
        </Section>

        <Section title="Orders">
          <Row label="Order — Assigned">
            <MapIcon variant="object-pin" icon="Orders" color={COLOR.skyblue} />
          </Row>
          <Row label="Order — Pending">
            <MapIcon variant="object-pin" icon="Orders" color={COLOR.orange} />
          </Row>
          <Row label="Order — Delivered">
            <MapIcon variant="object-pin" icon="Orders" color={COLOR.grass} />
          </Row>
        </Section>

        <Section title="Shops">
          <Row label="Shop — Active">
            <MapIcon variant="object-pin" icon="Depot" color={COLOR.grass} />
          </Row>
          <Row label="Shop — Inactive">
            <MapIcon variant="object-pin" icon="Depot" color={COLOR.coralRed} />
          </Row>
        </Section>

        <Section title="Many Orders (Cluster)">
          <Row label="Many Orders — Assigned">
            <MapIcon variant="badge" text="5" color={COLOR.skyblue} />
          </Row>
          <Row label="Many Orders — Pending">
            <MapIcon variant="badge" text="5" color={COLOR.orange} />
          </Row>
          <Row label="Many Orders — Delivered">
            <MapIcon variant="badge" text="5" color={COLOR.grass} />
          </Row>
        </Section>

        <Section title="Events">
          <Row label="Event — Transmission">
            <MapIcon variant="event-pin" color={COLOR.coralRed} />
          </Row>
        </Section>
      </div>
    </div>
  ),
};

/* ============================================================================
 * Grid overview — all 15 icons at a glance
 * ========================================================================== */

export const GridOverview: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        All Delivery Map Icons
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, auto)',
          gap: 24,
          alignItems: 'end',
        }}
      >
        {/* Row 1: Object Pins */}
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="object-pin" icon="Scooter" color={COLOR.grass} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Available</div>
        </div>
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="object-pin" icon="Scooter" color={COLOR.yellow} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Busy</div>
        </div>
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="object-pin" icon="Scooter" color={COLOR.gray} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Offline</div>
        </div>
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="object-pin" icon="User" color={COLOR.grass} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Delivered</div>
        </div>
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="object-pin" icon="User" color={COLOR.orange} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Pending</div>
        </div>
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="object-pin" icon="User" color={COLOR.yellow} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Delayed</div>
        </div>
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="object-pin" icon="Depot" color={COLOR.coralRed} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Inactive</div>
        </div>
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="object-pin" icon="Depot" color={COLOR.grass} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Active</div>
        </div>

        {/* Row 2: Remaining Object Pins + Badges + Event */}
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="object-pin" icon="Orders" color={COLOR.skyblue} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Assigned</div>
        </div>
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="object-pin" icon="Orders" color={COLOR.orange} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Pending</div>
        </div>
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="object-pin" icon="Orders" color={COLOR.grass} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Delivered</div>
        </div>
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="badge" text="5" color={COLOR.skyblue} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Assigned</div>
        </div>
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="badge" text="5" color={COLOR.orange} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Pending</div>
        </div>
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="badge" text="5" color={COLOR.grass} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Delivered</div>
        </div>
        <div style={{ textAlign: 'center', justifySelf: 'start' }}>
          <MapIcon variant="event-pin" color={COLOR.coralRed} />
          <div className="text-body-s-medium" style={{ color: 'var(--text-default-sub-body)', marginTop: 4, fontSize: 9 }}>Transmission</div>
        </div>
      </div>
    </div>
  ),
};
