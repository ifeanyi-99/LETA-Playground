import * as React from 'react';
import { ModalShell } from '../Modal/ModalShell.js';
import { ModalHeaders } from '../ModalHeaders/ModalHeaders.js';
import { FooterFrame } from '../FooterFrame/FooterFrame.js';
import { Button } from '../Button/Button.js';

export type AlertDialogVariant = 'basic' | 'warning';

export interface AlertDialogProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** `basic` (no header icon) or `warning` (leading warning icon in the header). Default `basic`. */
  variant?: AlertDialogVariant;
  /** Modal title. Default "Title". */
  title?: string;
  /** Body copy (Body/L/Regular). Ignored when `children` is provided. */
  message?: string;
  /** Body override — replaces the default message text. */
  children?: React.ReactNode;
  /** Optional leading content revealed above the message (Figma's hidden in-slot Notification Banner). */
  banner?: React.ReactNode;
  /** Cancel/dismiss action label. Default "Close". */
  cancelLabel?: string;
  /** Confirm action label. Default "Confirm". */
  confirmLabel?: string;
  /** Cancel button handler (also the default for the header close). */
  onCancel?: () => void;
  /** Confirm button handler. */
  onConfirm?: () => void;
  /** Header close-button handler. Falls back to `onCancel`. */
  onClose?: () => void;
}

/**
 * Alert Dialog (`1106:2868`) — the smallest modal template: a confirmation /
 * destructive-action prompt. 480×256, composing `ModalHeaders` (default) + a
 * body region (Body/L/Regular message) + `FooterFrame` (Close / Confirm).
 *
 * - **basic** — title + message.
 * - **warning** — adds a leading warning icon in the header.
 *
 * **When to use:** confirm a discrete, often destructive action.
 * **When NOT to use:** multi-field forms or content-heavy flows (use Modal
 * Dialog / Large Modal).
 */
export const AlertDialog = React.forwardRef<HTMLDivElement, AlertDialogProps>(
  function AlertDialog(
    {
      variant = 'basic',
      title = 'Title',
      message = 'Deleting will displace all entities within this group. Do you want to proceed?',
      children,
      banner,
      cancelLabel = 'Close',
      confirmLabel = 'Confirm',
      onCancel,
      onConfirm,
      onClose,
      ...rest
    },
    ref,
  ) {
    return (
      <ModalShell
        ref={ref}
        width={480}
        rounded
        role="alertdialog"
        aria-label={title}
        header={
          <ModalHeaders
            variant="default"
            title={title}
            onClose={onClose ?? onCancel}
            showSecondaryContent={false}
            showLeadingIcon={variant === 'warning'}
            leadingIcon="Warning"
            leadingIconColor={variant === 'warning' ? 'var(--icons-warning-default)' : undefined}
          />
        }
        footer={
          <FooterFrame variant="default">
            <Button variant="secondary" size="medium" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button variant="primary" size="medium" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </FooterFrame>
        }
        bodyStyle={{ padding: '24px 16px', gap: 24, alignItems: 'flex-start' }}
        {...rest}
      >
        {banner}
        {children ?? (
          <span
            className="text-body-l-regular"
            style={{ color: 'var(--text-default-body)' }}
          >
            {message}
          </span>
        )}
      </ModalShell>
    );
  },
);
