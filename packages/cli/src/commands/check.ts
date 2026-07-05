/* eslint-disable no-console */
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAllSnapshots } from '../tokens/load.js';
import { generateCss } from '../tokens/generators/css.js';
import { generateTextStylesCss } from '../tokens/generators/text-styles.js';
import { generateTokensTs } from '../tokens/generators/ts.js';
import { generateTailwindPreset } from '../tokens/generators/tailwind.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_PKG = path.resolve(__dirname, '../../../design-tokens');
const DIST_DIR = path.join(TOKENS_PKG, 'dist');
const GENERATED_SRC_DIR = path.join(TOKENS_PKG, 'src', 'generated');

interface FileCheck {
  path: string;
  expected: string;
}

async function main(): Promise<void> {
  const snapshots = await loadAllSnapshots();

  const checks: FileCheck[] = [
    { path: path.join(DIST_DIR, 'tokens.css'), expected: generateCss(snapshots) },
    { path: path.join(DIST_DIR, 'text-styles.css'), expected: generateTextStylesCss(snapshots) },
    { path: path.join(DIST_DIR, 'tailwind.preset.cjs'), expected: generateTailwindPreset(snapshots) },
    { path: path.join(GENERATED_SRC_DIR, 'tokens.ts'), expected: generateTokensTs(snapshots) },
  ];

  // Ensure dirs exist so missing-file errors are clearer.
  await mkdir(DIST_DIR, { recursive: true });
  await mkdir(GENERATED_SRC_DIR, { recursive: true });

  const drifts: string[] = [];
  for (const c of checks) {
    if (!existsSync(c.path)) {
      drifts.push(`${path.relative(process.cwd(), c.path)} is missing`);
      continue;
    }
    const actual = await readFile(c.path, 'utf8');
    if (actual !== c.expected) {
      drifts.push(`${path.relative(process.cwd(), c.path)} differs from generated output`);
    }
  }

  if (drifts.length > 0) {
    console.error('Figma tokens have drifted from the committed output:\n');
    for (const d of drifts) console.error(`  - ${d}`);
    console.error("\nRun 'pnpm tokens:sync' locally and commit the result.");
    process.exit(1);
  }

  console.log('Tokens are in sync with the Figma snapshots.');
}

main().catch((err: unknown) => {
  console.error('Token check failed:', err);
  process.exit(1);
});
