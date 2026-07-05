import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DesktopProgressIndicator } from './DesktopProgressIndicator.js';

const meta: Meta<typeof DesktopProgressIndicator> = {
  title: 'Molecules/DesktopProgressIndicator',
  component: DesktopProgressIndicator,
  parameters: {
    docs: {
      description: {
        component:
          'A linear progress bar that communicates the completion of an ongoing or measured process. ' +
          '(Distinct from the 14×14 Progress Tracker donut used in mobile badges.)' +
          '\n\n' +
          '**Use for** determinate progress with a known percentage — not for indeterminate spinners or ' +
          'tiny inline indicators.' +
          '\n\n' +
          'Figma `7353:37255`. The three Types have **distinct layouts**: **Upload** — horizontal, green ' +
          'bar + a trailing `%` that becomes a green Check-Circle at 100% (no helper text); **Task** — ' +
          'vertical, green bar with a helper line beneath; **System Process** — vertical, **blue** bar ' +
          'with a helper line beneath (system-driven / background work). `role="progressbar"`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DesktopProgressIndicator>;

const frame = (node: ReactNode) => <div style={{ width: 320 }}>{node}</div>;

/* ============================================================================
 * Figma Type — Upload (horizontal; trailing % → green Check-Circle at 100%)
 * ========================================================================== */

export const Upload: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
      {frame(<DesktopProgressIndicator variant="upload" value={50} />)}
      {frame(<DesktopProgressIndicator variant="upload" value={100} />)}
    </div>
  ),
};

/* ============================================================================
 * Figma Type — Task (vertical; green bar + helper line)
 * ========================================================================== */

export const Task: Story = {
  render: () =>
    frame(<DesktopProgressIndicator variant="task" value={30} helperText="3 of 10 steps completed" />),
};

/* ============================================================================
 * Figma Type — System Process (vertical; blue bar + helper line)
 * ========================================================================== */

export const SystemProcess: Story = {
  render: () =>
    frame(
      <DesktopProgressIndicator
        variant="system-process"
        value={60}
        helperText="API usage: 60% of limit"
      />,
    ),
};

/* ============================================================================
 * Catalog — Type × Status (Figma 7353:37255)
 * Upload row shows %/check; Task & System Process rows show the helper line.
 * ========================================================================== */

const HELPER: Record<string, (v: number) => string> = {
  task: (v) => `${Math.round(v / 10)} of 10 steps completed`,
  'system-process': (v) => `API usage: ${v}% of limit`,
};
const TYPES = [
  { variant: 'upload', label: 'Upload' },
  { variant: 'task', label: 'Task' },
  { variant: 'system-process', label: 'System Process' },
] as const;
const STATUSES = [0, 50, 100];

export const Catalog: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Type × Status · Figma <code>7353:37255</code>
      </h2>
      {TYPES.map((t) => (
        <div
          key={t.variant}
          style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}
        >
          <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
            {t.label}
          </span>
          {STATUSES.map((s) => (
            <div key={s} style={{ width: 320 }}>
              <DesktopProgressIndicator
                variant={t.variant}
                value={s}
                helperText={HELPER[t.variant]?.(s)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
