// LETA Avatar sample photos — the exact images the Figma Avatar component's
// `Photo 1 / Photo 2 / Photo 3` variants carry (set `7446:22517`), exported from
// the Large (64×64) variants at 2× (128px) for retina display at 40px.
//
// Shipped as real asset files (not inlined), mirroring the EmptyState precedent:
// each is referenced via `new URL('./assets/<x>.png', import.meta.url)` so it
// resolves relative to this module at runtime — out of the JS bundle,
// browser-cacheable.
//   • Storybook / Vite (from source): resolves the asset natively.
//   • Built dist (tsup/esbuild): esbuild leaves the `new URL(...)` expression
//     intact; the build step copies `src/Avatar/assets/*.png` → `dist/assets/`,
//     so `import.meta.url` (= dist/index.js) + `./assets/x.png` resolves.
//
// Each value MUST be a static `new URL('<literal>', import.meta.url)` so bundlers
// can detect and (in Vite) rewrite the asset reference.
//
// Use these for stories, mocks, and prototypes that show photo avatars — they
// keep the rendered UI identical to the design file without a network dependency.

/** The Figma Avatar photo set: `[Photo 1, Photo 2, Photo 3]`. */
export const AVATAR_PHOTOS: readonly [string, string, string] = [
  new URL('./assets/avatar-photo-1.png', import.meta.url).href,
  new URL('./assets/avatar-photo-2.png', import.meta.url).href,
  new URL('./assets/avatar-photo-3.png', import.meta.url).href,
];
