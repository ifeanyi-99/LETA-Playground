import { figmaColorToCss } from '../color.js';
import type { Effect, EffectStyle } from '../types.js';

/**
 * Convert a Figma effect-style name into a CSS custom-property identifier.
 * Drops the redundant "drop-shadow" / "shadow" tokens so the output is concise.
 *
 * "Neutral Drop Shadow 1" → `--shadow-neutral-1`
 * "Neutral Drop Shadow 2" → `--shadow-neutral-2`
 * "Neutral Drop Shadow 3" → `--shadow-neutral-3`
 * "Red Drop Shadow"       → `--shadow-red`
 * "Blue Drop Shadow"      → `--shadow-blue`
 */
export function effectStyleNameToCssVar(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/\bdrop\s*shadow\b/g, '') // strip "drop shadow"
    .replace(/\bshadow\b/g, '') // strip lone "shadow"
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `--shadow-${slug}`;
}

/**
 * Render a single effect layer into a CSS `box-shadow` value fragment.
 * - Skips invisible / non-DROP_SHADOW layers (returns null).
 * - Always pixels for offsets / radius / spread.
 */
function effectToBoxShadowLayer(e: Effect): string | null {
  if (e.visible === false) return null;
  if (e.type !== 'DROP_SHADOW') return null;
  const x = e.offset?.x ?? 0;
  const y = e.offset?.y ?? 0;
  const blur = e.radius ?? 0;
  const spread = e.spread ?? 0;
  const color = e.color ? figmaColorToCss(e.color) : 'rgb(0 0 0 / 0)';
  return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

/** Compose the multi-layer `box-shadow` value for one effect style. */
export function effectStyleToBoxShadow(style: EffectStyle): string {
  const layers = style.effects
    .map(effectToBoxShadowLayer)
    .filter((s): s is string => s !== null);
  return layers.join(', ');
}

/** Emit the `--shadow-*: ...;` declarations for every effect style. */
export function effectStyleDeclarations(styles: EffectStyle[]): string[] {
  return styles.map((s) => `${effectStyleNameToCssVar(s.name)}: ${effectStyleToBoxShadow(s)};`);
}
