import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs } from './Breadcrumbs.js';
import { Button } from '../Button/Button.js';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Molecules/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    docs: {
      description: {
        component:
          'A horizontal trail showing the user’s location in a hierarchy, with each ancestor a ' +
          'link back up the tree and the current page as a non-interactive endpoint.' +
          '\n\n' +
          '**Use on** pages nested ≥2 levels deep for orientation + up-navigation — not for flat ' +
          'hierarchies or as primary navigation.' +
          '\n\n' +
          'Figma `9108:33624`. **Nested** — in-section trail, Small link crumbs; **Global Client** — ' +
          'client-app wayfinding rooted at a company chip; **Global Admin** — admin wayfinding whose ' +
          'root is a Plain split button (Company + name + Stepper) that opens a client-switcher dropdown. ' +
          'Data-driven (`items` + `current`); renders semantic `<nav><ol><li>` with `aria-current="page"`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

const items = [
  { label: 'Previous Page', onClick: () => {} },
  { label: 'Previous Page', onClick: () => {} },
];

/* ============================================================================
 * Figma variant — Nested
 * ========================================================================== */
export const Nested: Story = {
  args: {
    type: 'nested',
    items,
    current: 'Current Page',
  },
};

/* ============================================================================
 * Figma variant — Global Client (company chip root)
 * ========================================================================== */
export const GlobalClient: Story = {
  args: {
    type: 'global-client',
    client: 'Acme Corp',
    items: [{ label: 'Previous Page', onClick: () => {} }],
    current: 'Current Page',
  },
};

/* ============================================================================
 * Figma variant — Global Admin (client-switcher split-button root)
 * ========================================================================== */
export const GlobalAdmin: Story = {
  args: {
    type: 'global-admin',
    client: 'Acme Corp',
    onClientClick: () => {},
    items: [{ label: 'Previous Page', onClick: () => {} }],
    current: 'Current Page',
  },
};

/* ============================================================================
 * Content slot — caller-injected trail (Figma `Nested/Global Client/Global
 * Admin Content` SLOT). `children` replaces the data-driven trail.
 * ========================================================================== */
export const ContentSlot: Story = {
  name: 'Content Slot (children)',
  render: () => (
    <Breadcrumbs>
      <Button variant="plain" size="small" showUnderline={false} onClick={() => {}}>Workspace</Button>
      <span className="text-label-m-regular" style={{ color: 'var(--text-default-label-idle)' }} aria-hidden>/</span>
      <Button variant="plain" size="small" showUnderline={false} onClick={() => {}}>Projects</Button>
      <span className="text-label-m-regular" style={{ color: 'var(--text-default-label-idle)' }} aria-hidden>/</span>
      <span className="text-label-s-semibold" style={{ color: 'var(--text-default-label-idle)' }} aria-current="page">Custom Page</span>
    </Breadcrumbs>
  ),
};

/* ============================================================================
 * Catalog — all three variants stacked
 * ========================================================================== */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
      <Breadcrumbs type="nested" items={items} current="Current Page" />
      <Breadcrumbs
        type="global-client"
        client="Acme Corp"
        items={[{ label: 'Previous Page' }]}
        current="Current Page"
      />
      <Breadcrumbs
        type="global-admin"
        client="Acme Corp"
        onClientClick={() => {}}
        items={[{ label: 'Previous Page' }]}
        current="Current Page"
      />
    </div>
  ),
};
