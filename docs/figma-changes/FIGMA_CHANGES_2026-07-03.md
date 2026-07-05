# Figma Changes — 2026-07-03

| | |
|---|---|
| **Scan date** | 2026-07-03 |
| **Previous scan** | 2026-07-02 |
| **Figma file** | `Kxbgc2KoJSmTxvSV3PwNEu` ("Library") |
| **Mode** | Tier 1 catalog + targeted Tier 2 (Content Primitives `6961:41406`, per the user's "especially the Metrics variant" hint) |

## Summary

| Category | Changes |
|---|---|
| Tokens / effect styles | none (not re-pulled; no variable edits reported) |
| Components added / removed | 0 |
| Catalog (axes / childCount / set bbox) | 0 — no structural change to any of the 486 entries |
| Variant visual changes | **Content Primitives — Metrics variant** |

Tier 1 caught nothing (the edit is inside a variant, invisible to the catalog). The deep Tier-2 capture
of Content Primitives found a single change, matching the user's report.

## Content Primitives (`6961:41406`) — Metrics variant — ✅ implemented

- **Variant height 108 → 136.**
- **The `Metric` frame flipped from HORIZONTAL to VERTICAL** (gap 8, left-aligned): the variance Badge
  (`0%`) now sits **stacked below the metric value**, not beside it. Baseline: `Metric` = HORIZONTAL 61×24
  (number + badge in a row). Now: `Metric` = VERTICAL 32×52 (number `10` on top → badge below). Everything
  else in Metrics unchanged (24px outlined Visual Anchor, Eyebrow + trailing icon, metric value
  `Heading/S/SemiBold`, description `Label/S/Regular`, trailing content).

**Code:** `packages/components/src/ContentPrimitives/ContentPrimitives.tsx` → `MetricsLayout` Metric block
changed from `flexDirection: row` (center-aligned) to `flexDirection: column` (flex-start), gap 8. Internal
to the variant, so **all consumers inherit it** (Metric Card, etc.) with no consumer code change.

**Storybook:** ContentPrimitives Metrics story doc note updated. Verified in Storybook — badge stacks
below the value, left-aligned (metric y=92 / badge y=120, both x=32); Metric Card positive-variance shows
`10` + green `↑ 20%` below. Matches `figma_capture_screenshot 10080:12922`.

**dist:** `@leta/components` rebuilt; typecheck clean.

## Scope note
Only Content Primitives was deep-scanned (the user flagged the Metrics variant specifically; Tier 1 found
no other structural change). If other components had fine visual tweaks that don't change axes/childCount/
set-bbox, a `--deep` full-variant run would be needed to catch them — none were reported.

## Publish
No Figma writes this session (read-only scan) — nothing dirtied by the sync on my side.
