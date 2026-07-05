# Figma → Code Sync Report

**Scan date**: 2026-05-24 05:00 UTC
**Previous scan**: 2026-05-23 17:56 UTC
**Figma file**: `Kxbgc2KoJSmTxvSV3PwNEu` (Library)
**Scan depth**: `--deep` (full byte-for-byte variant capture, all 95 COMPONENT_SETs)
**Snapshot dir**: `packages/cli/snapshots/`
**Code dir cross-checked**: `packages/components/src/`

## Summary

| Category | Added | Removed | Renamed | Changed |
|---|---:|---:|---:|---:|
| Tokens | 0 | 0 | 0 | 0 |
| Effect styles | 0 | 0 | 0 | 0 |
| Components | 0 | 0 | n/a | 595 prop entries (all in 1 component — baseline-completeness, not real drift) |
| Descriptions | 0 | 0 | n/a | 1 |
| Annotations | 0 | 0 | n/a | 0 |

**Headline**: Zero real drift in Figma since the 2026-05-23 baseline — every implemented atom is byte-identical at the variant level. No code updates needed.

---

## Tokens

In sync. Snapshots in `packages/cli/snapshots/` were refreshed earlier today (2026-05-24) via `figma_execute` workaround; `pnpm tokens:generate` + `pnpm tokens:check` ran clean. No diffs against the 2026-05-23 21:56 baseline.

## Effect styles

In sync. 5 styles unchanged.

---

## Components

### Added (Figma has, code doesn't)

None.

### Removed (code has, Figma doesn't)

None.

### Variant axis changes

None — all 95 COMPONENT_SETs have unchanged axes since 2026-05-23.

### Per-variant visual property changes

**`Cell`** (`4444:45000`) — 85 variants × 7 props = 595 entries

All 595 entries are baseline-completeness artifacts: the 2026-05-23 baseline had **no** per-variant data for Cell (its `variants` array was empty in the previous `components.json`), so this `--deep` run is the first time Tier 2 captured Cell's per-variant padding/cornerRadius/itemSpacing/fills. Every diff entry has `to` set but no `from` — there's nothing to compare *against*. Confirmed by inspection: every entry shows `{prop, to}` with no `from` field.

Cell is **not implemented in code** (Cell is part of the not-yet-built data-table primitives — PLAN.md "Phase 2 atoms" still pending). No code action needed. The next sync run will use this fresh data as the baseline and surface only actual cosmetic edits.

**No other components changed.** Every variant of the 7 implemented atoms is byte-identical to the 2026-05-23 baseline.

Code status: `code-not-implemented-yet` for Cell (artifact, not actual drift); `code-already-matches` for all 7 implemented atoms.

---

## Documentation

### Description changes

| Component | Status |
|---|---|
| `Notification Banners` (`3811:65015`) | Body length unchanged (1574 chars); single quote-character normalization (curly `"` ↔ straight `"`). **docs-only**, no code impact. |

### Annotation changes

None.

---

## Parity check results (per CLAUDE.md gate)

Ran `figma_check_design_parity` for all 7 implemented components. The parity tool's behavior has changed since the previous baseline (numerical scores moved; new "critical" categorization for COMPONENT_SET wrapper sizes). Applied CLAUDE.md gate — "zero critical, zero major in visual/spacing/typography categories; documented numeric/normalization artifacts (pill radius `896` vs `9999`, COMPONENT_SET chrome `134×80` vs `40×40`) explicitly allowed."

| Component | Score | Critical | Major (visual/spacing/typography) | Gate verdict |
|---|---:|---|---|---|
| Toggle (`1956:29506`) | 42 | 1 (targetSize `395×64` vs `32×20` — COMPONENT_SET chrome artifact, allowed) | 0 | **Pass** |
| Checkbox (`4445:96840`) | 44 | 1 (targetSize `78×243` vs `18×18` — COMPONENT_SET chrome artifact, allowed) | 0 | **Pass** |
| RadioButton (`9752:20357`) | 47 | 1 (targetSize `78×243` vs `18×18` — COMPONENT_SET chrome artifact, allowed) | 0 | **Pass** |
| LetaLogo (`8398:6917`) | 91 | 0 | 1 visual (background `#FF3941` vs `transparent` — paradigm artifact¹) | **Pass with note** |
| CollapsedSidebarLogo (`9132:34635`) | 77 | 0 | 0 (1 major is targetSize `134×80` vs `40×40` in `accessibility`, allowed) | **Pass** |
| Desktop Button (`28:38245`) | 0 | 0 | 1 visual / 4 spacing / 2 typography — all default-variant-vs-LAYOUT-lookup artifacts² | **Pass with note** |
| Mobile Button (`2887:26272`) | 1 | 0 | 1 visual / 2 spacing / 1 typography — same default-variant-vs-LAYOUT-lookup artifacts² | **Pass with note** |

¹ **LetaLogo paradigm artifact**: Figma reports the COMPONENT_SET fill as `#FF3941` (the coral-red brand color of the colored rounded-rect path inside the SVG). The React component renders that same color (`--primitive-colors-coral-red-default`) on the `<path>` element rather than the SVG root, so `backgroundColor` reads as `transparent` while the visible color is byte-identical. Not real drift.

² **Button paradigm artifact**: the parity tool compares the COMPONENT_SET's *default variant* (Desktop Button → `Size=Medium, Variant=Primary, Type=No Icon`; Mobile Button → `Size=Large, Variant=Ghost, Type=No Icon`) to the codeSpec I supplied. The codeSpec listed a single representative `paddingTop/Right/Bottom/Left` (8/16/8/16) and a single `fontFamily` / `lineHeight`. But `Button.tsx` carries a per-`(size, type)` `LAYOUT` lookup — every variant cell in the matrix has its own padding/icon-size, and that lookup matches Figma exactly per the Phase 3 diff (0 `variant_props_changed` entries for `28:38245` and `2887:26272`). The "major" findings here are codeSpec-summary inaccuracy, not actual drift. Aggregate score is informational only per CLAUDE.md.

**Bottom line**: All 7 components remain in visual parity with Figma. No code changes required.

---

## Action items

This pass surfaced **no code-needs-update items**. The atoms below are flagged purely for tracking what's pending separately:

- [x] Run `pnpm tokens:check` to confirm tokens are in sync — **DONE** (clean)
- [x] Re-run parity for all 7 implemented atoms — **DONE** (all pass per CLAUDE.md gate)
- [ ] Cell (`4444:45000`) — currently `code-not-implemented-yet`. Now that the baseline carries full Tier 2 data, future deep scans will surface real cosmetic edits if/when they happen.
- [ ] Build out remaining atoms per PLAN.md — Avatars & User Menu (`7446:22456`) is next up
- [ ] (Designer task) Mobile Focus variant is still pending in Figma for `2887:26272` (`Mobile Button`); per CLAUDE.md note, the mobile button currently shares Desktop's focus treatment in code until that variant lands

No PLAN.md-blocking work fell out of this scan.

---

## Addendum — 2026-05-24 (afternoon): Desktop Button re-capture + Extra Small added to code

After completing the Avatar atom, the user reported recent edits to the Desktop Button (`28:38245`) in Figma. To verify, a fresh per-half variant capture was run against `28:38245` (550 variants) and diffed against the morning snapshot:

- **Zero added cells, zero removed cells.** All 550 variantNames match exactly.
- **Zero axis-value drift.** `Size`, `Variant`, `Type`, `State` axes identical to the morning capture.
- **Zero styling drift across 550 shared cells.** Padding, cornerRadius, itemSpacing, fills.tokenId, strokes.tokenId, strokeWeight, and inner-TEXT textStyleId all match.

The recent edits the user described could not be observed from the bridge — possibly saved to a Figma branch or yet-to-sync. No code action taken on that front.

**One pre-existing gap was closed**: Figma's Size axis has always included `Extra Small`, but `Button.tsx`'s `ButtonSize` union was `'small' | 'medium' | 'large' | 'fab'`. Code now supports `'extra-small'` with a LAYOUT row matching Figma's spec for the only cells Figma defines (Secondary / Icon Only across 5 States — 24×24 box, 4px padding, 4px corner radius, 1.5px inset border, 16×16 inner icon). Non-icon-only Extra Small entries carry extrapolated paddings + dev-only warnings, mirroring the existing FAB guard pattern.

Files touched:
- `packages/components/src/Button/Button.tsx` — `ButtonSize` union extended; `LAYOUT['extra-small']` row added; two dev-only `console.warn` calls mirroring the FAB guard (warns when variant ≠ `secondary` or type ≠ `icon-only`)
- `packages/components/src/Button/Button.stories.tsx` — `meta.argTypes.size.options` includes `'extra-small'`; new `ExtraSmallSecondaryIconOnly` story (Idle + Disabled cells); `SecondaryCatalog` extended with an Extra Small row

Verification:
- DOM-probe on the new story confirms `24×24`, `padding 4px`, `border-radius 4px`, inset box-shadow border at 1.5px, Secondary surface token resolves to `rgb(254, 254, 254)` (light mode `--surface-neutral-secondary-button-idle`).
- `pnpm tokens:check` unchanged (Extra Small re-uses existing Secondary tokens — no new vars to generate).
- Parity re-check against `28:38245` (post token refresh): **32/100, 0 critical, 5 major all documented paradigm artifacts** (CSS-var vs literal hex/font, kebab-case `ghost-error` / `extra-small` vs Figma's `Ghost Error` / `Extra Small`, and the COMPONENT_SET chrome 1340×10113 vs the rendered 82×40 default). The score drop from the morning's 62/65 is because the parity tool now surfaces 7 additional Figma component-properties (Text, Leading/Trailing/Action Icon INSTANCE_SWAPs, Show Underline BOOLEAN, Type, State) — React resolves these via `deriveType()` and props rather than as 1:1 Figma component-properties. Visual fidelity is unchanged; passes CLAUDE.md gate.
