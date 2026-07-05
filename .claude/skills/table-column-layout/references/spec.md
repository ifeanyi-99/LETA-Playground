# Table Column Layout Specification

> **Leta · Design System · Dispatcher Platform**
> How columns are classified, sized, prioritised, and shrunk — so every table in the platform behaves the same way.

> **How to read this document**
> **Part I — The Table System** defines the rules every table obeys: classification, the width model, floors, shrink behaviour, and priority.
> **Part II — Table Instances** declares individual tables (Order, Unassigned, All, User Management) against that system. Each instance only states its columns and widths.
> Adding or changing a table means writing a new instance — not redesigning the system.

---

# Part I — The Table System

## 1. Philosophy

- Tables optimise for information density and scanability, not visual symmetry.
- Column widths reflect the importance of their content, not equal distribution. A Driver, Route, or Recipient column needs more horizontal room than a Status badge or a timestamp.
- The aim is to show the most useful information without forcing excessive truncation.
- **Never make all columns equal width.**

## 2. Column Classification

Every column belongs to one of five categories.

| Category | Role | Examples |
|---|---|---|
| **1 · Primary** | Identifies the record; scanned first. Often multi-line, may host inline actions. Receives remaining width and expands by weight. | Driver, Recipient, Route, Customer, Vehicle, Company |
| **2 · Primary Identifier** | Uniquely identifies the record but gains nothing from growing wider. Copied, searched, or clicked. Truncates safely. Fixed width by default. | Order ID, Trip ID, Batch ID, Invoice No., Tracking No. |
| **3 · Secondary** | Adds context without being the focus. Predictable length. Fixed width. | Depot, Service Type, Region, Vehicle Type |
| **4 · Utility** | Metadata or status. Small; sized to content. Fixed width. | Status, Priority, Delay, Duration, Created, Updated |
| **5 · Control** | Interactions, not information. Smallest columns; fixed width. The control column carries no header. | Checkbox, Expand, Overflow, Action buttons, Dispatch |

> **One exception for identifiers.** A Primary Identifier may be promoted to a **bounded flexible** column in a specific instance for visual balance (§3.3) — but never to unbounded growth. An identifier that truncates anyway earns nothing from unlimited width, and would starve the priority column.

## 3. Width Model

### 3.1 Fixed vs flexible

- **Fixed columns** have predictable content width and hold it regardless of screen size (checkbox, identifiers by default, Duration, Created, Status, Actions).
- **Flexible columns** carry the primary information and share all remaining width after the fixed columns are allocated. Never give these fixed pixel widths — distribute by weight.

### 3.2 Flexible weighting

- Assign weight to the **flexible space only**, not to the whole table.
- The percentage split is the source of truth; weights are the same ratio expressed for `flex-grow` or grid `fr` units, with Recipient as the 1.00 base.

| Primary flexible column | Share | Weight (Recipient = 1.00) |
|---|---|---|
| Route | 40% | 1.48 |
| Driver | 33% | 1.22 |
| Recipient | 27% | 1.00 |

If a primary flexible column is removed, redistribute its share **proportionally** across the survivors (see Instance B).

### 3.3 Bounded flexible columns

An identifier can flex within a **min–max band** so it looks balanced beside the primary columns without competing for width unbounded.

- Sits at its **min** on constrained screens.
- Grows slowly (low weight) once every primary floor is satisfied.
- Stops at its **max** and cedes further width to the primary flexible columns.

Applied to **Order ID** in the Order Table: min 150px, max 224px, low weight (confirmed). Past 224px the surplus goes to Route.

### 3.4 Minimum widths (floors)

Every flexible column has a floor: the smallest width that avoids truncating its protected content. Base the name portion of a floor on a representative-long name (about the p90 length), not the longest name that could ever occur — otherwise every row pays for one outlier.

| Column | Floor is set by | Protected content |
|---|---|---|
| Driver | Avatar + name + inline actions | Avatar and name; phone is a call action, not text |
| Recipient | Name + full phone | Name and full phone — must not truncate |
| Route | Stacked composite (see 3.5) | Enough of each line to distinguish locations |
| Order ID | 150px (also its bounded-flex min) | ~18–24 visible characters |

### 3.5 Route is a composite cell

Route is not a single line of text. It stacks the **depot** and **pickup** with a connecting line, plus the drop-off. This is why **Depot is not a separate column** in the Order Table — it lives inside the Route cell. Size Route as a stacked block; sized as one line, its floor comes out too low.

## 4. Allocation & Responsive Behaviour

### 4.1 Allocation order

Space is handed out in this order:

1. Give every **fixed** column its set width.
2. Satisfy every **flexible floor**, including the bounded-flex min.
3. Distribute surplus among the **primary flexible** columns by weight; grow the bounded-flex column by its low weight up to its max.

### 4.2 On shrink — freeze & redistribute

- Flexible columns shrink proportionally.
- When a column reaches its floor it **freezes**; the remaining shrink redistributes across the columns still above their floors.
- Recipient carries the strictest rule (full phone) and the smallest share, so it reaches its floor first, freezes, and forces Route and Driver to absorb the rest.

### 4.3 When the table doesn't fit — horizontal scroll

The table's **minimum width** is the sum of its fixed columns, its flexible floors, and any optional column the user has switched on. Behaviour follows the viewport against that minimum:

- **Viewport at or above the minimum:** flexible columns absorb the surplus by weight (§4.1). No scroll.
- **Viewport shrinking toward the minimum:** flexible columns shrink proportionally and freeze at their floors (§4.2). Still no scroll.
- **Viewport below the minimum:** the table **scrolls horizontally.**

Two things push the viewport below the minimum, and both resolve the same way — one behaviour, two triggers: the user **narrows the browser window**, or the user **switches on the optional Last Updated column** (which raises the minimum above the current width). Turning on Last Updated only scrolls when the flexible columns, already at their floors, cannot make room for it.

When the table scrolls, **pin the anchors**: Order ID fixed on the left, Actions fixed on the right. Pinning is per instance — the All view has no Actions column, so it pins Order ID only. Scroll **replaces column-dropping**: no column is hidden, only scrolled to, and the pinned Order ID keeps every row identifiable while the middle scrolls.

### 4.4 Wide viewports — scale the design *(confirmed 2026-07-04)*

The allocation in §4.1 governs widths **up to the design width** — the 1320px content canvas the instances are declared at (1440 screen − 72 collapsed sidebar − 48 page padding). Beyond it, handing every surplus pixel to the primary columns stops serving balance: on a sparse instance (All — two primaries) the primaries balloon and the row degrades into content islands separated by voids, with too much empty space between the elements of a row. So past the design width **the approved layout scales instead of stretching its primaries**:

- Re-derive each column's **design width** by running §4.1 at 1320.
- Distribute the full available width across all **information columns** (primary, primary-identifier, secondary, utility) **proportionally to those design widths** — the table renders as the approved design, scaled.
- **Control columns** (checkbox, actions) never scale — interactions gain nothing from width.
- A **bounded identifier keeps its max** (§3.3); the share it cedes redistributes proportionally among the other information columns.
- No information column ever renders below its design width in this mode; there is still **no dead gap**.

One rule below the design width (shrink → freeze → scroll, §4.2–4.3), one above (scale). The two agree exactly **at** the design width, so the handoff is seamless.

## 5. Two Priority Lists

Width Allocation (§5.1) is the active rule — it decides which flexible columns get surplus space. The Column-Drop Order (§5.2) is reference-only now that scroll (§4.3) handles overflow; it is kept for instances that opt out of scroll.

### 5.1 Width Allocation Priority

Which columns receive surplus width, in order. **Flexible columns only** — fixed columns do not negotiate for space.

| # | Column | Why |
|---|---|---|
| 1 | Route | Longest and most variable content |
| 2 | Driver | Avatar, name, phone |
| 3 | Recipient | Name and protected phone |
| 4 | Order ID (bounded) | Grows only within its band, after the primary floors |

### 5.2 Column-Drop Order (reference)

Superseded by horizontal scroll (§4.3) as the overflow behaviour — columns are not dropped by default. This priority is retained only if a specific instance opts out of scroll and hides its lowest-value columns instead. Runs opposite to allocation.

- **Drop first:** Secondary columns — Depot, Service Type, Region.
- **Then:** lower-priority Utility columns.
- **Never drop:** Status, Checkbox, Actions.

## 6. Truncation Rules

**Route** — preserve enough of each stacked line to tell locations apart.

| | Example |
|---|---|
| **GOOD** | `Arc Kitisuru Depot` / `3B Mango Lane, Kilimani…` |
| **AVOID** | `Arc…` / `3B…` |

- **Driver** — always show avatar and name. The phone is a call button, not displayed text.
- **Recipient** — always show name. Phone must not truncate.
- **Order ID** — show ~18–24 characters before ellipsis; full value via copy, tooltip, or detail view. Example: `v3q2k2-j2k2k2-qPR…`

## 7. Interaction Model

Two table types, distinguished by whether the row is a target.

| Type | Row behaviour | States |
|---|---|---|
| Static (e.g. Logs) | Read-only. The row is not clickable. | No hover, no pressed |
| Dynamic (e.g. Orders) | Clicking the row opens the record drawer. | Hover + pressed |

Inside a dynamic table:

- The **checkbox column is the only selection target** — clicking it selects the row; it does not open the drawer.
- **Inline buttons within a cell** (copy in the Order ID cell, change-driver) act independently of the row and **must stop event propagation**, so a mis-aimed tap never opens the drawer.

> Recommendation (not yet locked): because hover is the main signifier of a clickable row and hover does not exist on touch, dynamic rows should also carry a persistent affordance — a cursor change plus a trailing signifier — so clickability never depends on a mouse-over. Relevant for the 50+ PBL dispatchers.

## 8. General Rules

- Never distribute all columns evenly.
- Allocate space by information density.
- Fixed columns are only as wide as their content requires.
- Flexible columns absorb all remaining space.
- Route is always the widest flexible column.
- Keep column widths consistent across similar tables to reduce layout shift.
- Showing or hiding a column must not require redesigning the table — that is why the system and its instances are kept separate.
- The action / control column carries **no visible header label** — the icons already read as interactive, and a label only adds noise. The header cell still exists with a screen-reader-only accessible name (e.g. "Actions"), so the column is never announced as empty. Same for the checkbox column.
- Balance comes from important information having room to breathe, not from equal widths.

## 9. Implementation Rules

1. Classify every column: Primary, Primary Identifier, Secondary, Utility, Control.
2. Assign fixed widths to all non-primary columns, unless an instance promotes an identifier to bounded-flex.
3. Allocate remaining width among primary flexible columns by weight; grow any bounded-flex column by its low weight within its band.
4. Use weighted distribution, never equal widths.
5. Satisfy floors before distributing surplus. On shrink, freeze a column at its floor and redistribute (§4.2).
6. If a primary flexible column is removed, redistribute its share proportionally among the survivors.
7. Keep widths consistent across similar table types.
8. Inline cell actions stop propagation; the checkbox is the only selection target.

---

# Part II — Table Instances

Each instance declares its columns against the system in Part I, **in display order (left to right)**. This list is the contract an implementation can diff against.

## A. Order Table — dispatched & finished states

The full-column shape, used for any state where a driver and a trip exist: Assigned, At Depot, In Transit, Arrived, Delivered, Returned, Cancelled.

| Column (in order) | Width | Notes |
|---|---|---|
| Checkbox | 52px | Selection target |
| Order ID | 150–224px | Bounded flexible, low weight; pinned left on scroll |
| Trip | 90px | Primary Identifier |
| Driver | flex 33% | Primary flexible |
| Route | flex 40% | Primary flexible; always widest |
| Recipient | flex 27% | Primary flexible |
| Duration | 110px | Carries the SLA |
| Created | 120px | Shown by default |
| Last Updated | 120px | Toggle — off by default |
| Status | 140px | |
| Actions | 64px | Overflow only; no header; pinned right on scroll |

- **Actions is 64px here** — a single overflow button. Contrast Instance B, where Actions is 154px because the Unassigned view carries a Dispatch button plus overflow.
- **Depot is shown inside the Route cell**, not as its own column.

> **Worked example (assumptions stated).** 1440px screen, sidebar ~240px → content ~1200px. Fixed budget ≈ 576px (Last Updated off, Actions 64px). Remaining ~624px across Order ID + Route + Driver + Recipient. Order ID sits near its 150px floor when constrained → Route ≈ 190px, Driver ≈ 156px, Recipient ≈ 128px. On 1920px, Order ID drifts toward 224px and Route ≈ 358px. The 64px Actions column (down from 154px) is what buys Route its breathing room on dense laptops.

## B. Unassigned Orders Table (Scheduled, Pending, Broadcasted)

An unassigned order has no driver and no trip, so **both columns are removed** — not shown empty, removed. Actions is wider here because the row carries a Dispatch button.

| Column (in order) | Width | Notes |
|---|---|---|
| Checkbox | 52px | Selection target |
| Order ID | 150–224px | Bounded flexible; pinned left on scroll |
| Batch ID | 90px | Broadcasted view only |
| Route | flex 60% | Primary flexible; always widest |
| Recipient | flex 40% | Primary flexible |
| Duration | 110px | Pending & Broadcasted; absent for Scheduled |
| Created | 120px | Shown by default |
| Last Updated | 120px | Toggle — off by default |
| Status | 140px | |
| Actions | 154px | Dispatch + overflow; pinned right on scroll |

Route/Recipient are re-weighted **60 / 40** — Driver's 33-point share redistributed proportionally per Rule 6. The three views differ only as below:

| View | Vs the full set above | Flexible split |
|---|---|---|
| Pending | no Batch ID | Route 60% · Recipient 40% |
| Broadcasted | Batch ID present | Route 60% · Recipient 40% |
| Scheduled | no Batch ID, no Duration | Route 60% · Recipient 40% |

## C. All — search / triage view

Its job: the dispatcher does not know which group an order is in, so they open **All** (which collapses the sub-status dropdowns) and search. The primary interaction is search plus the Status column — not the columns themselves.

| Column (in order) | Width | Notes |
|---|---|---|
| Order ID | 150–224px | Bounded flexible; pinned left on scroll; the row you searched for |
| Route | flex 60% | Primary flexible; always widest |
| Recipient | flex 40% | Primary flexible |
| Duration | 110px | "—" for Scheduled rows |
| Created | 120px | Shown by default |
| Last Updated | 120px | Toggle — off by default |
| Status | 140px | The anchor column that makes a mixed list legible |

- **Absent:** Checkbox, Driver, Trip, Batch ID, Actions.
- **No Actions column** — every row opens the drawer on click, and the drawer footer carries the status-appropriate actions. This is why heterogeneous inline actions don't need to reconcile.
- **No Checkbox** — no bulk actions across mixed statuses.
- On scroll, pin **Order ID only** (there is no Actions column to pin).

## D. User Management Table — illustrative

Included to show the system generalises beyond orders. Here there is no Route cell, so **Depot appears as its own Secondary fixed column**. Columns to be finalised when this table is specced.

| Column | Category |
|---|---|
| Checkbox | Control |
| User | Primary flexible |
| Role | Secondary |
| Depot | Secondary |
| Status | Utility |
| Actions | Control |

## E. Modal / embedded tables

A table inside a modal, drawer, or panel (e.g. the broadcast-to-drivers dialog) carries a **reduced column set** — fewer columns, focused on the data relevant to that context. It does **not** replicate the full page-table columns. But it obeys the **same System rules** (Part I) at its own content width:

- **Reduce, don't redesign.** Drop the columns that context doesn't need; keep the survivors classified as they were (Primary flexible / Identifier / Utility / Control). Never add columns to match a page table, and never fall back to equal widths.
- **Same width model at the modal's width.** Sum the fixed columns; the primary columns share the remainder by the same weights (Route widest); apply the same floors and bounded Order ID band. Resolve the flex to the modal's content width (e.g. 736px), not the page's ~1320px.
- **Order of significance holds.** Route → Driver → Recipient → Order ID → Secondary → Utility → Control (§5.1). No dead gap on the right — the primary columns absorb the surplus.
- **Static wireframe caveat.** Because Figma auto-layout can't express weighted fill, the modal wireframe realises "weighted, no gap" as **computed FIXED px that sum to the modal content width**; in code it's still `flex` weights on the primary columns.

The takeaway: a modal table is the same system at a smaller width with fewer columns — not a special case.

---

*Order ID caps at 224px (§3.3); the Driver cell exposes the phone as a call action, not text (§3.4, §6). All decisions in this document are confirmed in review.*
