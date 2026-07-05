import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Badge, type BadgeColor } from './Badge.js';

const ALL_COLORS: BadgeColor[] = [
  'caution',
  'warning',
  'error',
  'information',
  'success',
  'notice',
  'primary',
  'primary-alt',
  'neutral',
  'highlight',
  'secondary',
];

const FIGMA_LABEL: Record<BadgeColor, string> = {
  caution:       'Caution · Yellow',
  warning:       'Warning · Orange',
  error:         'Error · Fire Red',
  information:   'Information · Sky Blue',
  success:       'Success · Green',
  notice:        'Notice · Teal',
  primary:       'Primary · Coral Red',
  'primary-alt': 'Primary Alt · Coral Red (Alt)',
  neutral:       'Neutral · Grey',
  highlight:     'Highlight · Purple',
  secondary:     'Secondary · Yankees Blue',
};

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          'Desktop Badge variants per Figma node `68:36623`. ' +
          '33 variants across Type (No Icon / Leading Icon / Trailing Icon) × ' +
          'Color (11 semantic values). Purely presentational — no interactive states.',
      },
    },
  },
  argTypes: {
    color: { control: 'select', options: ALL_COLORS },
    label: { control: 'text' },
    leadingIcon: { control: 'text' },
    trailingIcon: { control: 'text' },
  },
  args: {
    label: 'Label',
    color: 'neutral',
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

/* ============================================================================
 * Per-color stories — Type = No Icon
 * ========================================================================== */

export const Caution: Story = {
  args: { color: 'caution', label: 'Caution' },
};

export const Warning: Story = {
  args: { color: 'warning', label: 'Warning' },
};

export const Error: Story = {
  args: { color: 'error', label: 'Error' },
};

export const Information: Story = {
  args: { color: 'information', label: 'Information' },
};

export const Success: Story = {
  args: { color: 'success', label: 'Success' },
};

export const Notice: Story = {
  args: { color: 'notice', label: 'Notice' },
};

export const Primary: Story = {
  args: { color: 'primary', label: 'Primary' },
};

export const PrimaryAlt: Story = {
  name: 'Primary Alt (Coral Red Alt)',
  args: { color: 'primary-alt', label: 'Primary Alt' },
};

export const Neutral: Story = {
  args: { color: 'neutral', label: 'Neutral' },
};

export const Highlight: Story = {
  args: { color: 'highlight', label: 'Highlight' },
};

export const Secondary: Story = {
  args: { color: 'secondary', label: 'Secondary' },
};

/* ============================================================================
 * Icon-position stories — all 10 colors
 * ========================================================================== */

export const WithLeadingIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {ALL_COLORS.map((c) => (
        <Badge key={c} color={c} label={FIGMA_LABEL[c]} leadingIcon="Star" />
      ))}
    </div>
  ),
};

export const WithTrailingIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {ALL_COLORS.map((c) => (
        <Badge key={c} color={c} label={FIGMA_LABEL[c]} trailingIcon="Star" />
      ))}
    </div>
  ),
};

/* ============================================================================
 * Catalog — full 10 × 3 matrix (Figma `68:36623`)
 * ========================================================================== */

export const Catalog: Story = {
  render: () => {
    const types: { key: string; label: string; iconProps: { leadingIcon?: 'Star'; trailingIcon?: 'Star' } }[] = [
      { key: 'no-icon',       label: 'No Icon',       iconProps: {} },
      { key: 'leading-icon',  label: 'Leading Icon',  iconProps: { leadingIcon: 'Star' } },
      { key: 'trailing-icon', label: 'Trailing Icon', iconProps: { trailingIcon: 'Star' } },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
          Full variant matrix · Figma <code>68:36623</code>
        </h2>

        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px repeat(3, 1fr)', gap: 12 }}>
          <span />
          {types.map((t) => (
            <span key={t.key} className="text-label-m-semibold">
              {t.label}
            </span>
          ))}
        </div>

        {/* Rows */}
        {ALL_COLORS.map((c) => (
          <div
            key={c}
            style={{ display: 'grid', gridTemplateColumns: '220px repeat(3, 1fr)', gap: 12, alignItems: 'center' }}
          >
            <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
              {FIGMA_LABEL[c]}
            </span>
            {types.map((t) => (
              <Badge key={t.key} color={c} label="Label" {...t.iconProps} style={{ justifySelf: 'start' }} />
            ))}
          </div>
        ))}
      </div>
    );
  },
};
