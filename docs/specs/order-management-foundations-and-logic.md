# Order Management — Foundations & Logic

> **Document:** Order Management Foundations & Logic (Doc 1 of 2)
> **Companion:** Configuration Reference — On Demand (Doc 2, maps to DES-248) — the single source of truth for every admin toggle. This document references config flags **by name**; their definitions, defaults, and scope live there.
> **Companion spec — Doc 4: SLA & Fulfilment-Time Specification.** The fulfilment-time counter, the five-SLA phase model, the On-Time / At Risk / Delayed badge logic, and the multi-attempt reporting rollup (§11.3) are defined in **Doc 4** (drafted 2026-07-08; carries its own open questions). This document consumes its outputs (the counter, the badges) without redefining them.

> **Related tickets:** DES-247 (Form standards), DES-248 (Configuration Architecture), DES-251 (Order Creation form), DES-252 (Order Detail View), DES-256 (Reassignment), DES-265 (Add to Trip), DES-280 (En-route pickup engine), DES-46 (Marketplace epic)
> **Companion design spec:** Table Column Layout Specification (owns column widths, floors, truncation, responsive behaviour)
> **Audience:** implementation agent + engineers
> **Status:** Ready for build — domain logic (Parts 1–11) and orders-surface interaction (Part 12); generic component behaviour in Doc 3
> **Version:** 1.0

---

## 1. Overview

This document defines how orders are represented, created, edited, dispatched, reassigned, and closed on the Leta On Demand dispatcher platform. It owns **flows, states, validation, and the orders table**. It does not own configuration: wherever behaviour depends on an admin setting, this document names the flag and defers its definition to the Configuration Reference.

**What this document covers**

- The orders table and row anatomy (§3)
- Creating an order — the Add Order drawer (§4)
- Field configuration: Items and Payment (§5)
- Validation and microcopy (§6)
- The Order Detail View (§7)
- Editing orders — what is editable at each status (§8)
- Broadcast and manual-dispatch visibility (§9)
- Updating and reassigning — status transitions, Change Driver, Add to Trip (§10)
- Order disruption — Cancel, Reschedule, Return (§11)

**What this document does not cover**

- Admin/configuration surfaces and toggle definitions → Configuration Reference (Doc 2)
- Column widths, floors, truncation, responsive rules → Table Column Layout Specification
- Driver App screens → referenced only where an order action produces a driver-side effect

---

## 2. Core Principles & Glossary

### 2.1 Principles the build must hold to

- **Config-driven behaviour is referenced, never redefined.** When a field, action, or state depends on a setting, this document names the flag (e.g. `items.enabled`). The flag's meaning and default live in the Configuration Reference.
- **Physical custody governs what can move.** An order still at its origin can be reassigned freely. Once a driver is carrying it, changing its destination requires a handoff protocol, and past a point it is blocked.
- **Intentional friction on high-impact, low-frequency actions.** Reassignment, cancellation, and reschedule capture a structured reason and, where a driver is affected, confirm the consequence by naming the affected party.
- **Audit-trail integrity over convenience.** Activity entries are not deleted. Comments carry a 5-minute edit window and nothing more.
- **Consequence-first copy.** Confirmation copy names the affected customer or driver, not an abstract order ID.
- **Shared vocabulary across apps.** Status and action names match between the dispatcher platform and the Driver App so the two sides can troubleshoot in the same language.

### 2.2 Actors

| Actor | Role in Order Management |
|---|---|
| Dispatcher | Creates, edits, dispatches, reassigns, and closes orders |
| Admin | Sets configuration (Doc 2); has the Administration section |
| Driver | Receives, carries, delivers; may initiate returns where enabled |
| Recipient | Receives the delivery; sees a tracking link (out of scope here) |

### 2.3 Status glossary

Statuses fall into three filter groups. Within a group, sub-statuses are individually filterable.

| Status | Group | Meaning |
|---|---|---|
| **Scheduled** | Unassigned | Parked against a future delivery window; not yet in the active dispatch queue |
| **Pending** | Unassigned | In the active dispatch queue, awaiting assignment |
| **Broadcasted** | Unassigned | Offered to a pool of drivers for fulfilment, awaiting acceptance. A broadcast can carry several orders as one **batch**; a single driver accepts the whole batch (auto-broadcast / marketplace) |
| **Assigned** | Dispatched | A driver is assigned but has not yet reached the depot |
| **At Depot** | Dispatched | The driver is at the pickup depot |
| **In Transit** | Dispatched | En route to the recipient |
| **Arrived** | Dispatched | At the recipient location |
| **Delivered** | Finished | Terminal success |
| **Returning** | Dispatched | In Transit variant — the order is coming back (reverse-icon overlay on the In Transit badge) |
| **Returned** | Unassigned | Came back from a failed attempt; a **holding bay** awaiting the dispatcher's decision — re-dispatch, Add to Trip, Edit then dispatch, Reschedule, or Cancel |
| **Cancelled** | Finished | Terminal cancellation |

> **Ordering:** Scheduled precedes Pending everywhere it is listed (filters, sub-status lists, sort defaults).

> **Returned is classified Unassigned, not Finished.** It is a pseudo-terminal holding bay, not a true terminal: functionally identical to a new order awaiting dispatch, minus proof of a prior failed attempt. This lets it inherit the Unassigned table shape and action set for free, and leaves Finished as two true terminals — Delivered and Cancelled. Editing a Returned order before redispatch is a deliberate, load-bearing capability: most redelivery failures are bad-data failures (wrong address, unreachable recipient), and fixing the cause before retrying is the entire point of the holding bay — do not treat Returned as read-only.

> **Scheduled orders enter the queue automatically at T−1 hour.** When the current time is 1 hour from the set delivery date/time: if the client has **scheduled auto-broadcast** enabled (`scheduling.autoBroadcast.enabled`, Client-admin configuration), the order transitions **Scheduled → Broadcasted** (offered to nearby drivers); if not enabled, it transitions **Scheduled → Pending** for manual dispatch. A dispatcher can also dispatch a Scheduled order manually at any time before T−1h — the statuses streamline management, they don't imprison the order.

> **"Ready" states.** The set of statuses **before In Transit** — Scheduled, Pending, Broadcasted, Assigned, At Depot — is referred to collectively as **Ready** in this document: the order exists but has not yet left the depot, so it can still be moved freely. Wherever "Ready" appears as a category, it means this set.

---

## 3. Order Management Table

The orders table is the dispatcher's primary surface. Column sizing, floors, truncation, and responsive behaviour are owned by the **Table Column Layout Specification** and are not repeated here. This section defines behaviour and row content.

### 3.1 Table interaction model

- Two table types: **static** (read-only, e.g. Logs — no hover or pressed state) and **dynamic** (the orders table — the row is a target, with hover and pressed states).
- In the orders table, **clicking a row opens the Order Detail View** (§7).
- The **checkbox column is the only selection target.** Clicking the checkbox selects the row for bulk actions; it does not open the drawer.
- **Inline buttons inside a cell** (copy in the Order ID cell; change-driver and call in the Driver cell) act independently of the row and **must stop event propagation** so a mis-aimed tap never opens the drawer.

### 3.2 Row anatomy

| Cell | Content |
|---|---|
| **Checkbox** | Row selection for bulk actions |
| **Order ID** | The identifier (truncated ~18–24 chars) with inline quick actions beneath (copy, and status-relevant actions). Full value via copy / detail view |
| **Route** | Composite: **depot** and **pickup** stacked with a connecting line, plus the drop-off. This is where depot appears — there is no standalone Depot column in the orders table |
| **Driver** | Avatar + name, with inline **change-driver** and **call** buttons. The phone is a call action, not displayed text. **Present only for assigned states** |
| **Trip** | Trip identifier (short UUID). **Present only for assigned states** — an unassigned order has no trip |
| **Batch ID** | Identifier of the broadcast batch. **Present only for Broadcasted orders** — shows which orders were sent together to a driver pool as one batch |
| **Recipient** | Name + full phone (phone shown as protected text) |
| **Duration** | Order duration with its SLA. **Shown from Pending onward only** — Scheduled orders are not in the active queue, so duration/SLA do not yet apply |
| **Status** | Status badge (Returning = In Transit badge with a reverse-icon overlay) |
| **Created** | Timestamp (shown by default) |
| **Last Updated** | Timestamp (hidden by default; enabled via the column control) |
| **Actions** | Contextual actions / overflow. No visible column header; the header cell carries a screen-reader-only name |

> **Column set follows custody.** The **Driver** and **Trip** columns exist only for statuses where a driver and a trip exist (Assigned, At Depot, In Transit, Arrived, and Finished states). For **unassigned** orders — Scheduled, Pending, Broadcasted, **and Returned** — **both columns are removed** (not shown empty): a returned order's previous driver/trip no longer applies, since a retry gets a fresh assignment. See §3.4.

### 3.3 Status filtering

- Top-level filter groups: **Unassigned** (Scheduled · Pending · Broadcasted · **Returned**), **Dispatched** (Assigned · At Depot · In Transit · Arrived · Returning), **Finished** (Delivered · Cancelled — true terminals only).
- Each group expands to its sub-statuses (§2.3) for precise filtering.
- **Depot is a filter dimension, not a workspace.** A multi-depot user filters across depots via multi-select and sees orders from all selected depots at once. Depot is not a column in this table (it lives in the Route cell).

### 3.4 Table instances

Declared against the Table Column Layout Specification (which owns exact widths and column order):

- **Order Table** — dispatched & finished states (Assigned onward). Full columns, **including Driver and Trip**. Duration present. Actions column is **64px** (overflow only).
- **Unassigned Orders Table** — Scheduled, Pending, Broadcasted, **Returned**. **No Driver column and no Trip column** (neither exists yet). Route/Recipient re-weighted **60/40**. Duration present for Pending and Broadcasted; **absent for Scheduled and Returned** (Returned's SLA clock has reset — see §11.3). **Broadcasted** additionally shows a **Batch ID** column. Actions column is **154px** (Dispatch + overflow).
- **All — search / triage view.** For finding an order when its status group is unknown; opening All collapses the sub-status dropdowns and the dispatcher searches. Shows only columns meaningful for every row — **Order ID, Route, Recipient, Duration ("—" for Scheduled), Created, Status** (plus Last Updated if toggled on). **No Checkbox, Driver, Trip, Batch ID, or Actions**; every row opens the drawer for its actions.

> **Horizontal scroll.** The table's **minimum width** is its fixed columns + flexible floors + any optional column switched on. When the viewport drops below that minimum — whether the user **narrows the window** or **switches on Last Updated** — the table **scrolls horizontally**, with **Order ID pinned left and Actions pinned right** (Order ID only in the All view, which has no Actions column). Above the minimum, flexible columns absorb the space and nothing scrolls. Scroll replaces column-dropping, so no column is ever hidden — only scrolled to. This is an implementation concern for the interactive prototype, not Figma.

---

## 4. Order Creation — the Add Order Drawer

Order creation is a **single-page drawer**, not a wizard. (The wizard pattern is reserved for non-time-sensitive flows with genuine sequential dependencies — depot creation, driver creation — and is deliberately not used here, where dispatchers work under time pressure.)

### 4.1 Form surface & layout

Order creation uses a **side drawer** — the surface reserved for complex, multi-field entity forms (orders, trips, drivers). Simple configuration and confirmation tasks use centered modals instead.

**Single column vs. two columns is a response to length × grouping, not a fixed rule.** Consistency across forms lives in the primitives — field styling, labels, section headers, validation, button placement, drawer chrome — not in the column count.

- **Single column is the default**, and it is also the responsive base: a two-column form collapses to one on narrow widths, so single column is the skeleton and two columns is an enhancement.
- **Use two columns only when** the form is long enough that a single column means heavy scrolling **and** its fields fall into 2+ independent groups that need no forced reading order.
- **Add Order earns two columns** on both counts: it is long, and it splits into two independent clusters — *who / where* (left) and *what / how much* (right). A short form (e.g. Add User) stays single column; borderline forms (e.g. Add Driver) are decided on field count, not on matching Add Order.

Inside the Add Order drawer, the two panels mirror the field hierarchy — **required on the left, optional enrichment on the right**:

**Left panel — required**

- **Pickup details** — origin depot / pickup point
- **Drop-off details** — recipient name, delivery address
- **Delivery date & time** — a single date and time, chosen via the date/time picker (§4.3)
- **Delivery instructions** — free text

**Right panel — optional**

- **Payment information** — present only when `payment.enabled` (§6)
- **Items / product information** — present only when `items.enabled` (§5)

### 4.2 Configuration-aware field visibility

The drawer reads company configuration **on load** and renders only the fields relevant to that client — one component, different manifestations. A minimal-data client (e.g. Zucchini, whose orders carry only recipient name, contact, and address) sees just the required fields; a complex-scheduling client (e.g. Cake City) sees the full set. Field-level configuration is defined in the Configuration Reference (DES-248).

### 4.3 Delivery date & time

Delivery timing is a **single date and time** — not an earliest/latest window. The window model was dropped to cut the time spent creating a delivery; the dispatcher now picks one date and one time.

- The control opens a combined **date/time picker**: a month calendar on the left and a **Time of Day** list on the right at **30-minute intervals** (DES-247), with **Clear** and **Apply** actions.
- The date field also accepts direct text entry.
- Whether an order is treated as *scheduled* vs *immediate* is a separate property of the order (surfaced in the Overview tab, §7.3), not a second time field.

### 4.4 Validation & autofill

- **Inline validation triggers on blur**, per the form standards (DES-247). Field- and section-level copy is in §6.
- **Repeat-customer autofill:** when the recipient matches a known customer, saved details prefill to cut re-entry on the platform's highest-frequency task.

### 4.5 What was removed and why

- **Map preview during creation** — removed. Geocoding errors are rare enough in practice that the preview cost more attention than it saved.
- **Save Draft** — removed. There is no draft state for created orders.

### 4.6 Exit behaviour

Closing the drawer with unsaved input opens a confirmation:

> You have unsaved changes. Are you sure you want to discard them?

Two choices only — **Discard** / **Continue Editing**. There is no "save as draft" path.

---

## 5. Field Configuration — Items

The Items section appears in the drawer only when `items.enabled` is on. When on, the admin has also chosen **how** items are added — the mode.

### 5.1 Modes

| Mode | Flag value | Dispatcher experience |
|---|---|---|
| **Manual mode** | `items.mode = manual` | Dispatcher types a free-text item name. The items value is typed |
| **Product mode** | `items.mode = product` | Dispatcher selects from the managed Products list. The items value is derived and locked to the selected product |

`items.valueRequired` controls whether an items value must be entered.

### 5.2 Mode-change rule

Changing the mode **affects new orders only.** Orders already created keep the items they were saved with. This is a one-line contract for the build; it must not retro-rewrite existing orders.

### 5.3 Copy

> **Switching away from Product mode** (reassurance, at the switch point)
> Your products list stays saved — switch back anytime.

> **Product mode selected, Products list empty** (nudge that prevents stranding order creation)
> **No products yet.** Add products so dispatchers can pick from them when creating orders.
> → **Go to Products**

---

## 6. Field Configuration — Payment

The Payment section appears in the drawer only when `payment.enabled` is on. It carries the payment information fields for the order. Field definitions and any sub-toggles are owned by the Configuration Reference.

---

## 7. Order Detail View (DES-252)

Opened by clicking a dynamic row (§3.1). The detail view is the single place a dispatcher reads an order's full state, history, and dispatch reach.

### 7.1 Structure

- **Three tabs:** Overview, Activity, **Dispatch Logs**.
- **Footer-anchored contextual actions.** The available actions change by status (§10, §11) and sit in a persistent footer rather than scattered through the body.

### 7.2 Top-section summary card & map

The region above the accordion sections: a mini-map (left) and the **summary card** (right). Both are state-driven.

**Summary card anatomy:** a headline label + fulfilment-time counter + SLA badge on top; a divider; then main copy + sub copy + one trailing CTA.

- **Headline label:** "Elapsed fulfilment time" while the attempt is live (Scheduled → Arrived); "Total fulfilment time" once the attempt has concluded (Returning, Returned, Delivered, Cancelled).
- **Counter window:** starts at Pending (or at auto-broadcast for scheduled orders that skip Pending); runs to Delivered, or to Arrived for the return/cancel branch (§11.3). For 2nd/3rd drop-offs the counter **pauses** while the order waits its turn in the chain and the denominator is always the constant Expected OFT — it counts stage time, not wall-clock time. Full mechanics and badge logic: **Doc 4 — SLA & Fulfilment-Time Specification** (§1.2).
- **Timer scoping:** live countdowns/counters at second- or minute-precision render **in the open drawer only**. Order tables carry the static **Duration** column instead (absent for Scheduled and Returned) — rows never run live broadcast countdowns.

**Copy matrix (locked 2026-07-08):**

| # | State | Main copy | Sub copy | CTA | Mode |
|---|---|---|---|---|---|
| 1 | Scheduled / Pending (auto-broadcast client), >60 min to broadcast | `9 Jun 2027, 12:30 PM` (scheduled delivery date/time) | Scheduled delivery date | View Activity | Static |
| 2 | Scheduled / Pending (auto-broadcast client), ≤60 min to broadcast | `9 Jun 2027, 12:30 PM` | "{N} minutes until broadcast" (max 60; live, updates each minute, drawer-only) | View Activity | Dynamic |
| 3 | Pending (no auto-broadcast), ready | Dispatch Now | Items ready for delivery. | **Dispatch** | Static |
| 4 | Broadcasted | Order broadcast started | "{N} seconds elapsed." | **View Logs** → opens the **Dispatch Logs tab** (§7.5) | Dynamic |
| 5 | Assigned | Driver is on the way | Est delivery: 12:30 - 12:40 PM. | View Activity | Dynamic |
| 6 | At Depot | Driver is at the depot | Est delivery: 12:30 - 12:40 PM. | View Activity | Dynamic |
| 7 | In Transit | Driver is in transit | Est delivery: 12:30 - 12:40 PM. | View Activity | Static |
| 8 | Arrived | Driver has arrived | Est delivery: 12:30 - 12:40 PM. | View Activity | Dynamic |
| 9 | Returning | Driver is returning | Est drop-off: 12:30 - 12:40 PM. | View Activity | Dynamic |
| 10 | Delivered | Order delivered | Delivered at 12:50 PM. | View Activity | Static |
| 11 | Returned | Order returned | Returned at 12:50 PM. Counter resets to **0s**; prior attempt as **"Prev: {duration}"** (§11.3) | View Activity | Static |
| 12 | Cancelled | Order cancelled | Cancelled at 12:50 PM. | View Activity | Static |

- Row 2 applies to **any pre-broadcast order on an auto-broadcast client** — Scheduled, or an immediate-creation Pending order whose delivery time is still >1h out (it broadcasts at T−1h like a scheduled one).
- **Auto-broadcast assignment banner:** on first entry to Assigned via auto-broadcast, a **dismissible highlight notification banner** shows above the map: "This order was automatically assigned to {Driver Name}."
- Delivered main copy is **"Order delivered"** (locked) — earlier mockups showing "Order is delivered" are superseded.

**Map — the route's biography.** The mini-map renders the current truth of the route lifecycle:

| State | Map content |
|---|---|
| Pre-dispatch (Scheduled, Pending, Broadcasted) | Depot + drop-off pins only — no route exists until dispatch creates one |
| Assigned / At Depot / In Transit / Arrived | Planned route line + **live driver marker** tracking his position against it |
| Returning | Route + driver's live **location and orientation/heading** (is he actually heading back?); drop-off icon switches to **delivery failed** |
| Delivered | LETA's suggested route **and the path the driver actually took**, in the secondary/default-border color variable |
| Returned | Suggested route + the driver's trail **up to the point the return was triggered**; failed drop-off icon |
| Cancelled | Route shown **only if** the order was dispatched before cancellation (cancelled pre-pickup); no route if never dispatched. (An actual-path overlay is structurally impossible here — cancellation ends at pickup; §11.1) |

**Expanded map mode:** the expand control (map top-right) opens a fullscreen dimmed overlay — available in **every status**. Expanded mode adds an **info card affixed to the depot** and another **affixed to the drop-off**. For undispatched orders, a notification banner with a **Dispatch** CTA at its tail nudges the route into existence:

> Dispatch this order to generate its delivery route

### 7.3 Overview tab

The order's fields and current state. Editability is governed by the edit-behaviour matrix (§8). **What renders here is conditional** — it is not a fixed field list. Every status has detail-view variants driven by:

1. **Creation source** — created **manually** vs via **Storefront / API integration**. The Figma wireframes are annotated per scenario; the agent must follow the annotation for each variant.
2. **Scheduled origin** — whether the order was originally created as a **scheduled** order. This matters because of the T−1h automatic transition (§2.3): a Scheduled-origin order arrives at Broadcasted or Pending carrying its scheduling context, and its detail view reflects that provenance.
3. **Client configuration:**
   - **Pickup confirmation** on/off — when on, the Pickup PIN and Proof of Pickup elements appear.
   - **Proof of delivery** on/off — recipient signature and/or proof-of-delivery photo, per what the client enabled.
   - **Auto-broadcast** on/off for the client instance — auto-broadcasted orders carry the broadcast icon in their delivery badge (e.g. the Assigned badge with broadcast icon), and their Dispatch Logs content differs (§7.5).
4. **Order status** — the current lifecycle stage (§2.3).

> **AGENT:** the wireframes covering each status's detail-view variants live in the LETA Playground Figma file with per-scenario annotations. Prompt Ifeanyi for the relevant node links before building any detail-view variant — do not improvise a variant that isn't annotated.

> Visual reference (Figma): [Overview tab](https://www.figma.com/design/xVa4kZAArZWWvl6QsfID8S/LETA-Playground?node-id=320-99590)

### 7.4 Activity tab

A chronological record of everything that happened to the order.

- **Filters:** All, Events, Comments.
- **Event provenance markers:** every event is tagged **System**, **Dispatcher**, or **Driver** so the source of each change is legible.
- **Comments:** editable for a 5-minute window, then locked. **No deletion** — the audit trail is not mutable.

> Comment input helper text:
> Comments are editable for 5 minutes.

> Visual reference (Figma): [Activity tab](https://www.figma.com/design/xVa4kZAArZWWvl6QsfID8S/LETA-Playground?node-id=383-103970)

### 7.5 Dispatch Logs tab

Shows how the order reached (or is reaching) drivers. Content differs by company type and dispatch path:

- **SaaS / managed-fleet companies:** specific driver-level detail.
- **Marketplace companies:** reach and response rate.
- **Not yet broadcast** (unassigned, no broadcast sent): empty state.
- **Manually dispatched orders:** a centred information card explaining the order was dispatched manually (no broadcast occurred).

> Visual reference (Figma): [Dispatch Logs tab](https://www.figma.com/design/xVa4kZAArZWWvl6QsfID8S/LETA-Playground?node-id=384-106688). This tab was specced in depth in the dashboard redesign work.

---

## 8. Editing Orders — Edit-Behaviour Matrix

What a dispatcher can change depends on physical custody. Editing does **not** trigger reassignment; it edits the existing order in place and, where a driver already holds it, notifies them.

| Status | Editable fields | On save |
|---|---|---|
| **Scheduled, Pending, Broadcasted** | All fields, freely | Saved silently — no driver holds the order yet |
| **Assigned, At Depot** | All fields, **including the delivery address** | Saved **and the driver is notified**. No reassignment is triggered |
| **In Transit, Arrived, and beyond** | None | Editing is blocked entirely |

> Rationale: before a driver is assigned, edits are free. While a driver holds the order at origin, edits are allowed but the driver must be told. Once the order is moving, its parameters are frozen — the recourse is a disruption action (§11), not an edit.

---

## 9. Broadcast & Manual Dispatch Visibility

- **Broadcast** is the automatic path: an order is offered to eligible drivers (SaaS managed-fleet or marketplace), producing the Broadcasted status and the Dispatch Logs tab detail in §7.5.
- **Manual dispatch** is the dispatcher-driven path: the dispatcher selects a driver directly. Manually dispatched orders show the centred information card in the Dispatch Logs tab rather than broadcast metrics.
- The manual dispatch flow is a **centred modal** with a two-step progression — **Select Driver → Preview Route** — combining a driver list with a live map and an optimised route preview. (Full manual-dispatch modal spec is tracked separately; referenced here as the origin of the manual-dispatch order state.)

---

## 10. Updating & Reassigning

Reassignment moves an order or trip to a different driver. Availability is governed by status and custody. Every reassignment captures a **reason code** that lands in the order's Activity timeline (§7.4).

### 10.1 Action availability by status

| Status | Change Driver | Add to Trip | Reschedule | Cancel | Return |
|---|:---:|:---:|:---:|:---:|:---:|
| Scheduled | — | ✓ | ✓ ² | ✓ | — |
| Pending | — | ✓ | ✓ | ✓ | — |
| Broadcasted | — | ✓ | ✓ | ✓ | — |
| Assigned | ✓ | ✓ | ✓ * | ✓ | — |
| At Depot | ✓ | ✓ | ✓ * | ✓ | — |
| In Transit | — | — | — | → Return | ✓ |
| Arrived | — | — | — | → Return | ✓ |
| Returned | — | ✓ ³ | ✓ | ✓ | — |
| Delivered / Cancelled | — | — | — | — | — |

`✓ *` = allowed, but a consequences confirmation fires because a driver already holds the order (§11.2).
`✓ ²` = for a Scheduled order, Reschedule edits its existing set time (stays Scheduled); for Pending onward it moves the order to Scheduled.
`✓ ³` = Returned has no Change Driver (there is no current driver to change) — the equivalent action is **Dispatch**, assigning a driver fresh, or **Add to Trip** onto an existing trip. Cancel here is a normal terminal transition, not a special case (§11.4).
`→ Return` = the Cancel action transforms into Return once the order has left the depot (§11.3).

### 10.2 Change Driver

- **Available for:** Assigned, At Depot only. Hidden for every other status.
- **Target driver** must be **Available**. Busy or Offline drivers are filtered out of the selection list.
- **Fleet split:** auto-broadcast companies vs managed-fleet companies handle the destination differently (auto-broadcast re-offers; managed-fleet assigns directly).
- **Multi-select:** selecting several orders routes them all to a single destination driver in one operation.
- **Trip ID persists** — the original trip keeps its ID; only the driver changes.

### 10.3 Add to Trip (DES-265)

- **Available for Ready orders, plus Returned:** Scheduled, Pending, Broadcasted, Assigned, At Depot, Returned.
- **Target trip** must be **pre-departure** (its driver has not yet left the depot). Trips whose driver is already in transit are excluded from the target list.
- **Scheduled orders are eligible by design:** adding a Scheduled order to a trip about to depart effectively un-schedules it, serving the "customer wants it now" case without a separate Reschedule step.
- **Impact preview before commit:** adding to a trip surfaces the route change and the new stop sequence with the added order's projected ETA, so the dispatcher commits with the consequence in view.
- **Reason code is optional** for Add to Trip (an additive operation); reason capture is mandatory only for removal-type reassignments.
- **Driver notification:** the receiving driver is notified of the added pickup, including its impact on distance and earnings per their compensation model.
- **En-route pickup** — adding an order to a driver **already en route** — is a **configurable extension** of Add to Trip (`dispatch.enRoutePickup.enabled`, company-level, **off by default**). The shared en-route eligibility engine is specced separately (DES-280). When enabled, in-motion trips surface as eligible targets if the dispatcher's depot lies en route, the driver has not passed it (admin-set distance threshold), and vehicle capacity allows (admin-set rule). Such targets carry an inline signifier explaining why they appear ("Shown because this driver is passing your depot"). SaaS drivers cannot decline; marketplace drivers can. SLA impact on the incumbent order silently extends. Default Add to Trip behaviour remains pre-departure only.

### 10.4 Trip-level: Reassign Trip

- **Available for pre-departure trips only** (no order on the trip has left the depot).
- The new driver picks up the trip from the depot as planned; the trip ID persists, only the driver changes.
- Once any order on the trip enters In Transit, Reassign Trip is no longer available.

### 10.5 In-motion rescue — out of scope (V1)

In-motion rescue (intercepting a stuck driver's order mid-route) is **out of scope for V1**, at both order and trip level. It is acknowledged as conceptually real but has no concrete V1 use case.

### 10.6 Acceptance criteria

- Change Driver is available only for Assigned / At Depot; hidden otherwise.
- Change Driver lists only Available drivers.
- Add to Trip is available for Scheduled, Pending, Broadcasted, Assigned, At Depot; the target list excludes trips whose driver is in transit (unless en-route pickup is enabled).
- Multi-select routes all selected orders to a single destination driver or target trip.
- Trip ID persists across Change Driver / Add to Trip / Reassign Trip.
- A dispatcher can reassign a single order in **under 60 seconds** including reason-code capture (baseline 2m 21s).
- Reason codes are visible in the order Activity timeline and the trip activity log.

---

## 11. Order Disruption — Cancel, Reschedule, Return

These three actions form one state machine. The dividing line is **transit**: before the order leaves the depot it can be **Cancelled**; once it has left, the same intent becomes a **Return**. **Reschedule** is the customer-initiated "not now, later" path.

### 11.1 Cancel (Ready states)

- **Available while the order is in a Ready state** (up to and including At Depot). Hidden / disabled from In Transit onward.
- The button label and confirmation copy **adapt to the lifecycle stage**.
- **Reason-code capture** at terminal cancellation: a dropdown — **damaged goods, customer refund, perishable expiry, customer request, other** — plus an optional free-text note. `other` requires the note. Reason codes feed operations and finance reporting.
- Once the order leaves the depot, this action becomes **Return** (§11.3).

### 11.2 Reschedule (customer-initiated "later")

- **Triggerable from:** Pending, Broadcasted, Assigned, At Depot, and Returned.
- The order **lands in Scheduled** and re-enters the dispatch queue at the requested time. Date/time picker uses the 30-minute interval standard.
- **Consequences confirmation** when rescheduling an order a driver already holds (Assigned or At Depot). The action is **not blocked**; the consequence is made visible:

> This order is currently assigned to **[Driver Name]**. Rescheduling will remove this order from their trip and notify them. Proceed?

- **Reschedule semantics by origin:** from a **Scheduled** order, Reschedule edits its existing set time and the order stays Scheduled; from **Pending / Broadcasted / Assigned / At Depot / Returned**, it moves the order to Scheduled. (§10.1 corrected — Reschedule *is* available for Scheduled.)
- **Manual revert to Pending is exposed via the Update Status modal** (§12.6), not as a standalone action. It is one of the manual status overrides, not a distinct control.
- **Manual revert to Scheduled is intentionally not exposed** — Reschedule is the purpose-built path to Scheduled.

### 11.3 Return (post-transit) → Returned (Unassigned holding bay)

- **Triggering a return:** available for In Transit and Arrived. Triggerable from the **dispatch platform (always)** and the **Driver App (where `returns.driverInitiated.enabled`)**.
- **Returning** status: the In Transit badge with a reverse-icon overlay, distinguishable at a glance.
- **Returned is classified Unassigned** (§2.3) — not a true terminal. A returned order is functionally a fresh order awaiting redispatch, carrying the history of its failed attempt. Its detail view and table row use the Unassigned shape (§3.2, §3.4): no Driver, Trip, Duration, or Batch ID columns; SLA and driver/trip fields reset.
- **Returned order detail view — full action set** (§10.1, §12.5): **Dispatch** (assign a fresh driver) · **Add to Trip** (§10.3) · **Edit Order** · **Reschedule** (→ Scheduled, for a later re-attempt) · **Cancel** (terminal, with reason-code capture) · overflow (Update Status, Add Comment). Editing before redispatch is deliberate and load-bearing: most redelivery failures are bad-data failures (wrong address, unreachable recipient), and fixing the cause before retrying is the entire point of the holding bay.
- **SLA card on return:** the fulfilment-time counter resets to **0s**, with the prior attempt shown alongside as **"Prev: {duration}"** rather than silently discarded. Scope: **the card shows the immediately-previous attempt only** — if an order returns more than once, earlier attempts are not chained on the card. The full attempt history lives in the Activity tab, surfaced via an inline banner ("Check the Activity tab for more information on the last delivery attempt").
- **More Information section on return:** Dispatched/Dispatched By/Delivered/Delivered By reset to reflect the fresh, undispatched reality; Created/Created By persist (the order's origin doesn't change).
- **Return compensation** is set by a rate-card configuration: **No Compensation**, **Fixed Amount**, or **Percentage of Initial Payout** (`returns.compensation.model`). Compensation is reflected in the driver's earnings without requiring a re-drop record.
- The driver is notified within 5 seconds when a return is triggered while they are en route.
- **SLA reporting rollup — TBD, deferred to the SLA / Fulfilment-Time spec.** Ruled: when a returned order eventually delivers, client-facing SLA reporting counts it as **one rolled-up outcome**, not a breach-plus-success pair. The mechanics (how the rollup is computed, how it's labelled in reports) are specified in Doc 4 (SLA & Fulfilment-Time Specification).

### 11.4 Acceptance criteria

- Cancel is hidden / disabled for In Transit and beyond.
- A dispatcher cancels a Ready-state order in **under 30 seconds** including reason-code capture.
- A dispatcher reschedules an order in **under 45 seconds** including the consequences confirmation where applicable.
- Rescheduled orders reliably land in Scheduled and re-enter the queue at the new time; SLA tracking does not reset improperly.
- The driver is notified within 5 seconds of a reschedule or return that affects their trip.
- Reason codes are stored, visible in the Activity timeline, and exportable in operations reporting.
- The Returning visual is distinguishable from standard In Transit at a glance.

### 11.5 Out of scope (V1)

- Bulk cancellation or bulk reschedule (single-order only in V1).
- Customer-facing self-serve reschedule via the tracking link.
- Automatic reschedule suggestions from customer history.
- In-motion rescue (§10.5).
- Distance-based return compensation; photo proof of return.

---

## 12. Table Interaction Layer

Generic component behaviour (dropdown anchoring, loading, empty states, toasts, pagination mechanics, pickers, keyboard) is defined once in **Interaction & Component Patterns** (Doc 3). This section defines only what is specific to the orders surface.

### 12.1 Filter model

Four always-present dimensions plus attribute filters, combined with **AND logic — no exceptions**. Filters always apply; search never suspends or overrides them. When a combination yields nothing, the no-matching-results empty state guides recovery (12.6).

| Dimension | Control | Notes |
|---|---|---|
| Status | Pills (Unassigned · Dispatched · Finished · All) + per-pill sub-status picker with live counts | All collapses the sub-status dropdowns (§3.4) |
| Date | `Created: <preset>` pill → date-range picker (Doc 3 §7) | **Default: Created — Last 7 Days** |
| Search | Search box | Matches **Order ID + Recipient** only; ~300ms debounce |
| Attribute filters | Filter dropdown | See variant rule below |

**Attribute-filter availability derives from data availability, not column visibility.** Hiding a column never removes its filter. Candidate dimensions: **Depot** (only when the user manages >1 depot), **Driver** (only on tables whose data has drivers), **Recipient** (always), **Created By** (when the data carries it — ruled in the Table spec: low-weight flexible Primary, optional on all Order-family instances).

**Variant rule:** 2+ available dimensions → **Filter Group** variant (multi-dimension narrowing); exactly 1 → **Basic Filter Search** variant (single searchable list). Example: multi-depot user on a Dispatched table with Created By data → Filter Group over depot · driver · recipient · created-by. Single-depot user on an Unassigned table → Basic Filter Search over Recipient.

**Persistence:** filters, sort, and search persist across status-pill switches until manually cleared. A filter whose dimension is absent from the current table's data still applies and yields the empty state — it is never silently dropped. Row **selection** persists within a status pill and clears on pill switch.

**Active-filter signifier:** whenever any attribute filter is applied, the **data control section** (the design-system component housing search, date filter, table filter, and sort) switches to its **badge variant** — a badge beside the filter button indicating active filters. This variant already exists in the design system; the agent should prompt for its reference rather than inventing one.

### 12.2 Sort

- **Default: Created — Newest to Oldest.** Descending is always the default direction platform-wide: Newest→Oldest for dates, High→Low for metrics, Z→A for text.
- Sort options derive from the **visible** time/metric columns: Created (always), Duration (where present), Last Updated (when toggled on). Each offers both directions.
- Sorting resets pagination to page 1; sort choice persists per 12.1.

### 12.3 Pagination

Per Doc 3 §6. Default 10 rows (per mockups); "Showing X of Y"; any change to filters, search, sort, or pill resets to page 1.

### 12.4 Column control

Contains the optional columns for the current instance as stay-open checkboxes (Doc 3 §1.3). Currently: **Last Updated** and **Created By** (all Order-family instances, per the Table spec — Created By splices before Status and renders the User cell). Toggling a column on inserts it at its declared position and, if the table's minimum width now exceeds the viewport, flips the table into horizontal scroll with Order ID pinned left and Actions pinned right (Table spec §4.3).

### 12.5 Per-status table overflow (⋯) menus — VERIFIED against drawer set (2026-07-06)

Transcribed from the uploaded per-status wireframes. Groups are divider-separated top→bottom.

| Status | Menu contents (top → bottom, `|` = divider) |
|---|---|
| Scheduled | View Logs · Edit Order · Add To Trip · Update Status `|` Reschedule Order · Add Comment `|` **Cancel Order** |
| Pending | View Logs · Edit Order · Add To Trip · Update Status `|` Reschedule Order · Add Comment `|` **Cancel Order** |
| Broadcasted | View Logs · Edit Order · Add To Trip · Update Status `|` Reschedule Order · Add Comment `|` **Cancel Order** |
| Assigned / At Depot | View Logs · Edit Order · Add To Trip · Change Driver · Update Status `|` Reschedule Order · Add Comment `|` **Cancel Order** |
| In Transit / Arrived | View Logs · Update Status `|` Add Comment `|` **Return Order** |
| Returning | View Logs `|` Add Comment |
| Returned | *(same as Scheduled)* View Logs · Edit Order · Add To Trip · Update Status `|` Reschedule Order · Add Comment `|` **Cancel Order** |
| Delivered | *no ⋯ menu — single **View Logs** button (126px)* |
| Cancelled | *no ⋯ menu — single **View Logs** button (126px)* |

**Resolved (2026-07-07):** Scheduled, Pending, and Broadcasted share one 7-item table overflow menu (verified). Returned uses the same menu. **Update Status carries no chevron** — it opens a modal (§12.6), not a flyout submenu.

Inline row buttons per the Table spec: Unassigned rows carry **Dispatch** beside ⋯ (154px); dispatched rows carry ⋯ only (64px); Delivered and Cancelled rows carry the single **View Logs** button (126px).

### 12.6 Update Status modal — DOCUMENTED, SAFETY QUESTIONS OPEN

Reached via the **Update Status** item in the overflow menu. A manual status override letting a dispatcher force a terminal or queue state. Wireframe + annotations: node `1239:107822` — **agent: read the frame directly.**

Options are gated by current status. **Mark as Cancelled has been removed** — Cancel Order (§11.1) owns cancellation, with its reason codes and consequence-first copy.

| Current status | Offered options |
|---|---|
| Pending | Mark as Delivered |
| Scheduled, Broadcasted, Returned, Assigned, At Depot, In Transit, Arrived | Mark as Pending · Mark as Delivered |
| Delivered, Cancelled, Returning | *(no Update Status)* |

**Why Mark as Delivered deliberately bypasses proof of delivery — do not "fix" this.** In the operating context, drivers frequently reach the recipient's doorstep without enough mobile data to complete the in-app delivery confirmation. They call the dispatcher over the cellular network to confirm the drop, and the dispatcher marks it delivered on their behalf. This connectivity workaround is a core client requirement, not an oversight. **No reason capture in V1.** Accountability is preserved without added friction by the Activity log's existing provenance markers (§7.4): a manual status change records automatically as a **Dispatcher** event, so a forced Delivered is always distinguishable from a driver-completed one in the log.

Minor UX note: Pending yields a single option (Mark as Delivered) — confirm whether that stays a modal or collapses to a direct action.

### 12.7 Order Detail Drawer — footer actions

The drawer footer is a **two-part** surface, and both parts vary by status:

1. **Primary action button(s)** — the most common next action(s) for that status, shown as buttons in the footer.
2. **Footer overflow (⋯) menu** — secondary actions, opened from a menu button. This parallels the *table* overflow menu (12.5) but its contents may differ; it is verified separately.

Verified from the uploaded drawer set (2026-07-06). Primary buttons read left→right; Cancel/Return sit at the far left in red.

| Status | Primary footer buttons | Footer overflow (⋯) |
|---|---|---|
| Scheduled | **Cancel Order** · Add To Trip · Edit Order · Dispatch · ⋯ | Update Status · Reschedule Order · Add Comment |
| Pending | **Cancel Order** · Add To Trip · Edit Order · Dispatch · ⋯ | Update Status · Reschedule Order · Add Comment |
| Broadcasted | **Cancel Order** · Add To Trip · Edit Order · Dispatch · ⋯ | *(not supplied — assume same as Scheduled; confirm)* |
| Assigned / At Depot | **Cancel Order** · Add To Trip · Change Driver · Edit Order · ⋯ | Update Status · Reschedule Order · Add Comment |
| In Transit / Arrived | **Return Order** · Update Status · ⋯ | Add Comment *(single item)* |
| Returning | Add Comment *(single button, no ⋯)* | — |
| Returned | *(same footer as Scheduled)* **Cancel Order** · Add To Trip · Edit Order · Dispatch · ⋯ | *(same as Scheduled)* Update Status · Reschedule Order · Add Comment |
| Delivered | *no footer* | — |
| Cancelled | *no footer* | — |

**Resolved (2026-07-07):** **Delivered and Cancelled have no footer** — the drawer ends without an action bar; the table Actions cell is a single View Logs button. **Returned is classified in the Unassigned group** — a decision/holding state, not a true terminal (§2.3, §11.3). It keeps its full action footer by design: Dispatch · Add To Trip · Edit Order · Cancel, plus overflow — letting the dispatcher fix and retry, or cancel outright.

> **AGENT:** the drawer footer's overflow (⋯) and the *table* row overflow (12.5) are different menus for the same status and their contents differ — build each from its own source, do not assume parity.

### 12.8 Empty, loading, and error states

Patterns per Doc 3 §§2–3. Orders-surface copy:

- **No matching results** (search/filters/date too narrow, including orphaned attribute filters): main "No matching results", sub "Try adjusting your filters and date". No action button.
- **Empty status table** (no orders in this status): copy per wireframe. *(AGENT: prompt Ifeanyi for the wireframe link before building.)*
- **Load error:** textual pattern (Doc 3 §3.2) until designed.
- **Loading:** Doc 3 §2, centered in the table body.

### 12.9 Bulk actions

Checking rows raises the bulk toolbar with the "N selected" combobox (stay-open list of selected Order IDs; unchecking removes; ~4.5 rows visible with the 5th cut as the scroll affordance). Bulk operations follow §10.2's multi-select rule — all selected orders route to a single destination — and are limited to actions valid for **every** selected row's status. Selection scope per 12.1.

---

## Appendix A — Referenced Configuration Flags

Defined in the Configuration Reference (Doc 2). Named here for cross-reference only.

| Flag | Gates |
|---|---|
| `items.enabled` | Whether the Items section appears in the drawer |
| `items.mode` | `manual` or `product` |
| `items.valueRequired` | Whether an items value is mandatory |
| `payment.enabled` | Whether the Payment section appears |
| `dispatch.enRoutePickup.enabled` | En-route pickup extension of Add to Trip (company-level, off by default) |
| `scheduling.autoBroadcast.enabled` | Whether Scheduled orders auto-transition to Broadcasted at T−1h (else → Pending). **Client-level** (scope tiers are Client → Depot only — no Company tier). **To be defined in Doc 2** |
| `returns.driverInitiated.enabled` | Whether drivers can start a return from the Driver App |
| `returns.compensation.model` | `none` / `fixed` / `percentage` |

## Appendix B — Open Items

- Manual-dispatch modal and the Configuration Reference (Doc 2) are tracked as separate specs.
- **Jira sync pending:** DES-251 acceptance criteria still describe the old earliest/latest delivery window and must be updated to the single date + time picker (§4.3). DES-265 (Add to Trip) could not be read during this pass — fold in any additional detail once Jira access is granted.

**Resolved this revision:** the Ready-states naming (§2.3, was "pre-transit"); Broadcasted edit behaviour confirmed identical to Pending (§8); the detail tab is named Dispatch Logs, not Broadcast (§7.5).

## Appendix C — Revision History

| Version | Date | Changes |
|---|---|---|
| 1.0 | Jul 2026 | Initial specification — sections 1–11 consolidated from DES-248/252/256/280 and prior design decisions |
| 1.1 | Jul 2026 | "Finished" group name (was Completed); "Ready" states (was pre-transit); single date + time delivery picker (was earliest/latest window); Batch ID column; column-count drawer rule; Dispatch Logs tab (was Broadcast) with conditional Overview logic; Add to Trip corrected to DES-265 with impact-preview and driver-consent detail |
| 1.2 | Jul 2026 | Per-instance Actions width (64px overflow-only vs 154px Dispatch+overflow); new **All** search/triage instance (Order ID, Route, Recipient, Duration, Created, Status, +Last Updated; no Checkbox/Driver/Trip/Batch/Actions); unified horizontal-scroll rule keyed to minimum table width, pinning Order ID + Actions, superseding column-dropping |
| 1.3 | Jul 2026 | New Part 12 — Table Interaction Layer: AND-only filter model (data-availability filters, Filter Group vs Basic Filter Search variants, persistence rules), Created: Last 7 Days default, Order ID + Recipient search scope, default sort Created-newest, pagination, column control, per-status overflow menus (for review), empty/loading/error states, bulk actions. Companion Doc 3 (Interaction & Component Patterns) created |
| 2.3 | Jul 2026 | SLA model corrected per design walkthrough: Doc 4 v1.1 — constant Expected OFT with paused clocks replaces chain-adjusted totals; §7.2 counter bullet updated (pauses during chain wait, counts stage time not wall clock) |
| 2.2 | Jul 2026 | At Depot given its own summary-card copy ("Driver is at the depot") replacing the inherited Assigned line; Doc 4 promoted to v1.0 build-ready — chain-adjusted per-order totals with counter-denominator rule, At-Risk cadence engineering-owned, order-level badge granularity |
| 2.1 | Jul 2026 | §7.2 renamed **summary card** and rebuilt: locked 12-row copy matrix (incl. dynamic pre-broadcast countdown ≤60 min, drawer-scoped timers), Elapsed-vs-Total headline rule, map-state "route biography" table (planned vs actual path on Delivered, trail-to-failure on Returned, heading on Returning, conditional route on Cancelled), expanded-map mode (depot/drop-off info cards + dispatch-nudge banner). **Doc 4 — SLA & Fulfilment-Time Specification** drafted (five-SLA two-phase model, chaining, badge precedence) closing the standing TBD; three open questions logged there |
| 2.0 | Jul 2026 | New §7.2 — Top-section status card, an 11-state table (copy, timer state, live-countdown, SLA-badge reuse) covering every status from Scheduled through terminal. Map expand-to-fullscreen confirmed available from Scheduled onward. Pending/Dispatch-Now escalation ruled to reuse the platform SLA badge system rather than a separate escalation model. Subsequent §7 subsections renumbered (Overview→7.3, Activity→7.4, Dispatch Logs→7.5) with all cross-references corrected |
| 1.9 | Jul 2026 | **Returned reclassified from Finished to Unassigned** (pseudo-terminal holding bay, not a true terminal) — updated across §2.3 status glossary, §3.3 filter groups, §3.4 table instances, §10.1 action matrix (gains Add to Trip; Change Driver replaced by Dispatch), §11.3 (full action set, SLA-card reset with Prev-attempt-only scope, More Info reset, rollup ruled as single outcome — mechanics deferred to forthcoming SLA/Fulfilment-Time spec). Finished now = Delivered + Cancelled only. Fixed duplicate §10.3 header. SLA/Fulfilment-Time spec added as standing TBD companion doc |
| 1.8 | Jul 2026 | Drawer set (all 11 statuses) reviewed: §12.5 table-overflow and §12.9 drawer-footer menus transcribed from wireframes and verified; flagged four discrepancies (Update Status chevron vs modal, Broadcasted short table menu, missing Pending table menu, terminal-state footers on Cancelled/Returned). Scope tiers confirmed Client → Depot (no Company tier). New sections queued: SLA / fulfilment-time system and the Order Detail top-section summary card |
| 1.7 | Jul 2026 | Update Status finalised — Mark as Cancelled removed (Cancel Order owns cancellation); Mark-as-Delivered POD bypass confirmed intentional (low-connectivity delivery-confirmation workaround, no reason capture, accountability via Activity-log Dispatcher provenance); Created By automated-source copy locked to the Auto-created matrix in the Table spec; §12.9 drawer-footer scaffold added |
| 1.6 | Jul 2026 | §10.1 corrected — Reschedule available for Scheduled (edits set time); §11.2 reconciled — manual revert to Pending lives in Update Status, not a standalone action; new §12.8 documents the Update Status override modal (status-gated options) with three open safety questions (POD bypass on Mark-as-Delivered, Cancelled duplicating Cancel Order, revert-to-Pending capture); Created By non-human cell copy pending selection |
| 1.5 | Jul 2026 | Content-based Control-column width scale adopted (64/126/154 per Table spec §2.1) — resolves Delivered and Cancelled Actions (single 126px View Logs button, both confirmed no-menu); Returning drawer footer = single Add Comment button; wireframe verification of table overflow menus begun via Figma MCP — Update Status item and Scheduled-Reschedule conflict logged as open questions in 12.5 |
| 1.4 | Jul 2026 | Descending as universal default sort direction; active-filter badge variant on the data control; Scheduled T−1h auto-transition (`scheduling.autoBroadcast.enabled`) in §2.3 with detail-view variant logic in §7.2; manual revert to Pending removed from V1 UI (§11.2, AC deleted); 12.5 marked provisional pending wireframe verification — Delivered has no ⋯ (single View Logs button), Returning has no drawer footer overflow; drawer footer overflow documented as a parallel surface; all Figma slots replaced with agent-prompt notes; Clear-filters recommendation struck |
