import type { FigmaColor } from './types.js';

/**
 * Convert a Figma RGBA color (channels in 0..1) into an idiomatic CSS string.
 * - If alpha is 1: hex (e.g. `#ff7700`)
 * - Otherwise: `rgb(r g b / a)` (modern syntax, no commas)
 */
export function figmaColorToCss(c: FigmaColor): string {
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);

  if (c.a >= 0.999) {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Normalize alpha to up to 4 decimal places, trimming trailing zeros.
  const alpha = Math.round(c.a * 10000) / 10000;
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

export function isFigmaColor(v: unknown): v is FigmaColor {
  return (
    typeof v === 'object' &&
    v !== null &&
    'r' in v &&
    'g' in v &&
    'b' in v &&
    'a' in v &&
    typeof (v as FigmaColor).r === 'number'
  );
}
