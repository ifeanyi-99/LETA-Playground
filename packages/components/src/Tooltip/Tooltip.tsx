import * as React from 'react';
import { Button } from '../Button/Button.js';

export type TooltipVariant = 'small' | 'standard' | 'coachmark' | 'flyout' | 'popover';
export type TooltipPlatform = 'desktop' | 'mobile';
export type CaretSide = 'top' | 'bottom' | 'left' | 'right';
export type CaretAlign = 'start' | 'center' | 'end';

export interface TooltipProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Tooltip shape/content. Default `standard`. */
  variant?: TooltipVariant;
  /** `mobile` supports only small / standard / coachmark. Default `desktop`. */
  platform?: TooltipPlatform;
  /** Body text (small label / paragraph / coachmark + flyout body). */
  text?: string;
  /** Title (coachmark / flyout / popover). */
  title?: string;
  /** Edge the caret points from. Default `bottom`. */
  caretSide?: CaretSide;
  /** Caret position along the edge. Default `center`. */
  caretAlign?: CaretAlign;
  /** Show the caret. Default true. */
  showCaret?: boolean;

  // Coachmark
  step?: number;
  totalSteps?: number;
  skipLabel?: string;
  onSkip?: () => void;
  nextLabel?: string;
  onNext?: () => void;
  /** Optional badge rendered beside the coachmark title. */
  badge?: React.ReactNode;

  // Flyout
  cancelLabel?: string;
  onCancel?: () => void;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmVariant?: 'destructive' | 'primary';

  /**
   * Popover — Details Section slot (the metadata grid + any configuration
   * controls like a toggle row, with their dividers). Figma SLOT → ReactNode.
   */
  details?: React.ReactNode;
  /** Popover — CTA Section slot (the action buttons). Figma SLOT → ReactNode. */
  cta?: React.ReactNode;
}

/**
 * Per-variant surface + border (Figma `Surface/secondary/tooltip` for the dark
 * Small/Standard tooltips; the white `Surface/neutral/{coachmark,flyout,popover}`
 * for the larger surfaces). Body text colour follows: light on dark, dark on white.
 */
const SURFACE: Record<TooltipVariant, string> = {
  small: 'var(--surface-secondary-tooltip)',
  standard: 'var(--surface-secondary-tooltip)',
  coachmark: 'var(--surface-neutral-coachmark)',
  flyout: 'var(--surface-neutral-flyout)',
  popover: 'var(--surface-neutral-popover)',
};
const BORDER_VAR: Record<TooltipVariant, string> = {
  small: 'var(--border-secondary-default)',
  standard: 'var(--border-secondary-default)',
  coachmark: 'var(--border-neutral-default)',
  flyout: 'var(--border-neutral-default)',
  popover: 'var(--border-neutral-default)',
};
const CARET = 16; // rotated-square side → visible triangle ≈ 22×11 (matches Figma)

function Caret({ side, align, surface, border }: { side: CaretSide; align: CaretAlign; surface: string; border: string }) {
  const BORDER = border;
  // Outward-facing edges per side (the two borders that should show).
  const borders: React.CSSProperties =
    side === 'bottom'
      ? { borderRight: `var(--stroke-xs) solid ${BORDER}`, borderBottom: `var(--stroke-xs) solid ${BORDER}` }
      : side === 'top'
        ? { borderLeft: `var(--stroke-xs) solid ${BORDER}`, borderTop: `var(--stroke-xs) solid ${BORDER}` }
        : side === 'left'
          ? { borderLeft: `var(--stroke-xs) solid ${BORDER}`, borderBottom: `var(--stroke-xs) solid ${BORDER}` }
          : { borderTop: `var(--stroke-xs) solid ${BORDER}`, borderRight: `var(--stroke-xs) solid ${BORDER}` };

  const pos: React.CSSProperties = { position: 'absolute' };
  const isVertical = side === 'top' || side === 'bottom';
  // Place the square straddling the edge (half outside).
  if (side === 'bottom') pos.bottom = -CARET / 2;
  if (side === 'top') pos.top = -CARET / 2;
  if (side === 'left') pos.left = -CARET / 2;
  if (side === 'right') pos.right = -CARET / 2;
  // Align along the edge.
  if (isVertical) {
    if (align === 'start') pos.left = 20;
    else if (align === 'end') pos.right = 20;
    else { pos.left = '50%'; pos.transform = 'translateX(-50%) rotate(45deg)'; }
  } else {
    if (align === 'start') pos.top = 20;
    else if (align === 'end') pos.bottom = 20;
    else { pos.top = '50%'; pos.transform = 'translateY(-50%) rotate(45deg)'; }
  }
  if (!pos.transform) pos.transform = 'rotate(45deg)';

  return (
    <span
      aria-hidden="true"
      style={{
        ...pos,
        width: CARET,
        height: CARET,
        backgroundColor: surface,
        ...borders,
        zIndex: 0,
      }}
    />
  );
}

const Divider = ({ border }: { border: string }) => (
  <div style={{ height: 'var(--stroke-xs)', alignSelf: 'stretch', backgroundColor: border }} />
);

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  {
    variant = 'standard',
    platform = 'desktop',
    text,
    title = 'Title',
    caretSide = 'bottom',
    caretAlign = 'center',
    showCaret = true,
    step = 1,
    totalSteps = 4,
    skipLabel = 'Skip All',
    onSkip,
    nextLabel = 'Next',
    onNext,
    badge,
    cancelLabel = 'Cancel',
    onCancel,
    confirmLabel = 'Delete',
    onConfirm,
    confirmVariant = 'destructive',
    details,
    cta,
    style,
    ...rest
  },
  ref,
) {
  const isMobile = platform === 'mobile';
  const isDark = variant === 'small' || variant === 'standard';
  // Figma: Small/Standard = dark Surface/secondary/tooltip, Rounding/lg (8);
  // Coachmark/Flyout/Popover = white Surface/neutral/*, Rounding/xl (12).
  const surface = SURFACE[variant];
  const border = BORDER_VAR[variant];
  const radius = isDark ? 'var(--rounding-lg)' : 'var(--rounding-xl)';
  // Dark tooltips put light text on the secondary surface.
  const bodyColor = isDark ? 'var(--text-on-color-label)' : 'var(--text-default-body)';

  const shell: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    backgroundColor: surface,
    borderRadius: radius,
    boxShadow: `inset 0 0 0 var(--stroke-xs) ${border}, var(--shadow-neutral-2)`,
    width: 'fit-content',
    ...style,
  };

  let body: React.ReactNode;

  if (variant === 'small') {
    // Text Area: pad [12,24] desktop / [10,18] mobile (Figma). The label hugs its
    // content up to a 163px cap, then wraps — a short label ("Copy ID") stays one
    // line (44px tall); a long one ("Scheduled: 09 Jun 2027, 12:30 PM") wraps to
    // two centered lines (64px). Matches the Figma small-tooltip max text width.
    body = (
      <div style={{ padding: isMobile ? '10px 18px' : '12px 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <span
          className={isMobile ? 'text-label-s-regular' : 'text-label-m-regular'}
          style={{ color: bodyColor, display: 'inline-block', maxWidth: 163 }}
        >
          {text ?? 'View'}
        </span>
      </div>
    );
  } else if (variant === 'standard') {
    body = (
      <div style={{ padding: 'var(--padding-16px)', width: 288, boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        <span className="text-label-m-regular" style={{ color: bodyColor }}>
          {text ?? 'This will help indicate low stock levels for this product.'}
        </span>
      </div>
    );
  } else if (variant === 'coachmark') {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16px)', padding: 'var(--padding-16px)', width: 288, boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8px)' }}>
            <span className="text-label-l-semibold" style={{ color: 'var(--text-default-heading)' }}>{title}</span>
            {badge}
          </div>
          <span className="text-label-m-regular" style={{ color: 'var(--text-default-sub-body)' }}>
            {text ?? 'This will help indicate low stock levels for this product.'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="text-label-m-regular" style={{ color: 'var(--text-default-label-idle)', whiteSpace: 'nowrap' }}>
            {step} of {totalSteps}
          </span>
          <div style={{ display: 'flex', gap: 'var(--spacing-8px)' }}>
            <Button variant="secondary" size="small" onClick={onSkip}>{skipLabel}</Button>
            <Button variant="primary" size="small" onClick={onNext}>{nextLabel}</Button>
          </div>
        </div>
      </div>
    );
  } else if (variant === 'flyout') {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', width: 288, position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '16px 16px 12px', display: 'flex', flexDirection: 'column' }}>
          <span className="text-label-l-semibold" style={{ color: 'var(--text-default-heading)' }}>{title}</span>
        </div>
        <Divider border={border} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16px)', padding: 'var(--padding-16px)' }}>
          <span className="text-label-m-regular" style={{ color: 'var(--text-default-body)' }}>
            {text ?? 'This will help indicate low stock levels for this product.'}
          </span>
          <div style={{ display: 'flex', gap: 'var(--spacing-8px)', justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="small" onClick={onCancel}>{cancelLabel}</Button>
            <Button variant={confirmVariant} size="small" onClick={onConfirm}>{confirmLabel}</Button>
          </div>
        </div>
      </div>
    );
  } else {
    // popover (was "Advanced") — Header (Title + bottom divider) then Body
    // { Details Section slot, CTA Section slot }
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', width: 280, position: 'relative', zIndex: 1 }}>
        <div style={{ padding: 'var(--padding-16px)', borderBottom: `var(--stroke-xs) solid ${border}` }}>
          <span className="text-label-l-bold" style={{ color: 'var(--text-default-heading)' }}>{title}</span>
        </div>
        <div style={{ padding: 'var(--padding-16px)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20px)' }}>
          {details}
          {cta}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} role="tooltip" style={shell} {...rest}>
      {body}
      {showCaret && <Caret side={caretSide} align={caretAlign} surface={surface} border={border} />}
    </div>
  );
});
