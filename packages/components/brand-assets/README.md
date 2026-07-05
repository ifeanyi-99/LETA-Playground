# LETA Brand Assets

Static logo files for use outside the React component layer (marketing emails, social media, app store icons, downloadable brand kits, etc.).

## Source of truth

The canonical logo lives in **Figma** (`Kxbgc2KoJSmTxvSV3PwNEu`, node `8398:6917`) and is implemented as a vector React component at `packages/components/src/LetaLogo/`. **Always prefer the React `<LetaLogo>` for in-product use** — it scales cleanly, uses design tokens, and stays in sync with Figma.

The PNG/JPG files in this folder are static fallbacks for contexts that cannot render an SVG component.

## Files (drop here)

| Filename | Source | Use |
|---|---|---|
| `leta-logo-full.png` | Figma export of node `8398:6917` (Wordmark + Symbol composition) | High-resolution master |
| `leta-symbol.png` | Figma export of `Type=Symbol` (any size) | Square mark for app icons / avatars |

When the user attaches new logo image files, save them here using the filenames above (or update this README to reflect new naming).

## Generating from Figma

If a new size or format is needed:

1. Open the LETA library in Figma
2. Select the Logo component (`8398:6917`)
3. Use the export panel (PNG @ 1×, 2×, 4× as needed)

Do not edit these files by hand — re-export from Figma to preserve fidelity.
