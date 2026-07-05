// Static configuration for the LETA CLI.
//
// File key + node IDs are not secrets, so they live in source. If they change
// (e.g. a Figma file is moved or duplicated), update them here and re-run the
// snapshot commands.

export const config = {
  /** LETA Library file key on Figma. Used by tokens:fetch + future REST API integrations. */
  figmaFileKey: 'Kxbgc2KoJSmTxvSV3PwNEu',

  /** WebSocket port the Figma Desktop Bridge plugin connects to. */
  // The bridge plugin probes a small range; the port it lands on can shift
  // depending on what's already in use. Try the primary first, then fallbacks.
  bridgePort: 9226,
  bridgePortFallbacks: [9227, 9228, 9229] as readonly number[],

  /** Names (as they appear in Figma) of the variable collections we extract. Order matters for output stability. */
  collections: [
    { figmaName: 'Brand', file: 'brand.json' },
    { figmaName: 'Alias', file: 'alias.json' },
    // Note: " Mapped Colors" has a leading space in the Figma file. We normalize on the fly.
    { figmaName: 'Mapped Colors', file: 'mapped-colors.json' },
    { figmaName: 'Mapped Type', file: 'mapped-type.json' },
    { figmaName: 'Mapped Sizes', file: 'mapped-sizes.json' },
  ],
} as const;
