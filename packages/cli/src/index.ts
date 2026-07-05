#!/usr/bin/env node
/* eslint-disable no-console */
// Top-level dispatcher: `leta <command>`. For now, individual scripts are run
// directly via the package.json scripts (`tokens:generate`, etc.) using tsx.
const cmd = process.argv[2];

const commands: Record<string, string> = {
  'tokens:fetch': './commands/fetch.js',
  'tokens:generate': './commands/generate.js',
  'tokens:check': './commands/check.js',
  'tokens:sync': './commands/sync.js',
};

if (!cmd || !(cmd in commands)) {
  console.error('Usage: leta <command>');
  console.error('Available commands:');
  for (const c of Object.keys(commands)) console.error(`  ${c}`);
  process.exit(cmd ? 1 : 0);
}

await import(commands[cmd]!);
export {};
