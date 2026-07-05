// LETA Empty State illustrations (Figma `Illustrations/*` atom components, 600×600
// originals downscaled to 300px for retina display at 150×150).
//
// Shipped as real asset files (not inlined): each is referenced via
// `new URL('./assets/<x>.png', import.meta.url)` so it resolves relative to this
// module at runtime — out of the JS bundle, browser-cacheable.
//   • Storybook / Vite (from source): resolves the asset natively.
//   • Built dist (tsup/esbuild): esbuild leaves the `new URL(...)` expression
//     intact; the build step copies `src/EmptyState/assets` → `dist/assets`, so
//     `import.meta.url` (= dist/index.js) + `./assets/x.png` resolves correctly.
//
// Each value MUST be a static `new URL('<literal>', import.meta.url)` so bundlers
// can detect and (in Vite) rewrite the asset reference.
//
// Both WebP and PNG siblings ship: EmptyState renders `<picture>` with the WebP
// `<source>` first and the PNG `<img>` as fallback for older browsers. WebP is
// ~88% smaller (567 KB → 67 KB total); the PNGs stay as the universal fallback.

export type EmptyStateIllustration =
  | 'no-results'
  | 'no-reviews'
  | 'no-broadcast-logs'
  | 'image-upload'
  | 'file-upload'
  | 'no-suspensions'
  | 'no-items'
  | 'no-orders'
  | 'no-network'
  | 'new-update'
  | 'no-data'
  | 'no-trips'
  | 'no-drivers';

export const EMPTY_STATE_ILLUSTRATIONS: Record<EmptyStateIllustration, string> = {
  'no-results': new URL('./assets/no-results.png', import.meta.url).href,
  'no-reviews': new URL('./assets/no-reviews.png', import.meta.url).href,
  'no-broadcast-logs': new URL('./assets/no-broadcast-logs.png', import.meta.url).href,
  'image-upload': new URL('./assets/image-upload.png', import.meta.url).href,
  'file-upload': new URL('./assets/file-upload.png', import.meta.url).href,
  'no-suspensions': new URL('./assets/no-suspensions.png', import.meta.url).href,
  'no-items': new URL('./assets/no-items.png', import.meta.url).href,
  'no-orders': new URL('./assets/no-orders.png', import.meta.url).href,
  'no-network': new URL('./assets/no-network.png', import.meta.url).href,
  'new-update': new URL('./assets/new-update.png', import.meta.url).href,
  'no-data': new URL('./assets/no-data.png', import.meta.url).href,
  'no-trips': new URL('./assets/no-trips.png', import.meta.url).href,
  'no-drivers': new URL('./assets/no-drivers.png', import.meta.url).href,
};

export const EMPTY_STATE_ILLUSTRATIONS_WEBP: Record<EmptyStateIllustration, string> = {
  'no-results': new URL('./assets/no-results.webp', import.meta.url).href,
  'no-reviews': new URL('./assets/no-reviews.webp', import.meta.url).href,
  'no-broadcast-logs': new URL('./assets/no-broadcast-logs.webp', import.meta.url).href,
  'image-upload': new URL('./assets/image-upload.webp', import.meta.url).href,
  'file-upload': new URL('./assets/file-upload.webp', import.meta.url).href,
  'no-suspensions': new URL('./assets/no-suspensions.webp', import.meta.url).href,
  'no-items': new URL('./assets/no-items.webp', import.meta.url).href,
  'no-orders': new URL('./assets/no-orders.webp', import.meta.url).href,
  'no-network': new URL('./assets/no-network.webp', import.meta.url).href,
  'new-update': new URL('./assets/new-update.webp', import.meta.url).href,
  'no-data': new URL('./assets/no-data.webp', import.meta.url).href,
  'no-trips': new URL('./assets/no-trips.webp', import.meta.url).href,
  'no-drivers': new URL('./assets/no-drivers.webp', import.meta.url).href,
};
