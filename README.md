# LETA Design System

Code mirror of the LETA Figma Library, plus interactive product playgrounds.

## Structure

```
packages/
├── design-tokens/    CSS vars, Tailwind preset, TS exports (generated from Figma)
├── icons/            SVG icon React components
├── components/       React component library
└── cli/              Figma → code token generation

apps/
├── storybook/        Component documentation
└── playground/       Interactive product prototypes (On Demand, PD, ...)
```

## Stack

- **React** + **TypeScript**
- **Tailwind CSS** (custom preset built from design tokens)
- **pnpm workspaces** + **Turborepo**
- Vite for apps, tsup for packages
- Storybook for component documentation

## Tokens

Design tokens are generated from the Figma Library. Never hand-edit files in `packages/design-tokens/dist/`.

```bash
pnpm tokens:fetch     # Pull latest variables from Figma
pnpm tokens:generate  # Regenerate CSS / Tailwind / TS outputs
pnpm tokens:check     # Verify committed output matches Figma (used in CI)
pnpm tokens:sync      # fetch + generate + write
```

CI runs `tokens:check` on every PR and fails loudly if the committed tokens drift from the Figma source of truth.

## Getting started

```bash
pnpm install
pnpm dev
```

## Plan

See `PLAN.md` for the full build roadmap.
