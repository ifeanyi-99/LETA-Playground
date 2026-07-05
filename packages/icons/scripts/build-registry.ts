#!/usr/bin/env tsx
/* eslint-disable no-console */
// Build script: read inventory snapshot + @material-symbols/svg-500 package,
// resolve each LETA icon's glyph to a real SVG file, and emit a TypeScript
// registry that the Icon component consumes at runtime.
//
// Glyph resolution rules (in priority order):
//   - Convert dashes to underscores (Figma uses kebab; MS uses snake)
//   - If glyph ends in `-outline-rounded`: try `rounded/<base>.svg`
//   - If glyph ends in `-rounded`: try `rounded/<base>-fill.svg` then `rounded/<base>.svg`
//   - If glyph ends in `-outline`: try `outlined/<base>.svg` then `rounded/<base>.svg`
//   - Default: filled (LETA's default for non-Outline names) — try `rounded/<base>-fill.svg`
//     then `outlined/<base>-fill.svg`, then no-fill variants as a last resort
//
// Two output files:
//   - src/generated/registry.ts — Record<IconName, { fill: string; outline: string | null; svg: string }>
//   - src/generated/icon-names.ts — `export type IconName = "Dashboard" | "Orders" | ...`
//
// Unmapped icons (5 from the LETA snapshot use mdi: prefix or have malformed
// inner names) are excluded from the registry but logged. They'll show up as
// runtime errors if referenced — caught in TS via the IconName type.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'snapshots', 'inventory.json');
const OVERRIDES = path.join(ROOT, 'snapshots', 'overrides.json');
const GENERATED_DIR = path.join(ROOT, 'src', 'generated');
// pnpm puts each package's deps in its own node_modules (with symlinks into
// the .pnpm content-addressable store). Resolving via the package's own
// node_modules works for both pnpm and npm/yarn flat layouts.
const MS_DIR = path.resolve(ROOT, 'node_modules/@material-symbols/svg-500');

interface InventoryComponent {
  name: string; // "Icon/Dashboard"
  id: string;
  glyph: string | null; // "space-dashboard" | null
  raw: string | null;
}

interface Inventory {
  source: string;
  generatedAt: string;
  components: InventoryComponent[];
  componentSets: { name: string; id: string; variants: { name: string; id: string }[] }[];
}

/**
 * LETA component name → public IconName + outline-or-not flag.
 *
 * "Icon/Dashboard"          → { semantic: "Dashboard", outlined: false }
 * "Icon/Dashboard-Outline"  → { semantic: "Dashboard", outlined: true }
 *
 * The semantic name drops the leading "Icon/" prefix, replaces remaining
 * dashes/spaces with the closest valid identifier character, and strips a
 * trailing "-Outline".
 */
function parseLetaName(figmaName: string): { semantic: string; outlined: boolean } | null {
  if (!figmaName.startsWith('Icon/')) return null;
  let rest = figmaName.slice('Icon/'.length).trim();
  let outlined = false;

  // Match "-Outline" or "-Outline " or " Outline" suffix.
  const outlineSuffix = /[- ]?Outl?ine$/i;
  if (outlineSuffix.test(rest)) {
    outlined = true;
    rest = rest.replace(outlineSuffix, '');
  }
  // Pascal-friendly: trim trailing spaces, drop trailing-space-then-digit pattern, etc.
  rest = rest.replace(/\s+$/g, '');
  return { semantic: rest, outlined };
}

/**
 * Try a series of candidate paths under the @material-symbols/svg-500 tree
 * until one resolves. Returns the absolute path of the first hit, or null.
 */
function resolveGlyphFile(
  glyph: string,
  options: { outlined: boolean },
): string | null {
  // Normalize: kebab → snake. Strip optional `-rounded` / `-outline-rounded` /
  // `-outline` suffixes that Figma sometimes appends.
  let base = glyph;
  let stylePref: 'rounded' | 'outlined' = 'rounded';
  let fillPref: 'fill' | 'outline' = options.outlined ? 'outline' : 'fill';

  if (base.endsWith('-outline-rounded')) {
    base = base.slice(0, -'-outline-rounded'.length);
    stylePref = 'rounded';
    fillPref = 'outline';
  } else if (base.endsWith('-outline')) {
    base = base.slice(0, -'-outline'.length);
    fillPref = 'outline';
    // outlined-without-style-suffix — try rounded first, then outlined
  } else if (base.endsWith('-rounded')) {
    base = base.slice(0, -'-rounded'.length);
    stylePref = 'rounded';
  }

  const snake = base.replace(/-/g, '_');
  const tryPaths: string[] = [];
  const fillSuffix = '-fill.svg';
  const noFillSuffix = '.svg';
  const primarySuffix = fillPref === 'fill' ? fillSuffix : noFillSuffix;
  const secondarySuffix = fillPref === 'fill' ? noFillSuffix : fillSuffix;

  // Style preference order: stylePref first, the other second.
  const styles: Array<'rounded' | 'outlined'> = stylePref === 'rounded' ? ['rounded', 'outlined'] : ['outlined', 'rounded'];

  for (const style of styles) {
    tryPaths.push(path.join(MS_DIR, style, snake + primarySuffix));
  }
  for (const style of styles) {
    tryPaths.push(path.join(MS_DIR, style, snake + secondarySuffix));
  }

  for (const p of tryPaths) {
    if (existsSync(p)) return p;
  }
  return null;
}

interface BuildEntry {
  semantic: string;
  fillSvg: string | null;
  outlineSvg: string | null;
  fillSource: string | null; // for logging
  outlineSource: string | null;
}

interface Overrides {
  comment?: string;
  icons: Record<string, { fill?: string; outline?: string }>;
}

async function loadOverrides(): Promise<Overrides['icons']> {
  if (!existsSync(OVERRIDES)) return {};
  const raw = await readFile(OVERRIDES, 'utf8');
  const parsed = JSON.parse(raw) as Overrides;
  return parsed.icons ?? {};
}

async function main(): Promise<void> {
  const raw = await readFile(SNAPSHOT, 'utf8');
  const inv: Inventory = JSON.parse(raw);
  const overrides = await loadOverrides();

  // Group by semantic name so we collapse Filled + Outlined into one entry.
  const bySemantic = new Map<string, BuildEntry>();
  const unmapped: string[] = [];
  const skippedNoGlyph: string[] = [];
  const overridden: string[] = [];

  for (const comp of inv.components) {
    const parsed = parseLetaName(comp.name);
    if (!parsed) continue;
    if (!comp.glyph) {
      skippedNoGlyph.push(`${comp.name} (raw: ${comp.raw ?? 'n/a'})`);
      continue;
    }

    const file = resolveGlyphFile(comp.glyph, { outlined: parsed.outlined });
    if (!file) {
      unmapped.push(`${comp.name} → ${comp.glyph} (no MS file found)`);
      continue;
    }

    const svg = await readFile(file, 'utf8');
    const existing = bySemantic.get(parsed.semantic) ?? {
      semantic: parsed.semantic,
      fillSvg: null,
      outlineSvg: null,
      fillSource: null,
      outlineSource: null,
    };
    if (parsed.outlined) {
      existing.outlineSvg = svg;
      existing.outlineSource = path.relative(MS_DIR, file);
    } else {
      existing.fillSvg = svg;
      existing.fillSource = path.relative(MS_DIR, file);
    }
    bySemantic.set(parsed.semantic, existing);
  }

  // Apply hand-authored overrides last so they win over auto-resolved glyphs.
  // Use case: small circle (Circle-Medium) that doesn't exist in Material Symbols.
  for (const [semantic, value] of Object.entries(overrides)) {
    const existing = bySemantic.get(semantic) ?? {
      semantic,
      fillSvg: null,
      outlineSvg: null,
      fillSource: null,
      outlineSource: null,
    };
    if (value.fill) {
      existing.fillSvg = value.fill;
      existing.fillSource = '(override)';
    }
    if (value.outline) {
      existing.outlineSvg = value.outline;
      existing.outlineSource = '(override)';
    }
    bySemantic.set(semantic, existing);
    overridden.push(semantic);
  }

  await mkdir(GENERATED_DIR, { recursive: true });

  // Emit registry: Record<semanticName, { fill, outline }>
  const entries = Array.from(bySemantic.values()).sort((a, b) =>
    a.semantic.localeCompare(b.semantic),
  );
  const safeKey = (s: string) => JSON.stringify(s);

  const registryLines: string[] = [];
  registryLines.push('/* Auto-generated by build-registry.ts — DO NOT EDIT. */');
  registryLines.push('// Each entry pairs the filled and outlined SVG for a semantic icon.');
  registryLines.push('export interface IconRegistryEntry {');
  registryLines.push('  /** Filled SVG markup (default render). */');
  registryLines.push('  readonly fill: string | null;');
  registryLines.push('  /** Outlined SVG markup (used when `outlined` prop is true). */');
  registryLines.push('  readonly outline: string | null;');
  registryLines.push('}');
  registryLines.push('export const REGISTRY = {');
  for (const e of entries) {
    registryLines.push(`  ${safeKey(e.semantic)}: {`);
    registryLines.push(`    fill: ${e.fillSvg ? JSON.stringify(e.fillSvg) : 'null'},`);
    registryLines.push(`    outline: ${e.outlineSvg ? JSON.stringify(e.outlineSvg) : 'null'},`);
    registryLines.push('  },');
  }
  registryLines.push('} as const satisfies Record<string, IconRegistryEntry>;\n');
  registryLines.push('export type IconName = keyof typeof REGISTRY;\n');

  await writeFile(path.join(GENERATED_DIR, 'registry.ts'), registryLines.join('\n'), 'utf8');

  // Diagnostics
  const totalComponents = inv.components.length;
  const built = entries.length;
  const fillCount = entries.filter((e) => e.fillSvg).length;
  const outlineCount = entries.filter((e) => e.outlineSvg).length;
  const both = entries.filter((e) => e.fillSvg && e.outlineSvg).length;

  console.log(`Built icon registry from ${totalComponents} Figma components`);
  console.log(`  ${built} unique semantic names`);
  console.log(`  ${fillCount} have a filled glyph`);
  console.log(`  ${outlineCount} have an outline glyph`);
  console.log(`  ${both} have both`);
  if (overridden.length > 0) {
    console.log(`  ${overridden.length} hand-overridden: ${overridden.join(', ')}`);
  }
  console.log(`  ${skippedNoGlyph.length} skipped (no glyph mapping in Figma):`);
  for (const s of skippedNoGlyph) console.log(`    - ${s}`);
  if (unmapped.length > 0) {
    console.log(`  ${unmapped.length} unresolved (Figma glyph name didn't match @material-symbols/svg-500):`);
    for (const u of unmapped) console.log(`    - ${u}`);
  }
}

main().catch((err: unknown) => {
  console.error('build-registry failed:', err);
  process.exit(1);
});
