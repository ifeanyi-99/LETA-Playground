# Figma → Code Sync Report

**Scan date**: 2026-05-23 15:01 UTC
**Previous scan**: 2026-05-23 12:28 UTC (~2.5 h earlier)
**Figma file**: `Kxbgc2KoJSmTxvSV3PwNEu` (Library)
**Snapshot dir**: `packages/cli/snapshots/`
**Code dir cross-checked**: `packages/components/src/`

## Summary

| Category | Added | Removed | Renamed | Changed |
|---|---:|---:|---:|---:|
| Tokens | 0* | 0* | 0* | 0* |
| Effect styles | 0* | 0* | 0* | 0* |
| Components | 0 | 0 | n/a | 0 |
| Descriptions | 0 | 0 | n/a | 1 (cosmetic) |
| Annotations | 0 | 0 | n/a | 0 |

\* **Token / effect-style diff is not authoritative this run.** The token snapshots in `packages/cli/snapshots/` (`alias.json`, `brand.json`, `mapped-*.json`, `text-styles.json`, `effect-styles.json`) are 13–15 days old (May 8 – May 10). This skill never refreshes them — that's owned by the token pipeline (`pnpm tokens:fetch` / `pnpm tokens:sync`). So the "0 changes" for tokens means "the committed snapshots are identical to themselves", not "Figma's live token values match the committed snapshots". See action items below.

**Headline**: No substantive Figma changes against the morning baseline. One description was normalized (straight quotes → curly quotes, no semantic change). Token snapshots are stale and need `pnpm tokens:sync` to make the next sync meaningful.

---

## Tokens

Diff inconclusive — see headline caveat. The committed token snapshots have not been refreshed since:

| Snapshot | Last touched |
|---|---|
| `alias.json` | 2026-05-09 |
| `brand.json` | 2026-05-09 |
| `mapped-colors.json` | 2026-05-09 |
| `mapped-sizes.json` | 2026-05-08 |
| `mapped-type.json` | 2026-05-09 |
| `text-styles.json` | 2026-05-10 |
| `effect-styles.json` | 2026-05-10 |

User has reported updating tokens in Figma over the past ~week. To produce a real token diff, run `pnpm tokens:sync` (close any session holding port 9226 first — see CLAUDE.md) and re-run this skill.

---

## Components

No structural or visual changes detected.

| Check | Result |
|---|---|
| Components in catalog | 468 (468 in baseline — match) |
| COMPONENT_SETs | 95 (95 in baseline — match) |
| Total variants captured | 1948 (1948 in baseline — match) |
| Added components | 0 |
| Removed components | 0 |
| Renamed components | 0 |
| BBox resizes (set-level) | 0 |
| Variant axis changes | 0 |
| Per-variant visual prop changes | 0 |

All 95 component sets including the large ones (Desktop Button `28:38245` / 550 variants, Mobile Button `2887:26272` / 353, Flags `7111:43819` / 256, Cell `4444:45000` / 86) are byte-identical to the baseline at the captured property level (padding / item spacing / corner radius / fills / strokes / per-leaf width-height-fill).

---

## Documentation

### Description changes — 1 (cosmetic only)

| Component | nodeId | Change |
|---|---|---|
| Notification Banners | [`3811:65015`](https://www.figma.com/design/Kxbgc2KoJSmTxvSV3PwNEu/Library?node-id=3811-65015) | All straight ASCII quotes `"…"` were converted to curly typographic quotes `"…"`. No semantic change. Code impact: **docs-only** — and even within docs-only, this is a render-only normalization (no body text, only quote glyphs). |

Likely cause: Figma's text editor auto-corrects to smart quotes when the description was re-opened/edited. No action required.

### Annotation changes — 0

All 8 annotated components (Toggle, Checkbox, RadioButton, Leta Logo, Desktop Button, Mobile Button, Collapsed Sidebar Logo, plus Notification Banners) match the baseline exactly.

---

## Code cross-check

| Bucket | Count | Notes |
|---|---:|---|
| `code-needs-update` | 0 | — |
| `code-not-implemented-yet` | 0 | — |
| `code-orphaned` | 0 | — |
| `code-already-matches` | 0 | — |
| `docs-only` | 1 | Notification Banners description quote normalization |

---

## Action items

The Figma side is quiet. The only outstanding work is on the token-pipeline side, which is *not* something this skill can resolve.

- [ ] **Run `pnpm tokens:sync`** to refresh `packages/cli/snapshots/{alias,brand,mapped-*,text-styles,effect-styles}.json` against the live Figma file. The current snapshots are 13–15 days old; the user has indicated tokens were updated in Figma during that window. Until this runs, *no* token-drift signal in this report or any subsequent run is trustworthy.
- [ ] After `tokens:sync`, **re-run the figma-design-system-sync skill** so the resulting diff covers tokens for real. Likely outcome: a list of `value_changed` rows that should map cleanly into a `pnpm tokens:generate` followed by a regression check in Storybook (Foundations: Colors / Typography / Padding / Spacing / Rounding / Stroke / Opacity).
- [ ] (Optional, no code impact) Note the Notification Banners description curly-quote normalization in your next batch sign-off if you re-publish the Notification Banners component description — otherwise the diff will keep firing harmlessly.

No component re-implementation, no parity re-runs, no Storybook updates required from this scan alone.
