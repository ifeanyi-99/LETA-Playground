/* eslint-disable no-console */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';
import { BridgeClient } from '../bridge/client.js';
import {
  variableCollectionSnippet,
  textStylesSnippet,
  effectStylesSnippet,
  fileIdentitySnippet,
} from '../bridge/extract.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = path.resolve(__dirname, '../../snapshots');

async function tryConnect(port: number): Promise<{ client: BridgeClient; port: number; fileInfo: import('../bridge/client.js').FileInfo } | null> {
  const client = new BridgeClient({ port, connectionTimeoutMs: 8_000 });
  try {
    const fileInfo = await client.waitForPlugin();
    return { client, port, fileInfo };
  } catch (err) {
    client.close();
    const msg = err instanceof Error ? err.message : String(err);
    // EADDRINUSE on the chosen port → try the next one. Plugin-not-connected
    // is a real error and we surface it after the last attempt.
    if (msg.includes('already in use') || msg.includes('did not connect')) return null;
    throw err;
  }
}

async function main(): Promise<void> {
  console.log('Connecting to Figma Desktop Bridge…');
  const ports = [config.bridgePort, ...config.bridgePortFallbacks];
  console.log(`(Trying ports: ${ports.join(', ')})`);

  let connected: { client: BridgeClient; port: number; fileInfo: import('../bridge/client.js').FileInfo } | null = null;
  for (const port of ports) {
    process.stdout.write(`  port ${port}… `);
    const result = await tryConnect(port);
    if (result) {
      connected = result;
      console.log('connected');
      break;
    }
    console.log('skip');
  }

  if (!connected) {
    throw new Error(
      `Could not connect on any of: ${ports.join(', ')}. ` +
        `Open the LETA Library in Figma and ensure the Desktop Bridge plugin is active ` +
        `(Plugins → Development → Figma Desktop Bridge). If Claude Code is running, quit it first.`,
    );
  }

  const { client, fileInfo } = connected;

  try {
    console.log(`Connected. File: "${fileInfo.fileName ?? '?'}", page: "${fileInfo.pageName ?? '?'}"`);

    // Sanity check — confirm we can talk to the plugin and the file has variables.
    const identityRaw = await client.executeCode<string>(fileIdentitySnippet());
    const identity = JSON.parse(identityRaw) as { fileName: string; collectionCount: number };
    if (identity.collectionCount === 0) {
      throw new Error(
        `The active Figma file ("${identity.fileName}") has zero variable collections. ` +
          `Make sure the LETA Library is the active tab.`,
      );
    }
    console.log(`Sanity check OK: ${identity.collectionCount} variable collections detected.`);

    await mkdir(SNAPSHOT_DIR, { recursive: true });

    // Pull each variable collection sequentially (small, reliable; parallelism
    // doesn't help since the plugin executes one command at a time anyway).
    for (const c of config.collections) {
      process.stdout.write(`  fetching ${c.figmaName}… `);
      const json = await client.executeCode<string>(variableCollectionSnippet(c.figmaName));
      await writeFile(path.join(SNAPSHOT_DIR, c.file), json, 'utf8');
      const parsed = JSON.parse(json) as { variables: unknown[] };
      console.log(`${parsed.variables.length} vars → ${c.file}`);
    }

    // Text styles
    process.stdout.write('  fetching text styles… ');
    const stylesJson = await client.executeCode<string>(textStylesSnippet());
    await writeFile(path.join(SNAPSHOT_DIR, 'text-styles.json'), stylesJson, 'utf8');
    const parsed = JSON.parse(stylesJson) as { count: number };
    console.log(`${parsed.count} styles → text-styles.json`);

    // Effect styles (drop shadows used by Elevation atoms)
    process.stdout.write('  fetching effect styles… ');
    const effectsJson = await client.executeCode<string>(effectStylesSnippet());
    await writeFile(path.join(SNAPSHOT_DIR, 'effect-styles.json'), effectsJson, 'utf8');
    const effectsParsed = JSON.parse(effectsJson) as { count: number };
    console.log(`${effectsParsed.count} effect styles → effect-styles.json`);

    console.log(`\nSnapshots written to ${path.relative(process.cwd(), SNAPSHOT_DIR)}/`);
    console.log("Run 'pnpm tokens:generate' to regenerate the design-token outputs.");
  } finally {
    client.close();
  }
}

main().catch((err: unknown) => {
  console.error('\nError:', err instanceof Error ? err.message : err);
  process.exit(1);
});
