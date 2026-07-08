# Figma Design System Sync — 2026-07-08 (`--deep`)

- **Scan date:** 2026-07-08
- **Previous baseline:** 2026-07-07 (full `--deep`)
- **Figma file:** `Kxbgc2KoJSmTxvSV3PwNEu` ("Library")
- **Scope:** catalog + token fingerprint + full deep variant capture (all 93 sets, 1959 variants)

## Summary

| Category | Result |
|---|---|
| Tokens (5 collections + text + effect styles) | **No drift** |
| Components added / removed / axis / childCount | **None** |
| Variant visual changes | **1 component** — Notification Banners |

The user's edit was isolated to the **Notification Banner**. The only other deep-diff hit (Flags, 256 variants) was a capture-shape artifact (yesterday's Flags batch omitted the `leaves` field), not a design change — confirmed zero prop/dimension diffs.

## Notification Banners `3811:65015`

The **trailing section** was restructured, and the Filled corner radius changed.

### Trailing section — dismiss + CTA flex (the key change)

The trailing area is now a **vertical, full-height, right-aligned column** with `primaryAxisAlignItems: SPACE_BETWEEN`, holding two children:

| Child | Flex | Position |
|---|---|---|
| **Dismiss** (× — Plain / Small / Icon Only, `Icon/Cancel`) | `layoutGrow: 1`, content top-aligned | **top-right** |
| **CTA** (Primary / Small button, `Dispatch` + leading `Proceed`) | `layoutGrow: 0`, hidden by default (`visible: false`) | **bottom-right** |

Because the Dismiss frame grows and the CTA is pinned by space-between, the two are pushed to opposite vertical ends of the banner. Previously the dismiss was a lone top-aligned button in the root row and there was **no** trailing CTA.

### Corner radius

Filled variants: `--rounding-lg` (8) → **`--rounding-xl` (12)**. (Subtle has no surface/radius.)

### Code changes (`NotificationBanner.tsx`)

- New **`cta?: React.ReactNode`** prop — caller-injected trailing action, pinned bottom-right; hidden when omitted (mirrors the Figma `CTA` frame default).
- Dismiss + CTA now wrapped in a full-height, right-aligned, space-between **trailing section** column (dismiss grows → top; CTA → bottom).
- Filled `borderRadius` `--rounding-lg` → `--rounding-xl`.
- New `WithCTA` Storybook story demonstrating the bottom-right CTA + top-right dismiss.

Verified in Storybook: dismiss top-right, "Dispatch" CTA bottom-right, `border-radius: 12px`. typecheck clean, dist rebuilt.

## Tokens — new color variable (follow-up scan, same day)

A second scan (after the user updated color variables) found **one added token** in **Mapped Colors** — no other collection/text/effect drift:

| Token | `--var` | Light | Dark |
|---|---|---|---|
| `Border/primary/default` | `--border-primary-default` | `#ff3941` (colors-primary-default) | `#ff6167` (colors-primary-400) |

The border color for the primary (Coral Red) family — completes the `Border/primary/*` set (previously only `desktop-badge` / `mobile-badge` / `alt-desktop-badge` existed). Refreshed `mapped-colors.json` (431 → 432 vars) + `pnpm tokens:generate`; `tokens:check` clean; `--border-primary-default` now in `tokens.css` + `tokens.ts`. **No component consumes it yet** — it's a newly-available token, no code change required.

## Baseline

All 93 sets recaptured (deep). Flags now stored with the `leaves` field, so the artifact won't recur. No Figma library changes were made (read-only scan) — no publish needed.
