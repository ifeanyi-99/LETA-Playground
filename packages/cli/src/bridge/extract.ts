// Snippets that run inside the Figma plugin sandbox via the bridge client.
// Each snippet returns a stringified JSON payload (so the WebSocket transport
// doesn't need to handle structured cloning of complex Figma objects).

/**
 * Extract a single variable collection by name. Returns the same shape we
 * use in the snapshot files: `{ id, name, defaultModeId, modes, variables }`.
 *
 * The snippet:
 * - Loads all collections + all variables (separate API calls).
 * - Filters variables by collectionId.
 * - Trims `name` (handles cases like " Mapped Colors" with leading space).
 * - Returns a JSON string so even very large outputs (200KB+) survive the
 *   WebSocket transport without any custom serialization.
 */
export function variableCollectionSnippet(figmaName: string): string {
  // The snippet is plain JS (executed by the plugin's vm-equivalent), not
  // TypeScript. It receives the figma global and must compile under the
  // plugin's runtime constraints.
  return `
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    // Match either "Foo" or " Foo" (some collections have a stray leading space in the file).
    const c = collections.find(x => x.name === ${JSON.stringify(figmaName)} || x.name.trim() === ${JSON.stringify(figmaName)});
    if (!c) throw new Error('Collection not found: ' + ${JSON.stringify(figmaName)});
    const all = await figma.variables.getLocalVariablesAsync();
    const vars = all.filter(v => v.variableCollectionId === c.id);
    return JSON.stringify({
      id: c.id,
      name: c.name.trim(),
      defaultModeId: c.defaultModeId,
      modes: c.modes,
      variables: vars.map(v => ({
        id: v.id,
        name: v.name,
        type: v.resolvedType,
        scopes: v.scopes,
        valuesByMode: v.valuesByMode,
      })),
    }, null, 2);
  `;
}

/**
 * Extract every text style in the file. Returns `{ count, styles: [...] }` —
 * each entry includes its bound variable references (so the generator can
 * resolve font-size etc. through the same alias chain as the rest of the
 * snapshot).
 */
export function textStylesSnippet(): string {
  return `
    const styles = await figma.getLocalTextStylesAsync();
    const out = styles.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description || undefined,
      fontName: s.fontName,
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      paragraphSpacing: s.paragraphSpacing,
      textCase: s.textCase,
      textDecoration: s.textDecoration,
      boundVariables: s.boundVariables || {},
    }));
    return JSON.stringify({ count: out.length, styles: out }, null, 2);
  `;
}

/**
 * Extract every effect style in the file (drop shadows, used by Elevation).
 * Returns `{ count, styles: [...] }` — each entry includes its `effects` array
 * with offset / radius / spread / color so the generator can compose a CSS
 * `box-shadow` value (multi-layer shadows are joined with commas).
 */
export function effectStylesSnippet(): string {
  return `
    const styles = await figma.getLocalEffectStylesAsync();
    const out = styles.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description || undefined,
      effects: s.effects.map(e => ({
        type: e.type,
        color: e.color,
        offset: e.offset,
        radius: e.radius,
        spread: e.spread,
        visible: e.visible,
        blendMode: e.blendMode,
      })),
    }));
    return JSON.stringify({ count: out.length, styles: out }, null, 2);
  `;
}

/** Quick file-identification snippet — used as a sanity check before extraction. */
export function fileIdentitySnippet(): string {
  return `
    return JSON.stringify({
      fileName: figma.root.name,
      currentPageName: figma.currentPage.name,
      collectionCount: (await figma.variables.getLocalVariableCollectionsAsync()).length,
    });
  `;
}
