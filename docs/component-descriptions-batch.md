# Component descriptions — review batch (2026-06-03)

Drafts for 10 components. Each will be written **verbatim** to the Figma component
description (via the Desktop Bridge) and mirrored in the code (component JSDoc +
Storybook `docs.description.component`) **after you confirm/edit**. Items marked
_(inferred — confirm)_ are my best reading of the variant intent from its name; correct me
where wrong. Only **Shortcut** had an existing Figma description (improved below).

---

## 1. Modal Headers — `228:5568`
**What it is:** The top region of a modal/dialog — title, optional supporting text, and a close affordance — that anchors the modal and (optionally) hosts in-modal navigation.

**When to use:** At the top of every modal/dialog. **Not** for page-level headers (use Top Page Section) or drawers with their own chrome.

**Variants**
- **Default** — Usage: standard single-view modals (confirmations, forms, detail panels). Behavior: title + optional sub-text + close button; the body sits directly beneath.
- **With Tabs** — Usage: modals whose content is split into sections the user switches between without leaving the modal. Behavior: adds a Page Tabs Control beneath the title; the active tab swaps the modal body. _(inferred — confirm)_

---

## 2. Footer Frame — `6448:32008`
**What it is:** The bottom action region of modals, cards, and panels — houses primary/secondary actions and contextual footer content, pinned below the body.

**When to use:** Whenever a surface needs committed actions or summary at its base. **Not** for inline actions within content.

**Variants**
- **Default** — Usage: the standard primary + secondary action pair (e.g. Save / Cancel). Behavior: right-aligned buttons.
- **Validation Footer** — Usage: forms that can fail validation. Behavior: surfaces a validation/error message alongside the actions; primary may be disabled until valid. _(inferred — confirm)_
- **Data Summary** — Usage: when the footer must show a running total/count next to actions (e.g. "3 items selected", totals). Behavior: summary text on the leading edge, actions trailing. _(inferred — confirm)_
- **Tertiary Action** — Usage: when a low-priority or destructive action (e.g. "Delete", "Reset") must sit apart from the main pair. Behavior: adds a leading/plain tertiary action separated from primary/secondary. _(inferred — confirm)_
- **Preference Footer** — Usage: footers carrying a persistent preference (e.g. a "Don't show again" / toggle) with actions. Behavior: control on the leading edge + actions trailing. _(inferred — confirm)_
- **Card Footer** — Usage: compact footer for Cards (shorter height than modal footers). Behavior: condensed actions sized for card density.

---

## 3. Pagination — `7292:86007`
**What it is:** Navigation control for moving through paged data sets, in the layout that fits its host surface.

**When to use:** Below tables, lists, or comboboxes with more results than fit one view. **Not** for step-through wizards (use Page Tabs Control / Stepper) or carousels (use Carousel Pagination).

**Variants**
- **Table** — Usage: full data tables. Behavior: page-number controls with prev/next, typically paired with a rows-per-page selector and result count. _(inferred — confirm)_
- **Combobox** — Usage: compact, space-constrained contexts (inside a dropdown/combobox or toolbar). Behavior: a condensed "page X of Y" selector with prev/next. _(inferred — confirm)_
- **Stacked List** — Usage: stacked/list layouts (incl. narrow/mobile-leaning views). Behavior: simplified prev/next (and/or load-more) sized for list rows. _(inferred — confirm)_

---

## 4. Breadcrumbs — `9108:33624`
**What it is:** A horizontal trail showing the user's location in a hierarchy, with each ancestor a link back up the tree.

**When to use:** On pages nested ≥2 levels deep so users can orient and navigate up. **Not** for flat hierarchies or as primary navigation.

**Variants**
- **Nested** — Usage: in-page/section hierarchy within a product area. Behavior: shows the path within the current app section.
- **Global Client** — Usage: top-level wayfinding in the **client-facing app**. Behavior: roots the trail at the client app's home/context — the highest level a client user navigates from.
- **Global Admin** — Usage: top-level wayfinding in the **admin app**, used by an admin who has access to **multiple client instances** to switch between different "Client" profiles. Behavior: the root-level label is a **split icon button** (its trailing icon is the design system's **stepper**); clicking it opens a dropdown of client instances the admin can switch between.

---

## 5. Desktop Progress Indicator — `7353:37255`
**What it is:** A linear progress bar that communicates completion of an ongoing or measured process. (Distinct from the 14×14 **Progress Tracker** donut used in mobile badges.)

**When to use:** For determinate progress with a known percentage. **Not** for indeterminate spinners or tiny inline indicators.

**Variants (Type × Status 0/50/100%)**
- **Upload** — Usage: file/asset upload progress. Behavior: fills as bytes transfer; pairs with filename/size; 100% = complete. _(inferred — confirm)_
- **Task** — Usage: multi-step task or job completion (e.g. onboarding, processing). Behavior: fills as steps complete. _(inferred — confirm)_
- **System Process** (renamed from "Usage") — Usage: system-driven progress and background processing — e.g. "API usage: 60% of limit", "storage used", "task queue progress". Behavior: reflects a system/background process's completion against its limit or total.

---

## 6. Selection Control — `37:362`
**What it is:** A unified, labelled selection-input wrapper that renders a Checkbox, Radio Button, or Switch with consistent label, spacing, and states. Composes the existing Toggle / Checkbox / RadioButton atoms.

**When to use:** Anywhere a labelled boolean/option control is needed in forms, lists, and settings. **Not** as a bare glyph (use the underlying atoms directly only when you supply your own label).

**Variants (Variant × State)**
- **Checkbox** — Usage: multi-select / independent on-off options. States: Idle, Active (checked), Indeterminate (partial/parent of mixed children), Disabled.
- **Radio Button** — Usage: single-select within a group (mutually exclusive). States: Idle, Active (selected), Disabled. (No Indeterminate.)
- **Switch** — Usage: immediate on/off toggles for a setting (no submit needed). States: Idle (off), Active (on), Disabled.

---

## 7. Stepper — `4524:205932`
**What it is:** A numeric input with increment/decrement affordances for adjusting a value in discrete steps.

**When to use:** Bounded numeric entry where ± nudging is faster than typing (quantities, counts, durations). **Not** for unbounded numbers, ranges (use a slider), or step-through wizards.

**Variants (Type × State)**
- **Discrete** — a control for adjusting a single numeric value representing a **count of identical items**. Uses simple increment/decrement actions (+ / –) to add or remove units. Each step is uniform and independent. Best for quantities like item counts, participants, tickets, or any value where parts have no internal structure. States: Default, Hover, Focus, Disabled.
- **Segmented** — a control for adjusting a **structured numeric value composed of multiple interdependent units**. Each segment represents a bounded part of a larger value (e.g. hours, minutes, seconds, distance) with rules such as rollover and constrained ranges. Best for time, durations, and other compound values where each part has meaning within a system. States: Default, Active, Focus, Disabled.

---

## 8. Leading Input Field Element — `7111:43945`
**What it is:** An interactive adornment that sits at the **leading** edge inside an input field. Current type: a Country Selector for phone/locale inputs.

**When to use:** Inside text/phone inputs that need a leading selector or context. **Not** as a standalone control outside an input.

**Variants (Type: Country Selector × Variant × State)**
- **Single Country** — Usage: inputs locked to one country (display-only flag + dial code). Behavior: shows flag + code; non-selectable. _(inferred — confirm)_
- **Multiple Countries** — Usage: inputs where the user picks the country. Behavior: flag + code + chevron; opens a country picker. States: Idle, Hover, Pressed, Focus, Disabled.

_Note: Figma label "Mulitple Countries" is a typo — flag for rename to "Multiple Countries" alongside this work._

---

## 9. Trailing Input Field Element — `4478:344281`
**What it is:** An adornment that sits at the **trailing** edge inside an input field.

**When to use:** Inside inputs needing a trailing action or selector. **Not** standalone.

**Variants**
- **Basic** — Usage: a simple trailing affordance (e.g. clear "✕", status icon, or unit text). Behavior: presentational or single-action. _(inferred — confirm)_
- **Dropdown** — Usage: inputs that open a selector from the trailing edge (e.g. unit/currency/timezone picker). Behavior: chevron affordance that opens an overlay. _(inferred — confirm)_

---

## 10. Shortcut — `7259:81045`  _(improving existing description)_
**What it is:** A compact, contextual inline element placed at the trailing edge of dropdown menu items, command-palette rows, or list items. It surfaces the keyboard combination that triggers that action, reinforcing power-user workflows and discoverability.

**When to use:** Beside an actionable menu/command/list item that has a keyboard binding. **Not** for non-actionable text or where no shortcut exists.

**Variants**
- **Idle (Default / Active)** — Usage: the shortcut is operational and available because its parent option is interactive. Behavior: renders the key combination at full emphasis.
- **Disabled** — Usage: the parent option and its key binding are inactive. Behavior: muted styling; communicates the shortcut can't be triggered right now.
