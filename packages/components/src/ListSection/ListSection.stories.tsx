import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListSection, ListGroup, type ListItemData } from './ListSection.js';

/**
 * List Section (`217:6694`) — a collapsible white card with a section header
 * (title + description + collapse chevron) over a vertical stack of List Groups,
 * each showing a group sub-header and a 2-column grid of read-only key-value rows.
 * Dashed demarcators separate adjacent groups.
 */
const meta: Meta<typeof ListSection> = {
  title: 'Organisms/Forms/List Section',
  component: ListSection,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ListSection>;

const SAMPLE_ITEMS: ListItemData[] = [
  { label: 'First Name', value: 'John' },
  { label: 'Last Name', value: 'Doe' },
  { label: 'Email', value: 'john.doe@example.com' },
  { label: 'Phone', value: '+1 555 0100' },
  { label: 'City', value: 'Lagos' },
  { label: 'Country', value: 'Nigeria' },
];

/** Open state — two List Groups with key-value rows and a dashed demarcator. */
export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 864 }}>
      <ListSection title="Personal Details" subtext="Contact and location information" />
    </div>
  ),
};

/** Collapsed — only the section header is visible. */
export const Closed: Story = {
  render: () => (
    <div style={{ maxWidth: 864 }}>
      <ListSection title="Personal Details" subtext="Contact and location information" defaultOpen={false} />
    </div>
  ),
};

/** Single group with labelled data. */
export const SingleGroup: Story = {
  render: () => (
    <div style={{ maxWidth: 864 }}>
      <ListSection title="Account Details" subtext="Profile and account configuration">
        <ListGroup title="Contact Info" description="Primary contact details" items={SAMPLE_ITEMS} />
      </ListSection>
    </div>
  ),
};

/** Both Open and Closed states. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 864 }}>
      <ListSection title="Open" subtext="Expanded section with two groups" />
      <ListSection title="Closed" subtext="Collapsed — only the header is visible" defaultOpen={false} />
    </div>
  ),
};
