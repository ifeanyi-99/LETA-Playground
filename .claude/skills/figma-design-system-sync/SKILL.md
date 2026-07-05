---
name: figma-design-system-sync
description: Scan a Figma design system library via the figma-console MCP, diff it against the last saved snapshot, and produce a markdown change report plus PLAN.md updates so the React code can be brought back to visual parity. Use this skill whenever the user wants to know what changed in Figma, sync the design system, audit visual parity, refresh tokens/components from Figma, or asks variations of "what's new in Figma", "has the design system changed", "any Figma updates", "are we still in sync with the design file", "check the Figma library against code". Run this proactively when the user mentions design tokens being updated, atom components being revised in Figma, or before starting a new component implementation batch — it ensures the React code is reconciled against the current Figma state before more work piles up. When the user says "run the deep version of the figma-design-system-sync skill", "deep sync", "deep figma scan", or "full figma scan", invoke this skill with the --deep argument to force a full byte-for-byte variant capture across all components.
---

# Figma Design System Sync

This skill makes Figma the source of truth and the code the consumer. Each run captures a snapshot of the Figma library (tokens + components + annotations + descriptions), diffs it against the last snapshot, cross-references the React code, and emits a human-readable change report plus actionable PLAN.md tasks.

> ⚠️ **Two-tier scan — read this before invoking**
>
> The default invocation runs a **Tier 1 catalog scan** (~30–60 seconds): component list, axes, annotations, descriptions. This catches structural changes — added/removed components, renamed variants, axis edits, doc updates.
>
> A **Tier 2 deep variant scan** auto-runs when Tier 1 detects added or structurally-changed components, but only for *those specific components*.
>
> **Tier 1 will not detect fine visual tweaks** (padding/radius/fill changes on an existing variant) when those tweaks don't also change axis structure. If you know you've made cosmetic edits without restructuring, invoke with `--deep` to force a full byte-for-byte variant capture (the old 10–20 minute behavior). A periodic full `--deep` run is also a reasonable hygiene pass.

## When this skill runs

The user is asking you to detect drift between their Figma design system and the React implementation. They almost always care about **visual parity** — what the engineer sees in Storybook should match what the designer sees in Figma. Aggregate parity scores are *not* the bar; concrete visual deltas are.

Typical triggers:
- "What changed in Figma since last time?"
- "Sync the design system."
- "I updated some tokens and a few atoms — what needs to update in code?"
- "Check the Figma library against code before we start the next component."
- The user mentions they've been working independently in Figma for days/weeks and want a reconciliation pass.

## Repo assumptions

This skill is tuned for the LETA monorepo layout but the paths are configurable:

| Concept | Default path | What it is |
|---|---|---|
| Token snapshots | `packages/cli/snapshots/` | Existing JSONs from the token pipeline (alias, brand, effect-styles, mapped-*, text-styles) |
| Component/annotation snapshots | `packages/cli/snapshots/` (NEW siblings: `components.json`, `annotations.json`, `descriptions.json`) | Created by this skill |
| Component source | `packages/components/src/<Name>/` | React implementations |
| Roadmap | `PLAN.md` (repo root) | Where new tasks land |
| Change reports | `docs/figma-changes/FIGMA_CHANGES_<YYYY-MM-DD>.md` | One file per scan |

The Figma file key is `Kxbgc2KoJSmTxvSV3PwNEu`. If running against a different repo, read the project's CLAUDE.md or ask the user for the file key, snapshot dir, and component source dir before proceeding.

## High-level workflow

There are six phases. **Do not skip phases.** Each builds on the previous and skipping leads to silent gaps in the report.

1. **Preflight** — confirm MCP connectivity, file identity, locate the previous snapshot, decide tier
2. **Capture current Figma state** — Tier 1 always (catalog + annotations + descriptions); Tier 2 conditionally (per-variant visual properties)
3. **Diff** — old vs new, categorized by change type
4. **Cross-check the code** — map every Figma change onto the React source to know what's behind / ahead / equivalent
5. **Write artifacts** — the change report and the PLAN.md updates
6. **Save baseline** — overwrite snapshot files with the captured state, carrying forward unchanged variant data

If any phase reveals nothing changed, *say so explicitly* and skip writing the report — but still update the baseline timestamp so future runs are correct.

### Invocation flags

| Flag | Effect |
|---|---|
| *(none)* | Tier 1 by default. Tier 2 auto-runs for components flagged as added or structurally changed. |
| `--deep` | Skip the Tier 1 short-circuit. Run full Phase 2c across every COMPONENT_SET (~10–20 min). Use for periodic full audits or when you know cosmetic edits were made without restructuring. |
| `--catalog-only` | Tier 1 only, even if Tier 1 finds flagged components. Useful when you want a fast "what changed structurally" answer and plan to follow up with `--deep` later. |

---

## Phase 1 — Preflight

Before touching Figma:

1. Confirm figma-console MCP is connected: call `figma_get_status` with `probe: true`. The response is considered healthy only when **all** of these hold:
   - `setup.valid === true`
   - `probeResult.success === true`
   - `transport.active !== "none"`

   If any check fails, tell the user to open the Figma Desktop Bridge plugin (Plugins → Development → Figma Desktop Bridge → Run), wait ~3 seconds for the WebSocket handshake, then retry. Surface the response's `recoverySteps` array and `ai_instruction` field verbatim — the MCP authors that copy and it's more accurate than anything synthesized here. Don't proceed otherwise; every subsequent Figma call will fail confusingly.

2. Check `transport.websocket.portFallbackUsed`. When `true`, the MCP couldn't bind its preferred port (`transport.websocket.preferredPort`, default 9223) and fell back to `transport.websocket.port` (e.g. 9225). The usual cause: another Claude Code session or a `pnpm tokens:fetch` run is holding the preferred port. The scan still works — but **mention the fallback to the user** so (a) they aren't surprised by contention mid-scan and (b) they know to free the preferred port before running `pnpm tokens:sync` afterward (token pipeline binds 9226–9229 and will fail the same way if too many sessions are stacked).

3. Confirm the active Figma file matches expectations. `figma_get_status` exposes `currentFileName` (a human-readable name, **not** a file key — the file key isn't available from this endpoint). For LETA the expected value is `"Library"`. If the name differs, comes back as `"(unable to retrieve - Desktop Bridge may need to be opened)"`, or is `null`, ask the user whether to abort or proceed against the active file (they may have switched files intentionally, or the plugin needs reopening).

4. Look for previous snapshot files in the snapshots directory:
   - `components.json` and `annotations.json` and `descriptions.json` (skill-managed)
   - Token snapshots (`alias.json`, `brand.json`, `effect-styles.json`, `mapped-*.json`, `text-styles.json`)
   - If skill-managed snapshots are missing, this is a **first run** — capture state, write baseline, and tell the user "first scan complete, no diff to produce". Skip the diff phase.

5. Sanity check the snapshot timestamp. If it's older than a week, mention that to the user — it sets expectations for how much diff to expect.

---

## Phase 2 — Capture current Figma state

Phase 2 is split into two tiers. **Tier 1 always runs.** Tier 2 runs conditionally based on what Tier 1 found and the invocation flags.

### 2a. Tokens (Tier 1)

Read all existing JSONs from the snapshots dir. If the user mentions they ran `pnpm tokens:fetch` recently, trust those.

**If tokens are stale, do NOT tell the user to "run `pnpm tokens:sync` in a separate session" — that advice fails confusingly.** Here's why (confirmed 2026-05-27): the Figma Desktop Bridge plugin holds **exactly one connection at a time**, and while this skill runs it is bonded to the figma-console MCP (the plugin panel shows "MCP ready"). `pnpm tokens:fetch`/`tokens:sync` spins up its *own* competing WebSocket server on ports 9226–9229 and waits for the plugin to dial in — but the plugin is busy with the MCP, so the CLI either times out (`port … skip`) or completes a stale handshake and then dies with `"[object Object]" is not valid JSON` (the MCP's response envelope ≠ the CLI's expected `{id, result:"<json>"}`). The CLI bridge and the MCP are mutually-exclusive consumers of one single-connection plugin.

**Refresh tokens from inside this skill's session instead** — you already own the plugin via the MCP. Run the CLI's own extraction snippets through `figma_execute` and write the results to the snapshot files, then regenerate:

1. The snippets live in `packages/cli/src/bridge/extract.ts`: `variableCollectionSnippet(name)` (per collection), `textStylesSnippet()`, `effectStylesSnippet()`. Each `return`s a `JSON.stringify(...)` payload — use it as the *entire* `figma_execute` body.
2. The 5 variable collections (order matters for output stability): **Brand** → `brand.json`, **Alias** → `alias.json`, **Mapped Colors** (has a leading space in Figma — match `name.trim()`) → `mapped-colors.json`, **Mapped Type** → `mapped-type.json`, **Mapped Sizes** → `mapped-sizes.json`. Plus `text-styles.json` and `effect-styles.json`.
3. Each `figma_execute` returns the snapshot JSON as a *string* in `result`. Most overflow to disk (expected) — parse the overflow file and write `result` verbatim to `packages/cli/snapshots/<file>.json`. For small ones that come back inline (effect styles, mapped-sizes), the response is NOT persisted across turns — re-run wrapping the payload as `JSON.stringify({ payload, _pad: 'x'.repeat(60000) })` to force overflow, then extract `.payload`.
4. After all 7 files are written: `pnpm tokens:generate` then `pnpm tokens:check` (expect "Tokens are in sync with the Figma snapshots").

The token snapshots are owned by the token pipeline — but the figma_execute refresh above writes the *same* files the pipeline would, so it's a clean substitute when the CLI bridge is blocked. The alternative (quit every Claude session with the MCP, run `pnpm tokens:sync` in a plain terminal) works too but can't be Claude-driven.

### 2b. Components catalog (Tier 1)

Use `figma_execute` with the snippet in `references/figma_snippets.md` → **"List all library components"**. This walks the Figma file and emits a JSON of every COMPONENT and COMPONENT_SET node with:

- `nodeId`
- `name`
- `pageName`
- `type` (`COMPONENT` or `COMPONENT_SET`)
- For COMPONENT_SETs: `variantProperties` (axis → list of values), `childCount`
- `key` (Figma's stable component key, when published)
- `bbox` (x, y, width, height) — useful to detect resizes

Write a *new-catalog-only* file to a scratch path first (e.g. `/tmp/leta-figma-sync/components-catalog.json`). Don't overwrite `<snapshots>/components.json` yet — Phase 6 does that after merging variant data forward.

### 2c. Annotations + descriptions (Tier 1)

Combine via the snippet **"All annotations + descriptions in one pass"** in `references/figma_snippets.md`. For a typical scan this returns 5–15 KB and doesn't overflow. Write directly to `<snapshots>/annotations.json` and `<snapshots>/descriptions.json` in the same turn — the response only lives in the model's context until the next tool call.

Schema:
- `annotations.json` keyed by component nodeId → array of `{ categoryId, categoryName, label, body }`
- `descriptions.json` keyed by component nodeId → string

### 2d. Tier 1 decision point

Run `scripts/diff_snapshots.mjs --catalog-only` against the previous baseline. The script emits a top-level `_tier2_targets` array — nodeIds whose metadata changed in ways that *could* mask visual edits (additions, removals, axis changes).

- If `_tier2_targets` is empty **and** the user did **not** pass `--deep` → **skip Tier 2 entirely.** Tell the user "no structural changes; visual-property scan skipped (pass `--deep` to force)."
- If the user passed `--catalog-only` → **skip Tier 2 even if targets exist.**
- Otherwise → proceed to Tier 2 for each target.

### 2e. Per-component variant detail (Tier 2)

For each COMPONENT_SET in scope (either `_tier2_targets` or *all* when `--deep`), capture the visual properties of each variant child. Run the snippet **"Capture variant visual properties (symbol-safe)"** in `references/figma_snippets.md`. It emits per variant child:

- `nodeId`, `variantName` (e.g. `"Size=Medium, Type=Leading Icon"`)
- `width`, `height`
- `paddingLeft/Right/Top/Bottom`, `itemSpacing`
- `cornerRadius`
- `fills` (token-bound where possible — resolve via `boundVariables`)
- `strokes` (color + weight + `strokeAlign`)
- For text leaves: `textStyleId`, `characters`

Any value that's "mixed" in Figma (e.g. a frame with different per-corner radii) comes back as a JavaScript Symbol. **Symbols break `postMessage` marshalling** — if even one slips into the return value the entire batch errors with `Cannot unwrap symbol`. The snippet's `num()` / `s()` helpers convert symbols to the sentinel string `'__MIXED__'`. Do not strip them when copy-pasting.

**Chunking strategy** — the binding constraint is *response bytes*, not variant count. Empirically, ~424 variants returns ~316 KB, which exceeds the inline MCP response cap and triggers the on-disk overflow path. Plan:

- **Small sets** (childCount ≤ 25): batch ~40 sets per call. Two batches typically cover all small sets.
- **Medium sets** (26–75): bundle into the second small batch or a dedicated batch.
- **Large sets** (76–300): one set per call.
- **Huge sets** (>300, e.g. Desktop Button at 550): paginate by halves *inside the snippet* using `all.slice(0, half)` / `all.slice(half)`. Merge halves with `scripts/parse_mcp_overflow.py --key data`.

When Tier 2 runs targeted (not `--deep`), the per-call cost is bounded by how many components changed. A typical "I edited one component" scan should complete Tier 2 in seconds, not minutes.

### 2f. Carry-forward + final catalog (Tier 1 and Tier 2)

Even when Tier 2 only ran for a subset, the saved baseline at `<snapshots>/components.json` must contain `variants` arrays for **every** COMPONENT_SET — otherwise the next scan would mistake every untouched component for a metadata-only entry and lose visual-diff coverage going forward.

Run `scripts/carry_forward_variants.mjs --catalog <scratch>/components-catalog.json --old <snapshots>/components.json --tier2 <scratch>/tier2-variants.json --out <snapshots>/components.json`. The script merges:

1. The fresh catalog (axes, bbox, childCount, etc.)
2. Newly-captured variant data from Tier 2 (overrides old data per nodeId)
3. Old variant data from the previous baseline (for components Tier 2 didn't touch)

If `--deep` ran, `<scratch>/tier2-variants.json` covers every component and the old baseline's variant data is fully replaced.

---

## Phase 2.5 — Handling MCP response overflow

Most variant-capture calls *will* overflow the inline response cap. This is expected. The MCP saves the full response to a tool-results file and returns a path like:

```
Error: result (223,269 characters across 1 line) exceeds maximum allowed tokens.
Output has been saved to /Users/ifeanyi/.claude/projects/.../tool-results/mcp-figma-console-figma_execute-<ts>.txt
```

This is **not an error** for the workflow's purposes — the data is on disk. Parse it with the bundled helper:

```bash
# Single overflow file → stdout
python3 scripts/parse_mcp_overflow.py /path/to/overflow.txt

# Single overflow file → disk
python3 scripts/parse_mcp_overflow.py /path/to/overflow.txt --out /tmp/batch1.json

# Two halves of a huge set, merged on the `data` key
python3 scripts/parse_mcp_overflow.py half1.txt half2.txt --key data --out /tmp/desktop-button.json
```

Stash per-batch JSON in `/tmp/leta-figma-sync-variants/` (or a similar scratch dir) and merge them all into the final `components.json` at the end of Phase 2c.

### Inline responses that *didn't* overflow

When a response is small enough not to overflow, the harness **doesn't write it to disk** — the data only exists in the model's context until the next tool call. There are two safe patterns:

1. **Always write a tiny payload first.** Have the figma_execute snippet write to disk via a Python heredoc immediately after capturing — don't rely on the response surviving across turns.
2. **Force a small overflow.** If you anticipate needing to re-read the data, intentionally inflate the response (e.g. duplicate a small array) so it overflows. Awkward but works.

In practice, the only response small enough to come back inline is the annotations + descriptions pass — for that one, use Pattern 1: extract from the model's context immediately and `Write` the snapshot files in the same turn the response arrives.

---

## Phase 3 — Diff

Run `scripts/diff_snapshots.mjs` (a Node script bundled with this skill). It takes:

```
node scripts/diff_snapshots.mjs --old <previous-snapshot-dir> --new <current-snapshot-dir> --out <diff.json>
```

Two modes:

- **Default** — full diff including per-variant visual properties (`variant_props_changed`). Requires the new snapshot's `components.json` to contain `variants` arrays. Used after Tier 2 has run (auto-triggered or `--deep`).
- **`--catalog-only`** — diffs the catalog (added/removed/axis changes), annotations, descriptions, and tokens. Skips `variant_props_changed` entirely. Adds a top-level `_tier2_targets: string[]` of nodeIds that need Tier 2 capture. Used in Phase 2d to decide whether Tier 2 runs at all.

The script emits a structured JSON diff with these sections (and *only* these — empty arrays are fine, omit nothing):

```json
{
  "tokens": {
    "added": [{ "name": "...", "value": "...", "collection": "..." }],
    "removed": [{ "name": "...", "value": "..." }],
    "renamed": [{ "from": "...", "to": "..." }],
    "value_changed": [{ "name": "...", "mode": "light|dark|...", "from": "...", "to": "..." }]
  },
  "effect_styles": { /* same shape as tokens */ },
  "components": {
    "added":   [{ "nodeId": "...", "name": "...", "pageName": "..." }],
    "removed": [{ "nodeId": "...", "name": "..." }],
    "variant_axis_changed": [{ "nodeId": "...", "name": "...", "axes_added": [], "axes_removed": [], "values_added": {}, "values_removed": {} }],
    "variant_props_changed": [{ "nodeId": "...", "name": "...", "variantName": "...", "prop": "paddingLeft", "from": 12, "to": 8 }]
  },
  "descriptions": {
    "added":   [{ "nodeId": "...", "name": "..." }],
    "removed": [{ "nodeId": "...", "name": "..." }],
    "changed": [{ "nodeId": "...", "name": "...", "from": "...", "to": "..." }]
  },
  "annotations": {
    "added":   [{ "nodeId": "...", "category": "...", "label": "..." }],
    "removed": [{ "nodeId": "...", "category": "...", "label": "..." }],
    "changed": [{ "nodeId": "...", "category": "...", "label": "...", "from_body": "...", "to_body": "..." }]
  }
}
```

**Why a structured diff first, before prose?** Because the next phase (code cross-check) is mechanical — it needs to iterate over each change and check the corresponding file. Writing prose first and then trying to cross-check costs tokens and creates inconsistencies.

If `diff.json` ends up empty across the board, write nothing else and tell the user "no changes detected since `<previous-snapshot-timestamp>`". Still update the baseline.

---

## Phase 4 — Cross-check the code

For each change in `diff.json`, determine its status in code. There are five buckets:

| Bucket | Meaning |
|---|---|
| `code-needs-update` | Component exists in code, Figma drifted, code must catch up |
| `code-not-implemented-yet` | Figma has it, code doesn't — usually new components |
| `code-orphaned` | Code has it, Figma removed it — flag for deletion or designer review |
| `code-already-matches` | Change happened to match what code already had (rare — usually docs-only) |
| `docs-only` | Description/annotation change, no code impact |

How to check:

- **Tokens** — search the dist outputs in `packages/design-tokens/dist/tokens.css` and `tokens.ts` for the var name. If present, classify as `code-needs-update` (the next `pnpm tokens:sync` will refresh — flag that). If missing, `code-not-implemented-yet`.
- **Components** — check `packages/components/src/<Name>/` directory existence. Name-match is fuzzy: Figma's `"Collapsed Sidebar Logo"` maps to `CollapsedSidebarLogo`. Strip spaces and PascalCase.
- **Variant props changed** — read the relevant `.tsx` source. For Button-style components, look for the `LAYOUT` / `SIZES` lookup table and check whether the old value is in the source. If yes → `code-needs-update` with a hint about the line. If no → either the code was already updated or the value is computed differently; flag for human review.
- **Description / annotation changes** — `docs-only`. These don't affect parity scoring but should still be mentioned in the report so the user knows Figma docs evolved.

Don't try to be exhaustive about file:line references for every single change — be precise for the first few in each category, then summarize the rest. The goal is to give the user a starting line, not write the patch.

---

## Phase 5 — Write artifacts

### 5a. Change report

Create `docs/figma-changes/FIGMA_CHANGES_<YYYY-MM-DD>.md` (make the directory if missing). Use the template in `references/report_template.md`. The report must contain:

1. **Header**: scan date, previous-scan date, Figma file key, snapshot dirs
2. **Summary**: counts per category, with "no changes" called out where applicable
3. **Tokens** section — added / removed / renamed / value-changed, each with code-cross-check status
4. **Effect styles** section — same shape
5. **Components** section — broken down by:
   - Added components (Figma has, code doesn't yet)
   - Removed components
   - Variant axis changes
   - Per-variant visual property changes (grouped by component)
6. **Documentation** section — description + annotation deltas
7. **Action items** — derived from `code-needs-update` and `code-not-implemented-yet` buckets, formatted as a checklist that maps directly into PLAN.md

Keep the report dense but skimmable. Use tables for any list >5 items.

### 5b. PLAN.md update

Open `PLAN.md`. Find or create a section titled `## Pending Figma sync (<scan date>)`. Append the action checklist from the report. **Don't** rewrite existing PLAN.md content — only add the new section. If an older "Pending Figma sync" section exists and is unresolved, leave it alone and add a new dated section below it (the user can reconcile manually).

Each task line should be specific:

> - [ ] Update `Button.tsx` `LAYOUT` map: Medium / Leading Icon paddingLeft `12 → 8` ([28:38245](https://figma.com/...))
> - [ ] Implement new `Tag` component (Figma `<nodeId>`) — no code yet
> - [ ] Re-run `pnpm tokens:sync` (3 token value changes detected)

Always link Figma node IDs (the user can paste those into Figma URLs).

---

## Phase 6 — Save baseline

Overwrite the skill-managed snapshot files (`components.json`, `annotations.json`, `descriptions.json`) with the data captured in Phase 2. Add a top-level `_meta` block with:

```json
{
  "_meta": {
    "scanned_at": "<ISO timestamp>",
    "figma_file_key": "<key>",
    "skill_version": "0.1.0"
  },
  ...
}
```

The token snapshots are owned by the token pipeline; the skill normally reads them and doesn't overwrite them. **Exception**: when tokens are stale and the CLI bridge is blocked (see Phase 2a), refreshing them in-session via `figma_execute` *is* the right move — that writes the same files the pipeline would. After doing so, run `pnpm tokens:generate` + `pnpm tokens:check` so the dist outputs stay consistent with the snapshots you just wrote.

---

## Failure modes to watch for

- **`Cannot unwrap symbol`**: any `figma.mixed` value (mixed corner radii, mixed fills, mixed text style across a TEXT node) is a JavaScript Symbol, which breaks `postMessage`. Always use the `num()` / `s()` helpers shown in `references/figma_snippets.md`. If you're writing a new snippet, default to "guard everything" — symbol leakage kills the entire batch and forces a retry.
- **Bridge port conflict / fallback**: if the user just ran `pnpm tokens:fetch`, the bridge instance on port 9226 will still be running. The figma-console MCP falls back to 9225 automatically — the scan works, but mention the fallback in your preflight summary so the user has context. If `probeResult.success` is actually false, prompt the user to reopen the Desktop Bridge plugin.
- **MCP response overflow**: covered by Phase 2.5. This is the normal path for variant batches over ~50 children.
- **Inline response not persisted**: small responses (e.g. the annotations + descriptions pass) only live in the model's context. Don't defer parsing them — capture into a snapshot file in the same turn.
- **Stale nodeIds across sessions**: Figma nodeIds can shift between file versions in rare cases. If a previous-snapshot nodeId no longer resolves, treat the component as removed and look for a same-name component to flag as "possibly renamed/moved".
- **COMPONENT_SET chrome**: the COMPONENT_SET wrapper itself has its own dimensions (often `134×80` while children are `40×40`). Don't report wrapper dimension changes as visual drift; report only on variant *children*.
- **Variable mode resolution**: tokens with multiple modes (light/dark) report per-mode value diffs. Don't aggregate — keep modes separate so the user sees exactly which theme drifted.
- **Annotations with empty body**: Figma allows annotations with just a label, no body. Capture them anyway. The diff should treat `null` and `""` as equivalent for body-only matching.
- **Device-mockup pages**: in LETA the "iOS & Android Device Mockups" page contains chrome assets (camera, status bar, etc.) that aren't design-system components proper. Capture them in the catalog but skip variant detail unless the user asks.

## Don'ts

- Don't write code patches. This skill produces *plans*, not changes. The user (or a follow-up session) applies the patches.
- Don't gate on aggregate parity score. The user has been explicit: aggregate score is informational, only visual fidelity matters.
- Don't tell the user to "run `pnpm tokens:sync` in a separate session" as the *first* remedy for stale tokens — the CLI bridge can't connect while this skill holds the figma-console MCP (single-connection plugin), and it fails with a confusing `"[object Object]"` error. Refresh in-session via `figma_execute` instead (Phase 2a). `pnpm tokens:generate`/`tokens:check` are safe to run anytime — only the *fetch* half conflicts.
- Don't fabricate node IDs. If a node lookup fails, report the failure rather than inventing a plausible ID.

## Files in this skill

- `scripts/diff_snapshots.mjs` — pure-JS diff over the snapshot JSONs; supports `--catalog-only` for Tier 1 short-circuit
- `scripts/carry_forward_variants.mjs` — merges fresh catalog + new Tier 2 variant data + carried-forward variants from previous baseline (Phase 2f)
- `scripts/parse_mcp_overflow.py` — extract / merge payloads from MCP tool-results overflow files (used in Phase 2.5)
- `references/figma_snippets.md` — copy-paste Figma plugin API snippets for `figma_execute` (symbol-safe)
- `references/report_template.md` — markdown template for the change report
- `references/snapshot_schema.md` — JSON shape of components.json / annotations.json / descriptions.json

## Version

`0.3.0` — two-tier scan (default = Tier 1 catalog; Tier 2 auto-runs for flagged components or via `--deep`). Cuts no-op-run time from 10–20 min to under 60 s. Fixes Phase 1 references to non-existent `figma_get_status` fields (`websocket.otherInstances`, `currentFileKey`) so preflight gates actually evaluate. Adds `scripts/carry_forward_variants.mjs` and `--catalog-only` mode to `diff_snapshots.mjs`.

`0.2.0` — derived from lessons learned during the first scan of the LETA Figma file (`Kxbgc2KoJSmTxvSV3PwNEu`, 468 components / 95 sets / 1948 variants). Key changes from `0.1.0`: symbol-safe variant capture, explicit Phase 2.5 for response overflow, byte-based chunking guidance, bridge fallback awareness, dedicated `parse_mcp_overflow.py` helper.
