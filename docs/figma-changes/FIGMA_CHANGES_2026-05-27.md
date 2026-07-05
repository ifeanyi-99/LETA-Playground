# Figma → Code Sync Report

**Scan date**: 2026-05-27 00:00 UTC  
**Previous scan**: 2026-05-24 05:00 UTC  
**Figma file**: `Kxbgc2KoJSmTxvSV3PwNEu`  
**Snapshot dir**: `packages/cli/snapshots/`  
**Code dir cross-checked**: `packages/components/src/`  
**Scan mode**: `--deep` (full Tier 2 — all 95 COMPONENT_SETs recaptured)

## Summary

| Category | Added | Removed | Renamed | Changed |
|---|---:|---:|---:|---:|
| Tokens | 0 | 0 | 0 | 0 |
| Effect styles | 0 | 0 | 0 | 0 |
| Components | 0 | 1 | 0 | 3 axis + 84 visual prop |
| Descriptions | 2 | 0 | n/a | 4 |
| Annotations | 0 | 0 | n/a | 0 |

**Headline**: Avatar Large size shrunk from 72→64 px (all 6 types); Notification Banners, Option Cards, and 5 other molecule-layer components had padding/height adjustments; Map Icon set gained Numeric Pin, Badge, and Bike Delivery Icon variants (code already matches); Mobile Chips typo fixed in Figma axis ("nTrailing" → "Trailing"). Token snapshots unchanged — user must run `pnpm tokens:sync` to capture variable value changes.

> **Note on tokens**: The user made variable updates in Figma between 2026-05-24 and 2026-05-27, but the token snapshot files (alias.json, brand.json, etc.) were not refreshed during this scan because the bridge port is shared with the figma-console MCP. Run `pnpm tokens:sync` in a separate session (no figma-console MCP active) to capture those changes. Until then, this report shows 0 token changes — **that is misleading**.

---

## Tokens

No changes in current snapshots. ⚠️ Variable values may have changed in Figma — run `pnpm tokens:sync` to verify.

---

## Effect styles

No changes.

---

## Components

### Removed (Figma removed, check code)

- **`Bike Delivery Icon`** (`8658:14591`) — standalone COMPONENT removed from Figma. The same illustration is now a variant inside the **Map Icon** COMPONENT_SET (as `Types=Bike Delivery Icon`). Code: `code-already-matches` — `MapIcon.tsx` already handles `variant="bike-delivery"` via the `BikeDeliveryShape` sub-component. No code deletion needed.

### Variant axis changes

**`Map Icon`** (`3132:23448`)
- Values added: `Types: [Badge, Numeric Pin, Bike Delivery Icon]`
- Values removed: `Types: [Object Badge]` (renamed to "Badge")
- Code impact: **`code-already-matches`** — `MapIcon.tsx` uses `variant="badge"`, `"numeric-pin"`, `"bike-delivery"` which match. The old "Object Badge" → new "Badge" rename is a Figma label change only; prop values in code were never "Object Badge".

**`Mobile Chips`** (`8269:29237`)
- Values added: `Type: [Leading + Trailing Icon]` (fixed typo from "Leading + nTrailing Icon")
- Values removed: `Type: [Leading + nTrailing Icon]`, `State: [Variant6]` (internal cleanup)
- Code impact: **`code-already-matches`** — `MobileChip.tsx` derives type from `leadingIcon`/`trailingIcon` props; no hardcoded axis names.

**`Content Primitives`** (`6961:41406`)
- Values added: `Type: [Metrics]`
- Code impact: **`code-not-implemented-yet`** — Content Primitives is not in `packages/components/src/`.

### Per-variant visual property changes

**`Avatar`** (`7446:22517`) — 12 variants changed  
**Status**: `code-needs-update`

| Variant | Property | Old | New | Code location |
|---|---|---|---|---|
| Type=Empty-Teal, Size=Large | width | 72 | 64 | `Avatar.tsx:10` `SIZES.large` |
| Type=Empty-Teal, Size=Large | height | 72 | 64 | `Avatar.tsx:10` `SIZES.large` |
| Type=Empty-Grey, Size=Large | width | 72 | 64 | same |
| Type=Empty-Grey, Size=Large | height | 72 | 64 | same |
| Type=Empty-Warning, Size=Large | width | 72 | 64 | same |
| Type=Empty-Warning, Size=Large | height | 72 | 64 | same |
| Type=Photo 1, Size=Large | width | 72 | 64 | same |
| Type=Photo 1, Size=Large | height | 72 | 64 | same |
| Type=Photo 2, Size=Large | width | 72 | 64 | same |
| Type=Photo 2, Size=Large | height | 72 | 64 | same |
| Type=Photo 3, Size=Large | width | 72 | 64 | same |
| Type=Photo 3, Size=Large | height | 72 | 64 | same |

Fix: change `large: 72` → `large: 64` in the `SIZES` map at `Avatar.tsx:10`.

---

**`Notification Banners`** (`3811:65015`) — 25 prop changes across 10 variants  
**Status**: `code-not-implemented-yet`

| Variant | Properties changed |
|---|---|
| Type=Info, Variant=Filled | paddingLeft 12→20, paddingRight 12→20, paddingTop 12→16, paddingBottom 12→16, height 104→112 |
| Type=Neutral, Variant=Filled | same padding + height 104→112 |
| Type=Highlight, Variant=Filled | same padding + height 100→108 |
| Type=Warning, Variant=Filled | same padding + height 100→108 |
| Type=Error, Variant=Filled | same padding + height 100→108 |

All Filled variants: horizontal padding `12→20`, vertical padding `12→16`, heights adjusted accordingly. These specs should inform the eventual implementation.

---

**`Option Cards`** (`9894:18459`) — 20 prop changes across 4 variants  
**Status**: `code-not-implemented-yet`

All 4 Choice Card variants (Idle/Hover/Pressed/Active): padding all sides `16→20`, height `76→84`.

---

**`Dashboard Cards`** (`4239:74634`) — 12 prop changes across 12 variants  
**Status**: `code-not-implemented-yet`

All 12 Basic variants: height `124→120`.

---

**`Configuration Card`** (`9617:18100`) — 6 prop changes  
**Status**: `code-not-implemented-yet`

| Variant | paddingTop | paddingBottom | height |
|---|---|---|---|
| State=Enabled | 16→20 | 16→20 | 340→356 |
| State=Disabled | 16→20 | 16→20 | 76→84 |

---

**`Desktop Menu options`** (`8230:26475`) — 4 prop changes  
**Status**: `code-not-implemented-yet`

All 4 `Dropdown-Advanced` state variants: height `68→64`.

---

**`Desktop Drop Downs`** (`8230:26475` parent) — 2 prop changes  
**Status**: `code-not-implemented-yet`

| Variant | Property | Old | New |
|---|---|---|---|
| Variant=Stacked List | height | 336 | 320 |
| Variant=Combobox-Create (Empty) | height | 136 | 110 |

---

**`Footer Frame`** (`6448:32008`) — 2 prop changes  
**Status**: `code-not-implemented-yet`

| Variant | height old | height new |
|---|---|---|
| Property 1=Validation Footer | 88 | 80 |
| Property 1=Card Footer | 48 | 40 |

---

**`UI Info Card`** (`3061:14948`) — 1 prop change  
**Status**: `code-not-implemented-yet`

- `Types=User Profile`: height `188→180`

---

## Documentation

### Description changes

| Component | Change |
|---|---|
| Mobile Chips (`8269:29237`) | Minor copy edit (+31 chars) |
| Desktop Chips (`7139:53343`) | Minor copy edit (+27 chars) |
| Map Icon (`3132:23448`) | Name changed from "Map Icon Type" to "Map Icon" in description (matches code rename done 2026-05-25) |
| Notification Banners (`3811:65015`) | Quote encoding only — identical content |

### Descriptions added

| Component | Node ID | Notes |
|---|---|---|
| Page Title | `8567:15702` | New description added to Figma |
| Section Heading | `3061:15796` | New description added to Figma |

---

## Action items

```
## Pending Figma sync (2026-05-27)

- [ ] **Run `pnpm tokens:sync`** — user updated Figma variables 2026-05-24→2026-05-27; token snapshots not refreshed (bridge port conflict during scan). Do this in a session WITHOUT figma-console MCP active.
- [ ] **Fix `Avatar` Large size** — update `packages/components/src/Avatar/Avatar.tsx` line 10: `SIZES.large` from `72` → `64`. All 6 Large-size variants (3 monogram tones + 3 photo variants) are affected. Re-run parity after fix.
- [ ] **Map Icon axis** (`3132:23448`) — `code-already-matches`; no action needed. Standalone `Bike Delivery Icon` component removed from Figma; MapIcon.tsx already handles it as `variant="bike-delivery"`.
- [ ] **Mobile Chips axis** (`8269:29237`) — `code-already-matches`; no action needed. Figma fixed typo "nTrailing" → "Trailing" + removed internal Variant6.
- [ ] **Content Primitives** (`6961:41406`) — added `Metrics` type variant. Component not yet implemented; note for when molecules phase reaches this component.
- [ ] Molecule/organism-layer components with Figma spec updates (implement when their phase begins):
  - Notification Banners (`3811:65015`) — Filled variants: h-padding 12→20, v-padding 12→16
  - Option Cards (`9894:18459`) — all variants: padding 16→20, height 76→84
  - Dashboard Cards (`4239:74634`) — Basic variants: height 124→120
  - Configuration Card (`9617:18100`) — padding 16→20, height varies
  - Desktop Menu options (`8230:26475`) — Dropdown-Advanced: height 68→64
  - Footer Frame (`6448:32008`) — Validation Footer: height 88→80; Card Footer: height 48→40
  - UI Info Card (`3061:14948`) — User Profile: height 188→180
- [ ] Re-run parity check for Avatar after Large size fix (`figma_check_design_parity` against `7446:22517`)
```
