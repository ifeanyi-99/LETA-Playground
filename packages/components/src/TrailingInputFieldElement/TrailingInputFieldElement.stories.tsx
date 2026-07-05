import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrailingInputFieldElement } from './TrailingInputFieldElement.js';

const meta: Meta<typeof TrailingInputFieldElement> = {
  title: 'Molecules/Form Controls/Trailing Input Field Element',
  component: TrailingInputFieldElement,
  parameters: {
    docs: {
      description: {
        component:
          'An adornment that sits at the **trailing** edge inside an input field.' +
          '\n\n' +
          '**Use inside** inputs needing a trailing action or selector — not standalone.' +
          '\n\n' +
          'Figma `4478:344281`. **Basic** — a presentational content slot (unit text / status icon / ' +
          'clear "×"); **Dropdown** — a Secondary Button with a trailing chevron that opens a selector ' +
          '(reuses the Desktop Button atom).',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TrailingInputFieldElement>;

/* ============================================================================
 * Figma variant — Basic (presentational content/unit text)
 * ========================================================================== */

export const Basic: Story = {
  render: () => <TrailingInputFieldElement variant="basic" label="kg" />,
};

/* ============================================================================
 * Figma variant — Dropdown (Secondary Button + trailing chevron)
 * ========================================================================== */

export const Dropdown: Story = {
  render: () => (
    <TrailingInputFieldElement variant="dropdown" label="USD" aria-label="Select currency" />
  ),
};

/* ============================================================================
 * Catalog — both variants (Figma 4478:344281)
 * ========================================================================== */

export const Catalog: Story = {
  render: () => {
    const caption = { color: 'var(--text-default-helper)' } as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
        <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
          Trailing Input Field Element · Figma <code>4478:344281</code>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <span className="text-label-s-regular" style={caption}>
            Basic
          </span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <TrailingInputFieldElement variant="basic" label="kg" />
            <TrailingInputFieldElement variant="basic" label="%" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <span className="text-label-s-regular" style={caption}>
            Dropdown (interactive)
          </span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <TrailingInputFieldElement variant="dropdown" label="USD" aria-label="Select currency" />
            <TrailingInputFieldElement variant="dropdown" label="GMT" aria-label="Select timezone" />
          </div>
        </div>
      </div>
    );
  },
};
