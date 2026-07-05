import * as React from 'react';
import { Icon } from '@leta/icons';
import type { IconName } from '@leta/icons';

export type FeaturedIconColor = 'information' | 'highlight' | 'error' | 'success' | 'neutral' | 'warning';
export type FeaturedIconSize  = 'medium' | 'large';

export interface FeaturedIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Any icon from @leta/icons. */
  icon: IconName;
  /**
   * Semantic color variant — controls background tint and icon tint.
   * Maps directly to Figma's "Property 1" variant property.
   */
  color: FeaturedIconColor;
  /**
   * Size variant.
   * - medium: 32 × 32 px container, 16 px icon
   * - large:  44 × 44 px container, 20 px icon
   * @default 'medium'
   */
  size?: FeaturedIconSize;
}

const BG: Record<FeaturedIconColor, string> = {
  information: 'var(--surface-information-bg-subtle)',
  highlight:   'var(--surface-highlight-bg-subtle)',
  error:       'var(--surface-error-bg-subtle)',
  success:     'var(--surface-success-bg-subtle)',
  neutral:     'var(--surface-neutral-bg-muted)',
  warning:     'var(--surface-warning-bg-subtle)',
};

const ICON_COLOR: Record<FeaturedIconColor, string> = {
  information: 'var(--icons-information-default)',
  highlight:   'var(--icons-highlight-default)',
  error:       'var(--icons-error-default)',
  success:     'var(--icons-success-default)',
  neutral:     'var(--icons-neutral-default)',
  warning:     'var(--icons-warning-default)',
};

/** CSS variable for the outer container dimension per size. */
const CONTAINER_SIZE: Record<FeaturedIconSize, string> = {
  medium: 'var(--featured-icon-container-medium)', // 32px
  large:  'var(--featured-icon-container-large)',  // 44px
};

/** Icon pixel size per size variant (matches --featured-icon-icon-{size} token values). */
const ICON_SIZE: Record<FeaturedIconSize, number> = {
  medium: 16,
  large:  20,
};

/**
 * Featured Icon — a rounded-square container with a centered icon, used as a
 * visual anchor for card section titles. Non-interactive, purely presentational.
 */
export const FeaturedIcon = React.forwardRef<HTMLSpanElement, FeaturedIconProps>(
  function FeaturedIcon({ icon, color, size = 'medium', style, ...rest }, ref) {
    return (
      <span
        ref={ref}
        role="img"
        style={{
          display:         'inline-flex',
          alignItems:      'center',
          justifyContent:  'center',
          width:           CONTAINER_SIZE[size],
          height:          CONTAINER_SIZE[size],
          borderRadius:    'var(--rounding-lg)',
          backgroundColor: BG[color],
          flexShrink:      0,
          boxSizing:       'border-box',
          ...style,
        }}
        {...rest}
      >
        <Icon name={icon} size={ICON_SIZE[size]} color={ICON_COLOR[color]} />
      </span>
    );
  },
);
