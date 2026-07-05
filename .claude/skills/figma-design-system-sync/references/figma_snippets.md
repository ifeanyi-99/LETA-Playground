# Figma Plugin API snippets

These are the `figma_execute` snippets the skill runs in Phase 2. Each is async, expected to be the *entire* body passed to `figma_execute` (the runner wraps it in an async IIFE). Each returns JSON.

The skill assumes `figma.root` is the LETA design system file. If running against a different file the user has explicitly approved, the snippets work the same — they don't hardcode anything file-specific.

## Important: `figma.mixed` symbol handling

Figma represents "mixed" values (e.g. a frame whose children have different corner radii) as a JavaScript **Symbol** (`figma.mixed`). Symbols **cannot survive `postMessage` marshalling** — if a Symbol ever ends up in the return value, the entire snippet fails with:

```
Error: in postMessage: Cannot unwrap symbol
```

Every property that *can* be mixed must be guarded. The two helpers below cover the cases: `num(v)` for numeric props, `s(v)` for everything else. Use them on *every* read of `cornerRadius`, `fills`, `strokes`, `strokeAlign`, `strokeWeight`, `textStyleId`, `characters`, `width`, `height`, padding, item spacing. The cost is small — the cost of forgetting is the entire batch failing.

The snippets below already apply this. Don't strip the helpers when copy-pasting.

## List all library components

Walks every page and emits every `COMPONENT` and `COMPONENT_SET`. Component-set wrappers include `variantGroupProperties` (the axes); their children (the variant rows) are captured by the next snippet.

```javascript
await figma.loadAllPagesAsync();

const out = [];
for (const page of figma.root.children) {
  const stack = [...page.children];
  while (stack.length) {
    const n = stack.pop();
    if (!n) continue;
    if (n.type === 'COMPONENT_SET') {
      out.push({
        nodeId: n.id,
        name: n.name,
        pageName: page.name,
        type: 'COMPONENT_SET',
        key: n.key ?? null,
        variantGroupProperties: n.variantGroupProperties ?? null,
        childCount: n.children?.length ?? 0,
        bbox: { x: n.x, y: n.y, width: n.width, height: n.height },
      });
      continue; // don't descend into variant children here
    }
    if (n.type === 'COMPONENT') {
      // Skip variant children of a COMPONENT_SET — those are captured separately.
      const parentIsSet = n.parent && n.parent.type === 'COMPONENT_SET';
      if (!parentIsSet) {
        out.push({
          nodeId: n.id,
          name: n.name,
          pageName: page.name,
          type: 'COMPONENT',
          key: n.key ?? null,
          bbox: { x: n.x, y: n.y, width: n.width, height: n.height },
        });
      }
      continue;
    }
    if ('children' in n) {
      for (const c of n.children) stack.push(c);
    }
  }
}
return { count: out.length, components: out };
```

## Capture variant visual properties (symbol-safe)

Given a list of COMPONENT_SET nodeIds, walks each set's children (the variants) and captures layout/visual props. Pass the ids in as a JS array literal in the snippet.

```javascript
const setIds = [/* paste COMPONENT_SET nodeIds here */];

const MIXED = '__MIXED__';
// Any Symbol becomes the string sentinel '__MIXED__' so downstream JSON survives.
function s(v) { return typeof v === 'symbol' ? MIXED : v; }
// Numeric reads: keep numbers, surface mixed, default everything else to null.
function num(v) { return typeof v === 'number' ? v : (typeof v === 'symbol' ? MIXED : null); }

function pickFill(fills) {
  if (typeof fills === 'symbol') return MIXED;
  if (!Array.isArray(fills) || !fills.length) return null;
  const f = fills[0];
  if (!f) return null;
  if (f.type === 'SOLID') {
    const v = (f.boundVariables && f.boundVariables.color && f.boundVariables.color.id) || null;
    return { type: 'SOLID', tokenId: v, color: f.color, opacity: f.opacity ?? 1 };
  }
  return { type: f.type };
}

function pickStroke(strokes, weight, align) {
  if (typeof strokes === 'symbol') return MIXED;
  if (!Array.isArray(strokes) || !strokes.length) return null;
  return { fill: pickFill(strokes), weight: num(weight), align: s(align) };
}

function captureLeaf(n) {
  try {
    const base = { nodeId: n.id, name: n.name, type: n.type };
    if ('width' in n) base.width = num(n.width);
    if ('height' in n) base.height = num(n.height);
    if (n.type === 'TEXT') {
      try { base.characters = n.characters; } catch (e) { base.characters = MIXED; }
      base.textStyleId = (typeof n.textStyleId === 'string')
        ? n.textStyleId
        : (typeof n.textStyleId === 'symbol' ? MIXED : null);
    }
    if ('fills' in n)   base.fills = pickFill(n.fills);
    if ('strokes' in n) base.strokes = pickStroke(n.strokes, n.strokeWeight, n.strokeAlign);
    if ('cornerRadius' in n) base.cornerRadius = num(n.cornerRadius);
    return base;
  } catch (e) {
    return { nodeId: n?.id ?? null, name: n?.name ?? null, type: n?.type ?? null, error: String(e?.message || e) };
  }
}

function captureVariant(v) {
  try {
    return {
      nodeId: v.id,
      variantName: v.name,
      width: num(v.width),
      height: num(v.height),
      paddingLeft: num(v.paddingLeft),
      paddingRight: num(v.paddingRight),
      paddingTop: num(v.paddingTop),
      paddingBottom: num(v.paddingBottom),
      itemSpacing: num(v.itemSpacing),
      cornerRadius: num(v.cornerRadius),
      fills: 'fills' in v ? pickFill(v.fills) : null,
      strokes: 'strokes' in v ? pickStroke(v.strokes, v.strokeWeight, v.strokeAlign) : null,
      leaves: ('children' in v) ? v.children.map(captureLeaf) : [],
    };
  } catch (e) {
    return { nodeId: v?.id ?? null, variantName: v?.name ?? null, error: String(e?.message || e) };
  }
}

const out = {};
for (const id of setIds) {
  const set = await figma.getNodeByIdAsync(id);
  if (!set || set.type !== 'COMPONENT_SET') { out[id] = null; continue; }
  out[id] = (set.children || []).map(captureVariant);
}
return { batch: 'variant-capture', setCount: setIds.length, data: out };
```

### When a single component set is too large

If a set has hundreds of variants (e.g. Desktop Button: 550), the response will overflow even on its own. Paginate by halves *inside* the snippet:

```javascript
const set = await figma.getNodeByIdAsync(setId);
const all = set?.children || [];
const half = Math.ceil(all.length / 2);
// First call: all.slice(0, half)
// Second call: all.slice(half)
const chunk = all.slice(0, half).map(captureVariant);
return { batch: 'desktop-button-half-1', setId, total: all.length, chunkSize: chunk.length, data: chunk };
```

Merge halves on the Python side. See `scripts/parse_mcp_overflow.py` for the merge pattern.

## All annotations + descriptions in one pass

Avoid 400+ individual `figma_get_annotations` calls — walk the tree once and collect everything:

```javascript
await figma.loadAllPagesAsync();
const annotations = {};
const descriptions = {};
for (const page of figma.root.children) {
  const stack = [...page.children];
  while (stack.length) {
    const n = stack.pop();
    if (!n) continue;
    const isComp = (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET');
    if (isComp) {
      try {
        const desc = n.description;
        if (typeof desc === 'string' && desc.length) {
          descriptions[n.id] = { name: n.name, description: desc };
        }
      } catch (e) {}
    }
    try {
      const anns = n.annotations;
      if (Array.isArray(anns) && anns.length) {
        annotations[n.id] = {
          name: n.name,
          annotations: anns.map(a => ({
            categoryId: (typeof a.categoryId === 'string') ? a.categoryId : null,
            label: typeof a.label === 'string' ? a.label : null,
          })),
        };
      }
    } catch (e) {}
    // Don't descend into variant children of a COMPONENT_SET — we already handled the set itself.
    if (n.type === 'COMPONENT_SET') continue;
    if ('children' in n) for (const c of n.children) stack.push(c);
  }
}
return { annotations, descriptions };
```

In a typical LETA scan this returns ~5–15KB — small enough to come back inline. If you're tracking a much larger file and it overflows, drop into the same parse-from-disk pattern as the variant capture.

## Read a single component's description (one-off)

Useful when you only need a specific node and not the whole-file walk:

```javascript
const node = await figma.getNodeByIdAsync('<nodeId>');
return {
  nodeId: node?.id ?? null,
  name: node?.name ?? null,
  description: node?.description ?? null,
};
```

## Notes on the bridge

`figma_execute` runs inside the Figma Desktop plugin, so all `figma.*` APIs are available. The MCP marshals the returned value back as JSON, so don't return functions or Figma node references — only plain data. The snippets above all return JSON-serializable shapes.

If the MCP shows `otherInstances` in the websocket status (i.e. another bridge is running on a sibling port — usually `9226` from a `pnpm tokens:fetch` session), the figma-console MCP transparently falls back to `9225`. The scan still works, but tell the user, because it explains lower throughput and rules out the bridge as a culprit if anything goes wrong mid-scan.
