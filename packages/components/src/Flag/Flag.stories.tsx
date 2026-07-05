import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import * as FlagIcons from 'country-flag-icons/react/3x2';
import { Flag } from './Flag.js';

const meta: Meta<typeof Flag> = {
  title: 'Atoms/Flag',
  component: Flag,
  parameters: {
    docs: {
      description: {
        component:
          'Country flag display component (Figma `7111:43819`). ' +
          'One per ISO 3166 code. ' +
          'No interactive states — purely presentational. ' +
          'Backed by the `country-flag-icons` library (3×2 SVGs). ' +
          'Default render size: 20×15 px.',
      },
    },
  },
  argTypes: {
    code: { control: 'text' },
    width: { control: 'number' },
    height: { control: 'number' },
  },
  args: {
    code: 'US',
    width: 20,
    height: 15,
  },
};
export default meta;
type Story = StoryObj<typeof Flag>;

/* ============================================================================
 * Single flag control
 * ========================================================================== */

export const Default: Story = {
  args: { code: 'US' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Flag code="US" width={16} height={12} />
      <Flag code="US" width={20} height={15} />
      <Flag code="US" width={32} height={24} />
      <Flag code="US" width={48} height={36} />
      <Flag code="US" width={64} height={48} />
    </div>
  ),
};

/* ============================================================================
 * Full catalog — every code shipped by country-flag-icons
 *
 * Derived at runtime from the library's actual exports, so the Catalog
 * always stays in sync with what `country-flag-icons` ships. No grey-rectangle
 * fallbacks will appear because every code listed here has a real SVG.
 * ========================================================================== */

const ALL_CODES: string[] = Object.keys(FlagIcons)
  // Drop the `Has<XX>` typeguard exports the library also emits.
  .filter((k) => !k.startsWith('Has') && !k.startsWith('has') && k !== 'default')
  .sort();

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        All Flags · Figma <code>7111:43819</code>
      </h2>
      <p className="text-label-s-regular" style={{ color: 'var(--text-default-helper)', margin: 0 }}>
        {ALL_CODES.length} country and territory flags at 20×15 px — derived directly from{' '}
        <code>country-flag-icons/react/3x2</code> exports.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px' }}>
        {ALL_CODES.map((code) => (
          <div
            key={code}
            title={code}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
          >
            <Flag code={code} width={20} height={15} />
            <span
              className="text-label-s-regular"
              style={{ fontSize: 9, color: 'var(--text-default-helper)', lineHeight: 1 }}
            >
              {code}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};
