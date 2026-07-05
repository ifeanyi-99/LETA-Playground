import type { Meta, StoryObj } from '@storybook/react-vite';
import { Shortcut } from './Shortcut.js';

const meta: Meta<typeof Shortcut> = {
  title: 'Molecules/Shortcut',
  component: Shortcut,
  parameters: {
    docs: {
      description: {
        component:
          'A compact, contextual inline element placed at the trailing edge of dropdown menu items, ' +
          'command-palette rows, or list items. It surfaces the keyboard combination that triggers that ' +
          'action, reinforcing power-user workflows and discoverability.' +
          '\n\n' +
          '**Use beside** an actionable menu/command/list item that has a keyboard binding — not for ' +
          'non-actionable text or where no shortcut exists.' +
          '\n\n' +
          'Figma `7259:81045`. 2 states: **Idle** (operational, full emphasis) and **Disabled** (muted). ' +
          'Each key in the `keys` array renders as a semantic `<kbd>` keycap.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Shortcut>;

/* ============================================================================
 * Figma state — Idle (default)
 * ========================================================================== */

export const Default: Story = {
  render: () => <Shortcut keys={['Ctrl', 'K']} />,
};

/* ============================================================================
 * Figma state — Disabled
 * ========================================================================== */

export const Disabled: Story = {
  render: () => <Shortcut keys={['Ctrl', 'K']} disabled />,
};

/* ============================================================================
 * Catalog — both states across a few key combinations
 * ========================================================================== */

const row = { display: 'flex', alignItems: 'center', gap: 16 } as const;
const caption = { color: 'var(--text-default-helper)', minWidth: 72 } as const;

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Shortcut · Figma <code>7259:81045</code>
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <span className="text-label-s-regular" style={caption}>
          Idle
        </span>
        <div style={row}>
          <Shortcut keys={['K']} />
          <Shortcut keys={['Ctrl', 'K']} />
          <Shortcut keys={['Ctrl', 'Shift', 'P']} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <span className="text-label-s-regular" style={caption}>
          Disabled
        </span>
        <div style={row}>
          <Shortcut keys={['K']} disabled />
          <Shortcut keys={['Ctrl', 'K']} disabled />
          <Shortcut keys={['Ctrl', 'Shift', 'P']} disabled />
        </div>
      </div>
    </div>
  ),
};
