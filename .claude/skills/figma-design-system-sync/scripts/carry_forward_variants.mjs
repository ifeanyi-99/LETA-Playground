#!/usr/bin/env node
// Merge a fresh component catalog with newly-captured Tier 2 variant data and any
// carried-forward variants from the previous baseline, emitting a complete
// components.json for the new baseline.
//
// Usage:
//   node carry_forward_variants.mjs \
//     --catalog <fresh-catalog.json> \
//     --old <previous-components.json> \
//     [--tier2 <tier2-variants.json>] \
//     --out <merged-components.json>
//
// Inputs:
//   --catalog  Fresh catalog from Phase 2b. Shape:
//                { "_meta": {...}, "components": [ { nodeId, name, ..., (no variants) } ] }
//   --old      Previous baseline components.json. Same shape but with `variants` arrays.
//   --tier2    Optional. Map keyed by COMPONENT_SET nodeId → variants array. Components
//              present here get their new Tier 2 data and override any carry-forward.
//   --out      Destination path for the merged components.json.
//
// Behavior per component in the fresh catalog:
//   1. If Tier 2 captured fresh variants for this nodeId → use those.
//   2. Else if the previous baseline has variants for this nodeId → carry them forward.
//   3. Else → leave `variants` absent (e.g. brand-new component when --deep wasn't run).
//
// The _meta block is taken from the fresh catalog file. Old baselines that don't carry
// _meta produce a minimal default.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const tok = argv[i];
    if (!tok.startsWith('--')) continue;
    const k = tok.replace(/^--/, '');
    const next = argv[i + 1];
    if (next != null && !next.startsWith('--')) {
      args[k] = next;
      i++;
    } else {
      args[k] = true;
    }
  }
  return args;
}

function readJson(path, optional = false) {
  if (!existsSync(path)) {
    if (optional) return null;
    process.stderr.write(`error: required file not found: ${path}\n`);
    process.exit(2);
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.catalog || !args.old || !args.out) {
    process.stderr.write(
      'usage: node carry_forward_variants.mjs --catalog <path> --old <path> [--tier2 <path>] --out <path>\n'
    );
    process.exit(2);
  }

  const catalog = readJson(args.catalog);
  const old = readJson(args.old);
  const tier2 = args.tier2 ? readJson(args.tier2, true) : null;

  if (!Array.isArray(catalog.components)) {
    process.stderr.write('error: catalog file missing `components` array\n');
    process.exit(2);
  }

  const oldByNodeId = new Map(
    (old?.components || []).map(c => [c.nodeId, c])
  );

  // Tier 2 input can be a map { nodeId: variants[] } OR an array of {nodeId, variants}.
  // Normalize to a Map.
  const tier2Map = new Map();
  if (tier2) {
    if (Array.isArray(tier2)) {
      for (const entry of tier2) {
        if (entry?.nodeId && Array.isArray(entry.variants)) {
          tier2Map.set(entry.nodeId, entry.variants);
        }
      }
    } else if (typeof tier2 === 'object') {
      for (const [nodeId, variants] of Object.entries(tier2)) {
        if (Array.isArray(variants)) tier2Map.set(nodeId, variants);
      }
    }
  }

  const stats = { tier2: 0, carried: 0, missing: 0, total: catalog.components.length };
  const merged = catalog.components.map(c => {
    const out = { ...c };
    // Only COMPONENT_SETs should have variants. Single COMPONENTs skip this branch.
    if (c.type !== 'COMPONENT_SET') return out;

    if (tier2Map.has(c.nodeId)) {
      out.variants = tier2Map.get(c.nodeId);
      stats.tier2++;
    } else {
      const prior = oldByNodeId.get(c.nodeId);
      if (prior?.variants) {
        out.variants = prior.variants;
        stats.carried++;
      } else {
        // No fresh capture, no prior data — leave absent. Will show up in the next
        // run's diff as "no baseline variants" and likely trigger Tier 2 then.
        stats.missing++;
      }
    }
    return out;
  });

  const result = {
    _meta: catalog._meta || {
      scanned_at: new Date().toISOString(),
      skill_version: '0.3.0',
      note: 'No _meta provided in catalog file; defaults applied.',
    },
    components: merged,
  };

  writeFileSync(args.out, JSON.stringify(result, null, 2));
  process.stderr.write(
    `wrote ${args.out}: total=${stats.total}, tier2_fresh=${stats.tier2}, ` +
    `carried_forward=${stats.carried}, no_variants=${stats.missing}\n`
  );
}

main();
