import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoadingOverlay } from './LoadingOverlay.js';
import { Button } from '../Button/Button.js';

/**
 * Loading Overlay — a blocking loader: a translucent white scrim over the
 * region it covers (`contained`) or the whole viewport, the LETA loader Lottie
 * centered at 80×80, and "Loading" / "This will only take a moment" stacked 20px
 * below (8px apart). The engine + animation preload at mount so the animation
 * starts with the text, and dismissal is cycle-aligned — the overlay holds
 * until the animation finishes its full ~3.7s cycle even if `open` flips false
 * earlier.
 */
const meta: Meta<typeof LoadingOverlay> = {
  title: 'Molecules/Loading Overlay',
  component: LoadingOverlay,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof LoadingOverlay>;

/**
 * Contained overlay over a mock table region. Refresh sets `open` true, then
 * false 1s later (a fast fake fetch) — the overlay visibly persists until the
 * animation completes its full cycle, then dismisses.
 */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    const run = () => {
      setOpen(true);
      setTimeout(() => setOpen(false), 1000);
    };
    return (
      <div
        style={{
          position: 'relative',
          minHeight: 420,
          border: 'var(--stroke-xs) solid var(--border-neutral-default)',
          borderRadius: 'var(--rounding-xl)',
          padding: 'var(--padding-16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-16px)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" size="medium" iconOnly="Refresh" aria-label="Refresh" onClick={run} />
        </div>
        <span className="text-body-m-regular" style={{ color: 'var(--text-default-sub-body)' }}>
          Mock table region — the contained overlay dims only this box, not the page.
        </span>
        <LoadingOverlay contained open={open} />
      </div>
    );
  },
};
