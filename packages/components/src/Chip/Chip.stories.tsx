import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip.js';

const meta: Meta<typeof Chip> = {
  title: 'Atoms/Chip',
  component: Chip,
  parameters: {
    docs: {
      description: {
        component:
          'A compact, pill-shaped element that represents a specific piece of information, an attribute, or a discrete action. ' +
          'Chips help users **filter content in stacked lists**, make selections, or trigger context-specific tasks. ' +
          '\n\n' +
          '**Use above stacked lists** — not for filtering table data (use the table\'s built-in column filters for that), ' +
          'not as navigation (use Tabs or Segments), and not as a replacement for a full-width button or form control.' +
          '\n\n' +
          'Desktop Chip (Figma `7139:53343`). ' +
          '4 types (No Icon / Leading / Trailing / Leading + Trailing) × 5 states ' +
          '(Idle / Hover / Pressed / Active / Focus) = 20 Figma variants. ' +
          'Renders as a `<button>`; Active state is caller-controlled via the `active` prop.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    active: { control: 'boolean' },
    leadingIcon: { control: 'text' },
    trailingIcon: { control: 'text' },
  },
  args: {
    label: 'Label',
    active: false,
  },
};
export default meta;
type Story = StoryObj<typeof Chip>;

/* ============================================================================
 * Type variants
 * ========================================================================== */

export const NoIcon: Story = {
  args: { label: 'Label' },
};

export const WithLeadingIcon: Story = {
  args: { label: 'Label', leadingIcon: 'Filter' },
};

export const WithTrailingIcon: Story = {
  args: { label: 'Label', trailingIcon: 'Cancel' },
};

export const WithLeadingAndTrailingIcons: Story = {
  args: { label: 'Label', leadingIcon: 'Filter', trailingIcon: 'Cancel' },
};

/* ============================================================================
 * Active state
 * ========================================================================== */

export const Active: Story = {
  args: { label: 'Label', active: true },
};

export const ActiveWithLeadingIcon: Story = {
  args: { label: 'Label', leadingIcon: 'Filter', active: true },
};

/* ============================================================================
 * Catalog — full variant matrix
 * ========================================================================== */

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Full variant matrix · Figma <code>7139:53343</code>
      </h2>
      <p className="text-label-s-regular" style={{ color: 'var(--text-default-helper)', margin: 0 }}>
        Hover and press chips to see state transitions. Active state is toggled via the{' '}
        <code>active</code> prop.
      </p>

      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(2, auto)', gap: '16px 24px', alignItems: 'center' }}>
        <span />
        <span className="text-label-m-semibold">Idle</span>
        <span className="text-label-m-semibold">Active</span>

        {/* No Icon */}
        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>No Icon</span>
        <Chip label="Label" style={{ justifySelf: 'start' }} />
        <Chip label="Label" active style={{ justifySelf: 'start' }} />

        {/* Leading Icon */}
        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>Leading Icon</span>
        <Chip label="Label" leadingIcon="Filter" style={{ justifySelf: 'start' }} />
        <Chip label="Label" leadingIcon="Filter" active style={{ justifySelf: 'start' }} />

        {/* Trailing Icon */}
        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>Trailing Icon</span>
        <Chip label="Label" trailingIcon="Cancel" style={{ justifySelf: 'start' }} />
        <Chip label="Label" trailingIcon="Cancel" active style={{ justifySelf: 'start' }} />

        {/* Leading + Trailing */}
        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>Leading + Trailing Icon</span>
        <Chip label="Label" leadingIcon="Filter" trailingIcon="Cancel" style={{ justifySelf: 'start' }} />
        <Chip label="Label" leadingIcon="Filter" trailingIcon="Cancel" active style={{ justifySelf: 'start' }} />
      </div>
    </div>
  ),
};
