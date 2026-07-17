import * as React from 'react';
import { ModalShell } from '../Modal/ModalShell.js';
import { ModalHeaders } from '../ModalHeaders/ModalHeaders.js';
import { FooterFrame } from '../FooterFrame/FooterFrame.js';
import { Button } from '../Button/Button.js';
import { ContentPrimitives } from '../ContentPrimitives/ContentPrimitives.js';
import { Table, type TableColumn, type TableRow } from '../Table/Table.js';
import { SearchInput } from '../SearchInput/SearchInput.js';
import { MapView } from '../MapView/MapView.js';

export interface ExtraLargeModalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Modal title. Default "Title". */
  title?: string;
  /** Left panel content (below the group heading). Default a search/filter toolbar + `<Table>`. */
  tableContent?: React.ReactNode;
  /** Right map-panel content. Default a live `<MapView>` (Leaflet/OpenStreetMap). */
  mapContent?: React.ReactNode;
  /** Map centre `[lat, lng]` for the default `<MapView>`. Default Nairobi. */
  mapCenter?: [number, number];
  /** Cancel label. Default "Cancel". */
  cancelLabel?: string;
  /** Confirm label. Default "Confirm". */
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  /** Header close handler. Falls back to `onCancel`. */
  onClose?: () => void;
}

/**
 * Six plain "Label" columns at a fixed, respectable width — the table scrolls
 * horizontally rather than shrinking cells (the row may hold many columns). The
 * 120px width shows the first 3 columns fully and cuts the **4th** column
 * mid-cell at the ~477px viewport edge (checkbox 52 + 3×120 = 412 → ~65px of the
 * 4th peeks), so partial "Content" signals the table is horizontally scrollable.
 */
const COLUMNS: TableColumn[] = Array.from({ length: 6 }, () => ({ label: 'Label', width: 120 }));
const ROW_CELLS = Array.from({ length: 6 }, () => ({ type: 'sample' as const }));
const ROWS: TableRow[] = Array.from({ length: 12 }, () => ({ cells: ROW_CELLS }));

/** The simplified left-panel table toolbar — Search + Filter (icon-only) + Sort (icon-only). */
function TableToolbar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'var(--spacing-8px)', width: '100%' }}>
      <SearchInput placeholder="Search here..." style={{ flex: 1, minWidth: 0 }} />
      <Button variant="secondary" size="medium" iconOnly="Filter" aria-label="Filter" />
      <Button variant="secondary" size="medium" iconOnly="Sort" aria-label="Sort" />
    </div>
  );
}

/**
 * Extra Large Modal (`7900:165088`) — a 1024×768 two-panel picker modal.
 * Shell = `ModalHeaders` (default) + a **horizontal** body + `FooterFrame`.
 * The body splits into a fixed 512px left **Panel** (a `section-heading`
 * `ContentPrimitives` + a simplified search/filter toolbar + a selectable
 * `Table`, with a right divider) and a filling right **Map Section** (a live
 * `MapView` — Leaflet/OpenStreetMap — with its built-in `MapZoomControl`).
 *
 * The table mirrors the modal's *modified* table instance — a plain
 * Search + Filter + Sort By toolbar over a selectable table of "Label"/"Content"
 * columns with the standard "Showing 10 of 180" pagination footer (no Created
 * filter, no top-filter chips, no status/actions columns).
 *
 * **When to use:** select rows while referencing a map (e.g. assigning orders
 * to a route).
 */
export const ExtraLargeModal = React.forwardRef<HTMLDivElement, ExtraLargeModalProps>(
  function ExtraLargeModal(
    {
      title = 'Title',
      tableContent,
      mapContent,
      mapCenter,
      cancelLabel = 'Cancel',
      confirmLabel = 'Confirm',
      onCancel,
      onConfirm,
      onClose,
      ...rest
    },
    ref,
  ) {
    return (
      <ModalShell
        ref={ref}
        width={1024}
        rounded
        role="dialog"
        aria-label={title}
        onEscape={onClose ?? onCancel}
        header={
          <ModalHeaders variant="default" title={title} onClose={onClose ?? onCancel} showSecondaryContent={false} />
        }
        footer={
          <FooterFrame variant="default">
            <Button variant="secondary" size="medium" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button variant="primary" size="medium" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </FooterFrame>
        }
        bodyHeight={608}
        bodyStyle={{ flexDirection: 'row', padding: 0, gap: 0, overflow: 'hidden' }}
      >
        {/* Left panel — group heading + toolbar + table, with a right-edge divider */}
        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            width: 512,
            flexShrink: 0,
            padding: '20px 16px',
            gap: 16,
            borderRight: 'var(--stroke-xs) solid var(--border-neutral-default)',
            overflow: 'hidden',
          }}
        >
          <ContentPrimitives
            type="section-heading"
            text="Group Name"
            subtext="Provide details for this group"
            showTrailingContent={false}
          />
          {tableContent ?? (
            <>
              <TableToolbar />
              <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
                <Table
                  columns={COLUMNS}
                  rows={ROWS}
                  selectable
                  scrollX
                  showPages={false}
                  style={{ flex: 1, minHeight: 0 }}
                />
              </div>
            </>
          )}
        </div>

        {/* Right panel — live map (MapView) with its built-in MapZoomControl */}
        <div style={{ position: 'relative', flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {mapContent ?? <MapView center={mapCenter} />}
        </div>
      </ModalShell>
    );
  },
);
