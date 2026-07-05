import * as React from 'react';
import { Icon } from '@leta/icons';
import { ContentPrimitives } from '../ContentPrimitives/ContentPrimitives.js';
import { InputField, type InputFieldProps } from '../InputField/InputField.js';

const DASHED = 'var(--stroke-xs) dashed var(--border-neutral-default)';

/** A dashed horizontal rule separating Input Groups (Figma "Demarcator"). */
export function FormDemarcator({ style, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" aria-orientation="horizontal" style={{ width: '100%', height: 0, borderTop: DASHED, ...style }} {...rest} />;
}

export interface InputGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Group sub-header title (Figma group-header). Default "Group Name". */
  title?: string;
  /** Group sub-header description. Default "Provide details for this group". */
  description?: string;
  /**
   * Fields laid out in a wrapping 2-column grid (col gap 32, row gap 20). Each is an
   * `<InputField>`; defaults to a basic field (label "Label Text", placeholder
   * "Field Text", helper hidden), mirroring the Figma instance config. Default 8 fields.
   */
  fields?: InputFieldProps[];
  /** Trailing content on the group header (the group-header's interactive/passive slot). */
  headerTrailing?: React.ReactNode;
  /** Replace the group header entirely. */
  header?: React.ReactNode;
  /** Replace the field grid entirely (overrides `fields`). */
  children?: React.ReactNode;
}

const DEFAULT_FIELDS: InputFieldProps[] = Array.from({ length: 8 }, () => ({
  variant: 'basic', label: 'Label Text', placeholder: 'Field Text', showHelper: false,
}));

/**
 * Input Group — one titled cluster within an {@link InputSection}: a `group-header`
 * Content Primitive over a responsive 2-column grid of `InputField`s. Each field
 * fills its column and the grid wraps to one column when the container is narrow.
 */
export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  { title = 'Group Name', description = 'Provide details for this group', fields = DEFAULT_FIELDS, headerTrailing, header, children, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20px)', width: '100%', boxSizing: 'border-box', ...style }}
      {...rest}
    >
      {header ?? (
        <ContentPrimitives
          type="group-header"
          text={title}
          subtext={description}
          showSubtext={false}
          showVisualAnchor={false}
          showTrailingContent={!!headerTrailing}
          showInteractiveElements={!!headerTrailing}
          interactiveElements={headerTrailing}
        />
      )}
      {children ?? (
        <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 'var(--spacing-32px)', rowGap: 'var(--spacing-20px)', width: '100%' }}>
          {fields.map((f, i) => (
            <div key={i} style={{ flex: '1 1 calc(50% - (var(--spacing-32px) / 2))', minWidth: 240 }}>
              <InputField {...f} style={{ width: '100%', ...f.style }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export interface InputSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Section header title. Default "Text". */
  title?: string;
  /** Section header description. Default "Enter description here". */
  description?: string;
  /** Render the trailing collapse chevron. Default true. */
  showChevron?: boolean;
  /**
   * Start expanded (Figma `Open` variant). Default `true`. When collapsed
   * (`Close` variant) only the section header renders; the chevron toggles it.
   */
  defaultOpen?: boolean;
  /**
   * Controlled-toggle hook. When provided, the chevron calls this instead of
   * managing collapse internally — the caller drives `defaultOpen`.
   */
  onToggle?: () => void;
  /** Replace the section header entirely. */
  header?: React.ReactNode;
  /**
   * The form body — the Figma "Forms" SLOT (a vertical, 24px-gap stack). Provide
   * `<InputGroup>`s; a dashed demarcator is auto-inserted between adjacent children.
   * Defaults to two Input Groups, mirroring Figma.
   */
  children?: React.ReactNode;
}

/**
 * Input Section — a titled, collapsible, multi-group form organism (Figma
 * component set `10557:36087`, variants **Open** / **Close**). A section header
 * (title + description + collapse chevron) sits above the "Forms" slot: a vertical
 * stack of {@link InputGroup}s, each a `group-header` over a 2-column grid of
 * `InputField`s, separated by dashed demarcators.
 *
 * The chevron collapses the section like {@link ListSection} — **Open** shows the
 * header + Forms with a `Chevron-Up`; **Close** shows the header only with a
 * `Chevron-Down`.
 *
 * Composes `ContentPrimitives` (group-header) + `InputField`. The form body is the
 * Figma "Forms" SLOT, exposed as `children`; the default mirrors Figma (two groups).
 *
 * **When to use:** a structured, grouped form within a page or dialog.
 * **When not to use:** a single field (`InputField`), a few related fields
 * (`GroupedInput`), or tabular data (`Table`).
 */
export const InputSection = React.forwardRef<HTMLDivElement, InputSectionProps>(function InputSection(
  { title = 'Text', description = 'Enter description here', showChevron = true, defaultOpen = true, onToggle, header, children, style, ...rest },
  ref,
) {
  const [open, setOpen] = React.useState(defaultOpen);

  const chevron = showChevron ? (
    <button
      type="button"
      onClick={() => (onToggle ? onToggle() : setOpen(o => !o))}
      aria-label={open ? 'Collapse section' : 'Expand section'}
      aria-expanded={open}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'var(--icons-neutral-default)' }}
    >
      <Icon name={open ? 'Chevron-Up' : 'Chevron-Down'} size={24} />
    </button>
  ) : undefined;

  // Interleave a dashed demarcator between adjacent form children.
  const items = React.Children.toArray(children ?? [<InputGroup key="g1" />, <InputGroup key="g2" />]);
  const body: React.ReactNode[] = [];
  items.forEach((child, i) => {
    if (i > 0) body.push(<FormDemarcator key={`d${i}`} />);
    body.push(child);
  });

  return (
    <div
      ref={ref}
      className="leta-input-section"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12px)', width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--surface-neutral-bg-default)', ...style }}
      {...rest}
    >
      {/* Section header — a Section-Heading Content Primitive (Figma `Type: Section Heading`),
          consistent with List Section / Table Section. The chevron is its trailing slot. */}
      {header ?? (
        <ContentPrimitives
          type="section-heading"
          text={title}
          subtext={description}
          showTrailingContent={showChevron}
          showInteractiveElements={showChevron}
          interactiveElements={chevron}
          showPassiveElements={false}
        />
      )}

      {/* "Forms" SLOT — vertical 24px-gap stack of Input Groups + dashed demarcators.
          Hidden when collapsed (Figma's Close variant = header only). */}
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24px)', width: '100%' }}>
          {body}
        </div>
      )}
    </div>
  );
});
