import * as React from 'react';
import { ContentPrimitives } from '../ContentPrimitives/ContentPrimitives.js';
import { AccordionHeader, AccordionChevron, AccordionContent, useAccordion } from '../AccordionBehaviour/AccordionBehaviour.js';

const DASHED = 'var(--stroke-xs) dashed var(--border-neutral-default)';

/** A dashed horizontal rule separating List Groups inside a List Section. */
function ListDemarcator() {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      style={{ width: '100%', height: 0, borderTop: DASHED }}
    />
  );
}

export interface ListItemData {
  /** Primary label — maps to CP `text`. */
  label: string;
  /** Secondary value / description — maps to CP `subtext`. */
  value?: string;
  /** Show the leading visual-anchor (help icon). Default true, per Figma. */
  showAnchor?: boolean;
}

export interface ListGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Group sub-header title (Figma `group-header` CP). Default "Group Name". */
  title?: string;
  /** Group sub-header description. Default "Enter description here". */
  description?: string;
  /**
   * List items rendered in a 2-column grid (gap 16 horizontal, gap 20 vertical).
   * Each item is a `ContentPrimitives type="vertical-list-row"`. Default 6 items.
   */
  items?: ListItemData[];
  /** Replace the item grid entirely. */
  children?: React.ReactNode;
}

const DEFAULT_ITEMS: ListItemData[] = Array.from({ length: 6 }, () => ({
  label: 'Text',
  value: 'Enter Description here',
}));

/**
 * List Group — one titled cluster within a {@link ListSection}: a `group-header`
 * Content Primitive over a 2-column grid of `vertical-list-row` Content Primitives.
 */
export const ListGroup = React.forwardRef<HTMLDivElement, ListGroupProps>(
  function ListGroup(
    { title = 'Group Name', description = 'Enter description here', items = DEFAULT_ITEMS, children, style, ...rest },
    ref,
  ) {
    // Pair items into rows of 2
    const rows: ListItemData[][] = [];
    for (let i = 0; i < items.length; i += 2) {
      rows.push(items.slice(i, i + 2));
    }

    return (
      <div
        ref={ref}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20px)', width: '100%', ...style }}
        {...rest}
      >
        <ContentPrimitives
          type="group-header"
          text={title}
          subtext={description}
          showSubtext={false}
          showVisualAnchor={false}
          showTrailingContent={false}
          showPassiveElements={false}
          showInteractiveElements={false}
        />
        {children ?? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20px)', width: '100%' }}>
            {rows.map((pair, rowIdx) => (
              <div key={rowIdx} style={{ display: 'flex', gap: 'var(--spacing-16px)', width: '100%' }}>
                {pair.map((item, colIdx) => (
                  <ContentPrimitives
                    key={colIdx}
                    type="vertical-list-row"
                    text={item.label}
                    subtext={item.value}
                    showVisualAnchor={item.showAnchor ?? true}
                    showTrailingContent={false}
                    showInteractiveElements={false}
                    showPassiveElements={true}
                    style={{ flex: '1 0 0', minWidth: 0 }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

export interface ListSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Section header title. Default "Title". */
  title?: string;
  /** Section header description. Default "Enter description here". */
  subtext?: string;
  /**
   * The list body — the Figma "Content" SLOT (vertical 24px-gap stack). Provide
   * `<ListGroup>`s; a dashed demarcator is auto-inserted between adjacent children.
   * Defaults to two List Groups, mirroring Figma.
   */
  children?: React.ReactNode;
  /** Start expanded. Default true. */
  defaultOpen?: boolean;
}

/**
 * List Section — a collapsible, titled read-only list organism (Figma `217:6694`).
 * A white card (border, `--rounding-xl`, 20px padding) with a section header
 * (title + description + collapse chevron) over the "Content" SLOT: a vertical
 * stack of {@link ListGroup}s separated by dashed demarcators.
 *
 * Composes `ContentPrimitives` (section-heading, group-header, vertical-list-row).
 *
 * **When to use:** a grouped, read-only key-value information panel on a page.
 * **When not to use:** editable fields (`InputSection`), tabular data (`TableSection`).
 */
export const ListSection = React.forwardRef<HTMLDivElement, ListSectionProps>(
  function ListSection(
    { title = 'Title', subtext = 'Enter description here', children, defaultOpen = true, style, ...rest },
    ref,
  ) {
    const { open, toggle } = useAccordion(defaultOpen);

    // Auto-insert dashed demarcators between adjacent children
    const items = React.Children.toArray(children ?? [<ListGroup key="g1" />, <ListGroup key="g2" />]);
    const body: React.ReactNode[] = [];
    items.forEach((child, i) => {
      if (i > 0) body.push(<ListDemarcator key={`d${i}`} />);
      body.push(child);
    });

    return (
      <div
        ref={ref}
        className="leta-list-section"
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          width: '100%',
          backgroundColor: 'var(--surface-neutral-bg-default)',
          borderRadius: 'var(--rounding-xl)',
          boxShadow: `inset 0 0 0 var(--stroke-xs) var(--border-neutral-default)`,
          padding: 'var(--padding-20px)',
          ...style,
        }}
        {...rest}
      >
        <AccordionHeader open={open} onToggle={toggle}>
          <ContentPrimitives
            type="section-heading"
            text={title}
            subtext={subtext}
            showTrailingContent={true}
            showInteractiveElements={true}
            interactiveElements={<AccordionChevron open={open} onToggle={toggle} />}
            showPassiveElements={false}
          />
        </AccordionHeader>
        <AccordionContent open={open} gap="var(--spacing-24px)">
          {body}
        </AccordionContent>
      </div>
    );
  },
);
