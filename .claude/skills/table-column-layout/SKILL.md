---
name: table-column-layout
description: Apply the LETA Table Column Layout Specification when building, modifying, or reviewing any data table — classify each column, size fixed vs flexible (incl. bounded-flexible identifiers), set floors, weight the flexible space, and follow the freeze-and-redistribute, horizontal-scroll-with-pinned-anchors, truncation, and interaction rules. Use whenever you create or edit a table, add/remove a column, set or "balance" column widths, wire a Table/DataRows/TableContainer/Page table, or the user mentions columns being too wide/narrow, truncated, wrapping, squished, misaligned header-vs-body, or "not balanced". Use proactively before composing any new table screen so columns are right the first time.
---

# Table Column Layout

The authoritative rules for sizing columns in every LETA data table. **The canonical source of truth is [`references/spec.md`](references/spec.md)** — read it when precision matters; this file is the working summary. Tables optimize for **information density and scanability, not visual symmetry** — widths reflect the *importance and variability* of content, never an equal split.

> **Golden rule: never make all columns equal width.** Only primary (content) columns flex; everything else is fixed and only as wide as its content needs.

The spec is a **System** (Part I — rules every table obeys) + **Instances** (Part II — individual tables declared against it). **Adding or changing a table = write a new instance, not redesign the system.**

## How this maps to code (compose, never hand-roll)

Use `Table` from `@leta/components` — never build a custom table.

- **`TableColumn.role`** sets the default sizing: `'primary'` → flexible (`flex` weight); `'identifier' | 'secondary' | 'utility' | 'control'` → fixed `width`.
- **`flex`** = a primary column's weight (§3.2), the flexible-share ratio with **Recipient = 1.00**: Route `1.48` (40%), Driver `1.22` (33%), Recipient `1.00` (27%). Relative, so removing a column redistributes automatically (drop Driver → Route/Recipient settle at 60/40).
- **`minWidth`** = the column's **floor** (§3.4).
- **`maxWidth`** = the cap for a **bounded-flexible** identifier (§3.3).
- **`accessibleName`** = SR-only header name for a no-visible-label column (Actions/checkbox, §8) — the header cell still exists and reserves width; it is never deleted.
- The 52px checkbox column is added by `<Table selectable>`. A dev-warn fires if a table has no flexible column.

**CRITICAL — header and body must share every column's sizing.** In `<Table>` this is automatic (columns are defined once and applied to the header cell AND every body-row cell). When editing a Figma wireframe by hand, the header row and each body row are sized *independently* — you MUST set each column's width/FILL/weight/min/max on the header cell **and every body row cell at that index**, or the body columns drift and stop matching the header (the classic "Recipient header flexes but the body cell stays fixed / dead gap on the right / Actions header missing" failure).

> ✅ **Presets are reconciled to this spec (2026-07-03).** `columnPresets.ts` exports one preset per Figma instance — `ORDER_TABLE_COLUMNS`, `UNASSIGNED_ORDER_COLUMNS`, `BROADCASTED_ORDER_COLUMNS`, `SCHEDULED_ORDER_COLUMNS`, `ALL_ORDER_COLUMNS`, `LAST_UPDATED_COLUMN` — with instance-specific Actions widths and `pinned` anchors. See "Code reconciliation" at the bottom for the mapping.

---

## Part I — The System

### 1. Classify every column (5 categories)

| Category | Sizing | Role | Examples |
|---|---|---|---|
| **Primary** | **Flexible** (weight) | Identifies the record, scanned first; multi-line, may host inline actions | Driver, Recipient, Route, Customer, Vehicle, Company |
| **Primary Identifier** | Fixed (or bounded-flex, §3.3) | Uniquely identifies; copied/searched/clicked; truncates safely; gains nothing from growing | Order ID, Trip ID, Batch ID, Invoice/Tracking No. |
| **Secondary** | Fixed | Context, not focus; predictable length | Depot, Service Type, Region, Vehicle Type |
| **Utility** | Fixed (sized to content) | Metadata/status; small | Status, Priority, Delay, Duration, Created, Updated |
| **Control** | Fixed (smallest); **no visible header** | Interactions, not information | Checkbox, Expand, Overflow, Action buttons, Dispatch |

### 2. Width model
- **Fixed** columns hold their width regardless of screen size.
- **Flexible** (primary) columns share **all remaining width** after fixed columns — never fixed px, always weight.
- **Bounded-flexible (§3.3):** an identifier promoted to flex within a **min–max band** with a **low weight** — sits at min when constrained, grows slowly once every primary floor is satisfied, caps at max, then cedes surplus to the primary columns. Never unbounded. *(Order ID: min 150 / max 224 / low weight — past 224 the surplus goes to Route.)*
- **Floors (§3.4):** every flexible column has a `minWidth` = the smallest width that avoids truncating its protected content. Base a name floor on a **representative (p90) length**, not the longest possible.
- **Route is a composite cell (§3.5):** it stacks depot + pickup (connected) + drop-off. **Depot is not its own column** — it lives inside Route. Size Route as a stacked block.

### 3. Allocation order (§4.1)
1. Give every fixed column its width. 2. Satisfy every flexible floor (incl. the bounded-flex min). 3. Distribute surplus among primary columns by weight; grow the bounded-flex column by its low weight up to its max.

### 4. Responsive behaviour — shrink, then horizontal scroll (§4.2–4.3)
- **On shrink:** flexible columns shrink proportionally; when one hits its floor it **freezes** and the remaining shrink redistributes to columns still above their floors. Recipient (strictest — full phone — and smallest share) freezes first.
- **Table minimum width** = sum of fixed columns + flexible floors + any optional column switched on.
  - Viewport **≥ min** → flexible columns absorb surplus by weight. No scroll.
  - Viewport **shrinking toward min** → flexible columns shrink & freeze at floors. No scroll.
  - Viewport **below min** → the table **scrolls horizontally.**
- **Two triggers, one behaviour:** the user narrows the browser window, OR switches on the optional **Last Updated** column (which raises the minimum above the current width). Turning on Last Updated only scrolls when the flexible columns, already at their floors, can't make room.
- **Pin the anchors on scroll:** Order ID sticky-left, Actions sticky-right, so every row stays identifiable while the middle scrolls. **Pinning is per instance** — the *All* view has no Actions column, so it pins Order ID only.
- **Scroll REPLACES column-dropping** — no column is hidden, only scrolled to.
- **Wide viewports — scale the design (§4.4):** beyond the **design width** (the 1320px content canvas), the approved layout **scales proportionally** instead of dumping every surplus pixel into the primaries (which balloons Route/Recipient into voids on sparse instances like All). Information columns grow in their design-width ratio and never render below it; **control columns never scale**; a bounded identifier keeps its max (its ceded share redistributes). The shrink model (§4.2) and the scale model agree exactly at the design width.

### 5. Two priority lists (do not conflate)
- **Width-allocation priority (active rule):** who gets surplus → Route → Driver → Recipient → Order ID (bounded). Fixed columns never negotiate.
- **Column-drop order (reference only):** superseded by horizontal scroll (§4.3); retained only if an instance explicitly opts out of scroll. If ever used: drop Secondary first (Depot, Service Type, Region), then lower-priority Utility. **Never drop Status, Checkbox, or Actions.**

### 6. Truncation (§6)
- **Route** — preserve enough of each stacked line to tell locations apart (`Arc Kitisuru Depot / 3B Mango Lane, Kilimani…`, not `Arc… / 3B…`).
- **Driver** — always show avatar + name; the phone is a **call button, not displayed text**.
- **Recipient** — always show name; phone **must not truncate**.
- **Order ID** — ~18–24 chars then ellipsis (`v3q2k2-j2k2k2-qPR…`); full value via copy / tooltip / detail.

### 7. Interaction model (§7)
- **Static** table (e.g. Logs) — read-only row, **no hover/pressed**.
- **Dynamic** table (e.g. Orders) — clicking the row opens the record drawer; row has **hover + pressed**. The **checkbox is the only selection target** (it doesn't open the drawer). **Inline cell buttons stop propagation** so a mis-aimed tap never opens the drawer. *(`DataRows` already implements this: hover/pressed state + `isInteractiveTarget` suppresses row-press on buttons/links/inputs.)* Recommended (not locked): give dynamic rows a persistent clickability affordance (cursor + trailing signifier) since hover doesn't exist on touch.

### 8. General + implementation rules
Fixed columns only as wide as content; flexible absorb the rest; Route is always the widest flexible column; keep widths consistent across similar tables; showing/hiding a column must not require redesign; the control column has no *visible* header but keeps a real header cell + SR accessible name (never deleted). **Implementation:** classify → fixed widths for non-primary (unless promoted to bounded-flex) → weight the primary flexibles → satisfy floors before surplus → freeze on shrink, scroll below min with pinned anchors → redistribute a removed column's share → keep widths consistent → inline actions stop propagation.

---

## Part II — Instances (declared in display order, left → right)

### A. Order Table — dispatched & finished (Assigned, At Depot, In Transit, Arrived, Delivered, Returned, Cancelled)
The full-column shape — used for any state where a driver and a trip exist.

| # | Column | Width | Notes |
|---|---|---|---|
| 1 | Checkbox | 52 | Selection target |
| 2 | Order ID | 150–224 | Bounded flexible, low weight; **pinned left on scroll** |
| 3 | Trip | 90 | Primary Identifier |
| 4 | Driver | flex 33% (1.22) | Primary flexible, floor ~160 |
| 5 | Route | flex 40% (1.48) | Primary flexible; **always widest**, floor ~200 |
| 6 | Recipient | flex 27% (1.00) | Primary flexible, floor ~170 |
| 7 | Duration | 110 | Carries the SLA |
| 8 | Created | 120 | Shown by default |
| 9 | Last Updated | 120 | Toggle — **off by default** |
| 10 | Status | 140 | |
| 11 | Actions | **64** | Overflow only; **no header**; **pinned right on scroll** |

**Actions is 64 here** — a single overflow button (the ~64px, down from 154, is what buys Route its breathing room on dense laptops). Depot lives inside the Route cell.

### B. Unassigned Orders (Scheduled, Pending, Broadcasted)
No driver and no trip exist yet → **both columns removed** (not shown empty — removed). Actions is wider (154) because the row carries a **Dispatch** button + overflow. Route/Recipient re-weighted **60 / 40** (Driver's 33 pts redistributed per Rule 6).

| # | Column | Width | Notes |
|---|---|---|---|
| 1 | Checkbox | 52 | |
| 2 | Order ID | 150–224 | Bounded; pinned left |
| 3 | Batch ID | 90 | **Broadcasted view only** |
| 4 | Route | flex 60% | Widest, floor ~200 |
| 5 | Recipient | flex 40% | floor ~170 |
| 6 | Duration | 110 | Pending & Broadcasted; **absent for Scheduled** |
| 7 | Created | 120 | |
| 8 | Last Updated | 120 | Toggle — off by default |
| 9 | Status | 140 | |
| 10 | Actions | **154** | Dispatch + overflow; pinned right |

Three views differ only here (all Route 60% / Recipient 40%):
- **Pending** — no Batch ID.
- **Broadcasted** — Batch ID present.
- **Scheduled** — no Batch ID, no Duration.

### C. All — search / triage view
The dispatcher doesn't know which group an order is in, so they open **All** and search. Primary interaction is search + the Status column.

| # | Column | Width | Notes |
|---|---|---|---|
| 1 | Order ID | 150–224 | Bounded; **pinned left** (the searched row) |
| 2 | Route | flex 60% | Widest |
| 3 | Recipient | flex 40% | |
| 4 | Duration | 110 | `"—"` for Scheduled rows |
| 5 | Created | 120 | |
| 6 | Last Updated | 120 | Toggle — off by default |
| 7 | Status | 140 | The anchor column that makes a mixed list legible |

**Absent:** Checkbox, Driver, Trip, Batch ID, Actions. No Actions (every row opens the drawer; the drawer footer carries status-appropriate actions). No Checkbox (no bulk actions across mixed statuses). On scroll, **pin Order ID only**.

### D. User Management — illustrative
Generalises beyond orders. No Route cell here, so **Depot is its own Secondary fixed column**. Columns: Checkbox (control) · User (primary flexible) · Role (secondary) · Depot (secondary) · Status (utility) · Actions (control). To be finalised when specced.

---

## E. Modal / embedded tables

A table inside a modal, drawer, or panel (e.g. the broadcast-to-drivers dialog) carries a **reduced column set** — fewer columns, focused on that context's relevant data — but obeys the **same System rules** at its own content width (e.g. 736px, not the page's ~1320px): sum the fixed columns, share the remainder among the primary columns by the same weights (Route widest), same floors and bounded Order ID band, order of significance, **no dead gap**. Reduce, don't redesign — never add columns to match a page table, never fall back to equal widths. In the static wireframe this is realised as computed FIXED px that sum to the modal width; in code it's still `flex` weights.

## Code reconciliation — ✅ DONE (2026-07-03)

`packages/components/src/Table/columnPresets.ts` now matches this spec. What shipped:

1. **Order Table Actions 154 → 64.** Actions is **instance-specific**: `ACTIONS_OVERFLOW` = 64 (Order table, overflow only), `ACTIONS_DISPATCH` = 154 (Unassigned, Dispatch + overflow). Presets are explicit named constants (built DRY from shared column parts), no longer derived by filtering.
2. **Unassigned = one instance, three views.** `UNASSIGNED_ORDER_COLUMNS` (Pending), `BROADCASTED_ORDER_COLUMNS` (Pending **+ Batch ID 90** after Order ID), `SCHEDULED_ORDER_COLUMNS` (Pending **− Duration**, no Batch — pre-queue). `BATCH_ID` is a Primary Identifier (90).
3. **`ALL_ORDER_COLUMNS`** — Order ID · Route · Recipient · Duration · Created · Status; no Checkbox / Driver / Trip / Batch ID / Actions. Consume with `<Table selectable={false}>`.
4. **`LAST_UPDATED_COLUMN`** (utility, 120, off-by-default toggle) splices between Created and Status.
5. **Pinned anchors** — `TableColumn.pinned` (`'left'`/`'right'`) + a sticky-pin capability in `Table` (and `DataRows`). Order ID pins left, Actions pins right (All pins Order ID only), computed offsets stack after the checkbox. **Active only when `<Table scrollX>`** (a no-op in flex-fill mode). Scrollbar chrome: the table's vertical scrollbar is always hidden (scroll works, pagination reads as the boundary); in scrollX mode a slim 8px horizontal bar is the overflow cue. See the `ScrollPinned` Storybook story.
6. **Playground** (`OrdersPage.tsx`) routes each tab/sub-status to the matching preset (dispatched/finished → `ORDER_TABLE_COLUMNS`; unassigned scheduled/broadcasted/pending → the three Unassigned views; all → `ALL_ORDER_COLUMNS`), so it matches the Figma wireframes 1:1 per status. **Default = flex-fill, no h-scroll (the Figma tables carry none); `scrollX` flips on only when the user adds an optional column (Last Updated / Created By) from the Columns control**, which splices it before Status and activates the pinned horizontal scroll.
7. **§4.1 floors-first + §4.4 wide-mode scaling (2026-07-04).** Flexible columns' CSS is `flex: <weight> 1 <floor>px` — the **floor is the flex-basis**, so floors are satisfied first and only the *surplus* is shared by weight (a `0` basis had been splitting the whole pool by weight, squeezing Order ID and over-widening Route vs the approved design; at 1320 every instance now renders its Figma design px exactly). `Table` also computes each column's **design width** (running §4.1 at the 1320 canvas via `computeDesignWidths`) and watches its container: beyond the design width it switches to the scaled model — information columns `flex: <designPx> 1 <designPx>px` (proportional growth, design px as the floor), control columns fixed, bounded identifier capped.
