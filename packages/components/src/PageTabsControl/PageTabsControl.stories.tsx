import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageTabsControl } from './PageTabsControl.js';

const meta: Meta<typeof PageTabsControl> = {
  title: 'Molecules/PageTabsControl',
  component: PageTabsControl,
  parameters: {
    docs: {
      description: {
        component:
          'A full-width horizontal tab bar for top-level navigation between sections/pages, ' +
          'with a full-width demarcator line beneath the tabs.' +
          '\n\n' +
          '**`basic`** (wraps `PageTab`) — navigate between page sections. **`wizard`** (wraps ' +
          '`WizardTab`) — sequential multi-step flow; each tab has a numbered step circle and an ' +
          'optional `inactive` (future-step) flag.' +
          '\n\n' +
          'Not for switching content layout (use Desktop Segment Control), filtering (use Top ' +
          'Filter), or very large tab counts needing overflow scroll.' +
          '\n\n' +
          'Figma `3907:71981`. Data-driven: `value`/`onChange`. The active tab\'s 2px indicator ' +
          'sits on the demarcator line. Renders a `<div role="tablist">`; each tab is ' +
          '`role="tab"` + `aria-selected`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PageTabsControl>;

/* ============================================================================
 * Figma variant — Basic
 * ========================================================================== */

export const Basic: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <PageTabsControl
        variant="basic"
        value={value}
        onChange={setValue}
        tabs={[
          { label: 'Overview' },
          { label: 'Orders' },
          { label: 'Customers' },
          { label: 'Drivers' },
          { label: 'Reports' },
        ]}
      />
    );
  },
};

/* ============================================================================
 * Figma variant — Wizard
 * ========================================================================== */

export const Wizard: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    const tabs = [
      { label: 'Account' },
      { label: 'Details' },
      { label: 'Review', inactive: value < 1 },
      { label: 'Confirm', inactive: value < 2 },
    ];
    return (
      <PageTabsControl
        variant="wizard"
        value={value}
        onChange={setValue}
        tabs={tabs}
      />
    );
  },
};

/* ============================================================================
 * Catalog — both variants
 * ========================================================================== */

export const Catalog: Story = {
  render: () => {
    const [basic, setBasic] = useState(0);
    const [wiz, setWiz] = useState(0);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
          Variant matrix · Figma <code>3907:71981</code>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>Basic</span>
          <PageTabsControl
            variant="basic"
            value={basic}
            onChange={setBasic}
            tabs={[
              { label: 'Overview' },
              { label: 'Orders' },
              { label: 'Customers' },
              { label: 'Drivers' },
              { label: 'Reports' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>Wizard</span>
          <PageTabsControl
            variant="wizard"
            value={wiz}
            onChange={setWiz}
            tabs={[
              { label: 'Account' },
              { label: 'Details' },
              { label: 'Review', inactive: wiz < 1 },
              { label: 'Confirm', inactive: wiz < 2 },
            ]}
          />
        </div>
      </div>
    );
  },
};
