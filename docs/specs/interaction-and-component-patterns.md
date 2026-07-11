# Interaction & Component Patterns

> **Leta · Design System · Dispatcher Platform (Doc 3)**
> Generic component behaviour every surface reuses. Domain-specific interaction (which filters exist on the orders table, what the overflow menus contain) lives in *Order Management — Foundations & Logic*, Part 12. This document defines **how the components behave**, once, so every table, drawer, and screen behaves the same way.
> **Audience:** implementation agent + engineers.
> **Status:** v1.0 — patterns 1–9. Figma link slots marked `[FIGMA: …]` await node URLs.

---

## 1. Dropdown / Popover primitive

All dropdowns share one primitive: a portal-based overlay. **Only one dropdown may be open at a time** — opening any dropdown closes the current one.

### 1.1 Anchoring & placement

- The panel anchors to its trigger's bounding rect and renders into `document.body` via portal (escapes container overflow clipping) at a z-index above toasts and the bulk toolbar.
- Placements:
  - `bottom-start` (below trigger, left-aligned): sub-status pickers, Sort, Filter, date picker.
  - `bottom-end` (below, right-aligned): row overflow ⋯, Import/Export, Columns control.
  - `top-start` (above, bottom-anchored): the bulk toolbar's "N selected" list — grows upward, stays glued to the toolbar.
- The panel is hidden for one frame until measured, then clamped to the viewport (8px margin) and **flips above the trigger** if it would overflow the bottom edge. Reposition on content resize (ResizeObserver).

### 1.2 Motion

- Open: 140ms fade + rise/scale (`translateY(-6px) scale(0.98)` → identity), ease-out, transform-origin at the trigger edge.
- Close: 100ms fade-out before unmount.
- `prefers-reduced-motion`: no motion; instant show/hide.

### 1.3 Dismissal

Three ways, always all three:

1. Click anywhere outside (full-viewport invisible backdrop).
2. `Escape`.
3. Selection — with two semantics:
   - **Close-on-select:** single-choice menus (row actions, sub-status pick, Import/Export).
   - **Stay-open:** multi-toggle menus (Columns control, "N selected" list) — several checkboxes per visit.

On close, **focus returns to the trigger**.

## 2. Loading pattern

Used by any surface fetching data (table body, drawer tabs, Dispatch Logs).

### 2.1 Anatomy

Vertically and horizontally centered in the loading region:

1. Animation mark (~48px), **text-free asset** — text is never baked into the animation.
2. ~12px gap.
3. Line 1: "Loading" — 14px semibold, token `text/label`.
4. ~4px gap.
5. Line 2: "This will only take a moment" — 14px regular, token `text/label-idle`.

Copy is rendered in code (themable, localisable, screen-reader accessible). The loading region keeps a min-height so layout doesn't collapse.

### 2.2 Behaviour

- **No flash:** show the loader only if the fetch exceeds ~250ms; once shown, keep it visible ≥500ms.
- Container carries `role="status"` + `aria-live="polite"`.
- `prefers-reduced-motion`: static mark, same text.

## 3. Empty-state pattern

### 3.1 Anatomy

Centered in the content region: illustration/icon → main copy (one line, plain statement) → sub copy (one line, the way out) → optional single action button.

### 3.2 Variants

| Variant | Main copy | Sub copy | Action | Reference |
|---|---|---|---|---|
| No matching results (search/filters too narrow) | No matching results | Try adjusting your filters and date | — | *(AGENT: prompt for wireframe link)* |
| Empty table (no orders in this status) | *(per wireframe)* | *(per wireframe)* | — | *(AGENT: prompt for wireframe link)* |
| Load error / failed fetch | Couldn't load orders | Check your connection and try again | **Retry** | *(no wireframe — textual spec, pattern-level)* |

The no-matching-results variant applies equally when a persisted filter lands on a table whose data lacks that dimension (e.g. a Driver filter on an Unassigned table): filters always apply, the result is empty, the empty state guides recovery.

## 4. Toast pattern

- Placement: bottom-left of the viewport, above nothing interactive; stacks upward, newest at bottom.
- Duration: **6s default** (field conditions: divided attention, older users — err longer), 8s for toasts carrying an action (e.g. Undo). Dismissible by ✕ always.
- One line, consequence-first copy (name the affected customer/driver, not the order ID).
- Toasts are for **outcomes** ("Order cancelled — Jerome Wambui will not be notified"), never for questions. Anything needing a decision is a confirmation dialog, not a toast.
- `role="status"`; destructive-outcome toasts `role="alert"`.

## 5. Confirmation pattern

For high-impact, low-frequency actions (cancel, reschedule with a driver attached, reassignment):

- Centered modal (small), never a toast, never inline.
- Title states the action; body names the consequence and the affected party ("This order is currently assigned to **[Driver Name]**. Rescheduling will remove it from their trip and notify them.").
- Buttons: secondary neutral ("Continue Editing" / "Go Back") + primary styled to the action's nature (destructive red for Cancel).
- Mandatory reason capture, where required, lives inside this dialog — not a second dialog.
- `Escape` = the safe option. Focus is trapped inside while open; returns to trigger on close.

## 6. Pagination component

- Anatomy: "Showing X of Y" (left) · page controls ‹ 1 2 3 … N › (center-right) · rows-per-page select (right).
- Default page size **10**; selector offers 10 / 25 / 50. Choice persists per user.
- Changing filters, search, sort, or status pill **resets to page 1**.
- Page size change re-paginates from page 1.
- Keyboard: page controls are buttons, tabbable, `aria-current="page"` on the active page.

## 7. Date-range picker

The design-system `DateTimePicker type="date-range"` in a `bottom-start` popover.

- Two-region card: preset list (Today · Yesterday · Last 7 Days · Last 30 Days · Custom) + dual month calendars (current + next), Monday-first.
- **Presets apply immediately** on click (no Apply button); the popover stays open until dismissed. The trigger pill label updates to `<Field>: <Preset>`.
- **Custom** expands the card: editable start/end fields (`dd/mm/yyyy`, committed on blur/Enter; invalid input reverts; reversed dates auto-swap; calendar navigates to the typed month), footer with "N days selected" + Clear + Apply. Apply (disabled until both endpoints exist) applies the range and closes the popover.
- The pill prefix is contextual per surface ("Created" on order tables; other screens name their own field). The prefix is part of the *instance*, not the component.
- Time selection, where a picker includes it, uses **30-minute intervals**.

## 8. Search input

- Debounce ~300ms after the last keystroke before querying.
- A clear (✕) affordance appears when a query is present; clearing restores the unsearched view.
- Search **ANDs with all active filters** — it never suspends or overrides them. If the combination yields nothing, the no-matching-results empty state (§3.2) guides recovery.
- While a query is active the pagination label reflects the filtered count.

## 9. Filter components

Two variants, chosen by the number of available filter dimensions (OM §12.1): **1 dimension → Basic Filter Search; 2 or more → Filter Group.** The Basic variant *is* the Filter Group's right panel without the dimension rail — one core component, so the two stay visually and behaviourally identical where they overlap.

**Shared anatomy**

- A **search box** that filters the option list within the current dimension.
- A **checkbox list** of options (multi-select).
- A **footer**: a live **result count** on the left ("30 results" → "5 results" as selections narrow), and **Reset** + **Show Results** on the right.
- Filtering is **AND across everything** and **explicit** — selections do not touch the table until **Show Results** is pressed (a heavy table should not reflow on every checkbox tick). **Reset** clears all selections.
- **No-match state** (the in-filter search yields nothing): main "No matching results", sub "All {dimension}s will be displayed here." **Show Results is disabled** in this state.

**Basic Filter Search** (1 dimension, usually Recipient): the shared anatomy over a single dimension.

**Filter Group** (2+ dimensions):

- A left **dimension rail** (e.g. Recipient · Driver · Depot); selecting one shows its options on the right.
- A dimension carrying active selections shows a **"N selected ✕"** chip in the rail, so narrowing stays legible across dimensions without opening each one.
- The result count reflects the combined AND of every dimension.

**Copy consistency:** use sentence case "No matching results" to match the table empty state (§3), and name the real dimension in the sub-line ("All recipients will be displayed here" — never a placeholder like "reviews").

## 10. Keyboard &amp; focus baseline

- `Escape` closes the topmost overlay only (dropdown → then drawer → then modal), one layer per press.
- Focus returns to the triggering element whenever an overlay closes.
- Modals and drawers trap focus while open.
- All interactive controls reachable by Tab in visual order; dropdown menus navigable by arrow keys, `Enter` selects.
- Visible focus ring on all interactive elements (token-driven, never removed).

---

## Appendix — Figma link slots

> **AGENT:** design references and assets are supplied on request, not embedded here — chat-shared links may not be accessible later. Before building any of the following, prompt Ifeanyi directly for the current wireframe link or asset: the two empty states (no-matching-results, empty status table), the loading mark (request the static SVG), the date-range picker reference, and each per-status overflow menu (table and drawer footer variants).

## Revision history

| Version | Date | Changes |
|---|---|---|
| 1.0 | Jul 2026 | Initial patterns 1–9, consolidated from playground behaviour audit + interaction questionnaire rounds 1–4 |
