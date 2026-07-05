# Figma Changes — 2026-07-02

| | |
|---|---|
| **Scan date** | 2026-07-02 |
| **Previous scan** | 2026-06-28 |
| **Figma file** | `Kxbgc2KoJSmTxvSV3PwNEu` ("Library") |
| **Mode** | Tier 1 catalog + targeted Tier 2 (Content Primitives `6961:41406`, Table Data Control `7575:36637`) |
| **Snapshots** | `packages/cli/snapshots/` (components / annotations / descriptions refreshed) |

## Summary

| Category | Changes |
|---|---|
| Tokens | none (not re-pulled; no variable edits reported) |
| Effect styles | none |
| Components added | **1** — `Icon/Redo` |
| Components removed | 0 |
| Variant axis changes | 0 real (93 baseline-format artifacts — old baseline stored `variantGroupProperties: null`) |
| Variant visual changes | **Content Primitives** (Metrics + Section Heading) |
| Structure changes | Table Data Control childCount 3→5 (Active Filter variants — already in code) |
| Docs | +9 descriptions vs baseline (all written via bridge in prior code sessions — docs-only) |

**All action items were implemented in this same session** (user requested implementation, not just a plan). See per-item status below.

## Components

### Added — `Icon/Redo` (`10736:25670`, Atoms) — ✅ implemented
- Key `a4e2873bc39aed0fffc3d1a2ab1505b5a52d6174`, glyph `material-symbols:redo-rounded`, 18×18. **No `-Outline` sibling** → registry `outline: null` (like `Open`).
- Code: added to `packages/icons/snapshots/inventory.json` → `pnpm registry` (now **258 semantic IconNames**, 0 unresolved) → `@leta/icons` dist rebuilt. `<Icon name="Redo" />` works.
- Figma: appended to the **`preferredValues` of all 50 icon instance-swap slots across 28 component sets** (`editComponentProperty`, idempotent — same sweep as `Open`/`Edit-Off`). 0 errors.

### Changed — Content Primitives (`6961:41406`) — ✅ implemented
**Type=Metrics** (height 112 → 108):
- Metric value text style `Heading/M/SemiBold` → **`Heading/S/SemiBold`** → code `text-heading-m-semibold` → `text-heading-s-semibold` (responsive: 20px ≥768px).
- Metric description `Body/S/Regular` → **`Label/S/Regular`** → code `text-body-s-regular` → `text-label-s-regular`.
- Eyebrow (`Label/M/Regular`), variance Badge, 24px outlined anchor — unchanged, already matched.

**Type=Section Heading**:
- Gained a **Visual Anchor** — 20px outlined leading icon (default `Icon/Orders-Outline`) in a 22px pad-top-2 frame, **centered** against the title+subtext block (Leading Content `counterAxis: CENTER`). `Show Visual Anchor` + `Show Leading Icon` default **true**.
- Code: `hasVisualAnchor` now includes `section-heading`; `VisualAnchor` gained `align: 'top' | 'center'` (section-heading passes `center`; Utility/Group Header keep the existing top-pinned behavior).
- Hidden title extras in Figma (Info icon, 2 Desktop Badges, subtext leading icon) have **no component-property definitions** → not part of the API contract; not implemented (flag for the designer if they should be exposed).
- **Nested-instance check** (per CLAUDE.md rule): every Section-Heading instance in Input Section / List Section / Table Section / Extra Large Modal has `Show Visual Anchor: true` → the React organisms inherit the new default correctly (verified in Storybook). Card Utility instances remain `false` → unaffected.

### Structure — Table Data Control (`7575:36637`) — ✅ already matches
childCount 3→5: `Search + Create (Active Filter)` + `Search + Column Control (Active)` variants. The React `TableDataControl` already implements these via `filterCount` (built 2026-07-01). No action.

## Documentation
9 description additions vs the 2026-06-28 baseline — all authored from code sessions via the bridge (Table column-layout spec, Table Data Control, Bulk Actions Toolbar, modal shells, etc.). Docs-only; baseline refreshed.

## Verification
- typecheck + `@leta/components` / `@leta/icons` dist builds clean.
- Storybook (6107): Section Heading shows the centered 20px anchor; Metrics uses the new text styles; Input Section header inherits the anchor. Visually compared against `figma_capture_screenshot 6961:41406`.

## ⚠ Publish required
The `preferredValues` sweep (50 slots × 28 sets) dirtied the Library — **user must publish** for the Redo option to reach consumers.
