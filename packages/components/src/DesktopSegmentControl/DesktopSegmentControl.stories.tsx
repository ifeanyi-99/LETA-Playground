import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DesktopSegmentControl } from './DesktopSegmentControl.js';

const meta: Meta<typeof DesktopSegmentControl> = {
  title: 'Molecules/DesktopSegmentControl',
  component: DesktopSegmentControl,
  parameters: {
    docs: {
      description: {
        component:
          'A segmented control that groups 2+ mutually exclusive options into a single track, ' +
          'with exactly one active.' +
          '\n\n' +
          '**`view`** — compact (wraps `ViewSwitcherTab`); toggles how the same data is displayed ' +
          '(Grid / List / Map), sitting near the content it controls. **`segment`** — prominent ' +
          '(wraps `SegmentSwitcherTab`); high-level navigation within a drawer/panel, swapping the ' +
          'body content.' +
          '\n\n' +
          'Not for top-level page navigation (use Page Tabs Control), filtering (use Top Filter), ' +
          'binary on/off (use Toggle), or long/overflowing option sets.' +
          '\n\n' +
          'Figma `5778:230039`. Data-driven: `value`/`onChange` enforce single-active. Renders a ' +
          '`<div role="group">`; each tab exposes `aria-pressed`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DesktopSegmentControl>;

/* ============================================================================
 * Figma variant — View Switcher (compact)
 *
 * Segments are label-only by default. The Figma master has
 * `Show Leading Icon: false` on every segment — the `leadingIcon` prop is opt-in
 * only (see `WithLeadingIcons` below).
 * ========================================================================== */

export const ViewSwitcher: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <DesktopSegmentControl
        variant="view"
        value={value}
        onChange={setValue}
        segments={[
          { label: 'Grid' },
          { label: 'List' },
        ]}
      />
    );
  },
};

/* ============================================================================
 * Figma variant — Segment Switcher (prominent)
 * ========================================================================== */

export const SegmentSwitcher: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <DesktopSegmentControl
        variant="segment"
        value={value}
        onChange={setValue}
        segments={[
          { label: 'Details' },
          { label: 'Activity' },
        ]}
      />
    );
  },
};

/* ============================================================================
 * With leading icons (opt-in per segment)
 *
 * Demonstrates the optional per-segment `leadingIcon` field. The Figma master
 * defaults to `Show Leading Icon: false`, so this story is the explicit
 * opt-in. Icon size is constant across states (16px in view, 20px in segment).
 * ========================================================================== */

export const WithLeadingIcons: Story = {
  render: () => {
    const [view, setView] = useState(0);
    const [segment, setSegment] = useState(0);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
        <DesktopSegmentControl
          variant="view"
          value={view}
          onChange={setView}
          segments={[
            { label: 'Grid', leadingIcon: 'Orders' },
            { label: 'List', leadingIcon: 'List' },
          ]}
        />
        <DesktopSegmentControl
          variant="segment"
          value={segment}
          onChange={setSegment}
          segments={[
            { label: 'Details', leadingIcon: 'Orders' },
            { label: 'Activity', leadingIcon: 'Analytics' },
          ]}
        />
      </div>
    );
  },
};

/* ============================================================================
 * Catalog — both variants (label-only, mirrors the Figma master defaults)
 * ========================================================================== */

export const Catalog: Story = {
  render: () => {
    const [view, setView] = useState(0);
    const [segment, setSegment] = useState(0);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
          Variant matrix · Figma <code>5778:230039</code>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
            View Switcher (compact)
          </span>
          <DesktopSegmentControl
            variant="view"
            value={view}
            onChange={setView}
            segments={[
              { label: 'Grid' },
              { label: 'List' },
              { label: 'Map' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
            Segment Switcher (prominent)
          </span>
          <DesktopSegmentControl
            variant="segment"
            value={segment}
            onChange={setSegment}
            segments={[
              { label: 'Details' },
              { label: 'Activity' },
            ]}
          />
        </div>
      </div>
    );
  },
};
