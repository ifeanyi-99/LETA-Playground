import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Icon, REGISTRY, type IconName, type IconSize } from './index.js';

/**
 * Icon stories. The `Catalog` story is the canonical reference — it lists
 * every registered icon, both filled and outlined when available.
 */

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  argTypes: {
    name: {
      control: 'select',
      options: Object.keys(REGISTRY) as IconName[],
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'small', 'medium', 'large', 'xl', 'xxl', 'xxxl'] satisfies IconSize[],
    },
    outlined: { control: 'boolean' },
    color: { control: 'color' },
  },
};
export default meta;

type Story = StoryObj<typeof Icon>;

/** Single icon with full prop controls. Open the Controls panel to swap name, size, outlined, etc. */
export const Playground: Story = {
  args: { name: 'Dashboard', size: 'large', outlined: true },
};

/** All sizes side by side for one icon. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {(['xs', 'small', 'medium', 'large', 'xl', 'xxl', 'xxxl'] as IconSize[]).map((s) => (
        <div key={s} style={{ textAlign: 'center' }}>
          <Icon name="Settings" size={s} />
          <div style={{ fontSize: 11, color: 'var(--text-default-helper)', marginTop: 4 }}>{s}</div>
        </div>
      ))}
    </div>
  ),
};

/** Filled vs outlined for icons that ship both variants. */
export const FillVsOutline: Story = {
  render: () => {
    const both = (Object.entries(REGISTRY) as [IconName, (typeof REGISTRY)[IconName]][])
      .filter(([, v]) => v.fill && v.outline)
      .slice(0, 12);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {both.map(([name]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name={name} size="large" />
            <Icon name={name} outlined size="large" />
            <code style={{ fontSize: 11 }}>{name}</code>
          </div>
        ))}
      </div>
    );
  },
};

/** Color via parent CSS — proves `currentColor` cascade works. */
export const ColorCascade: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ color: 'var(--icons-primary-default)' }}>
        <Icon name="Check" size="large" />
        <div style={{ fontSize: 11 }}>--icons-primary-default</div>
      </div>
      <div style={{ color: 'var(--icons-success-default)' }}>
        <Icon name="Check" size="large" />
        <div style={{ fontSize: 11 }}>--icons-success-default</div>
      </div>
      <div style={{ color: 'var(--icons-warning-default)' }}>
        <Icon name="Warning" size="large" />
        <div style={{ fontSize: 11 }}>--icons-warning-default</div>
      </div>
      <div style={{ color: 'var(--icons-error-default)' }}>
        <Icon name="Error" size="large" />
        <div style={{ fontSize: 11 }}>--icons-error-default</div>
      </div>
    </div>
  ),
};

/** Catalog: every registered icon. Useful for designers cross-referencing Figma. */
export const Catalog: Story = {
  render: () => {
    const names = (Object.keys(REGISTRY) as IconName[]).sort();
    return (
      <div>
        <p style={{ color: 'var(--text-default-helper)' }}>
          {names.length} registered icons. Filled variant shown by default.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 16,
          }}
        >
          {names.map((n) => {
            const entry = REGISTRY[n];
            return (
              <div
                key={n}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: 12,
                  borderRadius: 6,
                  border: '1px solid var(--border-default-subtle, rgba(0,0,0,0.08))',
                }}
              >
                <Icon name={n} size="large" />
                <code style={{ fontSize: 10, textAlign: 'center', wordBreak: 'break-word' }}>{n}</code>
                <div style={{ fontSize: 9, color: 'var(--text-default-helper)' }}>
                  {entry.fill ? 'filled' : ''}
                  {entry.fill && entry.outline ? ' + ' : ''}
                  {entry.outline ? 'outlined' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
