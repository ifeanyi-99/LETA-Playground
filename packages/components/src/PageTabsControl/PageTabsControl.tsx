import * as React from 'react';
import { PageTab } from '../PageTab/PageTab.js';
import { WizardTab } from '../WizardTab/WizardTab.js';

export type PageTabsControlVariant = 'basic' | 'wizard';

/** A single tab within a Page Tabs Control. */
export interface PageTabsControlItem {
  /** Tab label text. */
  label: string;
  /** Step shown in the circle (wizard only). Defaults to the 1-based index. */
  step?: string | number;
  /** Wizard only — marks a future/unreached step (renders at 60% opacity). */
  inactive?: boolean;
}

export interface PageTabsControlProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** `basic` wraps PageTab; `wizard` wraps WizardTab (numbered step circles). */
  variant?: PageTabsControlVariant;
  /** The tabs to render, left to right. */
  tabs: PageTabsControlItem[];
  /** Index of the active tab. Controlled. */
  value: number;
  /** Fired with the clicked tab's index. */
  onChange: (index: number) => void;
}

/**
 * Page Tabs Control — a full-width horizontal tab bar for top-level navigation
 * between sections/pages, with a full-width demarcator line beneath the tabs.
 *
 * - **`basic`** (wraps {@link PageTab}) — navigate between page sections.
 * - **`wizard`** (wraps {@link WizardTab}) — sequential multi-step flow; each tab
 *   has a numbered step circle and an optional `inactive` (future-step) flag.
 *
 * **When NOT to use:** switching content layout (use Desktop Segment Control),
 * filtering (use Top Filter), or very large tab counts needing overflow scroll.
 *
 * Figma `3907:71981`. Data-driven: `value`/`onChange`. The active tab's 2px
 * indicator sits on the demarcator line (`--border-neutral-default`). Renders a
 * `<div role="tablist">`; each tab is `role="tab"` + `aria-selected`.
 */
export const PageTabsControl = React.forwardRef<HTMLDivElement, PageTabsControlProps>(
  function PageTabsControl(
    { variant = 'basic', tabs, value, onChange, className, style, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        role="tablist"
        className={className}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'clip',
          boxSizing: 'border-box',
          ...style,
        }}
        {...rest}
      >
        {/* Tab Container — 16px gap between tabs, 40px right padding (Figma) */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 'var(--spacing-16px)',
            paddingRight: 'var(--padding-40px)',
          }}
        >
          {tabs.map((tab, i) =>
            variant === 'wizard' ? (
              <WizardTab
                key={i}
                role="tab"
                aria-selected={i === value}
                label={tab.label}
                step={tab.step ?? i + 1}
                active={i === value}
                inactive={tab.inactive}
                onClick={() => onChange(i)}
              />
            ) : (
              <PageTab
                key={i}
                role="tab"
                aria-selected={i === value}
                label={tab.label}
                active={i === value}
                onClick={() => onChange(i)}
              />
            ),
          )}
        </div>
        {/* Demarcator — absolutely positioned at bottom (Figma z-index 1) */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            zIndex: 1,
            backgroundColor: 'var(--border-neutral-default)',
          }}
        />
      </div>
    );
  },
);
