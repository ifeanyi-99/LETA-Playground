import * as React from 'react';
import { Button } from '../Button/Button.js';
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs.js';
import { UserMenu } from '../UserMenu/UserMenu.js';
import { type AvatarTone } from '../Avatar/Avatar.js';

/** `default` (no unread indicator) or `active` (notification dot on the bell). */
export type TopBarVariant = 'default' | 'active';

export interface TopBarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** Default (no unread dot) or active (unread-notification dot). Default `default`. */
  variant?: TopBarVariant;
  /** Left wayfinding content. Default a global-admin Breadcrumbs. */
  left?: React.ReactNode;
  /** The signed-in user (drives the User-Menu). Default { name: "Alex Smith" }. */
  user?: { name: string; avatarSrc?: string; tone?: AvatarTone };
  /** Fired when the notification bell is clicked. */
  onNotificationsClick?: () => void;
  /** Fired when the User-Menu is clicked. */
  onUserMenuClick?: () => void;
}

/**
 * Top Bar — the persistent application header: contextual wayfinding
 * (breadcrumbs) on the left, and global controls — notifications and the
 * User-Menu — on the right. The `active` variant shows an unread-notification dot
 * on the bell. Composes Breadcrumbs, Button, and User-Menu.
 *
 * **Width:** the bar fills its container (`width: 100%`) — in a real app it
 * expands to the viewport/content frame it sits in. The Figma frame's fixed
 * 1200px is just the design canvas, not a constraint.
 *
 * **When to use:** the top-level app chrome above the page content.
 * **When not to use:** in-page tabs (Page Tabs Control); the table toolbar
 * (Table Data Control); the side navigation (Side Bar).
 */
export const TopBar = React.forwardRef<HTMLElement, TopBarProps>(function TopBar(
  { variant = 'default', left, user = { name: 'Alex Smith' }, onNotificationsClick, onUserMenuClick, className, style, ...rest },
  ref,
) {
  const bell = (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <Button
        variant="ghost"
        size="medium"
        prominent
        iconOnly="Notifications"
        iconOutlined
        aria-label="Notifications"
        onClick={onNotificationsClick}
      />
      {variant === 'active' && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 10,
            height: 10,
            borderRadius: 'var(--rounding-round)',
            backgroundColor: 'var(--icons-error-default)',
            border: 'var(--stroke-xs) solid var(--surface-neutral-bg-default)',
            boxSizing: 'content-box',
          }}
        />
      )}
    </span>
  );

  return (
    <header
      ref={ref}
      className={['leta-top-bar', className].filter(Boolean).join(' ')}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-16px)',
        width: '100%',
        height: 64,
        paddingTop: 'var(--padding-12px)',
        paddingBottom: 'var(--padding-12px)',
        paddingLeft: 'var(--padding-24px)',
        paddingRight: 'var(--padding-24px)',
        backgroundColor: 'var(--surface-neutral-bg-default)',
        borderBottom: 'var(--stroke-xs) solid var(--border-neutral-default)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8px)', minWidth: 0 }}>
        {left ?? <Breadcrumbs type="global-admin" client="Acme Corp" items={[{ label: 'Previous Page' }]} current="Current Page" />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-12px)', flexShrink: 0 }}>
        {bell}
        <UserMenu name={user.name} avatarSrc={user.avatarSrc} tone={user.tone} onClick={onUserMenuClick} />
      </div>
    </header>
  );
});
