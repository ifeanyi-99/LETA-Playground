# Desktop Menu options (`1531:5056`) — structural analysis (WIP)

A universal menu/list-item primitive. **15 Type values × up to 9 States = 74 variants.** Captured
2026-06-04 to seed a dedicated build. **Never assume a variant's structure — each Type below is
structurally distinct; analyze each before building.**

## Variant matrix (74)

| Type | States |
|---|---|
| Combobox | Idle, Hover, Pressed, Active, Disabled (5) |
| Dropdown Basic | Idle, Hover, Pressed, Disabled (4) |
| Dropdown-Advanced | Idle, Hover, Pressed, Disabled (4) |
| Dropdown-Destructive | Idle, Hover, Pressed, Disabled (4) |
| Checkbox Selection | Idle, Hover, Pressed, Idle-Selected, Hover-Selected, Pressed-Selected, Disabled (7) |
| Radio Button Selection | (same 7 as Checkbox Selection) |
| Day Cell | Idle, Hover, Pressed, Active, Disabled (5) |
| Mobile Day Cell | Idle, Pressed, Active, Disabled (4) |
| Pagination | Idle, Hover, Pressed, Active, Disabled (5) |
| Time Picker | Idle, Hover, Pressed, Active, Disabled (5) |
| Filter Group | Idle, Hover, Pressed, Active, +Selected of each (8) |
| Side Bar Main navigation | Idle, Hover, Pressed, Active (4) |
| Side Bar Main navigation(Icon-Only) | Idle, Hover, Pressed, Active (4) |
| Side Bar Sub navigation | Idle, Hover, Pressed, Active (4) |
| Side Tab navigation | Idle, Hover, Pressed, Active (4) |

## Component properties (16)
`Label`, `Show Leading Icon`, `Show Trailing Icon`, `Show Label`, `Show Buttons`, `Leading Icon`
(swap), `Trailing Icon` (swap), `Show Selection Control`, `Day Number`, `Time`, `Show Shortcut`,
`Filter Name`, `Show Badge`, `Navigation Label`, `Sub Navigation label`, `Side Tab Label`, + `Type`/`State`.

## Structural families (Idle-state fingerprints)
- **Menu rows** (Combobox, Dropdown Basic): 180×40, HORIZONTAL — `Content > [Text + Icons] [Trailing Elements]` (label + leading/trailing icons + trailing shortcut/buttons).
- **Dropdown-Destructive**: 180×40 — `Content > [Text + Icons]` (destructive/red label row).
- **Dropdown-Advanced**: 350×64, VERTICAL, pad 10 — **wraps a `Content Primitives` INSTANCE** ⟵ **DEPENDENCY: Content Primitives is its own unbuilt component.**
- **Time Picker**: 77×32, pad 8/6 — `Content > TEXT "12:00 AM"`.
- **Pagination**: 32×32 numbered cell — Active = `--surface-secondary-pagination-active` + on-color text; Idle = `--surface-neutral-day-cell-idle` + default text. (This is all Pagination.tsx needs.)
- **Checkbox / Radio Selection**: row with a selection control (reuse Checkbox/RadioButton atoms) + label; has `*-Selected` states.
- **Day Cell / Mobile Day Cell**: square calendar cells with a day number.
- **Filter Group**: filter row + selection + optional badge.
- **Sidebar / Side-Tab nav** (4 types): nav items (icon + label, active indicator); Icon-Only variant.

## Dependencies discovered
- **Content Primitives** (used by Dropdown-Advanced) — unbuilt; building DMO fully requires it too.
- Selection types reuse Checkbox / RadioButton atoms (built).
- Badge (built), Icon (built), Shortcut (built 2026-06-04).

## Recommendation
This is the largest component in the system + a sub-dependency (Content Primitives). It deserves a
**dedicated build session** with full context budget, analyzed family-by-family. Pagination only needs
the **Pagination Type** slice (the 32×32 cell), which can be inlined to unblock the molecule batch.
