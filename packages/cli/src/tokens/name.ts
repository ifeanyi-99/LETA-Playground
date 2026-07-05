// Convert a Figma variable name (e.g. "Primitive Colors/Yankees Blue/950")
// into a CSS-safe variable identifier (e.g. "--primitive-colors-yankees-blue-950").

const NEG_TOKEN = 'neg';

/**
 * Slugify a Figma variable name for use as a CSS custom property.
 *
 * Rules:
 * - Lowercase
 * - Replace `/` and whitespace with `-`
 * - Convert leading `-` (negative numbers) to "neg-" so the result is a valid identifier
 * - Strip any character that isn't `[a-z0-9-]`
 * - Collapse repeated dashes
 */
export function slugify(figmaName: string): string {
  const segments = figmaName.split('/').map((s) => s.trim());
  return segments
    .map((seg) => {
      let s = seg.toLowerCase().replace(/\s+/g, '-');
      if (s.startsWith('-')) s = NEG_TOKEN + s; // "-6" → "neg-6"
      s = s.replace(/[^a-z0-9-]/g, '');
      s = s.replace(/-+/g, '-');
      s = s.replace(/^-|-$/g, '');
      return s;
    })
    .filter(Boolean)
    .join('-');
}

/** Name → CSS variable token (with leading `--`). */
export function nameToCssVar(figmaName: string): string {
  return `--${slugify(figmaName)}`;
}
