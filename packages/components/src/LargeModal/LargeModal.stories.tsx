import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LargeModal } from './LargeModal.js';

/**
 * Large Modal (`228:11413`) — 768px-wide modal. Drawer variants are square,
 * **full viewport height** side-sheets (sticky header/footer, scrolling body)
 * with a `with-tabs` header; Centered is rounded (768×768) with a default header.
 * All use the `preference` footer.
 */
const meta: Meta<typeof LargeModal> = {
  title: 'Templates/Large Modal',
  component: LargeModal,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof LargeModal>;

const pad = (el: React.ReactNode) => <div style={{ padding: 24 }}>{el}</div>;

/** Single Column Form — square full-height side-sheet, tabs header, one column of Input Sections (short forms). */
export const SingleColumnForm: Story = {
  name: 'Single Column Form',
  render: () => <LargeModal variant="single-column-form" title="Add entity" />,
};

/** Dual Column Form — two columns of Input Sections split by a vertical demarcator (long forms, 2+ groups). */
export const DualColumnForm: Story = {
  name: 'Dual Column Form',
  render: () => <LargeModal variant="dual-column-form" title="Add entity" />,
};

/** Drawer (Read) — square full-height side-sheet, tabs header, stacked List Sections. */
export const DrawerRead: Story = {
  name: 'Drawer (Read)',
  render: () => <LargeModal variant="drawer-read" title="Details" />,
};

/** Centered / Regular — rounded, default header, Input Section + Table Section. */
export const Centered: Story = {
  render: () => pad(<LargeModal variant="centered" title="Configure" />),
};

/** All four variants. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start', padding: 24, height: '100vh', boxSizing: 'border-box' }}>
      <LargeModal variant="single-column-form" title="Add entity" />
      <LargeModal variant="dual-column-form" title="Add entity" />
      <LargeModal variant="drawer-read" title="Details" />
      <LargeModal variant="centered" title="Configure" />
    </div>
  ),
};
