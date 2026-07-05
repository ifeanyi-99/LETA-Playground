import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Badge } from './Badge.js';

const meta: Meta = {
  title: 'Atoms/Badge/Delivery Badges',
  parameters: {
    docs: {
      description: {
        component:
          'Pre-configured Badge instances for delivery management (Figma `68:36703`). ' +
          '19 delivery status presets — each maps a semantic Badge color + label + optional icon ' +
          'to a specific delivery or driver state. No new component; uses `<Badge />` directly.',
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
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span
      className="text-label-s-regular"
      style={{ color: 'var(--text-default-helper)', minWidth: 160 }}
    >
      {label}
    </span>
    {children}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <h3 className="text-label-l-semibold" style={{ margin: 0 }}>
      {title}
    </h3>
    {children}
  </section>
);

/* ============================================================================
 * All 19 statuses in one view
 * ========================================================================== */

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Delivery Badges · Figma <code>68:36703</code>
      </h2>
      <p className="text-label-s-regular" style={{ color: 'var(--text-default-helper)', margin: 0 }}>
        19 pre-configured delivery status presets using the base Badge component.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        <Row label="Scheduled"><Badge color="primary" label="Scheduled" /></Row>
        <Row label="Pending"><Badge color="caution" label="Pending" /></Row>
        <Row label="Ready for Pickup"><Badge color="caution" label="Pending" leadingIcon="Check-Circle" /></Row>
        <Row label="Assigned"><Badge color="highlight" label="Assigned" /></Row>
        <Row label="Broadcasted"><Badge color="secondary" label="Broadcasted" /></Row>
        <Row label="Auto-Broadcast"><Badge color="secondary" label="Auto-Broadcast" leadingIcon="Broadcast" /></Row>
        <Row label="At Depot"><Badge color="information" label="At Depot" /></Row>
        <Row label="In Transit"><Badge color="highlight" label="In Transit" /></Row>
        <Row label="Returning"><Badge color="highlight" label="Returning" leadingIcon="Return" /></Row>
        <Row label="Delivered"><Badge color="success" label="Delivered" /></Row>
        <Row label="Online"><Badge color="success" label="Online" /></Row>
        <Row label="Offline"><Badge color="primary" label="Offline" /></Row>
        <Row label="Deactivated"><Badge color="warning" label="Suspended" /></Row>
        <Row label="Returned"><Badge color="warning" label="Returned" /></Row>
        <Row label="Cancelled"><Badge color="error" label="Cancelled" /></Row>
        <Row label="Failed"><Badge color="error" label="Failed" /></Row>
        <Row label="Busy"><Badge color="caution" label="Busy" /></Row>
        <Row label="Arrived"><Badge color="notice" label="Arrived" /></Row>
        <Row label="Custom"><Badge color="neutral" label="Custom" /></Row>
      </div>
    </div>
  ),
};

/* ============================================================================
 * Grouped by domain context
 * ========================================================================== */

export const OrderStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Order Statuses
      </h2>

      <Section title="Pre-dispatch">
        <Row label="Scheduled"><Badge color="primary" label="Scheduled" /></Row>
        <Row label="Pending"><Badge color="caution" label="Pending" /></Row>
        <Row label="Ready for Pickup"><Badge color="caution" label="Pending" leadingIcon="Check-Circle" /></Row>
        <Row label="Assigned"><Badge color="highlight" label="Assigned" /></Row>
        <Row label="Broadcasted"><Badge color="secondary" label="Broadcasted" /></Row>
        <Row label="Auto-Broadcast"><Badge color="secondary" label="Auto-Broadcast" leadingIcon="Broadcast" /></Row>
      </Section>

      <Section title="Active">
        <Row label="At Depot"><Badge color="information" label="At Depot" /></Row>
        <Row label="In Transit"><Badge color="highlight" label="In Transit" /></Row>
        <Row label="Returning"><Badge color="highlight" label="Returning" leadingIcon="Return" /></Row>
        <Row label="Arrived"><Badge color="notice" label="Arrived" /></Row>
      </Section>

      <Section title="Terminal">
        <Row label="Delivered"><Badge color="success" label="Delivered" /></Row>
        <Row label="Returned"><Badge color="warning" label="Returned" /></Row>
        <Row label="Cancelled"><Badge color="error" label="Cancelled" /></Row>
        <Row label="Failed"><Badge color="error" label="Failed" /></Row>
      </Section>
    </div>
  ),
};

export const DriverStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Driver Statuses
      </h2>

      <Section title="Availability">
        <Row label="Online"><Badge color="success" label="Online" /></Row>
        <Row label="Offline"><Badge color="primary" label="Offline" /></Row>
        <Row label="Busy"><Badge color="caution" label="Busy" /></Row>
        <Row label="Deactivated"><Badge color="warning" label="Suspended" /></Row>
      </Section>

      <Section title="Other">
        <Row label="Custom"><Badge color="neutral" label="Custom" /></Row>
      </Section>
    </div>
  ),
};
