# LETA Playground — Design Specs (source of truth)

This directory is the **single source of truth** for the specs driving the LETA
On-Demand dispatcher **interactive playground** (`apps/playground`). It is
tracked in git and meant to be shared with the design co-pilot — edit the docs
here directly; do not maintain separate isolated copies. When design intent
changes, update the relevant file here and the implementation is reconciled
against it.

Figma design file (wireframes): **LETA Playground** — `xVa4kZAArZWWvl6QsfID8S`.
Figma component library: `Kxbgc2KoJSmTxvSV3PwNEu`.

## Documents

| File | Doc | Covers |
|---|---|---|
| [order-management-foundations-and-logic.md](order-management-foundations-and-logic.md) | **Doc 1** | Orders table + row anatomy, Add Order drawer, field config (Items/Payment), validation, Order Detail View (§7), edit matrix (§8), broadcast/dispatch visibility (§9), reassignment — Change Driver / Add to Trip (§10), disruption — Cancel / Reschedule / Return (§11), the table interaction layer — filters/sort/pagination/overflow menus/Update Status modal (§12). **Version 2.7.** |
| [interaction-and-component-patterns.md](interaction-and-component-patterns.md) | **Doc 3** | Generic component behaviour reused everywhere: dropdown/popover primitive, loading, empty states, toasts, confirmation, pagination, date-range picker, search, filters, keyboard & focus. **v1.1.** |
| [sla-and-fulfilment-time-specification.md](sla-and-fulfilment-time-specification.md) | **Doc 4** | The five-SLA two-phase fulfilment-time model, the constant-Expected-OFT-with-paused-clocks counter, On-Time / At Risk / Delayed badge precedence, multi-attempt reporting rollup. |
| [table-column-layout-specification.md](table-column-layout-specification.md) | Table spec | Column classification (Primary/Identifier/Secondary/Utility/Control), fixed vs weighted-flexible sizing, floors, freeze-and-redistribute, horizontal-scroll-with-pinned-anchors, per-instance column presets. |
| [changelog-bulk-actions-and-reschedule-suggestions.md](changelog-bulk-actions-and-reschedule-suggestions.md) | Changelog | Bulk cancel/reschedule brought into scope + the reschedule suggestion chips (folded into Doc 1 §11.1/§11.2/§11.2.1/§11.5 v2.7). |

### Referenced but not yet in this repo

- **Doc 2 — Configuration Reference (DES-248):** the admin toggle definitions
  (`items.enabled`, `items.mode`, `payment.enabled`, `scheduling.autoBroadcast.enabled`,
  etc.). Doc 1 names the flags; their defaults/scope live in Doc 2. Add it here when available.
- **Doc 5 — Broadcast & Fleet Configuration:** priority groups, acceptance
  windows, driver broadcast suspension. Add it here when available.

## Note on the Table Column spec

`table-column-layout-specification.md` here is the shareable copy. A working copy
also lives at `.claude/skills/table-column-layout/references/spec.md` (the
`table-column-layout` skill loads it during table work). Keep the two in sync —
edit here, then mirror into the skill's `references/spec.md` (they should be
byte-identical).
