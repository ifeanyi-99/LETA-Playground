/* eslint-disable no-console */
// `tokens:sync` = fetch fresh snapshots from Figma, then regenerate outputs.
// Used by developers after Figma variables change. CI runs `tokens:check`
// instead (since CI doesn't have Figma desktop).
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function run(script: string): void {
  console.log(`\n--- Running ${script} ---`);
  const result = spawnSync('node', ['--import', 'tsx', path.resolve(__dirname, script)], {
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('./fetch.ts');
run('./generate.ts');
