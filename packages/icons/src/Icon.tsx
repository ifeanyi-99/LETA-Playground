import * as React from 'react';
import { REGISTRY, type IconName } from './generated/registry.js';

export type IconSize = 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | 'xxxl';

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'children'> {
  /** Semantic LETA icon name (e.g. "Dashboard", "Orders", "Format-Bold"). */
  name: IconName;
  /** Render the outlined variant. Defaults to filled. */
  outlined?: boolean;
  /**
   * Sizing token from the LETA Mapped Sizes collection. Each value resolves
   * to a `var(--icons-*)` CSS variable so the size automatically responds to
   * breakpoints (Mapped Sizes has Desktop/Tablet/Mobile modes).
   *
   * Defaults to `medium`.
   */
  size?: IconSize | number;
  /**
   * Override fill/stroke. Defaults to `currentColor` so parent CSS using
   * Mapped Color tokens (e.g. `color: var(--icons-neutral-button)`) cascades.
   */
  color?: string;
  /** Accessible label. If omitted, the icon is treated as decorative. */
  title?: string;
}

const SIZE_TOKEN: Record<IconSize, string> = {
  xs: 'var(--icons-xs)',
  small: 'var(--icons-small)',
  medium: 'var(--icons-medium)',
  large: 'var(--icons-large)',
  xl: 'var(--icons-xl)',
  xxl: 'var(--icons-xxl)',
  xxxl: 'var(--icons-xxxl)',
};

/**
 * Strip the outer `<svg>` wrapper from a Material Symbols glyph file and
 * return only the inner shapes. We re-emit the wrapper ourselves so we can
 * control width/height/fill/aria attributes consistently.
 */
function extractInner(svg: string): { viewBox: string; inner: string } {
  const viewBoxMatch = /viewBox="([^"]+)"/.exec(svg);
  const innerMatch = /<svg[^>]*>([\s\S]*?)<\/svg>/.exec(svg);
  return {
    viewBox: viewBoxMatch?.[1] ?? '0 0 24 24',
    inner: innerMatch?.[1] ?? '',
  };
}

// Cache extracted inner content per icon — extraction is pure and the
// registry strings never change at runtime.
const innerCache = new Map<string, { viewBox: string; inner: string }>();
function inner(svg: string): { viewBox: string; inner: string } {
  let v = innerCache.get(svg);
  if (!v) {
    v = extractInner(svg);
    innerCache.set(svg, v);
  }
  return v;
}

/**
 * Render a LETA icon. Defaults to filled, sized by the `medium` token,
 * coloured by `currentColor`. Pass `outlined` for the outlined variant.
 *
 * Decorative by default — only adds an accessible name when `title` is set.
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, outlined = false, size = 'medium', color, title, style, ...rest },
  ref,
) {
  const entry = REGISTRY[name];
  if (!entry) return null;

  const svg = outlined ? entry.outline ?? entry.fill : entry.fill ?? entry.outline;
  if (!svg) return null;

  const { viewBox, inner: innerHtml } = inner(svg);
  const dim = typeof size === 'number' ? `${size}px` : SIZE_TOKEN[size];
  const isDecorative = !title;

  return (
    <svg
      ref={ref}
      role={isDecorative ? 'presentation' : 'img'}
      aria-hidden={isDecorative || undefined}
      aria-label={title}
      viewBox={viewBox}
      width={dim}
      height={dim}
      fill={color ?? 'currentColor'}
      shapeRendering="geometricPrecision"
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      // Material Symbols SVGs only contain <path> data — safe to inline.
      dangerouslySetInnerHTML={{ __html: innerHtml }}
      {...rest}
    />
  );
});
