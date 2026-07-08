import * as React from 'react';
import { Icon, type IconName } from '@leta/icons';
import { Button } from '../Button/Button.js';

export type NotificationBannerType =
  | 'info'
  | 'neutral'
  | 'highlight'
  | 'warning'
  | 'error';

export type NotificationBannerVariant = 'filled' | 'subtle';

export interface NotificationBannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  type?: NotificationBannerType;
  variant?: NotificationBannerVariant;
  title?: string;
  description: string;
  /** Override the leading icon (defaults to the icon derived from `type`). */
  icon?: IconName;
  onDismiss?: () => void;
  children?: React.ReactNode;
  showContentButtons?: boolean;
  /**
   * Optional trailing call-to-action, pinned to the **bottom-right** of the
   * trailing section (Figma `CTA` frame — a Primary/Small button, e.g. Dispatch).
   * The dismiss × sits top-right; when both are present they are pushed to
   * opposite ends of the full-height trailing column. Hidden by default
   * (mirrors the Figma `CTA` frame's `visible: false`).
   */
  cta?: React.ReactNode;
}

const TYPE_CONFIG: Record<
  NotificationBannerType,
  {
    iconName: IconName;
    filledBg: string;
    filledBorder: string;
    iconColor: string;
  }
> = {
  info: {
    iconName: 'Info',
    filledBg: 'var(--surface-information-bg-subtle)',
    filledBorder: 'var(--border-information-banner)',
    iconColor: 'var(--icons-information-default)',
  },
  neutral: {
    iconName: 'Info',
    filledBg: 'var(--surface-neutral-bg-subtle)',
    filledBorder: 'var(--border-neutral-banner)',
    iconColor: 'var(--icons-neutral-idle)',
  },
  highlight: {
    iconName: 'Lightbulb',
    filledBg: 'var(--surface-highlight-bg-subtle)',
    filledBorder: 'var(--border-highlight-banner)',
    iconColor: 'var(--icons-highlight-default)',
  },
  warning: {
    iconName: 'Warning',
    filledBg: 'var(--surface-warning-bg-subtle)',
    filledBorder: 'var(--border-warning-banner)',
    iconColor: 'var(--icons-warning-default)',
  },
  error: {
    iconName: 'Error',
    filledBg: 'var(--surface-error-bg-subtle)',
    filledBorder: 'var(--border-error-banner)',
    iconColor: 'var(--icons-error-default)',
  },
};

export const NotificationBanner = React.forwardRef<
  HTMLDivElement,
  NotificationBannerProps
>(function NotificationBanner(
  {
    type = 'info',
    variant = 'filled',
    title,
    description,
    icon,
    onDismiss,
    children,
    showContentButtons = true,
    cta,
    style,
    ...rest
  },
  ref,
) {
  const config = TYPE_CONFIG[type];
  const isFilled = variant === 'filled';

  // Flattened structure (Figma `3811:65015`): the root IS the horizontal row —
  // a `Leading element` (icon + content) and an optional `Dismiss`, top-aligned.
  const rootStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
    boxSizing: 'border-box',
    ...(isFilled
      ? {
          padding: 'var(--padding-16px)',
          borderRadius: 'var(--rounding-xl)',
          backgroundColor: config.filledBg,
          boxShadow: `inset 0 0 0 1px ${config.filledBorder}`,
        }
      : {}),
    ...style,
  };

  // Leading element — icon + content. Icon is TOP-aligned with a 1px top pad
  // (Figma `--padding-1px`) so it optically centres with the first text line
  // (the title for `filled`, the body for `subtle`).
  const leadingElementStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
    minWidth: 0,
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: isFilled ? 12 : 8,
    flex: 1,
    minWidth: 0,
  };

  const textFrameStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  };

  const slotStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  };

  // Trailing section (Figma `Trailing section`): a full-height, right-aligned
  // vertical column with SPACE_BETWEEN — the Dismiss × grows to pin top-right,
  // the optional CTA pins bottom-right.
  const trailingSectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexShrink: 0,
  };

  return (
    <div ref={ref} role="status" style={rootStyle} {...rest}>
      <div style={leadingElementStyle}>
        {/* Leading Icon — 1px top padding (Figma `Leading Icon` pad 1/0/0/0). */}
        <div style={{ flexShrink: 0, display: 'flex', paddingTop: 'var(--padding-1px)', color: config.iconColor }}>
          <Icon name={icon ?? config.iconName} size={18} />
        </div>

        {/* Content — text + optional content-buttons slot */}
        <div style={contentStyle}>
          {isFilled ? (
            <div style={textFrameStyle}>
              {title && (
                <span className="text-label-m-semibold" style={{ color: 'var(--text-default-label)' }}>
                  {title}
                </span>
              )}
              <span className="text-body-m-regular" style={{ color: 'var(--text-default-body)' }}>
                {description}
              </span>
            </div>
          ) : (
            <span className="text-body-m-regular" style={{ color: 'var(--text-default-body)' }}>
              {description}
            </span>
          )}

          {showContentButtons && children && <div style={slotStyle}>{children}</div>}
        </div>
      </div>

      {/* Trailing section — Dismiss × (top-right) + optional CTA (bottom-right) */}
      {(onDismiss || cta) && (
        <div style={trailingSectionStyle}>
          {onDismiss && (
            <div style={{ display: 'flex', flexGrow: 1, alignItems: 'flex-start' }}>
              <Button
                variant="plain"
                size="small"
                iconOnly="Cancel"
                showUnderline={false}
                onClick={onDismiss}
                aria-label="Dismiss"
              />
            </div>
          )}
          {cta && <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{cta}</div>}
        </div>
      )}
    </div>
  );
});
