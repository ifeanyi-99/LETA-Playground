import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoadingOverlay } from './LoadingOverlay.js';
import { Button } from '../Button/Button.js';

/**
 * Loading Overlay — a full-viewport blocking loader: dim scrim, the LETA loader
 * Lottie centered at 80×80, and "Loading..." / "Wait a few seconds." stacked
 * 20px below (8px apart, on-color text tokens). Shown while a view reloads —
 * e.g. the Table Data Control's Refresh button.
 */
const meta: Meta<typeof LoadingOverlay> = {
  title: 'Molecules/Loading Overlay',
  component: LoadingOverlay,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof LoadingOverlay>;

/** Click the button to show the overlay for 4 seconds (as the table-refresh flow does for ~2s). */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
      if (!open) return;
      const t = setTimeout(() => setOpen(false), 4000);
      return () => clearTimeout(t);
    }, [open]);
    return (
      <div>
        <Button variant="secondary" size="medium" iconOnly="Refresh" aria-label="Refresh" onClick={() => setOpen(true)} />
        <LoadingOverlay open={open} />
      </div>
    );
  },
};
