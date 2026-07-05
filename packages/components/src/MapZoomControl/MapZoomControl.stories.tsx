import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapZoomControl } from './MapZoomControl.js';

const meta: Meta<typeof MapZoomControl> = {
  title: 'Atoms/MapZoomControl',
  component: MapZoomControl,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof MapZoomControl>;

export const Default: Story = {
  name: 'Default',
  args: {
    onZoomIn: () => {},
    onZoomOut: () => {},
  },
};

export const ZoomInDisabled: Story = {
  name: 'Zoom In Disabled',
  args: {
    onZoomIn: () => {},
    onZoomOut: () => {},
    disableZoomIn: true,
  },
};

export const ZoomOutDisabled: Story = {
  name: 'Zoom Out Disabled',
  args: {
    onZoomIn: () => {},
    onZoomOut: () => {},
    disableZoomOut: true,
  },
};

export const Catalog: Story = {
  name: 'Catalog',
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-default-label-idle)' }}>Default</span>
        <MapZoomControl onZoomIn={() => {}} onZoomOut={() => {}} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-default-label-idle)' }}>Zoom In Disabled</span>
        <MapZoomControl onZoomIn={() => {}} onZoomOut={() => {}} disableZoomIn />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-default-label-idle)' }}>Zoom Out Disabled</span>
        <MapZoomControl onZoomIn={() => {}} onZoomOut={() => {}} disableZoomOut />
      </div>
    </div>
  ),
};
