import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileChip } from './MobileChip.js';

const meta: Meta<typeof MobileChip> = {
  title: 'Atoms/MobileChip',
  component: MobileChip,
  parameters: {
    docs: {
      description: {
        component:
          'A compact, pill-shaped element that represents a specific piece of information, an attribute, or a discrete action. ' +
          'Chips help users **filter content in stacked lists**, make selections, or trigger context-specific tasks. ' +
          '\n\n' +
          '**Use above stacked lists** — not for filtering table data (use the table\'s built-in column filters for that), ' +
          'not as navigation (use Mobile Segments or Tabs), and not as a replacement for a full-width button or form control.' +
          '\n\n' +
          'Mobile Chip (Figma `8269:29237`). Touch-first — no hover state. ' +
          '4 types (No Icon / Leading / Trailing / Leading + Trailing) × ' +
          '4 states (Idle / Pressed / Active / Focus). Pressed tracked via touch/mouse-down; ' +
          'Active is caller-controlled via the `active` prop.',
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
    label: 'Type',
    active: false,
  },
};

export default meta;
type Story = StoryObj<typeof MobileChip>;

/* ------------------------------------------------------------------ */
/*  Type-variant stories — one per Figma `Type` variant property      */
/* ------------------------------------------------------------------ */

export const NoIcon: Story = {
  args: { label: 'Type' },
};

export const WithLeadingIcon: Story = {
  args: { label: 'Type', leadingIcon: 'Info' },
};

export const WithTrailingIcon: Story = {
  args: { label: 'Type', trailingIcon: 'Check' },
};

export const WithLeadingAndTrailingIcons: Story = {
  args: { label: 'Type', leadingIcon: 'Info', trailingIcon: 'Check' },
};

/* ------------------------------------------------------------------ */
/*  Catalog — 4 types × 2 visible states (Idle / Active)              */
/* ------------------------------------------------------------------ */

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Full variant matrix · Figma <code>8269:29237</code>
      </h2>
      <p
        className="text-label-s-regular"
        style={{ color: 'var(--text-default-helper)', margin: 0 }}
      >
        Press and release each chip to see the Pressed visual. Active is caller-controlled.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '180px repeat(2, auto)',
          gap: '12px 24px',
          alignItems: 'center',
        }}
      >
        <span />
        <span className="text-label-m-semibold">Idle</span>
        <span className="text-label-m-semibold">Active</span>

        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
          No Icon
        </span>
        <MobileChip label="Type" style={{ justifySelf: 'start' }} />
        <MobileChip label="Type" active style={{ justifySelf: 'start' }} />

        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
          Leading Icon
        </span>
        <MobileChip label="Type" leadingIcon="Info" style={{ justifySelf: 'start' }} />
        <MobileChip label="Type" leadingIcon="Info" active style={{ justifySelf: 'start' }} />

        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
          Trailing Icon
        </span>
        <MobileChip label="Type" trailingIcon="Check" style={{ justifySelf: 'start' }} />
        <MobileChip label="Type" trailingIcon="Check" active style={{ justifySelf: 'start' }} />

        <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
          Leading + Trailing Icon
        </span>
        <MobileChip
          label="Type"
          leadingIcon="Info"
          trailingIcon="Check"
          style={{ justifySelf: 'start' }}
        />
        <MobileChip
          label="Type"
          leadingIcon="Info"
          trailingIcon="Check"
          active
          style={{ justifySelf: 'start' }}
        />
      </div>
    </div>
  ),
};
