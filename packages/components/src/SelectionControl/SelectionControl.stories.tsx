import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SelectionControl } from './SelectionControl.js';

const meta: Meta<typeof SelectionControl> = {
  title: 'Molecules/Form Controls/Selection Control',
  component: SelectionControl,
  parameters: {
    docs: {
      description: {
        component:
          'A labelled selection-input wrapper that renders a Checkbox, Radio Button, or Switch ' +
          'with consistent label, spacing, and states. Composes the Checkbox / RadioButton / Toggle atoms.' +
          '\n\n' +
          '**When to use** — anywhere a labelled boolean/option control is needed in forms, lists, and ' +
          'settings. **Not** as a bare glyph (use the underlying atoms directly when you supply your own label).' +
          '\n\n' +
          'Figma `37:362`. Checkbox/Radio lead with the control (label trailing); **Switch leads with the ' +
          'label** (toggle trailing). The label is wired via `htmlFor` + `aria-labelledby`, so clicking the ' +
          'text toggles the control. Indeterminate applies to Checkbox only; Disabled dims the whole row.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof SelectionControl>;

/* ============================================================================
 * Figma variant — Checkbox (control leading, label trailing)
 * ========================================================================== */

export const Checkbox: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <SelectionControl variant="checkbox" label="Label" checked={checked} onChange={setChecked} />
    );
  },
};

/* ============================================================================
 * Figma variant — Radio Button (single-select; control leading)
 * ========================================================================== */

export const RadioButton: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <SelectionControl variant="radio" label="Label" checked={checked} onChange={setChecked} />
    );
  },
};

/* ============================================================================
 * Figma variant — Switch (label leading, toggle trailing)
 * ========================================================================== */

export const Switch: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <SelectionControl variant="switch" label="Label" checked={checked} onChange={setChecked} />
    );
  },
};

/* ============================================================================
 * Indeterminate — checkbox-only state (partial / mixed children)
 * ========================================================================== */

export const Indeterminate: Story = {
  render: () => <SelectionControl variant="checkbox" label="Label" indeterminate />,
};

/* ============================================================================
 * Disabled — dims the whole row across all three variants
 * ========================================================================== */

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <SelectionControl variant="checkbox" label="Label" disabled />
      <SelectionControl variant="radio" label="Label" disabled />
      <SelectionControl variant="switch" label="Label" disabled />
    </div>
  ),
};

/* ============================================================================
 * With trailing icon — optional help/info affordance after the label
 * (Figma "Show Label Trailing Icon"; default content is Info, outlined)
 * ========================================================================== */

export const WithTrailingIcon: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <SelectionControl
        variant="checkbox"
        label="Label"
        trailingIcon="Info"
        checked={checked}
        onChange={setChecked}
      />
    );
  },
};

/* ============================================================================
 * Catalog — full variant × state matrix (Figma 37:362)
 * ========================================================================== */

const column = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  alignItems: 'flex-start',
} as const;
const caption = { color: 'var(--text-default-helper)' } as const;

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Variant matrix · Figma <code>37:362</code>
      </h2>

      <div style={column}>
        <span className="text-label-s-regular" style={caption}>
          Checkbox
        </span>
        <SelectionControl variant="checkbox" label="Idle" checked={false} />
        <SelectionControl variant="checkbox" label="Active" checked />
        <SelectionControl variant="checkbox" label="Indeterminate" indeterminate />
        <SelectionControl variant="checkbox" label="Disabled" disabled />
      </div>

      <div style={column}>
        <span className="text-label-s-regular" style={caption}>
          Radio Button
        </span>
        <SelectionControl variant="radio" label="Idle" checked={false} />
        <SelectionControl variant="radio" label="Active" checked />
        <SelectionControl variant="radio" label="Disabled" disabled />
      </div>

      <div style={column}>
        <span className="text-label-s-regular" style={caption}>
          Switch
        </span>
        <SelectionControl variant="switch" label="Idle" checked={false} />
        <SelectionControl variant="switch" label="Active" checked />
        <SelectionControl variant="switch" label="Disabled" disabled />
      </div>
    </div>
  ),
};
