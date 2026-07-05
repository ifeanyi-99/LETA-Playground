import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import {
  MobileFeaturedIcon,
  type MobileFeaturedIconColor,
  type MobileFeaturedIconSize,
} from './MobileFeaturedIcon.js';

const meta: Meta<typeof MobileFeaturedIcon> = {
  title: 'Atoms/MobileFeaturedIcon',
  component: MobileFeaturedIcon,
  parameters: {
    docs: {
      description: {
        component:
          'Mobile Featured Icon (Figma `4136:74148`). 6 colours × 2 variants ' +
          '(Basic / Filled) × 3 sizes (Small / Medium / Large) = 36 Figma variants. ' +
          'Basic = icon only. Filled = icon on a tinted circular background.',
      },
    },
  },
  argTypes: {
    icon: { control: 'text' },
    color: {
      control: 'select',
      options: ['information', 'success', 'warning', 'error', 'highlight', 'neutral'] satisfies MobileFeaturedIconColor[],
    },
    variant: { control: 'inline-radio', options: ['basic', 'filled'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
  },
  args: {
    icon: 'Orders',
    color: 'information',
    variant: 'filled',
    size: 'medium',
  },
};

export default meta;
type Story = StoryObj<typeof MobileFeaturedIcon>;

/* ------------------------------------------------------------------ */
/*  Default — interactive controls                                     */
/* ------------------------------------------------------------------ */

export const Default: Story = {};

/* ------------------------------------------------------------------ */
/*  Single-variant stories — Figma `Variant` property                  */
/* ------------------------------------------------------------------ */

export const Basic: Story = {
  args: { icon: 'Orders', color: 'information', variant: 'basic', size: 'medium' },
};

export const Filled: Story = {
  args: { icon: 'Orders', color: 'information', variant: 'filled', size: 'medium' },
};

/* ------------------------------------------------------------------ */
/*  Catalog — 6 colours × 2 variants × 3 sizes matrix (36 cells)       */
/* ------------------------------------------------------------------ */

const COLORS: MobileFeaturedIconColor[] = [
  'neutral',
  'information',
  'success',
  'warning',
  'error',
  'highlight',
];
const SIZES: MobileFeaturedIconSize[] = ['small', 'medium', 'large'];

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Full variant matrix · Figma <code>4136:74148</code>
      </h2>

      {(['basic', 'filled'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3
            className="text-label-l-semibold"
            style={{ margin: 0, color: 'var(--text-default-heading)', textTransform: 'capitalize' }}
          >
            {variant}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px repeat(3, auto)',
              gap: '16px 32px',
              alignItems: 'center',
            }}
          >
            <span />
            {SIZES.map((s) => (
              <span key={s} className="text-label-m-semibold" style={{ textTransform: 'capitalize' }}>
                {s}
              </span>
            ))}

            {COLORS.map((c) => (
              <React.Fragment key={c}>
                <span
                  className="text-label-s-regular"
                  style={{ color: 'var(--text-default-helper)', textTransform: 'capitalize' }}
                >
                  {c}
                </span>
                {SIZES.map((s) => (
                  <MobileFeaturedIcon
                    key={s}
                    icon="Orders"
                    color={c}
                    variant={variant}
                    size={s}
                    style={{ justifySelf: 'start' }}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
