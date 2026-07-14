import * as React from 'react';
import {
  EMPTY_STATE_ILLUSTRATIONS,
  EMPTY_STATE_ILLUSTRATIONS_WEBP,
  type EmptyStateIllustration,
} from './illustrations.js';

export type EmptyStateType =
  | 'no-results'
  | 'no-reviews'
  | 'no-broadcast-logs'
  | 'image-upload'
  | 'file-upload'
  | 'no-suspensions'
  | 'no-items'
  | 'no-orders'
  | 'no-network'
  | 'new-update'
  | 'no-data'
  | 'no-trips'
  | 'no-drivers'
  | 'no-products';

export type EmptyStateSize = 'mobile' | 'desktop';

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Preset scenario — sets the illustration + default copy. Default `no-orders`. */
  type?: EmptyStateType;
  /** `desktop` (full-page, larger heading) or `mobile` (compact — cards/panels/results). Default `desktop`. */
  size?: EmptyStateSize;
  /** Override the heading. */
  heading?: string;
  /** Override the supporting copy. */
  description?: string;
  /** Show the illustration. Default true (false ⇒ Figma's "No Icon" treatment — text only). */
  showIcon?: boolean;
  /** Optional CTA (e.g. a `<Button>`), rendered below the copy (Container slot). */
  children?: React.ReactNode;
}

interface Preset {
  /** Key into the base64 illustration map (Figma `Illustrations/*` atoms). */
  illustration: EmptyStateIllustration;
  heading: string;
  description: string;
}

// Each scenario maps to one of the 13 LETA illustrations + its default copy.
// `no-products` reuses the `no-items` illustration (as in Figma).
const PRESET: Record<EmptyStateType, Preset> = {
  'no-results':        { illustration: 'no-results',       heading: 'No Matching Results', description: 'Try adjusting your search.' },
  'no-reviews':        { illustration: 'no-reviews',       heading: 'No Reviews',          description: 'All reviews will be displayed here' },
  'no-broadcast-logs': { illustration: 'no-broadcast-logs', heading: 'No Broadcast Logs',  description: 'All info will be displayed here' },
  'image-upload':      { illustration: 'image-upload',     heading: 'Select image to upload', description: 'Or drag and drop here' },
  'file-upload':       { illustration: 'file-upload',      heading: 'Select file to upload',  description: 'Or drag and drop here' },
  'no-suspensions':    { illustration: 'no-suspensions',   heading: 'No Suspensions',      description: 'You are currently eligible to receive order broadcasts from partner companies.' },
  'no-items':          { illustration: 'no-items',         heading: 'No Items',            description: 'You have no returnables' },
  'no-orders':         { illustration: 'no-orders',        heading: 'No Orders Yet',       description: 'All orders will be displayed here' },
  'no-network':        { illustration: 'no-network',       heading: 'Check your connection', description: 'Could not connect to the internet. Please check your network.' },
  'new-update':        { illustration: 'new-update',       heading: 'Get the new update',  description: 'Update to the latest version with bug fixes and improvements.' },
  'no-data':           { illustration: 'no-data',          heading: 'No Data Yet',         description: 'All data will be displayed here' },
  'no-trips':          { illustration: 'no-trips',         heading: 'No Trips Yet',        description: 'All trips will be displayed here' },
  'no-drivers':        { illustration: 'no-drivers',       heading: 'No Drivers',          description: 'All drivers will be displayed here' },
  'no-products':       { illustration: 'no-items',         heading: 'No Products',         description: 'No products have been added.' },
};

// The illustration is a constant 150×150 across both sizes (Figma); only the
// heading type style changes — Mobile = Body/L/SemiBold (16), Desktop =
// Heading/S/SemiBold (20).
const ILLUSTRATION_SIZE = 150;
const HEADING_CLASS: Record<EmptyStateSize, string> = {
  mobile: 'text-body-l-semibold',
  desktop: 'text-heading-s-semibold',
};

/**
 * Empty State (`7339:29150`) — a centred placeholder column shown when there's no
 * data: a 150×150 LETA illustration (with its own ground shadow) over a heading
 * and supporting copy, plus an optional CTA. Choose a scenario with `type` (14
 * presets), the heading scale with `size`, or pass `showIcon={false}` for the
 * text-only "No Icon" treatment. The `children` slot (Figma Container) holds the CTA.
 *
 * **When to use:** an empty table/list/panel, no search results, a connection
 * error, or an upload prompt.
 * **When not to use:** inline field errors (use the field's own message) or a
 * transient toast (use Toast).
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  {
    type = 'no-orders',
    size = 'desktop',
    heading,
    description,
    showIcon = true,
    children,
    style,
    ...rest
  },
  ref,
) {
  const preset = PRESET[type];
  const headingText = heading ?? preset.heading;
  const descriptionText = description ?? preset.description;

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-20px)',
        width: 300,
        padding: 'var(--padding-16px)',
        boxSizing: 'border-box',
        ...style,
      }}
      {...rest}
    >
      {showIcon && (
        // Decorative illustration (the heading carries the meaning). It already
        // includes its ground shadow, so no separate ellipse is needed. WebP first
        // (~88% smaller) with the PNG as the universal fallback for older browsers.
        <picture style={{ flexShrink: 0, lineHeight: 0 }}>
          <source srcSet={EMPTY_STATE_ILLUSTRATIONS_WEBP[preset.illustration]} type="image/webp" />
          <img
            src={EMPTY_STATE_ILLUSTRATIONS[preset.illustration]}
            alt=""
            aria-hidden
            width={ILLUSTRATION_SIZE}
            height={ILLUSTRATION_SIZE}
            style={{ width: ILLUSTRATION_SIZE, height: ILLUSTRATION_SIZE, objectFit: 'contain' }}
          />
        </picture>
      )}

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-8px)', width: '100%' }}>
        <span className={HEADING_CLASS[size]} style={{ color: 'var(--text-default-heading)', textAlign: 'center' }}>
          {headingText}
        </span>
        <span className="text-body-m-regular" style={{ color: 'var(--text-default-sub-body)', textAlign: 'center' }}>
          {descriptionText}
        </span>
      </div>

      {/* CTA (Container slot) */}
      {children}
    </div>
  );
});
