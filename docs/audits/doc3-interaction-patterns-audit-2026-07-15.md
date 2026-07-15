# Doc 3 — Interaction & Component Patterns · Playground Conformance Audit

> **Audited:** 2026-07-15 · read-only pass (no code changed)
> **Spec:** `docs/specs/interaction-and-component-patterns.md` (Doc 3, v1.0, Jul 2026)
> **Scope:** the LETA Playground (`apps/playground`) + the `@leta/components` it composes
> **Verified against:** `Popover.tsx`, `AppShell.tsx` (`ToastRegion`), `OrdersPage.tsx`,
> `AddOrderDrawer.tsx`, `LoadingOverlay`, `Toast`, `TableContainer`, `ModalShell`, `useStore`.

## Summary

The interaction **primitives are largely correct** — Popover motion/portal/placement, the
empty-state variants, pagination reset-to-page-1, and search-ANDs-with-filters all conform.
The divergences cluster in **Toast, confirmation, search debounce, and focus management**:
**4 high-severity behavioural gaps** and several medium ones.

Legend: 🟢 conformant · 🟡 partial · 🔴 gaps

## Findings by pattern

| § | Pattern | Status | Finding |
|---|---------|--------|---------|
| **1** | Dropdown / Popover primitive | 🟡 Partial | Portal ✓, backdrop + Escape ✓, motion **exactly matches** spec (140ms in / 100ms out, `translateY(-6px) scale(0.98)`, reduced-motion) ✓, placements + viewport-clamp + flip ✓, z-index above toast/bulk-toolbar ✓. **Gaps:** (a) no **focus-return-to-trigger** on close (§1.3); (b) **single-open not enforced across components** — the AppShell user-menu, client-switcher, and the OrdersPage table overlay are independent state, so two can be open at once (within OrdersPage it is correctly single-open). |
| **2** | Loading pattern | 🟡 Partial | Centered mark + two text lines + `role="status"` ✓, min-height preserved ✓. **Gaps:** (a) **copy differs** — code defaults `"Loading..."` / `"Wait a few seconds."`; spec wants `"Loading"` / **"This will only take a moment"**; (b) **no 250ms-delay / 500ms-minimum guard** (`runLoad` shows instantly and holds ~2s) — acceptable for the mock, absent for real fetches; (c) missing `aria-live="polite"`. |
| **3** | Empty-state | 🟢 Mostly | No-results + empty-table variants ✓; both toolbars correctly stay on no-results ✓. **Gaps:** (a) copy `"…filters & date."` vs spec `"…filters and date"` (trivial); (b) **no load-error / Retry variant** (`"Couldn't load orders"` + **Retry**) — no error path exists yet. |
| **4** | Toast | 🔴 Gaps | `role="status"` ✓, stacks newest-at-bottom ✓, dismissible ✓, symmetric enter/exit motion ✓. **Gaps:** (a) **placed bottom-RIGHT; spec says bottom-LEFT**; (b) **duration hardcoded `7000ms`; spec is 6s default / 8s when carrying an action**; (c) destructive-outcome toasts stay `role="status"`, spec wants **`role="alert"`**; (d) copy names **order IDs** (`"ORD-… is now broadcasted"`) — spec wants the **affected customer/driver name**, consequence-first. |
| **5** | Confirmation | 🔴 Gap | AddOrderDrawer discard correctly uses the DS `AlertDialog` ✓. **But destructive order actions don't confirm** — row **Cancel Order** and **bulk Cancel** call `cancelOrder` immediately + toast, no modal. Spec §5 requires a centered confirmation (consequence + affected party, red primary) for cancel / reschedule / reassign. |
| **6** | Pagination | 🟡 Partial | Default page size 10 ✓, reset-to-page-1 on filter/search change ✓, DS Pagination keyboard + `aria-current` ✓. **Gap:** **rows-per-page selector is a stub** (`onRowsPerPageClick` → toast) — no 10 / 25 / 50, no per-user persistence, no re-paginate-from-1. |
| **7** | Date-range picker | 🟡 Partial | `DateTimePicker type="date-range"` in a `bottom-start` popover ✓, **presets apply immediately + popover stays open** ✓, Custom Apply closes ✓, pill label updates ✓. **Gap:** the chosen range **doesn't actually filter** the table — `filtered` ignores the date; the "Created" pill is cosmetic. |
| **8** | Search input | 🟡 Partial | Clear (✕) affordance ✓, **ANDs with all active filters** ✓, pagination label reflects filtered count ✓. **Gap:** **no ~300ms debounce** — `filtered` recomputes on every keystroke (instant on the local mock, but the debounce is unimplemented). |
| **9** | Filter components | 🟡 Partial | "Filter" opens `basic-filter-search` (Recipient) ✓ — the right shape for 1 dimension. **Gaps:** selections **don't apply** (`activeFilterCount` hardcoded `0`, no wiring); and with Recipient + Created By this should be a **Filter Group** (2+ dimensions). *(= separate checklist item: "Unassigned Basic Filter → Filter Group".)* |
| **10** | Keyboard & focus | 🔴 Gaps | Visible focus ring everywhere ✓, Popover Escape ✓. **Gaps:** (a) **drawer / modal don't trap focus** (`ModalShell` has no focus management); (b) **AddOrderDrawer has no Escape handler**; (c) **no focus-return-to-trigger** on any overlay close. |

## Severity roll-up

**High (user-facing behavioural divergence):**
- §4 Toast placement (right → left), duration (7s → 6s/8s), destructive `role="alert"`.
- §5 No confirmation dialog for destructive order Cancel (row + bulk) — fires immediately.
- §8 Search has no 300ms debounce.
- §10 No focus trap in drawer/modal; drawer has no Escape.

**Medium:**
- §1/§10 No focus-return-to-trigger on overlay close.
- §2 LoadingOverlay copy differs from spec; no 250ms/500ms guard; missing `aria-live`.
- §6 Rows-per-page selector is a stub (no sizes, no persistence).
- §7 Date-range doesn't filter (cosmetic pill).
- §9 Filter selections don't apply.

**Low / content:**
- §4 Toast copy uses order IDs, not customer/driver names.
- §3 `& → and`; no load-error / Retry state.
- §1 cross-component single-open not enforced.

## Suggested fix grouping

**Group A — pure Doc-3 pattern fixes, safe to apply now (no new surfaces):**
1. Toast → **bottom-left**, duration **6s / 8s-with-CTA**, `role="alert"` for `error` type, flip the enter-slide direction.
2. LoadingOverlay copy → `"Loading"` / `"This will only take a moment"` + `aria-live="polite"`; add the 250ms/500ms guard to `runLoad`.
3. Search → wrap `setSearch` in a **300ms debounce**.
4. Focus: **focus-return-to-trigger** in `Popover`; **Escape + focus-trap** in `ModalShell`/drawer.
5. Empty-state copy `& → and`.

**Group B — behavioural, but tied to OM Doc 1 / the Filter-Group checklist item:**
6. Confirmation dialog for Cancel/Reschedule (§5) — pairs with the OM disruption surfaces (Doc 1 §11).
7. Date-range actually filters (§7) + rows-per-page selector (§6) + filter-apply wiring (§9, = "Basic Filter → Filter Group").
8. Toast consequence-first copy — needs the customer/driver names per action (comes with the OM flows).

## Note on intentional prior choices

Toast **bottom-right** and the **~7s** duration were deliberate earlier decisions (CLAUDE.md
records "bottom-right placement owned by consumer" and "~7s"). Doc 3 (Jul 2026, v1.0) postdates
them and specifies **bottom-left / 6s–8s** — this audit treats the newer spec as authoritative,
but flags the divergence in case the earlier choice was intentional and should instead update the spec.
