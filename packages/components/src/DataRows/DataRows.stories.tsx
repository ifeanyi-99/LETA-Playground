import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataRows, type DataRowsVariant, type DataRowsState } from './DataRows.js';

/**
 * Data Rows (`4445:105200`) — one body row of a LETA data table: a flush run of
 * `Cell`s that read as a single, uniformly-coloured row. `variant` sets the
 * density (Basic 52px / Complex 80px); the row owns the interaction state
 * (Idle / Hover / Pressed / Active) and pushes it to every cell. Hover/pressed
 * are runtime; `selected` (Active) is caller-controlled; `state` forces a visual
 * state for these catalogs. Rows sit inside a bounded width (the table) so the
 * truncating cells clip.
 */
const meta: Meta<typeof DataRows> = {
  title: 'Organisms/Tables/Data Rows',
  component: DataRows,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof DataRows>;

const STATES: DataRowsState[] = ['idle', 'hover', 'pressed', 'active'];
const VARIANTS: DataRowsVariant[] = ['basic', 'complex'];

const Lab = ({ s }: { s: string }) => (
  <code style={{ fontSize: 10, color: 'var(--text-default-label-idle)' }}>{s}</code>
);

/** A bordered, fixed-width box standing in for the table the row lives in. */
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 1000, border: '1px solid var(--border-neutral-default)', borderRadius: 'var(--rounding-lg)', overflow: 'hidden' }}>
    {children}
  </div>
);

/** A representative row shown across all four interaction states. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      {STATES.map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Lab s={`complex · ${s}`} />
          <Frame>
            <DataRows variant="complex" state={s} />
          </Frame>
        </div>
      ))}
    </div>
  ),
};

/** Full matrix — both variants across all four states. */
export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'flex-start' }}>
      {VARIANTS.map((v) => (
        <div key={v} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Lab s={v} />
          <Frame>
            {STATES.map((s) => (
              <DataRows key={s} variant={v} state={s} />
            ))}
          </Frame>
        </div>
      ))}
    </div>
  ),
};
