import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileUpload } from './FileUpload.js';
import { FileUploadCard } from './FileUploadCard.js';

const meta: Meta<typeof FileUpload> = {
  title: 'Molecules/Form Controls/File Upload',
  component: FileUpload,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A drag-and-drop file upload zone (the `File Upload` type of Data Entry `38:42`, Desktop variant). ' +
          'Label + a dashed drop zone with a "Browse to upload" button + max-size hint; a hidden file input ' +
          'is triggered by Browse, and drag-drop is supported (`onFiles`). The Uploading / Uploaded states ' +
          'render a queue of `<FileUploadCard>`s in the `children` slot. (Figma has no disabled state; the ' +
          'mobile image-tile grid is the separate `MobileFileUpload` component.)',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof FileUpload>;

const QueueHeading = ({ children }: { children: React.ReactNode }) => (
  <span className="text-label-m-medium" style={{ color: 'var(--text-default-heading)' }}>{children}</span>
);
const Group = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8px)' }}>{children}</div>
);

/** Idle drop zone. */
export const Default: Story = {
  args: { label: 'Attach an image', tag: 'optional', onFiles: () => {} },
};

/** Uploading — drop zone + an in-progress card and a completed card. */
export const Uploading: Story = {
  render: () => (
    <FileUpload label="Attach an image" tag="optional" onFiles={() => {}}>
      <Group>
        <QueueHeading>Uploading (1)</QueueHeading>
        <FileUploadCard status="uploading" filename="filename.png" size="32MB" progress={50} onRemove={() => {}} />
      </Group>
      <Group>
        <QueueHeading>Uploaded (1)</QueueHeading>
        <FileUploadCard status="uploaded" filename="filename.png" size="32MB" onRemove={() => {}} />
      </Group>
    </FileUpload>
  ),
};

/** Uploaded — drop zone + two completed cards. */
export const Uploaded: Story = {
  render: () => (
    <FileUpload label="Attach an image" tag="optional" onFiles={() => {}}>
      <Group>
        <QueueHeading>Uploaded (2)</QueueHeading>
        <FileUploadCard status="uploaded" filename="filename.png" size="32MB" onRemove={() => {}} />
        <FileUploadCard status="uploaded" filename="filename.png" size="32MB" onRemove={() => {}} />
      </Group>
    </FileUpload>
  ),
};

/** Without a label. */
export const NoLabel: Story = {
  args: { showLabel: false, onFiles: () => {} },
};
