# SLA & Fulfilment-Time Specification

> **Leta · Dispatcher Platform (Doc 4)**
> Defines the five-SLA phase model, the fulfilment-time counter, and the On-Time / At Risk / Delayed badge logic. Consumed by *Order Management — Foundations & Logic* (§7.2 summary card, §11.3 return reset, §12 Duration column) and stored via the *Configuration Reference* (Doc 2, TBD).
> **Status:** v1.0 — build-ready. All open questions ruled (2026-07-08); see §6.
> **Scope tiers:** Client → Depot. SLA values are client-configurable (totals differ per client — e.g. 30m in the drawer mockups, 40m in the reference diagram).

---

## 1. The model — five SLAs, two phases

The dispatcher (client admin) sets **five stage SLAs** covering every step of an order's journey. Reference values from the worked diagram in parentheses.

### Phase 1 — Dispatch & Pickup

| SLA | Stage | Window | Ref. value |
|---|---|---|---|
| **SLA 1** | Assignment | *Ready for delivery* → *Assigned to driver* (manual or auto-broadcast) | 5 min |
| **SLA 2** | Travel to depot | *Assigned* → *Arrived at depot* | 10 min |
| **SLA 3** | Pickup | *Arrived at depot* → *Pickup completed* | 5 min |

### Phase 2 — Drop-off

| SLA | Stage | Window | Ref. value |
|---|---|---|---|
| **SLA 4** | Travel to destination | *Delivery started* → *Arrived at destination* | 15 min |
| **SLA 5** | Completion | *Arrived at destination* → *Delivered / Cancelled / Return triggered* ("Fail Order" via Driver App or "Return Order" via platform) | 5 min |

**Expected Order Fulfilment Time (OFT)** = the sum of the five SLAs (reference: 40 min). This is the target for **every** order regardless of drop-off position — it is never stretched for later drop-offs. What changes for later drop-offs is when their clocks *run* (§1.2).

### 1.1 Multi-drop-off chaining (SLA 4)

For the **first** drop-off on a trip, SLA 4 counts from *Pickup completed*. For **subsequent** drop-offs, SLA 4 counts from the moment the **previous** order on the trip concluded (*Delivered / Cancelled / Return triggered*). Phase 1 SLAs run once per trip visit to the depot and apply to all orders picked up together; Phase 2 chains per drop-off. This gives the client stage-level visibility on single- and multi-drop-off trips alike.

### 1.2 Constant OFT, paused clocks (ruled 2026-07-08 — supersedes the chain-adjusted draft)

**Actual OFT = the sum of the five stage times only.** The wait between drop-offs — the span where a subsequent order already holds the In Transit *status* but its SLA 4 clock has not started (its predecessor hasn't concluded) — **does not count** toward any clock. The Expected OFT stays constant; the order's clocks pause instead.

**Consequences the implementation must honour:**

- **Status ≠ stage clock.** A 2nd/3rd drop-off is In Transit from *Pickup completed*, but its SLA 4 clock starts only when the previous order concludes (*Delivered / Cancelled / Return triggered*). Badge and counter derive from **stage clocks**, never from raw status timestamps.
- **The fulfilment counter pauses during the wait.** Order 3 in the worked example sits at 20m 00s from 12:20 to 1:00 PM, then resumes. The denominator is always the constant Expected OFT ("{elapsed} / 40m SLA") — it is never chain-stretched.
- **A paused order shows On-Time** — no clock is running, nothing can breach. At-Risk prediction resumes when its stage clock starts.

### 1.3 Worked example — three drop-offs, one trip (reference diagram)

All three orders: Ready 12:00 → Assigned 12:05 (SLA 1: 5/5) → At Depot 12:15 (SLA 2: 10/10) → Pickup complete 12:20 (SLA 3: 5/5). Cumulative 20 min each.

| Order | SLA 4 clock runs | SLA 4 actual | SLA 5 actual | Actual OFT | Outcome |
|---|---|---|---|---|---|
| 1 (1st drop-off) | 12:20 → 12:35 | 15/15 | 5/5 (delivered 12:40) | **40/40** | On-Time |
| 2 (2nd) | 12:40 → 12:58 | **18/15 — breached** | 5/5 | **43/40** | **Delayed** — badge flipped at 12:56, the moment the stage clock passed 15 min |
| 3 (3rd) | paused 12:20→1:00, then runs | 15/15 | 5/5 | **40/40** | On-Time — despite concluding ~80 wall-clock min after Ready |

> Known inconsistency in the source diagram: Order 2's delivered timestamp reads 1:00 PM, which yields a 2-min SLA 5 — but the recorded SLA 5 (5 min) and the 43-min OFT are the stated intent, implying delivery at 1:03 PM (and Order 3's window shifting accordingly). The model is unaffected; correct the diagram's timestamps.

## 2. Status ↔ stage mapping

| SLA window | Order statuses it spans |
|---|---|
| SLA 1 | Pending, Broadcasted |
| SLA 2 | Assigned |
| SLA 3 | At Depot |
| SLA 4 | In Transit |
| SLA 5 | Arrived |

The counter itself starts at **Pending** (or at auto-broadcast assignment for scheduled orders that skip Pending) and stops at **Delivered**, or at **Arrived** for the return/cancel branch. On **Returned**, the counter resets to 0s with the prior attempt preserved as "Prev: {duration}"; a returned order that eventually delivers reports as a **single rolled-up outcome**, not a breach-plus-success pair (ruled — OM §11.3).

## 3. Badge logic — On-Time / At Risk / Delayed

| Badge | Trigger | Nature |
|---|---|---|
| **Delayed** | The **current stage clock exceeds its stage SLA**, OR cumulative stage time exceeds the Expected OFT — whichever first *(ruled 2026-07-08: a single stage breach is sufficient; Order 2 flips Delayed at 12:56 with only 36 cumulative minutes)* | Hard threshold |
| **At Risk** | The platform **predicts** the current stage SLA will be missed, using contextual data — driver location, moving speed, direction, depot location, drop-off location — while nothing has actually breached yet | Predictive |
| **On-Time** | Nothing breached, nothing flagged At Risk. Paused orders (§1.2) show On-Time | Default |

**Precedence:** Delayed > At Risk > On-Time. Once anything has breached, Delayed shows regardless of how healthy the current stage looks; At Risk never appears after a breach.

Worked example (SLA 2 = 10): an Assigned order whose driver the system predicts needs >10 min to reach the depot flags **At Risk**; if the stage clock then actually passes 10 min, **Delayed**; if the prediction says he'll make it, **On-Time**.

### 3.1 Completed orders — binary, not three-state *(ruled 2026-07-09)*

The three-state model above applies only while an order is **in progress**. Once an order concludes (Delivered or Cancelled), **At Risk no longer applies** — it's a prediction about what hasn't happened yet, and a completed order has nothing left to predict. A completed order can only have **actually** met its target or **actually** missed it:

| Outcome | Trigger |
|---|---|
| **Within OFT** | Actual fulfilment time ≤ Expected OFT |
| **Beyond OFT** | Actual fulfilment time > Expected OFT |

Visual treatment differs from the in-progress state too — see Table spec §2.3.2: the Status cell drops its trailing icon entirely (nothing left to flag on identity), and the outcome instead renders as a self-contained icon + label badge inside the Duration cell.

## 4. Surfaces that consume this system

- **Summary card** (OM §7.2): counter + badge in the drawer's top section.
- **Table row — Status and Duration cells** (Table spec §2.3, ruled 2026-07-09): **in-progress** rows (§2.3.1) double the three-state signal across both cells — Status gets a trailing icon (orange warning / red error), Duration's text takes the matching color token. **Completed** rows (§2.3.2, §3.1 above) drop to a binary outcome shown once: no Status icon, and Duration becomes a self-contained icon + label badge (green check / red error circle). Only applies where Duration is present; Scheduled and Returned carry neither.
- **Dispatch Now escalation** (OM §7.2 row 3): the Pending card escalates using **these same badge thresholds and colors** — not a separate escalation system.
- **Client SLA reporting**: stage-level and total outcomes per order (mechanics TBD with Doc 2).

## 5. Configuration flags (stored in Doc 2)

| Flag | Meaning | Level |
|---|---|---|
| `sla.phase1.assignment` | SLA 1 duration | Client |
| `sla.phase1.arriveAtDepot` | SLA 2 duration | Client |
| `sla.phase1.pickup` | SLA 3 duration | Client |
| `sla.phase2.arriveAtDestination` | SLA 4 duration | Client |
| `sla.phase2.completeAtDestination` | SLA 5 duration | Client |

## 6. Rulings (2026-07-08) — formerly open questions

1. **Multi-drop-off total: constant OFT with paused clocks** — specified in §1.2 (supersedes the brief chain-adjusted draft of the same date). Wait time between drop-offs counts toward nothing; the counter pauses; the denominator is always the base Expected OFT.
2. **At Risk recompute cadence: engineering-owned.** The prediction engine's re-evaluation frequency is validated and set by engineering; this spec defines the trigger logic, not the polling rate.
3. **Badge granularity: order-level only.** Clients see one badge per order (summary card, Duration column, reporting). Per-stage outcomes are not surfaced as badges anywhere; stage events remain visible as raw entries in the Activity timeline.

## Revision history

| Version | Date | Changes |
|---|---|---|
| 1.3 | Jul 2026 | New §3.1 — completed orders (Delivered/Cancelled) ruled **binary** (Within OFT / Beyond OFT), not three-state: At Risk cannot apply retroactively. §4 updated to describe the split mechanism (in-progress doubles the signal across Status+Duration; completed drops to a single Duration-cell outcome badge) |
| 1.2 | Jul 2026 | §4 made concrete: the Status/Duration cell color-and-icon correlation is now specified as a mechanism (not just gestured at), cross-referenced to new Table spec §2.3 |
| 1.1 | Jul 2026 | **Model corrected from design walkthrough:** chain-adjusted totals replaced by **constant OFT + paused clocks** (§1.2) — wait time counts toward nothing, counter pauses, denominator always base OFT. Delayed trigger upgraded: single stage breach suffices, not only OFT breach (§3). Three-order worked example added (§1.3) with source-diagram timestamp inconsistency flagged. Paused orders ruled On-Time |
| 1.0 | Jul 2026 | All three open questions ruled (chain-adjusted draft — superseded by 1.1); At-Risk cadence engineering-owned; badge granularity order-level only |
| 0.9 | Jul 2026 | Initial draft from design review: five-SLA two-phase model, chaining rule, status mapping, badge logic with precedence, counting windows, config flags. Three open questions logged |
