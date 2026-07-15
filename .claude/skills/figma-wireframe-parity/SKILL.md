---
name: figma-wireframe-parity
description: Implement any Figma wireframe (a screen, flow, or prototype frame — not a Library component) to 1:1 design parity via a 4-step inventory-present-build-verify process. Use whenever the user asks to "implement this wireframe", "build this screen from Figma", "match this Figma frame", points at a specific Figma node/URL to build, or asks why a previously-built screen doesn't match Figma. Not for building or updating a Library component itself (atoms/molecules/organisms) — that's a plain component-implementation task; this skill is specifically for consuming a wireframe/prototype frame that composes those components into a screen.
---

# Figma Wireframe Parity Workflow

Established 2026-07-15 after noticing prior wireframe implementations had drifted from
the actual Figma spec — components were hand-rolled or mismatched to the wrong DS
variant instead of read directly off the wireframe. This is the standard process for
implementing **any** Figma wireframe (LETA Playground or elsewhere in the repo) to 1:1
parity.

## Token efficiency rules (apply throughout)

- One deep scan per wireframe — write the inventory to a scratch file/note and
  reference it, rather than re-querying Figma repeatedly.
- Use `get_screenshot` for visual re-checks instead of re-pulling full node trees.
- Request only the node data needed (names, IDs, component properties), not full
  document trees.
- Batch related Figma queries into single calls where possible.
- Don't re-verify screens that already passed parity in a previous iteration.

## Step 1 — Inventory scan (one pass, cache results)

Scan the wireframe via the Figma access strategy in `CLAUDE.md` — Dev MCP
`get_metadata` first (cheap structural pass), then `get_design_context` (component
properties + screenshot), escalating to the figma-console MCP only for richer
data/writes/parity checks. Categorize **every** element into exactly one of:

- **(a) Library components** — instances of the design-system Library. For each:
  component name, the variant/property values in use, and whether any properties are
  overridden from defaults. Map each to its exact `@leta/components` counterpart by
  name. **Flag, never silently improvise:** if a Library instance uses a
  variant/property combination that doesn't exist in code, surface it as a Step-2
  question.
- **(b) Ad-hoc components** — components defined locally in the wireframe's own file
  (not from the Library). Log each to `design-parity/adhoc-registry.json` (create if
  absent) with component name, source file, node ID, a one-line structural
  description, and date first seen. Before adding a new entry, check the registry for
  a structural match (similar name/structure/description); if found, increment its
  `occurrences` and append the new source file instead of duplicating. At the end of
  the build, list any ad-hoc component with **3+ occurrences or 2+ source files** as
  a "Promotion candidate" for the user to consider elevating into the Library.
- **(c) Plain elements** — non-component raw frames, shapes, text, decorative
  visuals. List briefly, grouped by screen region.

## Step 2 — Present the inventory before building

Show the (a)/(b)/(c) inventory as a compact table plus the implementation plan.
Batch **all** genuinely ambiguous items into a single `AskUserQuestion` checkpoint —
ambiguous means: element identity unclear, intended behavior unknowable from the
design (e.g. what a button triggers), or a Library variant mismatch. Do not ask about
things the design or the project's existing conventions already answer. Wait for
explicit approval before writing any code.

## Step 3 — Build

- **Library components:** import from `@leta/components` — never rebuild, never
  inline-style a lookalike.
- **Ad-hoc components:** build as local components within the prototype's own
  directory, styled exclusively with design tokens.
- **Plain elements:** regular markup, tokens only, no hardcoded values.
- Skip any Figma node with `visible: false` during traversal — never implement a
  hidden element (a hidden Lock icon and a hidden "Demarcator" divider have both
  shipped by mistake this way).

## Step 4 — Parity verification

Screenshot the running implementation and compare against a Figma screenshot of the
wireframe. Check layout, spacing, typography, colors, component variants, and
states. Fix discrepancies and re-verify — up to 3 iterations max. Report any
remaining known differences with reasons. Don't re-verify a screen that already
passed in an earlier iteration.

## Two hard-won corrections (apply every time)

1. **The screenshot is ground truth for literal copy, not the generated JSX.**
   `get_design_context`'s reference code can carry stale or base-component default
   text instead of the actual instance override (confirmed 2026-07-15: an Alert
   Dialog's JSX-extracted button labels were wrong; the user had to correct them from
   directly viewing the file). If the JSX and the screenshot disagree on a title,
   button label, or body copy, flag the disagreement rather than silently picking
   one — when in doubt, take a fresh `get_screenshot` look or ask the user to confirm
   the exact string.
2. **Verify the actual bound variant per-instance — never assume from a similar
   prior build.** The user deliberately restructures and reuses LETA design-system
   building blocks differently across wireframes than how a component is typically
   used elsewhere — "the design system components are just building blocks that may
   or may not be restructured for usage in actual wireframes and prototypes."
   Confirmed 2026-07-15: an Add Order drawer's section titles were built with the
   shared `InputGroup` helper (hardcoding the `group-header` Content Primitives
   variant — Body/M/SemiBold, secondary color) because that's what a visually
   similar prior screen used — but the actual Figma instance was bound to
   `section-heading` (Body/L/SemiBold, heading color), a measurable visual
   difference that had shipped wrong. Check the exact typography classes/color
   tokens rendered in the JSX/screenshot against the candidate variants' known
   styles for **every** Content-Primitives-style or multi-variant component, every
   time. The user's words on this: "verify, verify, verify."

## Related conventions this workflow composes with

- **Nested-instance property config:** when a wireframe composes an *instance* of a
  Library component, reproduce that instance's exact Figma property values, not the
  component's React defaults (Breadcrumbs once shipped underlined Plain buttons
  because `showUnderline` defaulted `true` in code while the Figma instance had it
  `false`).
- **Figma SLOTs → composable child-injection props:** any `type === 'SLOT'` node maps
  to a named `ReactNode` prop, caller-injected, never hardcoded; its default
  visibility mirrors the Figma slot's own `visible` flag.
- **MapView is the standard map primitive** — every map surface composes `<MapView>`
  (Leaflet + OSM, no API key) rather than a one-off embed.
