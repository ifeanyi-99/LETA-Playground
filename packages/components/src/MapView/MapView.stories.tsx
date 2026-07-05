import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapView } from './MapView.js';

/**
 * Map View — the LETA standard interactive map primitive: a **Leaflet** map
 * (OpenStreetMap raster tiles, no API key) with the design-system `MapZoomControl`
 * overlaid bottom-right and wired to drive the map's zoom. Pan by drag, zoom by
 * wheel or the control. This is the canonical map surface for every LETA map view
 * until a more robust provider (e.g. Google Maps) is adopted.
 *
 * Requires network access for the OSM tiles.
 */
const meta: Meta<typeof MapView> = {
  title: 'Molecules/Map View',
  component: MapView,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ width: 800, height: 500, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof MapView>;

/** Default — Nairobi, zoom 14, with the working zoom control. */
export const Default: Story = {};

/** A different centre + zoom (Lavington area, closer in). */
export const Centered: Story = {
  args: { center: [-1.273, 36.78], zoom: 15 },
};
