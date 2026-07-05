import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BulkActionsToolbar } from './BulkActionsToolbar.js';
import { Button } from '../Button/Button.js';

/**
 * Bulk Actions Toolbar (`7973:17061`) — the floating action bar shown when table
 * rows are selected. A centered white pill: selection control (+ optional summary)
 * | bulk actions + More (⋯) | close (✕), with vertical dividers. Fixed 80px from
 * the viewport bottom, centered, max-width 800px, single non-wrapping row.
 *
 * The selection control is a Ghost button with a **trailing `Chevron-Down`**
 * ("10 selected ⌄") — a dropdown affordance, not a leading checkbox.
 *
 * **Icon convention — outlined by default.** Every icon-bearing Button here passes
 * `iconOutlined` so glyphs render as the outlined library variant (filled is only a
 * fallback for glyphs with no outline). Follow this when supplying your own `actions`
 * so the toolbar renders correctly on every screen.
 */
const meta: Meta<typeof BulkActionsToolbar> = {
  title: 'Organisms/Tables/Bulk Actions Toolbar',
  component: BulkActionsToolbar,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof BulkActionsToolbar>;

/** Default — "N selected ⌄" dropdown control + outlined-icon actions + close. Summary omitted (the common case). */
export const Default: Story = {
  render: () => <BulkActionsToolbar />,
};

/** WithSummary — weight/volume metadata shown between selection and actions. Numbers render SemiBold, units Regular. */
export const WithSummary: Story = {
  render: () => (
    <BulkActionsToolbar
      summaryItems={[
        { value: '800', unit: 'kg' },
        { value: '980', unit: 'cases' },
      ]}
    />
  ),
};

/** Caller-supplied action buttons via the `actions` slot (outlined icons). */
export const CustomActions: Story = {
  render: () => (
    <BulkActionsToolbar
      selectionLabel="3 selected"
      actions={
        <>
          <Button variant="ghost" size="medium" iconLeft="User" iconOutlined>Assign</Button>
          <Button variant="ghost" size="medium" iconLeft="Download" iconOutlined>Export</Button>
          <Button variant="ghost-error" size="medium" iconLeft="Delete" iconOutlined>Delete</Button>
        </>
      }
    />
  ),
};

/** Real placement — fixed 80px from the viewport bottom, centered, max-width 800px. */
export const Fixed: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ position: 'relative', height: 480, background: 'var(--surface-neutral-bg-subtle)' }}>
      <span style={{ position: 'absolute', top: 16, left: 16, color: 'var(--text-default-label-idle)' }} className="text-label-m-regular">
        Toolbar is fixed 80px from the bottom, centered.
      </span>
      <BulkActionsToolbar fixed />
    </div>
  ),
};
