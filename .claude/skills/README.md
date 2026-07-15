# LETA project-local skills

Skills here are auto-loaded by Claude Code in any session opened against this repo. They cover workflows specific to the LETA design system and codebase.

## Installed skills

### `figma-design-system-sync/`

Scans the Figma design system library (`Kxbgc2KoJSmTxvSV3PwNEu`), diffs it against the last saved snapshot, and produces a markdown change report plus `PLAN.md` updates so the React code can be brought back to visual parity.

**Trigger phrases**:
- "what changed in Figma since last time?"
- "sync the design system"
- "I updated some tokens and atoms — what needs to update in code?"
- "audit visual parity"

**Snapshot files it manages** (in `packages/cli/snapshots/`):
- `components.json` — catalog + per-variant visual properties for all 95 component sets
- `annotations.json` — pinned annotations per component
- `descriptions.json` — component descriptions

The token snapshots (`alias.json`, `brand.json`, `effect-styles.json`, etc.) are owned by the token pipeline (`pnpm tokens:sync`) and the skill reads them without modification.

Outputs go to `docs/figma-changes/FIGMA_CHANGES_<YYYY-MM-DD>.md` and append a "Pending Figma sync" section to `PLAN.md`.

### `table-column-layout/`

Encodes the **Table Column Layout Specification** — a System (rules) + Instances (per-table presets). Classify each column (Primary / Identifier / Secondary / Utility / Control); fixed widths for non-primary; weighted flexible shares (Recipient = 1.00 base) for primary; **bounded-flexible** identifiers (min–max band, e.g. Order ID 150–224); per-column **floors**; freeze-and-redistribute on shrink; the two priority lists (width-allocation vs column-drop); truncation + interaction (static vs dynamic) rules. Maps onto the `Table` component's `TableColumn` `role`/`flex`/`minWidth`/`maxWidth`/`accessibleName`/`pinned` API and the per-Figma-instance presets: `ORDER_TABLE_COLUMNS` (full, Actions 64), `UNASSIGNED_ORDER_COLUMNS` (Pending, Actions 154), `BROADCASTED_ORDER_COLUMNS` (+ Batch ID 90), `SCHEDULED_ORDER_COLUMNS` (− Duration), `ALL_ORDER_COLUMNS` (search/triage — no checkbox/driver/trip/batch/actions), `LAST_UPDATED_COLUMN` (toggle). Order ID pins left / Actions pins right on horizontal scroll (`<Table scrollX>`). Modal/embedded tables use a reduced column set under the same rules at their own width.

**Trigger phrases**:
- "build / change this table" or "add/remove a column"
- "set / balance the column widths"
- "the columns are too wide / truncated / squished / not balanced"

The golden rule it enforces: **never make all columns equal width** — only primary content columns flex.

### `figma-wireframe-parity/`

The 4-step process for implementing any Figma **wireframe** (a screen/flow/prototype
frame — not a Library component) to 1:1 parity: **Inventory** (categorize every
element as a Library component / ad-hoc component / plain element, mapping Library
instances to their exact `@leta/components` name+variant) → **Present** (a compact
table + implementation plan, with all genuinely ambiguous items batched into one
`AskUserQuestion` checkpoint) → **Build** (compose Library components, never
hand-roll) → **Verify** (screenshot-diff against Figma, up to 3 iterations). Bakes in
two hard-won corrections: treat the Figma **screenshot** as ground truth for literal
copy (never the `get_design_context` JSX, which can carry stale/default text), and
**verify each component's actual bound variant per-instance** — never assume from a
similar-looking prior build, since the user deliberately restructures Library
building blocks differently per wireframe.

**Trigger phrases**:
- "implement this wireframe" / "build this screen from Figma"
- "match this Figma frame"
- pointing at a specific Figma node/URL to build
- "why doesn't this screen match Figma?"

## Packaged `.skill` files

`packaged/` holds the distributable `.skill` bundles (zip archives) for sharing the skills outside this repo — install on another machine by running the skill-creator's `install_skill` flow against the file.
