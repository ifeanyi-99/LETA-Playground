import type { Meta, StoryObj } from '@storybook/react-vite';
import { TopFilter } from './TopFilter.js';
import { Badge } from '../Badge/Badge.js';

const meta: Meta<typeof TopFilter> = {
  title: 'Molecules/TopFilter',
  component: TopFilter,
  parameters: {
    docs: {
      description: {
        component:
          'A compact, pill-shaped filter control for table/list toolbars. Filters rows by a ' +
          'status (or similar categorical dimension).' +
          '\n\n' +
          '**Basic** (default) is a single on/off toggle; **Advanced** adds a trailing ' +
          'Chevron-Down and opens an options dropdown on click — the overlay is a separate ' +
          '(later) molecule, so this component only fires `onClick`.' +
          '\n\n' +
          'Use for quick status/category filters in a table toolbar — not for navigation ' +
          '(use Page Tabs Control / Desktop Segment Control), free-text search (use an input), ' +
          'or general tags (use Chip / Tag).' +
          '\n\n' +
          'Figma `1572:12741`. 2 types (Basic / Advanced) × 6 states (Idle / Hover / Pressed ' +
          'and their `-Selected` counterparts) = 12 variants. Renders a `<button>`; hover/press ' +
          'are tracked internally, `selected` is caller-controlled and exposed via `aria-pressed`.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    advanced: { control: 'boolean' },
    selected: { control: 'boolean' },
  },
  args: {
    label: 'Status',
    advanced: false,
    selected: false,
  },
};
export default meta;
type Story = StoryObj<typeof TopFilter>;

/* ============================================================================
 * Default
 * ========================================================================== */

export const Default: Story = {
  args: { label: 'Status' },
};

/* ============================================================================
 * Boolean props
 * ========================================================================== */

export const Advanced: Story = {
  args: { label: 'Status', advanced: true },
};

export const Selected: Story = {
  args: {
    label: 'Status',
    advanced: true,
    selected: true,
    badge: <Badge color="primary" label="Scheduled" />,
  },
};

/* ============================================================================
 * Catalog — single-component matrix (resting states)
 * ========================================================================== */

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Variant matrix · Figma <code>1572:12741</code>
      </h2>
      <p className="text-label-s-regular" style={{ color: 'var(--text-default-helper)', margin: 0 }}>
        Hover and press to see Hover/Pressed transitions. <code>selected</code> is caller-controlled
        — it switches the border to the secondary (active) treatment and fills with the active
        surface at rest.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(2, auto)', gap: '16px 24px', alignItems: 'center' }}>
        <span />
        <span className="text-label-m-semibold">Unselected</span>
        <span className="text-label-m-semibold">Selected</span>

        {/* Basic */}
        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>Basic</span>
        <TopFilter label="Status" style={{ justifySelf: 'start' }} />
        <TopFilter label="Status" selected style={{ justifySelf: 'start' }} />

        {/* Advanced */}
        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>Advanced</span>
        <TopFilter label="Status" advanced style={{ justifySelf: 'start' }} />
        <TopFilter label="Status" advanced selected badge={<Badge color="primary" label="Scheduled" />} style={{ justifySelf: 'start' }} />
      </div>
    </div>
  ),
};
