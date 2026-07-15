import * as React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Block width — a number is treated as px, any other value is passed through as CSS (e.g. `'100%'`). Default `'100%'`. */
  width?: number | string;
  /** Block height — a number is treated as px, any other value is passed through as CSS. Default `16`. */
  height?: number | string;
  /** Corner radius — a number is treated as px, any other value is passed through as CSS. Default `--rounding-lg`. */
  borderRadius?: number | string;
}

const STYLE_ID = 'leta-skeleton-styles';
// Base/highlight are the same neutral pairing already used for other muted/disabled
// surfaces (`--surface-neutral-bg-muted` — FeaturedIcon/WizardTab/FileUploadCard's
// muted state; `--surface-disabled-input-field` — InputField/Select/TextArea's
// disabled state), one step lighter on the neutral scale (150 → 100) — reused here
// rather than introducing a new pairing, per the design-token convention of picking
// an existing semantic token over a raw color-scale value.
const STYLES = `
@keyframes leta-skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.leta-skeleton {
  background-image: linear-gradient(
    90deg,
    var(--surface-neutral-bg-muted) 0%,
    var(--surface-neutral-bg-muted) 37.5%,
    var(--surface-disabled-input-field) 50%,
    var(--surface-neutral-bg-muted) 62.5%,
    var(--surface-neutral-bg-muted) 100%
  );
  background-size: 200% 100%;
  animation: leta-skeleton-shimmer 1.5s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .leta-skeleton { animation: none; background-image: none; background-color: var(--surface-neutral-bg-muted); }
}
`;
function ensureSkeletonStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = STYLES;
  document.head.appendChild(el);
}

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * Skeleton — a shimmering placeholder rectangle for loading states, used
 * anywhere real content isn't ready yet (starting with table rows). Purely
 * presentational: compose several into whatever shape the loading content will
 * take (a table-row arrangement, a card, a list) — see `TableContainer`'s
 * `Loading` story for a worked example.
 *
 * The shimmer is a `background-position` sweep across a static gradient
 * (`--surface-neutral-bg-muted` base, `--surface-disabled-input-field`
 * highlight), 1.5s ease-in-out, looping — `prefers-reduced-motion: reduce`
 * drops to a static muted block.
 *
 * `aria-hidden` by default (it's decorative filler, not content); the loading
 * region it sits within should carry the real `role="status"`/`aria-live`.
 *
 * **When to use:** a region that will shortly hold real content of a known
 * shape (a table row, a card). **When not to use:** an indeterminate,
 * whole-page "please wait" — use `LoadingOverlay` for that (Loading pattern:
 * first load with nothing to show yet → `LoadingOverlay`; a subsequent update
 * to already-visible content — filter, sort, tab switch, refresh → `Skeleton`
 * rows only, no scrim, the rest of the page stays usable).
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { width = '100%', height = 16, borderRadius = 'var(--rounding-lg)', className, style, ...rest },
  ref,
) {
  ensureSkeletonStyles();
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={['leta-skeleton', className].filter(Boolean).join(' ')}
      style={{
        width: toCssSize(width),
        height: toCssSize(height),
        borderRadius: toCssSize(borderRadius),
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    />
  );
});
