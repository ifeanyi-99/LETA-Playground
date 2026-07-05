import * as React from 'react';

export interface CarouselPaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Total number of pages. @default 3 */
  total?: number;
  /** Current page, 1-indexed. Must be in `[1, total]`. */
  current: number;
}

/**
 * Carousel Pagination — page-position indicator for mobile carousels.
 *
 * Figma `8667:15335` defines exactly 3 page variants; this component
 * generalises to any total. The active indicator is a 20×6 red pill;
 * inactive indicators are 6×6 gray circles. 8px gap.
 *
 * Non-interactive — the parent carousel handles page navigation.
 */
export const CarouselPagination = React.forwardRef<HTMLDivElement, CarouselPaginationProps>(
  function CarouselPagination({ total = 3, current, style, ...rest }, ref) {
    const clamped = Math.max(1, Math.min(total, current));
    const indicators = Array.from({ length: total }, (_, i) => i + 1);

    return (
      <div
        ref={ref}
        role="group"
        aria-label={`Page ${clamped} of ${total}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--spacing-8px)',
          ...style,
        }}
        {...rest}
      >
        {indicators.map((page) => {
          const isActive = page === clamped;
          return (
            <span
              key={page}
              aria-hidden
              style={{
                display: 'inline-block',
                width: isActive ? 20 : 6,
                height: 6,
                borderRadius: 'var(--rounding-round)',
                backgroundColor: isActive
                  ? 'var(--surface-primary-active-carousel-pagination)'
                  : 'var(--surface-neutral-inactive-carousel-pagination)',
                transition: 'width 200ms ease-out, background-color 200ms ease-out',
              }}
            />
          );
        })}
      </div>
    );
  },
);
