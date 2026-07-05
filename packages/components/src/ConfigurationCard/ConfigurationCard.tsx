import * as React from 'react';
import { ContentPrimitives } from '../ContentPrimitives/ContentPrimitives.js';
import { Toggle } from '../Toggle/Toggle.js';
import { Button } from '../Button/Button.js';
import { FooterFrame } from '../FooterFrame/FooterFrame.js';
import {
  NotificationBanner,
  type NotificationBannerType,
} from '../NotificationBanner/NotificationBanner.js';

/* ============================================================================
 * ConfigurationCardRow — a single white settings row inside the card body.
 * Mirrors Figma's nested "Content Card" (Surface/neutral/bg-primary, xl radius).
 * ========================================================================== */

export interface ConfigurationCardRowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Row title (Label/M/SemiBold). */
  title: string;
  /** Row description (Body/M/Regular). */
  description?: string;
  /** Trailing action — e.g. a `<Button>` ("Dispatch"). */
  trailing?: React.ReactNode;
}

export const ConfigurationCardRow = React.forwardRef<HTMLDivElement, ConfigurationCardRowProps>(
  function ConfigurationCardRow({ title, description = 'Enter description here', trailing, style, ...rest }, ref) {
    return (
      <div
        ref={ref}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box',
          padding: 'var(--padding-20px)',
          borderRadius: 'var(--rounding-xl)',
          backgroundColor: 'var(--surface-neutral-bg-default)',
          boxShadow: 'inset 0 0 0 var(--stroke-xs) var(--border-neutral-default)',
          ...style,
        }}
        {...rest}
      >
        <ContentPrimitives
          type="utility"
          text={title}
          subtext={description}
          showVisualAnchor={false}
          showTrailingContent={trailing != null}
          showPassiveElements={false}
          showInteractiveElements
          interactiveElements={trailing}
        />
      </div>
    );
  },
);

/* ============================================================================
 * ConfigurationCard — toggle-able settings section.
 * Header (title + description + Toggle) is always shown. When enabled, the body
 * (children rows) and footer (validation message + actions) are revealed.
 * ========================================================================== */

export interface ConfigurationCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onToggle'> {
  /** Section title (Label/M/SemiBold). */
  title: string;
  /** Section description (Body/M/Regular). */
  description?: string;
  /** Whether the section is enabled. Controls the header Toggle + body/footer visibility. */
  enabled?: boolean;
  /** Fires when the header Toggle is flipped. */
  onToggle?: (enabled: boolean) => void;
  /** Body content — typically one or more `<ConfigurationCardRow>`. Shown when enabled. */
  children?: React.ReactNode;
  /** Show the footer region when enabled. Default true. */
  showFooter?: boolean;
  /** Validation / helper message shown in the footer's subtle Notification Banner. */
  footerMessage?: string;
  /** Notification Banner type for the footer message. Default "info". */
  footerMessageType?: NotificationBannerType;
  /** Secondary action label. */
  cancelLabel?: string;
  /** Secondary action handler. */
  onCancel?: () => void;
  /** Primary action label. */
  submitLabel?: string;
  /** Primary action handler. */
  onSubmit?: () => void;
}

export const ConfigurationCard = React.forwardRef<HTMLDivElement, ConfigurationCardProps>(
  function ConfigurationCard(
    {
      title,
      description = 'Enter description here',
      enabled = false,
      onToggle,
      children,
      showFooter = true,
      footerMessage = 'Validation goes here. Keep it short',
      footerMessageType = 'info',
      cancelLabel = 'Action',
      onCancel,
      submitLabel = 'Action',
      onSubmit,
      style,
      ...rest
    },
    ref,
  ) {
    const hasFooter =
      enabled && showFooter && (footerMessage || cancelLabel || submitLabel);

    return (
      <div
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 'var(--spacing-24px)',
          width: '100%',
          boxSizing: 'border-box',
          padding: 'var(--padding-20px)',
          borderRadius: 'var(--rounding-xxl)',
          backgroundColor: 'var(--surface-neutral-bg-subtle)',
          boxShadow: 'inset 0 0 0 var(--stroke-xs) var(--border-neutral-default)',
          ...style,
        }}
        {...rest}
      >
        {/* Header */}
        <ContentPrimitives
          type="utility"
          text={title}
          subtext={description}
          showVisualAnchor={false}
          showTrailingContent
          showPassiveElements={false}
          showInteractiveElements
          interactiveElements={
            <Toggle
              checked={enabled}
              onChange={(checked) => onToggle?.(checked)}
              aria-label={title}
            />
          }
        />

        {/* Body (rows) */}
        {enabled && children != null && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-16px)',
              width: '100%',
            }}
          >
            {children}
          </div>
        )}

        {/* Footer */}
        {hasFooter && (
          <FooterFrame
            variant="card"
            leading={
              footerMessage ? (
                <NotificationBanner
                  variant="subtle"
                  type={footerMessageType}
                  description={footerMessage}
                />
              ) : undefined
            }
          >
            {cancelLabel && (
              <Button variant="secondary" onClick={onCancel}>
                {cancelLabel}
              </Button>
            )}
            {submitLabel && (
              <Button variant="primary" onClick={onSubmit}>
                {submitLabel}
              </Button>
            )}
          </FooterFrame>
        )}
      </div>
    );
  },
);
