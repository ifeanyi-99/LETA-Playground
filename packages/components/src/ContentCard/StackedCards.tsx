import * as React from 'react';
import { ContentCard } from './ContentCard.js';

export interface StackedCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The stacked cards — typically `<ContentCard>`s. Defaults to two Content Cards. */
  children?: React.ReactNode;
}

/**
 * Stacked Cards — vertically stacks multiple Content Cards with a 16px gap. It has
 * no surface of its own (no fill/border); it just lays its children out in a column.
 * Pass `<ContentCard>`s (or anything) as `children`; the default is two Content Cards.
 *
 * Figma `2794:28551` ("Content Primitive Containers" → Stacked Cards).
 */
export const StackedCards = React.forwardRef<HTMLDivElement, StackedCardsProps>(function StackedCards(
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
        borderRadius: 'var(--rounding-xl)',
        ...style,
      }}
      {...rest}
    >
      {children ?? (
        <>
          <ContentCard />
          <ContentCard />
        </>
      )}
    </div>
  );
});
