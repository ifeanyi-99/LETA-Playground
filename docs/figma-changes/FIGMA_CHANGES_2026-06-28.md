# Figma Changes — 2026-06-28

Sync against file `Kxbgc2KoJSmTxvSV3PwNEu` ("Library").
Previous baseline: 2026-06-22. Captured: 2026-06-28.

---

## Token changes

Two new CSS custom properties emitted in `packages/design-tokens/dist/tokens.css`:

| Token | Light mode | Dark mode |
|---|---|---|
| `--surface-primary-alt-desktop-badge` | `var(--colors-primary-default)` (coral red) | `var(--colors-primary-100)` |
| `--border-primary-alt-desktop-badge` | `var(--colors-primary-default)` | `var(--colors-primary-100)` |

These serve the new "Coral Red (Alt)" filled-badge colour variant (see below).
No existing tokens were removed or renamed.

---

## Component changes

### Desktop Badges `68:36623` — new colour + padding update

**New variant: Coral Red (Alt)**
The `Color` axis gained an 11th value `"Coral Red (Alt)"`, adding 3 new children (No Icon / Leading Icon / Trailing Icon) → `childCount` 30→33.

| Property | Value |
|---|---|
| Background | `--surface-primary-alt-desktop-badge` (saturated coral red fill) |
| Border | `--border-primary-alt-desktop-badge` |
| Text | `--text-on-color-label` (white) |
| Icon | `--icons-on-color-default` (white) |

This is an **inverse** badge — a solid filled coral-red background with white content, vs the existing `primary` (Coral Red) which uses a light pink fill with dark text.

**Padding update (all colours / all types)**

| Type | Old L/R | New L/R |
|---|---|---|
| No Icon | 8 / 8 | 6 / 6 |
| Leading Icon | 8 / 8 | 4 (icon side) / 6 |
| Trailing Icon | 8 / 8 | 6 / 4 (icon side) |

T/B padding unchanged (2/2). The icon-adjacent side is always the tighter one, giving a balanced optical weight between the icon glyph and the badge border.

**Code status: `code-needs-update` → DONE**

Changes made to `packages/components/src/Badge/Badge.tsx`:
- Added `'primary-alt'` to `BadgeColor` union type
- Added `primary-alt` entries to `BG`, `BORDER`, `TEXT_COLOR`, `ICON_COLOR` maps
- Updated `paddingLeft`/`paddingRight` to be icon-presence-aware (No Icon 6/6, icon side 4, text side 6)

Changes made to `packages/components/src/Badge/Badge.stories.tsx`:
- Added `'primary-alt'` to `ALL_COLORS` array and `FIGMA_LABEL` map
- Added `PrimaryAlt` story
- Updated doc description: 30→33 variants, 10→11 colours

Verified in Storybook (port 6107): Catalog renders all 11×3=33 variants; Coral Red (Alt) row renders as solid filled coral with white text; padding computed values confirmed (6/4/4/6 via `getComputedStyle`).

---

### Data Entry `38:42` — new Error state on Desktop Search Input

New Figma variant: `Type=Search Input, Variant=Desktop, State=Error`
`childCount` 56→57.

**Code status: `code-already-matches`**

The `SearchInput` component (`packages/components/src/SearchInput/SearchInput.tsx`) already exposes an `error` / `errorMessage` prop (added 2026-06-27), which renders a border `--border-error-default` + error message row below the field. The Storybook `Error` story exists at `Molecules/Form Controls/Search Input/Desktop`.

---

### Desktop Dropdowns `8230:26475` — 2 new filter-search variants

`childCount` 13→15. New Figma variants: `Basic Filter-Search` and `Basic Filter-Search (Empty)`.

**Code status: `code-already-matches`**

`DesktopDropdowns` already exposes `variant="basic-filter-search"` and `variant="basic-filter-search-empty"` (added 2026-06-27) with associated Storybook stories.

---

### Large Modal `228:11413` — Dual Column Form variant

`childCount` 3→4. New Figma variant: `Dual Column Form`.

**Code status: `code-already-matches`**

`LargeModal` already exposes `variant="dual-column-form"` (added 2026-06-24/25) with associated Storybook story `Templates/Large Modal/Dual Column Form`.

---

## Other structural catalogue noise

92 component sets show axis changes vs the 2026-06-22 baseline. These are **format artefacts** — the old baseline recorded an empty `variantProperties: {}` for all COMPONENT_SETs (the 2026-06-22 scan didn't enrich per-component axes). The current scan populates them from `node.componentPropertyDefinitions`. No design changes are implied; the variant structure for these components matches the existing React implementations.

---

## Baseline updated

- `packages/cli/snapshots/brand.json` — refreshed
- `packages/cli/snapshots/alias.json` — refreshed
- `packages/cli/snapshots/mapped-colors.json` — refreshed
- `packages/cli/snapshots/mapped-type.json` — refreshed
- `packages/cli/snapshots/mapped-sizes.json` — refreshed
- `packages/cli/snapshots/text-styles.json` — refreshed
- `packages/cli/snapshots/effect-styles.json` — refreshed
- `packages/cli/snapshots/components.json` — updated with new catalog (2431 components / 93 sets)

`pnpm tokens:generate` + `pnpm tokens:check` → **Tokens are in sync with the Figma snapshots.**
