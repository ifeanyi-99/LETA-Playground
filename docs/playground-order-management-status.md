# LETA Playground — Order Management: build status & handoff

> Living summary of the Deliveries/Orders build in `apps/playground`. Source of
> truth for specs is [`docs/specs/`](specs/README.md). Figma wireframes: LETA
> Playground file `xVa4kZAArZWWvl6QsfID8S`. Last updated 2026-07-17.

## Architecture (how it's wired)

- **Shell:** `apps/playground/src/shell/AppShell.tsx` — collapsed `SideBar` +
  `TopBar` + routed `<Outlet/>`; a top-right `ToastRegion` driven by the store.
- **State:** `apps/playground/src/store/` — zustand `useStore.ts` (orders,
  drivers, clients, toasts + mutations: `addOrder`, `updateOrder`,
  `updateOrderStatus`, `assignOrder`, `cancelOrder`, `pushToast`), `types.ts`,
  `mockData.ts` (3 client configs; a shared order pool).
- **Main screen:** `apps/playground/src/pages/OrdersPage.tsx` — the Deliveries
  table + all its overlays/flows.
- **Overlays:** portal `Popover` (`components/Popover.tsx`) with platform-wide
  single-open + shared Escape stack + focus-return; modals composed from
  `@leta/components` templates.
- **Compose, never hand-roll** — every surface is `@leta/components` instances
  (see the CLAUDE.md rule); raw markup only for layout primitives.

## Built & shipped (Orders surface)

**Table & controls**
- `TableContainer` (empty / default / no-results) + `TableDataControl` (search +
  create toolbar, filters + column-control toolbar with Refresh).
- Status filter pills (Unassigned/Dispatched/Finished/All) with per-pill
  sub-status pickers + live counts; `TopFilterSection` with the sliding
  active-filter ring.
- Search (Order ID / recipient / phone, 300ms debounce), Sort (Created /
  Duration / **Last Updated**), Filter Group (client-scoped dimensions:
  Recipient + Created By always, Depot for multi-depot clients, Driver on
  Dispatched/Finished), Columns control (Last Updated + Created By toggles),
  Created date-range pill (opens `DateTimePicker` — **cosmetic, doesn't filter yet**).
- Pagination with per-user-persisted rows-per-page (10/25/50).
- Per-Figma-instance column presets from `@leta/components` (`ORDER_TABLE_COLUMNS`,
  `…_FINISHED`, `UNASSIGNED_…`, `BROADCASTED_…`, `SCHEDULED_…`, `ALL_…`),
  `scrollX="auto"` with pinned Order ID/Actions. Duration header carries the ⓘ +
  "Total fulfilment time" tooltip on every table.
- SLA indicators (§2.3): status-badge warning/error icon + colour-coded Duration
  while counting; finished = binary within/beyond OFT. Mock deterministic values.
- Row hover tooltips (`HoverTip`): Copy ID, Created manually / via integration,
  Scheduled: {date}, Auto-broadcast, SLA icon (At Risk/Delayed), finished
  Duration (Delivery on time/delayed), Change Driver, Call.
- Trip cell (Plain button "TRP-xxx ↗" / "--"); driver cell (Swap+Call on active,
  name-only on finished, "--" when no driver); provenance icons.
- Bulk selection + `BulkActionsToolbar` (Dispatch / Add To Trip / Cancel Order /
  ⋯ overflow → Update Status + Reschedule), "N selected" combobox.
- Loading: first-load `LoadingOverlay` scrim; subsequent updates flash `Skeleton`
  rows (status switch / filter / sort / search / refresh).

**Action flows (row ⋯ + bulk)**
- **Add Order** drawer — config-aware (depots/items/payment), recipient
  autocomplete + address geocoding, item rows, exit-confirm. Submit → toast + CTA.
- **Edit Order** — the Add Order drawer in edit mode (prefilled, "Save Changes",
  address-lock banner for Assigned/At Depot, gated to editable statuses; In
  Transit+ blocked). Store `updateOrder`.
- **Cancel Order** modal — reason checkboxes + optional note (Other requires it),
  destructive confirm; row + bulk; count-led CTA.
- **Update Status** modal — status-gated OptionCards (single-select), toast names
  the target status; row + bulk.
- **Reschedule Order** modal — manual date/time field + 4 suggestion chips (base:
  order's time single / now bulk), no-op-disabled confirm, driver-held warning
  banner; row + bulk.
- **Per-status ⋯ menus (§12.5)** — `rowMenuFor(status)`: Ready+Returned = 7-item
  + Cancel; Assigned/At Depot adds Change Driver; In Transit/Arrived = View Logs·
  Update Status | Add Comment | Return Order; Returning = View Logs | Add Comment;
  Delivered/Cancelled = no menu (single View Logs).
- **CTA copy standard** "Action [Count] Orders" / singular "Action Order" across
  Cancel/Reschedule/Update; body copy pluralizes ("this order" vs "N orders").

**Doc 3 Group A (interaction patterns)** — shared overlay stack + `useEscapeLayer`
+ `useFocusTrap` in `@leta/components/Modal`; modals/drawers trap focus + return
it; toast top-right/6s-8s/role=alert-on-error; Popover single-open + focus-return;
LoadingOverlay copy; empty-state copy.

**Stubbed (toast "coming soon"), flows not built:** View Logs, Add Comment, Add
To Trip, Change Driver, Return Order, Dispatch-Logs. These anchor to surfaces below.

## Not yet built (remaining OM Doc 1)

1. **Order Detail View (§7, DES-252)** — NEXT. Clicking a row opens it; also
   triggered by the **"View Order"** button in the Add-Order success toast (its
   `cta.onClick` currently fires a "coming soon" toast — wire it here). Three tabs
   (Overview / Activity / Dispatch Logs), top summary card + SLA fulfilment-time
   counter + mini-map (`MapView`, state-driven route biography), per-status
   footer actions. **Needs wireframes per status/scenario.**
2. **Dispatch / Change Driver / Add to Trip (§10)** — incl. the manual-dispatch
   Select-Driver → Preview-Route modal. Needs wireframes.
3. **Return flow (§11.3)** — makes the "Return Order" menu item functional.
4. Loose ends: Created date-range actually filtering the table; page-level
   load-error state wiring (the `EmptyState type="error"` component exists).

## Conventions to keep

- Compose `@leta/components` only; inspect the wireframe instance tree first
  (use the `figma-wireframe-parity` skill for any new wireframe).
- Verify via DOM queries in the preview, not just screenshots (stale frames).
  Use real `mousedown`+`mouseup`+`click` for focus behaviour; do trigger+check
  in one `preview_eval` for toasts (6–8s auto-dismiss).
- After a `packages/components` edit: rebuild dist + clear
  `apps/playground/node_modules/.vite` + restart preview.
- Specs live in `docs/specs/` and are the source of truth — reconcile against
  them, don't regenerate isolated copies.

## Resume prompt for the next session

> Continue the LETA Playground. Read `docs/playground-order-management-status.md`
> in full first, and treat `docs/specs/` as the spec source of truth (Doc 1 =
> order-management-foundations-and-logic.md; the Order Detail View is §7, DES-252).
>
> We're building the **Order Detail View** next. It opens by **clicking a table
> row** (the dynamic orders table — §3.1) and also from the **"View Order"** CTA
> in the Add-Order success toast (currently `handleOrderCreated` in OrdersPage.tsx
> wires that CTA to a "coming soon" toast — repoint it at the detail view). It's
> the design-system's largest surface: 3 tabs (Overview / Activity / Dispatch
> Logs), a top summary card with the SLA fulfilment-time counter + a mini-map
> (`MapView`, the state-driven "route biography" per §7.2), and per-status
> footer contextual actions (§12.7). Its content is conditional on creation
> source, scheduled origin, client config, and status (§7.3).
>
> I'll share the detail-view wireframes per status/scenario — don't improvise a
> variant that isn't annotated (§7.3 note). Same discipline: compose
> `@leta/components` only, never hand-roll; use the `figma-wireframe-parity`
> skill; confirm ambiguous flow connections via AskUserQuestion before building;
> verify via DOM queries. Several already-built row/footer actions currently stub
> to toasts (View Logs, Add Comment, Add To Trip) and should wire into the detail
> view where appropriate.
