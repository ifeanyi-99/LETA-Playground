# Change report template

Fill in placeholders `<like-this>`. Omit any section where every list is empty — but always keep the Summary table so a reader can see at a glance that "nothing changed in tokens" was a real check, not a missed phase.

```markdown
# Figma → Code Sync Report

**Scan date**: <YYYY-MM-DD HH:mm UTC>
**Previous scan**: <YYYY-MM-DD HH:mm UTC, or "first scan">
**Figma file**: `Kxbgc2KoJSmTxvSV3PwNEu`
**Snapshot dir**: `packages/cli/snapshots/`
**Code dir cross-checked**: `packages/components/src/`

## Summary

| Category | Added | Removed | Renamed | Changed |
|---|---:|---:|---:|---:|
| Tokens | <n> | <n> | <n> | <n> |
| Effect styles | <n> | <n> | <n> | <n> |
| Components | <n> | <n> | n/a | <variant axis changes + visual prop changes> |
| Descriptions | <n> | <n> | n/a | <n> |
| Annotations | <n> | <n> | n/a | <n> |

**Headline**: <one sentence — e.g. "Buttons padding tweaked across 6 Medium variants, plus 2 new tokens added.">

---

## Tokens

### Added
| Name | Value | Collection | Code status |
|---|---|---|---|
| `--example` | `#ABCDEF` | brand | code-not-implemented-yet (run `pnpm tokens:sync`) |

### Value changed
| Name | Mode | Old | New | Code status |
|---|---|---|---|---|

### Removed / Renamed
<list>

---

## Effect styles
<same shape as Tokens>

---

## Components

### Added (Figma has, code doesn't)
- **`<Component Name>`** ([`<nodeId>`](https://www.figma.com/file/Kxbgc2KoJSmTxvSV3PwNEu/?node-id=<nodeId>)) — <one-line description if available>

### Removed (code has, Figma doesn't)
<list — flag for designer review>

### Variant axis changes
For each affected component:

**`<Component Name>`** (`<nodeId>`)
- Axes added: `<list>`
- Axes removed: `<list>`
- Values added: `Size: [Mini]` / `State: [Loading]`
- Values removed: `<list>`
- Code impact: <code-needs-update | code-not-implemented-yet | etc>

### Per-variant visual property changes
Grouped by component. Use a table when >5 variants are affected:

**`<Component Name>`** (`<nodeId>`) — <N> variants changed

| Variant | Property | Old | New | Code location |
|---|---|---|---|---|
| Size=Medium, Type=Leading Icon | paddingLeft | 12 | 8 | `Button.tsx` `LAYOUT.medium['leading-icon']` |

---

## Documentation

### Description changes
| Component | Old (first 80 chars) | New (first 80 chars) |
|---|---|---|

### Annotation changes
| Component | Category | Label | Old body → New body |
|---|---|---|---|

---

## Action items

Mirror the highest-impact changes into a checklist. The same checklist is appended to `PLAN.md` under `## Pending Figma sync (<scan date>)`.

- [ ] Run `pnpm tokens:sync` to refresh design-tokens dist (<n> token value changes detected)
- [ ] Update `packages/components/src/Button/Button.tsx` `LAYOUT` map — `Medium / Leading Icon` paddingLeft `12 → 8`, `Trailing Icon` paddingRight `12 → 8` ([28:38245](https://www.figma.com/file/Kxbgc2KoJSmTxvSV3PwNEu/?node-id=28:38245))
- [ ] Implement `Tag` component — new in Figma, no code yet ([nodeId](url))
- [ ] Reconcile `OldThing` — removed from Figma but `packages/components/src/OldThing` still exists; confirm deletion with designer
- [ ] Re-run parity for affected components after code changes:
  - [ ] Desktop Button (`28:38245`)
  - [ ] Mobile Button (`2887:26272`)
```

## Format rules

- Always use the table form for any list >5 items. Bullets for shorter lists.
- Always include the markdown link to the Figma node so the user can click through.
- Group per-variant prop changes by component, not flat across all components — easier to scan.
- Action items should be specific enough that a fresh session can act on them without re-reading the report (cite file path + symbol + before→after).
- Use `code-needs-update`, `code-not-implemented-yet`, `code-orphaned`, `code-already-matches`, `docs-only` as the status vocabulary — consistent across reports.
