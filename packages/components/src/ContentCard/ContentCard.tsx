import * as React from 'react';
import { ContentPrimitives } from '../ContentPrimitives/ContentPrimitives.js';
import { Button } from '../Button/Button.js';

export interface ContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The card body — any content block, typically a `ContentPrimitives`. Maps to
   * the Figma `Container` slot. Defaults to a Utility primitive (title + subtext +
   * a trailing "Dispatch" Secondary button), mirroring Figma's default instance.
   */
  children?: React.ReactNode;
}

/**
 * Content Card — a plain bordered surface that wraps a single content block. It's
 * the generic "card chrome" you drop a Content Primitive into: a white card with a
 * 1px neutral border, 12px corners, and 20px padding (no shadow).
 *
 * The Figma `Container` slot is the `children` prop, laid out in a vertical
 * 16px-gap, full-width column. Pass any content (a `ContentPrimitives` of any type,
 * or your own markup); the default is a Utility primitive with a "Dispatch" action.
 *
 * **When to use:** to present a content block (Utility / Metrics / List-Row /
 * Progress primitive) on its own card surface.
 * **When NOT:** for selectable choices (use Option Card), KPI tiles (use Metric
 * Card), or toggleable sections (use Configuration Card).
 *
 * Figma `9896:25095` ("Content Primitive Containers" → Content Card).
 */
export const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(function ContentCard(
  { children, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        boxSizing: 'border-box',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-16px)',
        padding: 'var(--padding-20px)',
        borderRadius: 'var(--rounding-xl)',
        border: 'var(--stroke-xs) solid var(--border-neutral-default)',
        backgroundColor: 'var(--surface-neutral-bg-default)',
        ...style,
      }}
      {...rest}
    >
      {children ?? (
        <ContentPrimitives
          type="utility"
          text="Text"
          subtext="Enter description here"
          showVisualAnchor={false}
          showInteractiveElements
          interactiveElements={<Button variant="secondary" size="medium">Dispatch</Button>}
        />
      )}
    </div>
  );
});
