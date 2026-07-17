# Changelog: Bulk Cancel, Bulk Reschedule & Reschedule Suggestions

> For the coding agent implementing the Figma wireframes. This resolves the contradictions flagged earlier between the wireframes (which showed bulk actions and suggestion chips) and the spec (which listed bulk actions and customer-history suggestions as out of scope). The spec has been corrected to match design intent — the wireframes were right, the written scope was stale.
> **Source of truth:** Order Management — Foundations & Logic, §§11.2, 11.2.1, 11.5 (v2.7). Jira: DES-254.

---

## 1. Bulk cancel and bulk reschedule are now in scope

**Previously:** OM §11.5 and DES-254 both listed "bulk cancellation or bulk reschedule" as out of scope for V1 — single-order only.

**Now:** Both are fully in scope, with the same rules as their single-order equivalents:

- **Mandatory confirmation.** Bulk Cancel and bulk Reschedule require the same confirmation dialog as single-order actions before firing. Instant/silent bulk action (fire immediately, toast after) is a defect, not a shortcut.
- **Bulk cancel reason code:** one reason code applies to the whole selected batch — not captured per order.
- **Bulk reschedule consequence copy:** one shared string covers both single and bulk —

  > Please note that rescheduling will unassign orders from their current drivers.

  This fires only when **at least one** selected order is driver-held (Assigned/At Depot). A selection of purely unassigned orders (Pending/Broadcasted/Scheduled) reschedules directly, no dialog.
- This copy is a **deliberate departure** from the platform's usual consequence-first, name-the-affected-party copy principle — do not "fix" it toward named-driver phrasing. Same authority call as the toast-copy ruling (shipped code wins over prescribed spec copy).

## 2. Reschedule suggestion chips (new feature)

The Reschedule modal now offers a manual date/time field **and** four quick-pick suggestion chips: **+1 hour, +4 hours, +8 hours, tomorrow (same time)**. Works identically for single-order and bulk reschedule; the modal always states the count in its heading and button ("Manually reschedule {n} orders," "Reschedule {n} Order(s)").

**This is not the same feature as the "automatic reschedule suggestions from customer history" line that remains out of scope.** That refers to data-driven recommendations from a customer's order history — not built, not in scope. These chips are simple relative-time math, nothing predictive.

### Manual field default

| Selection | Default value |
|---|---|
| Single order, already has a scheduled date/time | That order's own scheduled date/time |
| Single order, no scheduled date/time | Today, current time **rounded up to the next full hour** — e.g. 9:37 → 10:00. (9:00 stays 9:00; it's already on the hour.) |
| Multiple orders (any mix) | Today, current time rounded up to the next full hour — same rule; there's no single "original" time for a mixed batch |

### Suggestion chip base time

| Selection | Chips calculated from |
|---|---|
| Single order | **That order's own current scheduled time.** Example: order scheduled 2:00 PM → chips read 3:00 PM / 6:00 PM / 10:00 PM / tomorrow 2:00 PM |
| Multiple orders | **Right now** (system clock at the moment the modal opens) |

Both cases use the same four offsets (+1h / +4h / +8h / tomorrow-same-time); only the base time differs.

### Button state

**Ruled 2026-07-17 — simplified from an earlier "disabled until touched" draft.** "Reschedule {n} Order(s)" is disabled **only when the value on screen would be a no-op** — it matches every selected order's actual current scheduled time. It's enabled the moment the value would produce a real change. This is a single comparison (screen value vs. stored value), not an interaction-tracking flag.

| Selection | Default value | Button starts... | Why |
|---|---|---|---|
| Single order, already scheduled | The order's own scheduled time | **Disabled** | Confirming would set it to the time it's already at — a true no-op |
| Single order, unscheduled | Today, next full hour | **Enabled** | No prior scheduled time exists; confirming genuinely schedules it |
| Multiple orders (any mix) | Today, next full hour | **Enabled** | No shared "already scheduled to this" state to protect against — confirming is a real bulk action |

The earlier draft ("disabled until the admin clicks something") needed a special exception for bulk/unscheduled selections and is superseded — the no-op comparison handles every case with one rule, no exceptions.

### Toast on submit

- Bulk: **"{n} orders rescheduled"** / "Your orders have been rescheduled."
- Singular (n=1): **"1 order rescheduled"** / "Your order has been rescheduled."

## 3. Reference

- Full spec: OM doc §11.2 (consequence copy, scope), §11.2.1 (modal detail — this changelog's source), §11.5 (out-of-scope, corrected).
- Jira: DES-254, ACs 2/4/7/8 (bulk) and 9/10 (suggestions), updated 2026-07-17.
- Confirmation-dialog requirement generally: Interaction & Component Patterns (Doc 3) §5.
