import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip.js';
import { Button } from '../Button/Button.js';
import { SelectionControl } from '../SelectionControl/SelectionControl.js';

const meta: Meta<typeof Tooltip> = {
  title: 'Molecules/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A contextual overlay anchored to a target with a directional caret. ' +
          'Figma `1178:15588` ("Tooltips & Popovers"). Variants: Small / Standard (dark) / Coachmark / Flyout / Popover ' +
          '(Desktop), Small / Standard / Coachmark (Mobile). Presentational — triggering and ' +
          'caret positioning are owned by the consuming prototype; `caretSide`/`caretAlign` ' +
          'control the caret (default bottom-center).',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

/**
 * Sample content for the Popover tooltip's Details Section slot: a 2-column
 * Title/Description grid + a "Configuration Control" (divider · switch · divider),
 * mirroring the Figma default.
 */
function SampleDetails() {
  const cell = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
      <span className="text-body-m-regular" style={{ color: 'var(--text-default-sub-body)' }}>Title</span>
      <span className="text-body-m-medium" style={{ color: 'var(--text-default-body)' }}>Description</span>
    </div>
  );
  const divider = <div style={{ height: 'var(--stroke-xs)', backgroundColor: 'var(--border-neutral-default)' }} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Metadata grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[0, 1, 2].map((r) => (
          <div key={r} style={{ display: 'flex', gap: 16 }}>
            {cell}
            {cell}
          </div>
        ))}
      </div>
      {/* Configuration Control: divider · switch · divider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {divider}
        <SelectionControl
          variant="switch"
          fullWidth
          label="Show drop-off locations"
          trailingIcon="Info"
          defaultChecked
        />
        {divider}
      </div>
    </div>
  );
}

const DispatchCTA = () => (
  <Button variant="secondary" size="small" style={{ width: '100%' }}>
    Dispatch
  </Button>
);

/** Small — a compact label. */
export const Small: Story = { args: { variant: 'small', text: 'View' } };

/** Standard — a short paragraph. */
export const Standard: Story = {
  args: { variant: 'standard', text: 'This will help indicate low stock levels for this product.' },
};

/** Coachmark — onboarding step with title, body, counter, and Skip/Next. */
export const Coachmark: Story = {
  args: {
    variant: 'coachmark',
    title: 'Text',
    text: 'This will help indicate low stock levels for this product.',
    step: 1,
    totalSteps: 4,
  },
};

/** Flyout — title + body + Cancel/Delete actions. */
export const Flyout: Story = {
  args: {
    variant: 'flyout',
    title: 'Title',
    text: 'This will help indicate low stock levels for this product.',
  },
};

/** Popover — title + detail grid + toggle + CTA. */
export const Popover: Story = {
  args: {
    variant: 'popover',
    title: 'Title',
    details: <SampleDetails />,
    cta: <DispatchCTA />,
  },
};

/** Mobile Small. */
export const MobileSmall: Story = { args: { platform: 'mobile', variant: 'small', text: 'View' } };

/** Mobile Standard. */
export const MobileStandard: Story = {
  args: { platform: 'mobile', variant: 'standard', text: 'This will help indicate low stock levels for this product.' },
};

/** Mobile Coachmark. */
export const MobileCoachmark: Story = {
  args: {
    platform: 'mobile',
    variant: 'coachmark',
    title: 'Text',
    text: 'This will help indicate low stock levels for this product.',
    step: 1,
    totalSteps: 4,
  },
};

/** All variants grouped (Desktop + Mobile). */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
        <Tooltip variant="small" text="View" />
        <Tooltip variant="standard" text="This will help indicate low stock levels for this product." />
        <Tooltip variant="coachmark" title="Text" text="This will help indicate low stock levels for this product." />
        <Tooltip variant="flyout" title="Title" text="This will help indicate low stock levels for this product." />
        <Tooltip variant="popover" title="Title" details={<SampleDetails />} cta={<DispatchCTA />} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
        <Tooltip platform="mobile" variant="small" text="View" />
        <Tooltip platform="mobile" variant="standard" text="This will help indicate low stock levels for this product." />
        <Tooltip platform="mobile" variant="coachmark" title="Text" text="This will help indicate low stock levels for this product." />
      </div>
    </div>
  ),
};
