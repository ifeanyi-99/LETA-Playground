import * as React from 'react';
import {
  Button,
  type ButtonVariant,
  type ButtonSize,
  type ButtonPlatform,
} from './Button.js';

/* ============================================================================
 * Default icons (sourced from Figma — `28:38245` Desktop / `2887:26272` Mobile).
 *
 *   Leading / Trailing / Split Button → Icon/Proceed
 *   Icon Only / Prominent Icon Only   → Icon/Cancel
 * ========================================================================== */

const DEFAULT_LEADING = 'Proceed' as const;
const DEFAULT_TRAILING = 'Proceed' as const;
const DEFAULT_ICON_ONLY = 'Cancel' as const;

/* ============================================================================
 * "Type" axis as exposed in Figma. The React API derives this from props,
 * but for catalog rendering we walk it explicitly so devs can map each cell
 * back to a Figma variant 1:1.
 * ========================================================================== */

export type FigmaButtonType =
  | 'no-icon'
  | 'leading-icon'
  | 'trailing-icon'
  | 'split-button'
  | 'icon-only'
  | 'prominent-icon-only';

export const TYPE_LABEL: Record<FigmaButtonType, string> = {
  'no-icon': 'No Icon',
  'leading-icon': 'Leading Icon',
  'trailing-icon': 'Trailing Icon',
  'split-button': 'Split Button',
  'icon-only': 'Icon Only',
  'prominent-icon-only': 'Prominent Icon Only',
};

export const SIZE_LABEL: Record<ButtonSize, string> = {
  'extra-small': 'Extra Small',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  fab: 'FAB',
};

export const VARIANT_LABEL: Record<ButtonVariant, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  ghost: 'Ghost',
  'ghost-error': 'Ghost Error',
  dashed: 'Dashed',
  destructive: 'Destructive',
  plain: 'Plain',
  success: 'Success',
};

/* ============================================================================
 * (Platform, Variant, Size) → Types[]
 *
 * Sourced from `packages/cli/snapshots/components.json` — captured 2026-05-24.
 * Only cells that exist in Figma render in the catalog. Adding or removing
 * cells here is a deliberate design-system decision — they MUST be
 * justified against the captured snapshot or a fresh `figma_execute` capture.
 * ========================================================================== */

type Matrix = Partial<Record<ButtonSize, FigmaButtonType[]>>;
type PlatformMatrix = Partial<Record<ButtonVariant, Matrix>>;

const DESKTOP_BASE: FigmaButtonType[] = ['no-icon', 'leading-icon', 'trailing-icon', 'split-button', 'icon-only'];
const DESKTOP_BASE_NO_ICON_ONLY: FigmaButtonType[] = ['no-icon', 'leading-icon', 'trailing-icon', 'split-button'];
const MOBILE_BASE: FigmaButtonType[] = ['no-icon', 'leading-icon', 'trailing-icon', 'split-button', 'icon-only'];
const MOBILE_BASE_NO_ICON_ONLY: FigmaButtonType[] = ['no-icon', 'leading-icon', 'trailing-icon', 'split-button'];

export const MATRIX: Record<ButtonPlatform, PlatformMatrix> = {
  desktop: {
    primary: {
      small: DESKTOP_BASE,
      medium: [...DESKTOP_BASE, 'prominent-icon-only'],
      large: DESKTOP_BASE,
      fab: DESKTOP_BASE,
    },
    secondary: {
      'extra-small': ['icon-only'],
      small: DESKTOP_BASE,
      medium: [...DESKTOP_BASE, 'prominent-icon-only'],
      large: DESKTOP_BASE,
      fab: DESKTOP_BASE,
    },
    ghost: {
      small: DESKTOP_BASE,
      medium: [...DESKTOP_BASE, 'prominent-icon-only'],
      large: DESKTOP_BASE,
    },
    'ghost-error': {
      small: DESKTOP_BASE,
      medium: [...DESKTOP_BASE, 'prominent-icon-only'],
      large: DESKTOP_BASE,
    },
    dashed: {
      small: DESKTOP_BASE_NO_ICON_ONLY,
      medium: DESKTOP_BASE_NO_ICON_ONLY,
      large: DESKTOP_BASE_NO_ICON_ONLY,
    },
    destructive: {
      small: DESKTOP_BASE_NO_ICON_ONLY,
      medium: DESKTOP_BASE_NO_ICON_ONLY,
      large: DESKTOP_BASE_NO_ICON_ONLY,
    },
    plain: {
      // Plain has Icon Only only at Small per Figma snapshot.
      small: DESKTOP_BASE,
      medium: DESKTOP_BASE_NO_ICON_ONLY,
      large: DESKTOP_BASE_NO_ICON_ONLY,
    },
  },
  mobile: {
    primary: {
      small: MOBILE_BASE,
      medium: MOBILE_BASE,
      large: MOBILE_BASE,
      fab: MOBILE_BASE,
    },
    secondary: {
      small: MOBILE_BASE,
      medium: MOBILE_BASE,
      large: MOBILE_BASE,
      fab: MOBILE_BASE,
    },
    ghost: {
      small: MOBILE_BASE,
      medium: MOBILE_BASE,
      large: MOBILE_BASE,
    },
    'ghost-error': {
      small: MOBILE_BASE,
      medium: MOBILE_BASE,
      large: MOBILE_BASE,
    },
    dashed: {
      small: MOBILE_BASE_NO_ICON_ONLY,
      medium: MOBILE_BASE_NO_ICON_ONLY,
      large: MOBILE_BASE_NO_ICON_ONLY,
    },
    destructive: {
      small: MOBILE_BASE_NO_ICON_ONLY,
      medium: MOBILE_BASE_NO_ICON_ONLY,
      large: MOBILE_BASE_NO_ICON_ONLY,
    },
    success: {
      small: MOBILE_BASE_NO_ICON_ONLY,
      medium: MOBILE_BASE_NO_ICON_ONLY,
      large: MOBILE_BASE_NO_ICON_ONLY,
    },
    plain: {
      small: MOBILE_BASE,
      medium: MOBILE_BASE,
      large: MOBILE_BASE,
    },
  },
};

/* ============================================================================
 * Render helpers
 * ========================================================================== */

const Cell: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, minHeight: 64 }}>
    <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
      {label}
    </span>
    {children}
  </div>
);

function renderTypeCell(
  type: FigmaButtonType,
  variant: ButtonVariant,
  size: ButtonSize,
  platform: ButtonPlatform,
  disabled = false,
) {
  const label = disabled ? 'Disabled' : TYPE_LABEL[type];
  const common = { variant, size, platform, disabled } as const;
  switch (type) {
    case 'no-icon':
      return (
        <Cell label={label}>
          <Button {...common}>Dispatch</Button>
        </Cell>
      );
    case 'leading-icon':
      return (
        <Cell label={label}>
          <Button {...common} iconLeft={DEFAULT_LEADING}>
            Dispatch
          </Button>
        </Cell>
      );
    case 'trailing-icon':
      return (
        <Cell label={label}>
          <Button {...common} iconRight={DEFAULT_TRAILING}>
            Dispatch
          </Button>
        </Cell>
      );
    case 'split-button':
      return (
        <Cell label={label}>
          <Button {...common} iconLeft={DEFAULT_LEADING} iconRight={DEFAULT_TRAILING}>
            Dispatch
          </Button>
        </Cell>
      );
    case 'icon-only':
      return (
        <Cell label={label}>
          <Button {...common} iconOnly={DEFAULT_ICON_ONLY} aria-label="Cancel" />
        </Cell>
      );
    case 'prominent-icon-only':
      return (
        <Cell label={label}>
          <Button {...common} prominent iconOnly={DEFAULT_ICON_ONLY} aria-label="Cancel" />
        </Cell>
      );
  }
}

/* ============================================================================
 * VariantCatalog — the one and only catalog layout used for every variant
 * story on both platforms. Sizes become H3 rows; Types become columns;
 * Disabled is always the last column (skipped for FAB — Figma has no
 * Disabled FAB).
 * ========================================================================== */

export const VariantCatalog: React.FC<{
  variant: ButtonVariant;
  platform: ButtonPlatform;
}> = ({ variant, platform }) => {
  const matrix = MATRIX[platform][variant];
  if (!matrix) {
    return (
      <p className="text-body-s-regular" style={{ color: 'var(--text-error-label)' }}>
        {VARIANT_LABEL[variant]} is not defined in Figma for {platform}.
      </p>
    );
  }

  const orderedSizes: ButtonSize[] = ['extra-small', 'small', 'medium', 'large', 'fab'];
  const sizes = orderedSizes.filter((s) => matrix[s] !== undefined);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        {VARIANT_LABEL[variant]} · {platform === 'desktop' ? 'Desktop' : 'Mobile'}
      </h2>
      {sizes.map((size) => {
        const types = matrix[size]!;
        const isFab = size === 'fab';
        return (
          <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 className="text-label-l-semibold" style={{ margin: 0 }}>
              Size: {SIZE_LABEL[size]}
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
              {types.map((t) => (
                <React.Fragment key={t}>{renderTypeCell(t, variant, size, platform)}</React.Fragment>
              ))}
              {/* Figma defines no Disabled FAB → skip the Disabled column. */}
              {!isFab && (
                <>{renderTypeCell(types[0]!, variant, size, platform, true)}</>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
};

export { DEFAULT_LEADING, DEFAULT_TRAILING, DEFAULT_ICON_ONLY };
