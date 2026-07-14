# Figma → Code Sync Report

**Scan date**: 2026-07-14 06:00 UTC
**Previous scan**: 2026-07-08 06:30 UTC
**Figma file**: `Kxbgc2KoJSmTxvSV3PwNEu` ("Library")
**Scan mode**: `--deep` (full byte-for-byte variant capture across all 93 COMPONENT_SETs + 393 standalone components = 486 catalog entries)
**Snapshot dir**: `packages/cli/snapshots/`
**Code dir cross-checked**: `packages/components/src/`

## Summary

| Category | Added | Removed | Renamed | Changed |
|---|---:|---:|---:|---:|
| Tokens | 0 | 0 | 0 | 0 |
| Effect styles | 0 | 0 | 0 | 0 |
| Components | 0 | 0 | n/a | 65 variant-prop changes (1 component) |
| Descriptions | 0 | 0 | n/a | 0 |
| Annotations | 0 | 0 | n/a | 0 |

**Headline**: The only structural/visual drift is **Desktop Button — all 65 Plain variants had their `cornerRadius` set to 0** (was 8/12). No token, effect-style, component add/remove, axis, or documentation changes anywhere in the library.

> Note: the three empty-dropdown variants the designer flagged (Combobox-Search Empty, Basic-Filter-Search Empty, Filter-Group Empty on **Desktop Dropdowns `8230:26475`**) do **not** appear in the variant-prop diff because their edit is a *composed-content copy change* (`"All reviews will be displayed here" → "Try adjusting your search."` inside the nested Empty State), which is below the variant-frame granularity the diff compares. Verified directly by walking each variant (see Components → Empty-dropdown variants below).

---

## Tokens

No changes. Fingerprint of the committed snapshots (Jun-28 pull, last confirmed in-sync 2026-07-08) matches; not re-fetched this run.

## Effect styles

No changes.

---

## Components

### Added / Removed / Axis changes

None. All 486 catalog entries (93 sets + 393 standalone) present and structurally identical to the 2026-07-08 baseline.

### Per-variant visual property changes

**`Desktop Button`** ([`28:38245`](https://www.figma.com/design/Kxbgc2KoJSmTxvSV3PwNEu/Library?node-id=28-38245)) — **65 variants changed** — `cornerRadius 8/12 → 0` across **every Plain variant** (all Sizes × all Types × all States).

| Scope | Property | Old | New | Code location |
|---|---|---|---|---|
| `Variant=Plain, Size=Medium/Small` (all Types/States) | cornerRadius | 8 | 0 | `Button.tsx` — `radius = isPlain ? 0 : …` |
| `Variant=Plain, Size=Large` (all Types/States) | cornerRadius | 12 | 0 | `Button.tsx` — `radius = isPlain ? 0 : …` |

Confirmed via deep leaf walk: the Plain button's underline is a dedicated full-width `Underline` VECTOR (1px stroke, spans icon+gap+label — e.g. 78px for Leading Icon), while the label TEXT carries `textDecoration: NONE`. **Code status: `code-needs-update` → DONE this session** (see Action items).

### Empty-dropdown variants (content-copy change, below diff granularity)

**`Desktop Dropdowns`** ([`8230:26475`](https://www.figma.com/design/Kxbgc2KoJSmTxvSV3PwNEu/Library?node-id=8230-26475)) — three variants, all now render the nested Empty State with Title **"No Matching Results"** + subtitle **"Try adjusting your search."** (text-only / No-Icon EmptyState). Verified by walking each:

- **Combobox-Search (Empty)** (`3363:25930`) — search field + centered text-only Empty State + Pagination footer ("1 - 10 of 10").
- **Basic Filter-Search (Empty)** (`10666:15897`) — search field + text-only Empty State (No-Icon, 84px) + Footer Frame (Reset / Show Results).
- **Filter Group Empty** (`7312:88700`) — two-pane (filter-group rows | search + text-only Empty State) + Footer Frame ("30 results" / Reset / Show Results).

**Code status: `code-already-matches`** — the working tree already sets `EmptyState` `no-results` default copy to "Try adjusting your search." and all three variants render `<EmptyState type="no-results" size="desktop" showIcon={false} />` with no override. Verified live in Storybook.

---

## Documentation

No description or annotation changes.

---

## Action items

- [x] `Button.tsx` — Plain `cornerRadius → 0`: set `radius = isPlain ? 0 : (platform==='mobile' ? PILL : layout.desktopRadius)` ([28:38245](https://www.figma.com/design/Kxbgc2KoJSmTxvSV3PwNEu/Library?node-id=28-38245)). **Done.**
- [x] `Button.tsx` — Plain underline must span the whole content row (icons + label): replaced `text-decoration: underline` with `border-bottom: 1px solid currentColor` on `.leta-btn--plain.leta-btn--underline`, and excluded Icon-Only Plain from the underline class. **Done.** (This mirrors Figma's full-width `Underline` VECTOR; text-decoration only underlined the text run, leaving flex-item icons bare.)
- [x] `EmptyState.tsx` / `DesktopDropdowns.tsx` — three empty-dropdown variants copy "Try adjusting your search." **Already in working tree; verified in Storybook.**
- [x] Rebuild `@leta/components` dist (playground consumes the built dist). **Done.**
- [ ] Re-run parity for Desktop Button (`28:38245`) at a convenient point — informational only (Plain radius is the sole change).

**Figma library**: clean — this scan was read-only (no descriptions/variables written), so no publish is required from the sync itself.
