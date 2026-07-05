import * as React from 'react';

export interface PlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Centered label. Default "Placeholder". */
  label?: string;
  /** Min height of the box. Default 120. */
  minHeight?: number;
}

/**
 * A temporary visual stand-in for a not-yet-built component (a dashed neutral box
 * with a centered muted label). Used e.g. inside the Map search results panel in
 * place of the Desktop Menu Options list (`1531:5056`) until that component exists.
 * Swap out once the real component ships.
 */
export const Placeholder = React.forwardRef<HTMLDivElement, PlaceholderProps>(function Placeholder(
  { label = 'Placeholder', minHeight = 120, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        width: '100%',
        minHeight,
        padding: 'var(--padding-16px)',
        borderRadius: 'var(--rounding-lg)',
        border: 'var(--stroke-xs) dashed var(--border-neutral-default)',
        backgroundColor: 'transparent',
        ...style,
      }}
      {...rest}
    >
      <span className="text-label-m-regular" style={{ color: 'var(--text-default-label-idle)', textAlign: 'center' }}>
        {label}
      </span>
    </div>
  );
});
