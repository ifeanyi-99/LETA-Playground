# Figma Design System Sync — 2026-07-07

- **Scan date:** 2026-07-07
- **Previous baseline:** 2026-07-03
- **Figma file:** `Kxbgc2KoJSmTxvSV3PwNEu` ("Library")
- **Snapshot dir:** `packages/cli/snapshots/`
- **Tier:** Tier 1 catalog + annotations/descriptions + token fingerprint; Tier 2 deep-variant capture auto-run for the 2 flagged sets.
- **Bridge note:** figma-console MCP fell back from port 9223 → 9224 (another process held the preferred port). Scan unaffected; free 9223 before `pnpm tokens:sync`.

## Summary

| Category | Result |
|---|---|
| Tokens (5 collections + text + effect styles) | **No drift** — byte-identical to committed snapshots |
| Components added / removed | none |
| Variant axis changes | **2** (Cell, Table-Container) |
| Descriptions changed | none |
| Annotations changed | none |

Only two structural changes since 2026-07-03, both on the **Cell** and **Table-Container** sets. One of the three added variants was genuinely new code work; the other two were already implemented in code ahead of the Figma baseline.

## Tokens

All 5 variable collections (Brand 195 / Alias 174 / Mapped Colors 431 / Mapped Type 170 / Mapped Sizes 31), 42 text styles, and 5 effect styles fingerprint-matched the committed snapshots exactly. **No `pnpm tokens:sync` needed.**

## Components

### Cell `4444:45000` — Type axis 18 → 20 (childCount 66 → 74)

Two new `Type` values added: **User** and **API**.

| New variant | Structure (from Figma tree + render) | Code status |
|---|---|---|
| `Type=User` (`10757:9057`) | Avatar (Medium 40px, photo/empty-teal initials) + name (`--text-default-heading`, label-m-medium) + email (`--text-default-sub-body`, body-m-regular) | ✅ **code-already-matches** — `user-cell` was already implemented in `Cell.tsx` |
| `Type=API` (`10787:17505`) | Featured Icon (Large, **Highlight**/purple, `Integration` glyph) + title "Auto-created" (`--text-default-heading`) + subtext "From online store" (`--text-default-sub-body`) | 🔨 **built this session** — new `api-cell` type |

The API cell is the machine/integration counterpart of the user cell (who/what created a row).

### Table-Container `1524:40283` — Property 1 gained "No Results"

| New variant | Code status |
|---|---|
| `Property 1=No Results` | ✅ **code-already-matches** — the `no-results` variant was built 2026-07-06 (predated only the Figma baseline, not the code) |

## Documentation

No description or annotation deltas.

## Action items

- [x] Add `api-cell` type to `Cell.tsx` — FeaturedIcon (Large, highlight, `Integration`) + `apiTitle`/`apiSubtext`/`apiIcon` props ([`4444:45000`](https://figma.com/design/Kxbgc2KoJSmTxvSV3PwNEu?node-id=10787-17505))
- [x] Add `ApiCell` Storybook story + include in Catalog + widths map
- [x] typecheck + rebuild `@leta/components` dist
- [x] Verify render in Storybook (all 4 states match Figma)
- [x] `user-cell` (Figma "User") — already implemented, no action
- [x] Table-Container `no-results` — already implemented, no action
- [ ] **Playground:** no change required — `api-cell`/`user-cell` are now available for the Orders "created by" column if a future flow needs them; not currently used.

## Deep scan (`--deep`) — follow-up, same day

After the Tier-1 pass the user made two more edits and requested a full `--deep` byte-for-byte variant audit. Re-captured the catalog + token fingerprint + **all 93 COMPONENT_SETs** (1959 variants). Findings:

### New in this deep pass (genuinely fixed in code)

| Change | Figma | Code fix |
|---|---|---|
| **Featured Icon** `8967:38281` gained **Teal** color (Property 1 6→7; childCount 12→14). Maps to the `notice` token family (LETA's teal): `--surface-notice-bg-subtle` + `--icons-notice-default`. | `10795:34191` | Added `teal` to `FeaturedIconColor` + BG/ICON maps + stories |
| **API cell** now uses the **Teal** Featured Icon (was Highlight). This is the "Cell update" — a nested-instance change (no variant-prop diff). | `10787:17505` | `Cell.tsx` `api-cell` → `color="teal"` |
| **`Icons/notice/default`** light-mode value **#80c6be → #669e98** (darker teal). | Mapped Colors | Refreshed `mapped-colors.json` + `tokens:generate`; `--icons-notice-default` auto-updates all consumers |
| **Tag** padding: L8/R6 → **L6/R4** (outer 6, remove-side 4 — the badge-family reduction Tag had missed). | `7751:28982` | `Tag.tsx` |
| **Desktop Metric Card** padding: 16 vertical → **20 uniform**. | `4239:74634` | `DesktopMetricCard.tsx` |
| **Desktop Menu Options** `dropdown-advanced`: padding 10→**12**, minHeight 64→**68**. | `1531:5056` | `DesktopMenuOptions.tsx` |

### Stale-baseline noise (verified already-in-code — no action)

The deep diff surfaced ~300 more variant-prop deltas, but the baseline's variant arrays predate the June reconciliation passes, so these were **already implemented in code** (spot-verified against source): Footer Frame 80/88→72 + pad 20→16, Notification Banners pad 20→16 + gap 16, Desktop/Delivery Badges pad 8→6/6→4, Tooltip dark surface tokens, Empty State illustration heights, Featured Icon container 44→40 (token resolves to 40; stale code comment fixed), Option Card pad 16, List/Table Section pad 20, Modal/Alert Dialog −8 heights (footer-72 propagation), `itemSpacing→0` roots (gap moved into child containers — real gap unchanged). **Refreshing the baseline with the full deep capture clears all of it** so the next diff is clean.

### Baseline

All 93 sets now carry fresh deep variant data (was carried-forward from ≤ early June). Future `--deep` runs will diff cleanly.
