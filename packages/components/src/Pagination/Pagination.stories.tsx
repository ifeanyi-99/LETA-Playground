import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from './Pagination.js';

const meta: Meta<typeof Pagination> = {
  title: 'Molecules/Pagination',
  component: Pagination,
  parameters: {
    docs: {
      description: {
        component:
          'Navigation for moving through paged data sets, in the layout that fits its host surface.' +
          '\n\n' +
          '**Use below** tables, lists, or comboboxes with more results than fit one view — not for ' +
          'step-through wizards (use Page Tabs Control / Stepper) or carousels (use Carousel Pagination).' +
          '\n\n' +
          'Figma `7292:86007`. **Table** — count + page-number controls + rows-per-page selector; ' +
          '**Stacked List** — same controls, condensed; **Combobox** — compact count + prev/next only. ' +
          'Data-driven (`page` / `pageCount` / `onPageChange`); the page cell is a 32×32 numbered button.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

/* ============================================================================
 * Figma variant — Table (count + page controls + rows-per-page)
 * ========================================================================== */

export const Table: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <div style={{ width: 856 }}>
        <Pagination
          variant="table"
          page={page}
          pageCount={18}
          onPageChange={setPage}
          countLabel="Showing 10 of 180"
          rowsPerPage={10}
        />
      </div>
    );
  },
};

/* ============================================================================
 * Figma variant — Combobox (compact: count + prev/next)
 * ========================================================================== */

export const Combobox: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        variant="combobox"
        page={page}
        pageCount={1}
        onPageChange={setPage}
        countLabel="1 - 10 of 10"
      />
    );
  },
};

/* ============================================================================
 * Figma variant — Stacked List (condensed controls)
 * ========================================================================== */

export const StackedList: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <div style={{ width: 856 }}>
        <Pagination
          variant="stacked-list"
          page={page}
          pageCount={18}
          onPageChange={setPage}
          countLabel="Showing 10 of 180"
          rowsPerPage={10}
        />
      </div>
    );
  },
};

/* ============================================================================
 * Catalog — all three variants (Figma 7292:86007)
 * ========================================================================== */

export const Catalog: Story = {
  render: () => {
    const [a, setA] = useState(3);
    const [b, setB] = useState(1);
    const [c, setC] = useState(5);
    const caption = { color: 'var(--text-default-helper)' } as const;
    const Row = ({ label, children }: { label: string; children: ReactNode }) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', width: 856 }}>
        <span className="text-label-s-regular" style={caption}>
          {label}
        </span>
        {children}
      </div>
    );
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
        <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
          Pagination · Figma <code>7292:86007</code>
        </h2>
        <Row label="Table">
          <Pagination variant="table" page={a} pageCount={18} onPageChange={setA} countLabel="Showing 10 of 180" rowsPerPage={10} />
        </Row>
        <Row label="Stacked List">
          <Pagination variant="stacked-list" page={c} pageCount={18} onPageChange={setC} countLabel="Showing 10 of 180" rowsPerPage={10} />
        </Row>
        <Row label="Combobox">
          <Pagination variant="combobox" page={b} pageCount={1} onPageChange={setB} countLabel="1 - 10 of 10" />
        </Row>
      </div>
    );
  },
};
