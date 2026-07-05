import * as React from 'react';
import { Icon } from '@leta/icons';
import { ContentPrimitives } from '../ContentPrimitives/ContentPrimitives.js';
import { TableContainer } from '../TableContainer/TableContainer.js';
import { TableDataControl } from '../TableDataControl/TableDataControl.js';

export interface TableSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Section header title. Default "Title". */
  title?: string;
  /** Section header description. Default "Enter description here". */
  subtext?: string;
  /**
   * The table body — the Figma "Container" SLOT, a `Table-Container` instance.
   * Defaults to a `<TableContainer>` with a search/filter toolbar. Pass your own
   * `<TableContainer>` with real data, or any other content.
   */
  children?: React.ReactNode;
  /** Start expanded. Default true. */
  defaultOpen?: boolean;
  /**
   * Number of active filter rules. Forwarded to the default `TableContainer`'s
   * `TableDataControl`. Ignored when `children` is overridden. Default 0.
   */
  filterCount?: number;
}

/**
 * Table Section — a collapsible, titled table organism (Figma `4818:152180`,
 * variants **Open** / **Closed**). An edge-to-edge section (no card chrome) with a
 * Section-Heading Content Primitive (title + description + collapse chevron) over
 * the "Container" SLOT — a **`Table-Container` instance** (toolbar + table). No
 * group sub-header (the Table Container owns its own structure).
 *
 * Composes `ContentPrimitives` (section-heading) + `TableContainer`.
 *
 * **When to use:** a titled, collapsible table on a forms/lists-&-sections page.
 * **When not to use:** a standalone table without a section context (`TableContainer`).
 */
export const TableSection = React.forwardRef<HTMLDivElement, TableSectionProps>(
  function TableSection(
    {
      title = 'Title',
      subtext = 'Enter description here',
      children,
      defaultOpen = true,
      filterCount = 0,
      style,
      ...rest
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(defaultOpen);

    const chevron = (
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Collapse section' : 'Expand section'}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 0, padding: 0, cursor: 'pointer',
          color: 'var(--icons-neutral-default)',
        }}
      >
        <Icon name={open ? 'Chevron-Up' : 'Chevron-Down'} size={24} />
      </button>
    );

    return (
      <div
        ref={ref}
        className="leta-table-section"
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-12px)',
          width: '100%',
          ...style,
        }}
        {...rest}
      >
        <ContentPrimitives
          type="section-heading"
          text={title}
          subtext={subtext}
          showTrailingContent={true}
          showInteractiveElements={true}
          interactiveElements={chevron}
          showPassiveElements={false}
        />

        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24px)', width: '100%' }}>
            {children ?? (
              <TableContainer
                controls={<TableDataControl variant="search-column" showColumnControl={false} filterCount={filterCount} />}
              />
            )}
          </div>
        )}
      </div>
    );
  },
);
