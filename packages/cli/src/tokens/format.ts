import { figmaColorToCss, isFigmaColor } from './color.js';
import { nameToCssVar } from './name.js';
import type { AllSnapshots, Variable, VariableValue } from './types.js';

/**
 * Format a variable value (which may be a literal or alias) into the CSS
 * expression that should appear on the right-hand side of a `--token: ...`.
 *
 * Aliases produce `var(--target-name)` so theme/breakpoint switching cascades
 * through CSS naturally without re-resolving in the generator.
 */
export function formatValue(
  value: VariableValue,
  variable: Variable,
  snapshots: AllSnapshots,
): string {
  // Alias → `var(--target)`
  if (typeof value === 'object' && value !== null && 'type' in value && value.type === 'VARIABLE_ALIAS') {
    const target = snapshots.variableIndex.get(value.id);
    if (!target) {
      throw new Error(`Alias target not found: ${value.id} (referenced from ${variable.name})`);
    }
    return `var(${nameToCssVar(target.name)})`;
  }

  if (isFigmaColor(value)) {
    return figmaColorToCss(value);
  }

  if (typeof value === 'number') {
    return formatNumber(value, variable);
  }

  if (typeof value === 'string') {
    if (isFontWeightVariable(variable) && value in FONT_WEIGHT_MAP) {
      return fontWeightToCss(value);
    }
    return JSON.stringify(value);
  }

  if (typeof value === 'boolean') {
    return String(value);
  }

  throw new Error(`Unsupported value type for ${variable.name}: ${JSON.stringify(value)}`);
}

/**
 * Decide whether a numeric value should carry units in CSS.
 *
 * Heuristic based on Figma scope hints:
 * - WIDTH_HEIGHT, GAP, FONT_SIZE, LINE_HEIGHT, PARAGRAPH_*, EFFECT_FLOAT → px
 * - LETTER_SPACING → px (Figma exposes its kerning values in px)
 * - OPACITY, FONT_WEIGHT, FONT_VARIATIONS → unitless
 * - Variables with no scopes (often raw scale) → unitless (they're aliased into typed vars)
 */
const FONT_WEIGHT_MAP: Record<string, string> = {
  Thin: '100',
  ExtraLight: '200',
  Light: '300',
  Regular: '400',
  Medium: '500',
  SemiBold: '600',
  Bold: '700',
  ExtraBold: '800',
  Black: '900',
};

function fontWeightToCss(figmaWeight: string): string {
  return FONT_WEIGHT_MAP[figmaWeight] ?? '400';
}

function isFontWeightVariable(variable: Variable): boolean {
  const scopes = new Set(variable.scopes);
  return (
    scopes.has('FONT_WEIGHT') ||
    scopes.has('ALL_SCOPES') ||
    /weight/i.test(variable.name)
  );
}

function formatNumber(n: number, variable: Variable): string {
  const scopes = new Set(variable.scopes);
  const UNITLESS_SCOPES = new Set(['OPACITY', 'FONT_WEIGHT', 'FONT_VARIATIONS']);
  const hasUnitScope = [...scopes].some((s) => !UNITLESS_SCOPES.has(s));
  if (hasUnitScope) return `${n}px`;
  if (scopes.size === 0) return String(n);
  return String(n);
}
