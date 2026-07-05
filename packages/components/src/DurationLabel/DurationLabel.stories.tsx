import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DurationLabel, type DurationLabelStatus } from './DurationLabel.js';

/**
 * Duration Labels (`4445:107943`) — a compact inline duration/status label.
 * Finished pairs a status icon with greyed time (completed); Active colours the
 * live time by status. Composed by the Cell's `duration` type.
 */
const meta: Meta<typeof DurationLabel> = {
  title: 'Molecules/Table Cells/Duration Labels',
  component: DurationLabel,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof DurationLabel>;

const Lab = ({ s }: { s: string }) => (
  <code style={{ fontSize: 10, color: 'var(--text-default-label-idle)' }}>{s}</code>
);
const Col = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>{children}</div>
);

export const Finished: Story = {
  render: () => (
    <Col>
      <div><Lab s="on-target" /><DurationLabel variant="finished" status="on-target" time="1h 24m 12s" /></div>
      <div><Lab s="delayed" /><DurationLabel variant="finished" status="delayed" time="2h 05m 47s" /></div>
    </Col>
  ),
};

export const Active: Story = {
  render: () => (
    <Col>
      <div><Lab s="on-target" /><DurationLabel variant="active" status="on-target" time="0h 12m 03s" /></div>
      <div><Lab s="at-risk" /><DurationLabel variant="active" status="at-risk" time="0h 48m 19s" /></div>
      <div><Lab s="delayed" /><DurationLabel variant="active" status="delayed" time="1h 11m 56s" /></div>
    </Col>
  ),
};

export const Catalog: Story = {
  render: () => {
    const rows: Array<[string, React.ReactNode]> = [
      ['finished · on-target', <DurationLabel variant="finished" status="on-target" />],
      ['finished · delayed', <DurationLabel variant="finished" status="delayed" />],
      ['active · on-target', <DurationLabel variant="active" status="on-target" />],
      ['active · at-risk', <DurationLabel variant="active" status="at-risk" />],
      ['active · delayed', <DurationLabel variant="active" status="delayed" />],
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        {rows.map(([label, node]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Lab s={label} />
            {node}
          </div>
        ))}
      </div>
    );
  },
};
