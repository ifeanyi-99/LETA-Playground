import * as React from 'react';
import { SideBar } from '../SideBar/SideBar.js';
import { TopBar } from '../TopBar/TopBar.js';
import { Title } from '../Title/Title.js';
import { PageTabsControl, type PageTabsControlItem } from '../PageTabsControl/PageTabsControl.js';
import { NotificationBanner } from '../NotificationBanner/NotificationBanner.js';
import { TableContainer } from '../TableContainer/TableContainer.js';
import { Sidetab } from '../Sidetab/Sidetab.js';
import { ConfigurationCard } from '../ConfigurationCard/ConfigurationCard.js';
import type { SideBarGroup } from '../SideBar/SideBar.js';

export type PageVariant = 'data-table' | 'configuration';

/** The collapsed Side Bar nav as it appears on the Figma Page (8 + 5 icons). */
const SIDEBAR_GROUPS: SideBarGroup[] = [
  { items: [{ active: true }, {}, {}, {}, {}, {}, {}, {}] },
  { items: [{}, {}, {}, {}, {}] },
];

export interface PageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Which page layout to render (Figma `Type`):
   * - `data-table` — a Table Container (toolbar + table) page.
   * - `configuration` — a Sidetab nav beside a column of Configuration Cards.
   * Default `data-table`.
   */
  variant?: PageVariant;
  /** Page heading. Default "Heading 1". */
  heading?: string;
  /** Body override — replaces the variant's default page body (everything below the Top Bar). */
  children?: React.ReactNode;
  /**
   * Number of active filter rules. Forwarded to the default `data-table` variant's
   * `TableContainer`. Ignored when `children` is overridden or `variant` is
   * `configuration`. Default 0.
   */
  filterCount?: number;
}

const DEFAULT_TABS: PageTabsControlItem[] = Array.from({ length: 6 }, () => ({ label: 'Default' }));

/** The shared page-body header: Title + Page Tabs Control. */
function BodyHeader({ heading, tab, setTab }: { heading: string; tab: number; setTab: (i: number) => void }) {
  return (
    <>
      <Title text={heading} variant="page-dialog" style={{ flexShrink: 0 }} />
      <PageTabsControl variant="basic" tabs={DEFAULT_TABS} value={tab} onChange={setTab} style={{ flexShrink: 0 }} />
    </>
  );
}

/** The shared info Notification Banner shown under the tabs on every page. */
function PageBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <NotificationBanner type="info" variant="filled" title="Title" description="Enter Text" onDismiss={onDismiss} style={{ flexShrink: 0 }} />
  );
}

/**
 * Page (`9626:14490`) — a full desktop application page: a collapsed
 * {@link SideBar} rail beside a viewport of a {@link TopBar} and a scrolling body.
 * The body opens with a page Title and a {@link PageTabsControl}, then an info
 * {@link NotificationBanner}, then the variant's main content.
 *
 * Variants (Figma `Type`):
 * - **data-table** — a {@link TableContainer} (search/filter toolbar + table + pagination).
 * - **configuration** — a {@link Sidetab} nav beside a column of {@link ConfigurationCard}s.
 *
 * The Side Bar and Top Bar are fixed (sticky); only the page body scrolls.
 * Composition only — every region is an already-built organism / molecule.
 *
 * **When to use:** the top-level shell for a product screen.
 * **When NOT to use:** a modal/dialog flow (use the Templates) or a single
 * component in isolation.
 */
export const Page = React.forwardRef<HTMLDivElement, PageProps>(function Page(
  { variant = 'data-table', heading = 'Heading 1', children, filterCount = 0, style, ...rest },
  ref,
) {
  const [tab, setTab] = React.useState(0);
  const [dismissed, setDismissed] = React.useState(false);

  const body =
    children ??
    (variant === 'data-table' ? (
      <>
        <BodyHeader heading={heading} tab={tab} setTab={setTab} />
        {/* Container — fills the body; 16px bottom padding keeps the table within
            the viewport (Figma Container pad [0,0,16,0]). The TableContainer fills
            it so the table scrolls internally with its Pagination always visible. */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-16px)',
            paddingBottom: 'var(--padding-16px)',
          }}
        >
          {!dismissed && <PageBanner onDismiss={() => setDismissed(true)} />}
          <TableContainer fillHeight filterCount={filterCount} />
        </div>
      </>
    ) : (
      <>
        <BodyHeader heading={heading} tab={tab} setTab={setTab} />
        {!dismissed && <PageBanner onDismiss={() => setDismissed(true)} />}
        {/* Container — Sidetab (fixed) beside a scrolling Configuration column
            (Figma Container = Sidetab + Content/Scroll Frame, gap 60). */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'row', gap: 60 }}>
          <Sidetab style={{ flexShrink: 0, height: '100%' }} />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-16px)',
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <ConfigurationCard key={i} title="Text" description="Enter description here" enabled={false} />
            ))}
          </div>
        </div>
      </>
    ));

  return (
    <div
      ref={ref}
      className="leta-page"
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100dvh',
        backgroundColor: 'var(--surface-neutral-page-primary)',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {/* Collapsed Side Bar rail (72px, full height) */}
      <SideBar variant="collapsed" groups={SIDEBAR_GROUPS} style={{ flexShrink: 0 }} />

      {/* Viewport — Top Bar (fixed) + a viewport-filling body (no page scroll) */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flexShrink: 0 }}>
          <TopBar />
        </div>
        {/* Data/Config Page Body — Figma pad [24,24,0,24], gap 24. Fills the
            viewport and never scrolls itself; scrolling lives inside the table /
            config column so the page chrome stays put. */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-24px)',
            padding: '24px 24px 0',
            boxSizing: 'border-box',
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
});
