import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { MobileBadge, type MobileBadgeColor } from './MobileBadge.js';

const meta: Meta<typeof MobileBadge> = {
  title: 'Atoms/MobileBadge',
  component: MobileBadge,
  parameters: {
    docs: {
      description: {
        component:
          'Mobile Badge (Figma `3100:17588`). Compact pill-shaped status indicator. ' +
          '8 colour variants × 3 icon-position types (No Icon / Leading Icon / Trailing Icon). ' +
          'Typography: Caption/L/SemiBold. Asymmetric padding compresses the icon side.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    color: {
      control: 'select',
      options: ['blue', 'green', 'red', 'orange', 'yellow', 'purple', 'grey', 'coral-red'] satisfies MobileBadgeColor[],
    },
    leadingIcon: { control: 'text' },
    trailingIcon: { control: 'text' },
  },
  args: {
    label: 'Text',
    color: 'grey',
  },
};

export default meta;
type Story = StoryObj<typeof MobileBadge>;

/* ------------------------------------------------------------------ */
/*  Default — editable via Storybook controls                         */
/* ------------------------------------------------------------------ */

export const Default: Story = {};

/* ------------------------------------------------------------------ */
/*  Single-variant stories — one per Figma variant property            */
/* ------------------------------------------------------------------ */

export const WithLeadingIcon: Story = {
  args: { label: 'Text', color: 'grey', leadingIcon: 'Orders' },
};

export const WithTrailingIcon: Story = {
  args: { label: 'Text', color: 'grey', trailingIcon: 'Orders' },
};

/* Mirrors Figma `Variant=Progress Badge` (grey palette + ProgressTracker leading indicator). */
export const Progress: Story = {
  args: { label: '10% complete', color: 'grey', variant: 'progress', progressValue: 10 },
};

/* ------------------------------------------------------------------ */
/*  Catalog — full 8 colours × 3 types matrix (24 variants)            */
/* ------------------------------------------------------------------ */

const COLORS: MobileBadgeColor[] = [
  'grey',
  'blue',
  'green',
  'red',
  'orange',
  'yellow',
  'purple',
  'coral-red',
];

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Full variant matrix · Figma <code>3100:17588</code>
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px repeat(3, auto)',
          gap: '12px 24px',
          alignItems: 'center',
        }}
      >
        {/* Header row */}
        <span />
        <span className="text-label-m-semibold">No Icon</span>
        <span className="text-label-m-semibold">Leading Icon</span>
        <span className="text-label-m-semibold">Trailing Icon</span>

        {COLORS.map((c) => (
          <React.Fragment key={c}>
            <span
              className="text-label-s-regular"
              style={{ color: 'var(--text-default-helper)' }}
            >
              {c}
            </span>
            <MobileBadge label="Text" color={c} style={{ justifySelf: 'start' }} />
            <MobileBadge
              label="Text"
              color={c}
              leadingIcon="Orders"
              style={{ justifySelf: 'start' }}
            />
            <MobileBadge
              label="Text"
              color={c}
              trailingIcon="Orders"
              style={{ justifySelf: 'start' }}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Progress Badge variant (always grey palette per Figma) */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span
          className="text-label-m-semibold"
          style={{ color: 'var(--text-default-heading)' }}
        >
          Progress Badge
        </span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <MobileBadge label="10% complete" color="grey" variant="progress" progressValue={10} />
          <MobileBadge label="50% complete" color="grey" variant="progress" progressValue={50} />
          <MobileBadge label="75% complete" color="grey" variant="progress" progressValue={75} />
          <MobileBadge label="100% complete" color="grey" variant="progress" progressValue={100} />
        </div>
      </div>
    </div>
  ),
};
