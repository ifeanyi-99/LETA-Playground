import type { Meta, StoryObj } from '@storybook/react-vite';
import { TopFilterSection } from './TopFilterSection.js';
import { Badge } from '../Badge/Badge.js';

const meta: Meta<typeof TopFilterSection> = {
  title: 'Molecules/TopFilterSection',
  component: TopFilterSection,
  parameters: {
    docs: {
      description: {
        component:
          'The filter bar that holds a horizontal row of Top Filter controls in a table ' +
          'toolbar. Data-driven: pass a `filters` array; each entry becomes a `TopFilter`. ' +
          '\n\n' +
          'Filters are **independent** (several can be applied at once) — selection state lives ' +
          "in the caller's data and is surfaced back via `onFilterClick(index)`. " +
          '\n\n' +
          'Use as the status-filter row above/within a data table — not for a single filter ' +
          '(use `TopFilter`), navigation (use `PageTabsControl`), or view switching ' +
          '(use `DesktopSegmentControl`).' +
          '\n\n' +
          'Figma `9469:84304` (Basic / Advanced reflect which kind of filters the row holds).',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TopFilterSection>;

/* ============================================================================
 * Figma variant — Basic
 * ========================================================================== */

export const Basic: Story = {
  args: {
    filters: [
      { label: 'Status', selected: true },
      { label: 'Driver' },
      { label: 'Region' },
      { label: 'Priority' },
      { label: 'Type' },
    ],
  },
};

/* ============================================================================
 * Figma variant — Advanced
 * ========================================================================== */

export const Advanced: Story = {
  args: {
    filters: [
      { label: 'Status', advanced: true, selected: true, badge: <Badge color="primary" label="Scheduled" /> },
      { label: 'Driver', advanced: true },
      { label: 'Region', advanced: true },
      { label: 'Priority', advanced: true },
      { label: 'Type', advanced: true },
    ],
  },
};

/* ============================================================================
 * Catalog — both Figma variants
 * ========================================================================== */

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Variant matrix · Figma <code>9469:84304</code>
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>Advanced</span>
        <TopFilterSection
          filters={[
            { label: 'Status', advanced: true, selected: true, badge: <Badge color="primary" label="Scheduled" /> },
            { label: 'Driver', advanced: true },
            { label: 'Region', advanced: true },
            { label: 'Priority', advanced: true },
            { label: 'Type', advanced: true },
          ]}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>Basic</span>
        <TopFilterSection
          filters={[
            { label: 'Status', selected: true },
            { label: 'Driver' },
            { label: 'Region' },
            { label: 'Priority' },
            { label: 'Type' },
          ]}
        />
      </div>
    </div>
  ),
};
