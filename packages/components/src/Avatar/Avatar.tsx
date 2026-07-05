import * as React from 'react';

export type AvatarSize = 'xs' | 'small' | 'medium' | 'large';
export type AvatarTone = 'teal' | 'warning' | 'yankee-blue';

const SIZES: Record<AvatarSize, number> = {
  xs: 24,
  small: 32,
  medium: 40,
  large: 64,
};

// Initials text style per size — matches Figma `7446:22517` font sizes
// (xs 10 / small 12 / medium 14 / large 24).
const TEXT_STYLE_CLASS: Record<AvatarSize, string> = {
  xs: 'text-caption-l-semibold',
  small: 'text-label-s-semibold',
  medium: 'text-label-m-semibold',
  large: 'text-heading-m-semibold',
};

const TONE_BG: Record<AvatarTone, string> = {
  teal: 'var(--surface-notice-avatar-bg)',
  warning: 'var(--surface-warning-avatar-bg)',
  'yankee-blue': 'var(--surface-secondary-avatar-bg)',
};

// Initials colour per tone (Figma `7446:22517`): Empty-Teal / Empty-Warning use the
// dark default label; Empty-Yankee Blue uses the secondary label.
const TONE_TEXT: Record<AvatarTone, string> = {
  teal: 'var(--text-default-label)',
  warning: 'var(--text-default-label)',
  'yankee-blue': 'var(--text-secondary-label)',
};

function deriveInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const words = trimmed.split(/\s+/);
  if (words.length === 1) {
    return [...words[0]!][0]!.toUpperCase();
  }
  const first = [...words[0]!][0] ?? '';
  const last = [...words[words.length - 1]!][0] ?? '';
  return (first + last).toUpperCase();
}

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Required — used as the accessible name and as the source for derived initials. */
  name: string;
  size?: AvatarSize;
  /** Photo URL. If it fails to load (onError), Avatar falls back to initials on the chosen tone. */
  src?: string;
  /** Tonal background for the initials render mode. Default: 'yankee-blue'. */
  tone?: AvatarTone;
  /** Override the derived initials (e.g. corporate accounts using "CO" instead of name-derived). */
  initials?: string;
  /** When nested inside an already-labeled interactive parent, set this to hide from SR. */
  decorative?: boolean;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  function Avatar(
    {
      name,
      size = 'medium',
      src,
      tone = 'yankee-blue',
      initials,
      decorative = false,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const [errored, setErrored] = React.useState(false);
    React.useEffect(() => {
      // Reset error state when src changes so a new URL gets a fresh attempt.
      setErrored(false);
    }, [src]);

    const px = SIZES[size];
    const showPhoto = Boolean(src) && !errored;
    const displayInitials = initials ?? deriveInitials(name);

    const a11yProps = decorative
      ? { 'aria-hidden': true as const }
      : { role: 'img' as const, 'aria-label': name };

    return (
      <span
        ref={ref}
        {...a11yProps}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          width: px,
          height: px,
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: showPhoto ? 'transparent' : TONE_BG[tone],
          color: TONE_TEXT[tone],
          userSelect: 'none',
          flexShrink: 0,
          ...style,
        }}
        {...rest}
      >
        {showPhoto ? (
          <img
            src={src}
            alt=""
            onError={() => setErrored(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <span aria-hidden="true" className={TEXT_STYLE_CLASS[size]}>
            {displayInitials}
          </span>
        )}
      </span>
    );
  },
);
