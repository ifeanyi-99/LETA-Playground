# Figma Changes — 2026-06-03

| | |
|---|---|
| Scan date | 2026-06-03 |
| Previous baseline | 2026-05-27 |
| Figma file | `Kxbgc2KoJSmTxvSV3PwNEu` ("Library") |
| Snapshot dir | `packages/cli/snapshots/` |
| Report | `docs/figma-changes/FIGMA_CHANGES_2026-06-03.md` |
| Mode | Tier 1 catalog + Tier 2 for flagged targets |

## Summary

| Category | Count |
|---|---|
| Tokens added / removed / changed | 0 / 0 / 0 |
| Effect styles changed | 0 |
| Components added | 3 |
| Components removed | 0 |
| Variant axis changed | 1 |
| Descriptions added / changed | 0 / 0 |
| Annotations added / changed | 0 / 0 |

> **Note on icon renames:** This session normalized **38 icon component names** (typo fixes,
> space→hyphen, dedup-by-glyph) and added `Icon/Deactivate`. The catalog diff keys by `nodeId`,
> so renames on an existing node are **not** surfaced as add/remove here — but they are fully
> reflected in the refreshed baseline and already propagated to `@leta/icons` (see below).

## Components

### Added (3 new nodeIds since 2026-05-27)

| Component | Page | nodeId | Code status |
|---|---|---|---|
| `Icon/Account` | Atoms | `10114:20014` | ✅ already synced to `@leta/icons` this session |
| `Icon/Account-Outline` | Atoms | `10114:20013` | ✅ already synced to `@leta/icons` |
| `Icon/Deactivate` | Atoms | `10134:10470` | ✅ created + synced this session (glyph `block`) |

*(Flag, Weight, Code, Barcode pairs were already present in the 2026-05-27 baseline — not new.)*

### Variant axis changed (1)

| Component | nodeId | Change | Code status |
|---|---|---|---|
| `Page Tabs Control` | `3907:71981` | Axis `Property 1` now `Basic, Wizard` — **"Scrollable" variant removed** by designer | `code-already-matches` — `packages/components/src/PageTabsControl` never implemented Scrollable (noted in CLAUDE.md 2026-05-27) |

## Tokens / Effect styles
No changes since the last baseline.

## Documentation
No description or annotation changes (8 annotated components, 28 descriptions — unchanged).

## Action items
Effectively none outstanding — this scan's structural changes were produced/handled in the same session:

- [x] `@leta/icons` synced to current Figma icon set (356 components → 254 semantic names) via `inventory.json` regen + `pnpm registry`.
- [x] `Icon/Account` (+Outline) and `Icon/Deactivate` present in the regenerated registry.
- [x] `Page Tabs Control` "Scrollable" removal — code already matches (no implementation existed).
- [ ] **Publish the Figma library** so downstream consumers receive the renamed icons + new `Icon/Deactivate` + the synced swap lists. *(Manual, user.)*
