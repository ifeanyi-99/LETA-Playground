import * as React from 'react';

export interface ProgressTrackerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Progress value, 0-100. Clamped at the bounds. */
  value: number;
}

/**
 * Progress Tracker — 14×14 circular progress indicator (Figma `5608:216176`).
 *
 * A gray track ring with a green arc showing completion percentage. Figma
 * defines 4 discrete variants (10 / 50 / 75 / 100 %); this React component
 * generalises to any `value` in `[0, 100]`.
 *
 * Used as the leading indicator inside the Progress Badge variant of
 * MobileBadge.
 */
export const ProgressTracker = React.forwardRef<HTMLSpanElement, ProgressTrackerProps>(
  function ProgressTracker({ value, style, ...rest }, ref) {
    const clamped = Math.max(0, Math.min(100, value));
    /* SVG geometry: 14×14 viewBox, radius chosen so a 2px stroke fits inside
     * the bounding box (r = 6 → outer edge 7 ± 1px stroke ≈ 7 ± 1 = 6..8). */
    const r = 6;
    const c = 2 * Math.PI * r;
    const dash = (clamped / 100) * c;

    return (
      <span
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        style={{
          display: 'inline-flex',
          width: 14,
          height: 14,
          flexShrink: 0,
          ...style,
        }}
        {...rest}
      >
        <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden>
          {/* Track */}
          <circle
            cx={7}
            cy={7}
            r={r}
            fill="none"
            stroke="var(--surface-neutral-progress-bar-track)"
            strokeWidth={2}
          />
          {/* Progress arc — starts at 12 o'clock, sweeps clockwise */}
          {clamped > 0 && (
            <circle
              cx={7}
              cy={7}
              r={r}
              fill="none"
              stroke="var(--surface-success-task-progress-bar)"
              strokeWidth={2}
              strokeDasharray={`${dash} ${c}`}
              strokeLinecap="round"
              transform="rotate(-90 7 7)"
            />
          )}
        </svg>
      </span>
    );
  },
);
