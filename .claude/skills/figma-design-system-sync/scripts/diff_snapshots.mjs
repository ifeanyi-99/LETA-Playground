#!/usr/bin/env node
// Diff two snapshot directories and emit a structured JSON diff to stdout (or --out).
//
// Usage:
//   node diff_snapshots.mjs --old <dir> --new <dir> [--out <file>] [--catalog-only]
//
// Modes:
//   default        Full diff including per-variant visual properties (variant_props_changed).
//                  Requires new <dir>/components.json to contain `variants` arrays.
//   --catalog-only Skip variant_props_changed entirely. Adds a top-level _tier2_targets
//                  array listing nodeIds whose metadata changed (added components +
//                  variant_axis_changed). Used in Tier 1 to decide whether Tier 2 needs
//                  to run at all.
//
// The script is tolerant of missing files — it treats them as empty, so a first run
// produces a diff equivalent to "everything is added".

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function parseArgs(argv) {
  // Supports --flag value and bare --flag (boolean). Required for --catalog-only.
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

function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    process.stderr.write(`warn: failed to parse ${path}: ${e.message}\n`);
    return null;
  }
}

// Diff a flat token-style map. Values may be primitives OR objects keyed by mode.
function diffFlatTokens(oldMap, newMap) {
  const oldKeys = new Set(Object.keys(oldMap || {}));
  const newKeys = new Set(Object.keys(newMap || {}));
  const added = [];
  const removed = [];
  const valueChanged = [];

  for (const k of newKeys) {
    if (!oldKeys.has(k)) {
      added.push({ name: k, value: newMap[k] });
      continue;
    }
    const oldV = oldMap[k];
    const newV = newMap[k];
    // Mode-aware: if value is an object with mode keys, diff per mode
    if (oldV && typeof oldV === 'object' && !Array.isArray(oldV) &&
        newV && typeof newV === 'object' && !Array.isArray(newV)) {
      const allModes = new Set([...Object.keys(oldV), ...Object.keys(newV)]);
      for (const mode of allModes) {
        if (JSON.stringify(oldV[mode]) !== JSON.stringify(newV[mode])) {
          valueChanged.push({ name: k, mode, from: oldV[mode], to: newV[mode] });
        }
      }
    } else if (JSON.stringify(oldV) !== JSON.stringify(newV)) {
      valueChanged.push({ name: k, from: oldV, to: newV });
    }
  }
  for (const k of oldKeys) {
    if (!newKeys.has(k)) removed.push({ name: k, value: oldMap[k] });
  }
  return { added, removed, renamed: [], value_changed: valueChanged };
}

function diffComponents(oldList, newList, opts = {}) {
  const { catalogOnly = false } = opts;
  const oldById = new Map((oldList || []).map(c => [c.nodeId, c]));
  const newById = new Map((newList || []).map(c => [c.nodeId, c]));
  const added = [];
  const removed = [];
  const variantAxisChanged = [];
  const variantPropsChanged = [];

  for (const [id, n] of newById) {
    if (!oldById.has(id)) {
      added.push({ nodeId: id, name: n.name, pageName: n.pageName });
      continue;
    }
    const o = oldById.get(id);
    // Variant axis diff
    if (n.type === 'COMPONENT_SET') {
      const oldAxes = o.variantGroupProperties || {};
      const newAxes = n.variantGroupProperties || {};
      const axesAdded = Object.keys(newAxes).filter(a => !(a in oldAxes));
      const axesRemoved = Object.keys(oldAxes).filter(a => !(a in newAxes));
      const valuesAdded = {};
      const valuesRemoved = {};
      for (const a of Object.keys(newAxes)) {
        if (!(a in oldAxes)) continue;
        const oldVals = new Set(oldAxes[a].values || []);
        const newVals = new Set(newAxes[a].values || []);
        const va = [...newVals].filter(v => !oldVals.has(v));
        const vr = [...oldVals].filter(v => !newVals.has(v));
        if (va.length) valuesAdded[a] = va;
        if (vr.length) valuesRemoved[a] = vr;
      }
      if (axesAdded.length || axesRemoved.length ||
          Object.keys(valuesAdded).length || Object.keys(valuesRemoved).length) {
        variantAxisChanged.push({
          nodeId: id, name: n.name,
          axes_added: axesAdded, axes_removed: axesRemoved,
          values_added: valuesAdded, values_removed: valuesRemoved,
        });
      }
      // Per-variant prop diff — skipped entirely in catalog-only mode (Tier 1).
      if (catalogOnly) continue;
      const oldVariants = new Map((o.variants || []).map(v => [v.variantName, v]));
      const newVariants = new Map((n.variants || []).map(v => [v.variantName, v]));
      const propKeys = ['width', 'height', 'paddingLeft', 'paddingRight', 'paddingTop',
                        'paddingBottom', 'itemSpacing', 'cornerRadius'];
      for (const [name, nv] of newVariants) {
        const ov = oldVariants.get(name);
        if (!ov) continue; // new variant, captured under variant_axis_changed
        for (const p of propKeys) {
          if (nv[p] !== ov[p] && (nv[p] != null || ov[p] != null)) {
            variantPropsChanged.push({
              nodeId: id, name: n.name, variantName: name,
              prop: p, from: ov[p], to: nv[p],
            });
          }
        }
        // Fill / stroke / radius token id diff
        const oldFillToken = ov.fills?.tokenId ?? null;
        const newFillToken = nv.fills?.tokenId ?? null;
        if (oldFillToken !== newFillToken) {
          variantPropsChanged.push({
            nodeId: id, name: n.name, variantName: name,
            prop: 'fills.tokenId', from: oldFillToken, to: newFillToken,
          });
        }
      }
    }
  }
  for (const [id, o] of oldById) {
    if (!newById.has(id)) removed.push({ nodeId: id, name: o.name });
  }
  return {
    added, removed,
    variant_axis_changed: variantAxisChanged,
    variant_props_changed: variantPropsChanged,
  };
}

function diffKeyedText(oldMap, newMap, valueKey = null) {
  // Generic diff for { nodeId: string | array } maps (descriptions/annotations)
  const oldKeys = new Set(Object.keys(oldMap || {}));
  const newKeys = new Set(Object.keys(newMap || {}));
  const added = [];
  const removed = [];
  const changed = [];

  for (const k of newKeys) {
    const ov = oldMap?.[k];
    const nv = newMap?.[k];
    if (ov == null && nv != null) { added.push({ nodeId: k, value: nv }); continue; }
    if (JSON.stringify(ov) !== JSON.stringify(nv)) {
      changed.push({ nodeId: k, from: ov, to: nv });
    }
  }
  for (const k of oldKeys) {
    if (!newKeys.has(k)) removed.push({ nodeId: k, value: oldMap[k] });
  }
  return { added, removed, changed };
}

function main() {
  const args = parseArgs(process.argv);
  const oldDir = args.old;
  const newDir = args.new;
  const outPath = args.out;
  const catalogOnly = args['catalog-only'] === true;
  if (!oldDir || !newDir) {
    process.stderr.write('usage: node diff_snapshots.mjs --old <dir> --new <dir> [--out <file>] [--catalog-only]\n');
    process.exit(2);
  }

  // Token files we know about
  const tokenFiles = ['alias.json', 'brand.json', 'mapped-colors.json', 'mapped-sizes.json',
                      'mapped-type.json', 'text-styles.json'];
  const tokenDiff = { added: [], removed: [], renamed: [], value_changed: [] };
  for (const f of tokenFiles) {
    const oldMap = readJson(join(oldDir, f)) || {};
    const newMap = readJson(join(newDir, f)) || {};
    const d = diffFlatTokens(oldMap, newMap);
    for (const cat of ['added', 'removed', 'value_changed']) {
      for (const item of d[cat]) tokenDiff[cat].push({ ...item, collection: f.replace('.json', '') });
    }
  }

  const effectDiff = diffFlatTokens(
    readJson(join(oldDir, 'effect-styles.json')) || {},
    readJson(join(newDir, 'effect-styles.json')) || {},
  );

  const oldComponents = readJson(join(oldDir, 'components.json'));
  const newComponents = readJson(join(newDir, 'components.json'));
  const componentDiff = diffComponents(
    oldComponents?.components || [],
    newComponents?.components || [],
    { catalogOnly },
  );

  const oldDescriptions = readJson(join(oldDir, 'descriptions.json'));
  const newDescriptions = readJson(join(newDir, 'descriptions.json'));
  const descDiff = diffKeyedText(
    oldDescriptions?.descriptions || {},
    newDescriptions?.descriptions || {},
  );

  const oldAnnotations = readJson(join(oldDir, 'annotations.json'));
  const newAnnotations = readJson(join(newDir, 'annotations.json'));
  const annDiff = diffKeyedText(
    oldAnnotations?.annotations || {},
    newAnnotations?.annotations || {},
  );

  const result = {
    _meta: {
      old_snapshot: oldComponents?._meta || null,
      new_snapshot: newComponents?._meta || null,
      mode: catalogOnly ? 'catalog-only' : 'full',
    },
    tokens: tokenDiff,
    effect_styles: effectDiff,
    components: componentDiff,
    descriptions: descDiff,
    annotations: annDiff,
  };

  // Catalog-only mode: emit the list of nodeIds that need a Tier 2 deep variant scan.
  // These are components whose metadata changed in ways that could mask visual edits.
  if (catalogOnly) {
    const targets = new Set();
    for (const c of componentDiff.added) targets.add(c.nodeId);
    for (const c of componentDiff.variant_axis_changed) targets.add(c.nodeId);
    result._tier2_targets = [...targets];
  }

  const json = JSON.stringify(result, null, 2);
  if (outPath) writeFileSync(outPath, json);
  else process.stdout.write(json + '\n');
}

main();
