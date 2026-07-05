import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper } from './Stepper.js';

const meta: Meta<typeof Stepper> = {
  title: 'Molecules/Form Controls/Stepper',
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component:
          'A numeric input with increment/decrement affordances for adjusting a value in discrete steps.' +
          '\n\n' +
          '**Use for** bounded numeric entry where ± nudging is faster than typing (quantities, counts, ' +
          'durations) — not for unbounded numbers, ranges (use a slider), or step-through wizards.' +
          '\n\n' +
          'Figma `4524:205932`. **Discrete** — a bordered field with the value + an up/down spinner ' +
          '(`Icon/Stepper`); **Segmented** — a joined `[−] [count] [+]` control whose buttons reuse the ' +
          'Desktop Button atom. Controlled (`value`/`onChange`) or uncontrolled (`defaultValue`); ' +
          'ArrowUp/ArrowDown nudge the value.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Stepper>;

/* ============================================================================
 * Figma type — Discrete (field + up/down spinner)
 * ========================================================================== */

export const Discrete: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return <Stepper variant="discrete" value={value} onChange={setValue} aria-label="Quantity" />;
  },
};

/* ============================================================================
 * Figma type — Segmented ([−] [count] [+])
 * ========================================================================== */

export const Segmented: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return <Stepper variant="segmented" value={value} onChange={setValue} aria-label="Quantity" />;
  },
};

/* ============================================================================
 * Disabled — both types
 * ========================================================================== */

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Stepper variant="discrete" defaultValue={0} disabled aria-label="Quantity" />
      <Stepper variant="segmented" defaultValue={0} disabled aria-label="Quantity" />
    </div>
  ),
};

/* ============================================================================
 * Catalog — both types
 * ========================================================================== */

export const Catalog: Story = {
  render: () => {
    const [discrete, setDiscrete] = useState(2);
    const [segmented, setSegmented] = useState(2);
    const caption = { color: 'var(--text-default-helper)' } as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
        <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
          Stepper · Figma <code>4524:205932</code>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <span className="text-label-s-regular" style={caption}>
            Discrete
          </span>
          <Stepper variant="discrete" value={discrete} onChange={setDiscrete} aria-label="Quantity" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <span className="text-label-s-regular" style={caption}>
            Segmented
          </span>
          <Stepper
            variant="segmented"
            value={segmented}
            onChange={setSegmented}
            aria-label="Quantity"
          />
        </div>
      </div>
    );
  },
};
