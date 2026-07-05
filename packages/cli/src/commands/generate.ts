/* eslint-disable no-console */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAllSnapshots } from '../tokens/load.js';
import { generateCss } from '../tokens/generators/css.js';
import { generateTextStylesCss } from '../tokens/generators/text-styles.js';
import { generateTokensTs } from '../tokens/generators/ts.js';
import { generateTailwindPreset } from '../tokens/generators/tailwind.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// CLI sits at packages/cli; design-tokens is a sibling package.
const TOKENS_PKG = path.resolve(__dirname, '../../../design-tokens');
const DIST_DIR = path.join(TOKENS_PKG, 'dist');
const GENERATED_SRC_DIR = path.join(TOKENS_PKG, 'src', 'generated');

async function main(): Promise<void> {
  const snapshots = await loadAllSnapshots();

  const tokensCss = generateCss(snapshots);
  const textStylesCss = generateTextStylesCss(snapshots);
  const tokensTs = generateTokensTs(snapshots);
  const tailwindPreset = generateTailwindPreset(snapshots);

  await mkdir(DIST_DIR, { recursive: true });
  await mkdir(GENERATED_SRC_DIR, { recursive: true });
  await Promise.all([
    writeFile(path.join(DIST_DIR, 'tokens.css'), tokensCss, 'utf8'),
    writeFile(path.join(DIST_DIR, 'text-styles.css'), textStylesCss, 'utf8'),
    writeFile(path.join(DIST_DIR, 'tailwind.preset.cjs'), tailwindPreset, 'utf8'),
    // tokens.ts is a regular TypeScript source file, not a build output —
    // it gets re-exported from src/index.ts and bundled by tsup.
    writeFile(path.join(GENERATED_SRC_DIR, 'tokens.ts'), tokensTs, 'utf8'),
  ]);

  console.log(`Generated tokens:`);
  console.log(`  ${path.relative(process.cwd(), DIST_DIR)}/tokens.css        (CSS custom properties + theme/breakpoint cascade)`);
  console.log(`  ${path.relative(process.cwd(), DIST_DIR)}/text-styles.css   (text style utility classes)`);
  console.log(`  ${path.relative(process.cwd(), DIST_DIR)}/tailwind.preset.cjs (Tailwind theme extension)`);
  console.log(`  ${path.relative(process.cwd(), GENERATED_SRC_DIR)}/tokens.ts          (TypeScript token map)`);
}

main().catch((err: unknown) => {
  console.error('Token generation failed:', err);
  process.exit(1);
});
