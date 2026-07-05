# Snapshot file schemas

Three skill-managed JSON files live in `packages/cli/snapshots/` alongside the token snapshots. Each has the same top-level shape: a `_meta` block + a payload.

## components.json

Catalog of every COMPONENT and COMPONENT_SET in the Figma file, plus per-variant visual properties for sets.

```json
{
  "_meta": {
    "scanned_at": "2026-05-23T14:30:00Z",
    "figma_file_key": "Kxbgc2KoJSmTxvSV3PwNEu",
    "skill_version": "0.2.0"
  },
  "components": [
    {
      "nodeId": "28:38245",
      "name": "Desktop Button",
      "pageName": "Atoms / Buttons",
      "type": "COMPONENT_SET",
      "key": "abc123...",
      "variantGroupProperties": {
        "Size": { "values": ["Small", "Medium", "Large", "FAB"] },
        "Type": { "values": ["No Icon", "Leading Icon", "Trailing Icon", "Split Button", "Icon Only", "Prominent Icon Only"] },
        "State": { "values": ["Idle", "Hover", "Pressed", "Focus", "Disabled"] },
        "Variant": { "values": ["Primary", "Secondary", "Tertiary", "Ghost", "Ghost Error", "Plain", "Dashed"] }
      },
      "childCount": 840,
      "bbox": { "x": 0, "y": 0, "width": 4200, "height": 6000 },
      "variants": [
        {
          "nodeId": "28:38246",
          "variantName": "Size=Medium, Type=Leading Icon, State=Idle, Variant=Primary",
          "width": 96,
          "height": 40,
          "paddingLeft": 8,
          "paddingRight": 12,
          "paddingTop": 10,
          "paddingBottom": 10,
          "itemSpacing": 8,
          "cornerRadius": 9999,
          "fills":   { "type": "SOLID", "tokenId": "VariableID:1:2", "color": {"r":0.1,"g":0.1,"b":0.4}, "opacity": 1 },
          "strokes": null,
          "leaves": [
            { "nodeId": "...", "name": "Icon", "type": "INSTANCE", "width": 18, "height": 18 },
            { "nodeId": "...", "name": "Label", "type": "TEXT", "characters": "Button", "textStyleId": "S:abc..." }
          ]
        }
      ]
    },
    {
      "nodeId": "9132:34635",
      "name": "Collapsed Sidebar Logo",
      "pageName": "Atoms / Sidebar",
      "type": "COMPONENT",
      "key": "xyz...",
      "bbox": { "x": 0, "y": 0, "width": 40, "height": 40 }
    }
  ]
}
```

## annotations.json

Keyed by component nodeId. Each value is an array of annotations attached to that node.

```json
{
  "_meta": { "scanned_at": "...", "figma_file_key": "...", "skill_version": "0.2.0" },
  "annotations": {
    "28:38245": [
      { "categoryId": "3030:2", "categoryName": "Accessibility", "label": "Role", "body": "button (native)" },
      { "categoryId": "3030:2", "categoryName": "Accessibility", "label": "Name", "body": "children, OR aria-label when iconOnly" },
      { "categoryId": "3030:1", "categoryName": "Interaction", "label": "Keyboard", "body": "Enter + Space activate" }
    ],
    "9132:34635": []
  }
}
```

## descriptions.json

Keyed by component nodeId. Value is the full description text.

```json
{
  "_meta": { "scanned_at": "...", "figma_file_key": "...", "skill_version": "0.2.0" },
  "descriptions": {
    "28:38245": "Primary desktop button used across the product...\n\n## Accessibility\n- Role: button (native)\n...",
    "9132:34635": "Collapsed sidebar logo that doubles as the expand control..."
  }
}
```

## Token snapshots (already exist, NOT skill-managed)

For reference — these are produced by `pnpm tokens:sync` and the diff script consumes them as-is:

- `alias.json` — semantic token aliases (e.g. `border-secondary-component-focus`)
- `brand.json` — brand-level tokens
- `effect-styles.json` — shadow definitions
- `mapped-colors.json`, `mapped-sizes.json`, `mapped-type.json` — primitive mappings
- `text-styles.json` — text style definitions

Each is a flat JSON map; the diff script treats them as `{ name: value }` objects (or `{ name: { mode: value, mode: value } }` for multi-mode collections).
