# Normalized Test Cases — Product Category Verification

> Pipeline stage: 3 — Test Case Normalizer | Ticket: **TBD** (working slug: `product-category-verification`) | Epic: TBD
> Source: [`docs/test_cases/product-category-verification.md`](../test_cases/product-category-verification.md) (Stage 2 output, 2026-07-14)
> Entry path: **Pipeline path** (Stage 2 → Stage 3) — no Gate A′ applies; this is not a manual-entry case.
> Generated: 2026-07-14

---

## 2. Normalization Summary

| Metric | Value |
|---|---|
| Cases in | 5 (TC-01–TC-05) |
| Cases out | 5 (TC-01–TC-05) |
| Duplicates merged | 0 |
| Cases rejected | 0 |
| Schema violations found | 2 (see below) |
| TBDs remaining | 4 (see Rejected / Open Items Log) |

**Schema violations resolved:**

1. **Type vocabulary conflict — TC-01, TC-02, TC-03.** Source Stage 2 document listed `Type: Positive / Negative` (a combined value) for each of these three cases, since each case's single scenario step bundles a positive assertion ("only category X shown") with a negative assertion ("no other category visible") in one `Then`/`And Then` pair. The fixed vocabulary permits one value per case. Normalized to **`Positive`** (the dominant assertion), with the negative sub-assertion preserved verbatim in `notes` and in the step's `expectedResult` — no test behavior was altered, only the classification field.
2. **Priority vocabulary mapping.** Source used `High` / `Medium` (Test Plan Section 31 vocabulary); normalized schema requires `P1`/`P2`/`P3`. Applied standard mapping: `High → P1`, `Medium → P2`. No case used `Low`.

---

## 3. Normalized Test Case Table

### Module: Home Page — Category Sidebar & Product Grid

| Test Case ID | Req ID | Title | Type | Priority | Automation Candidate |
|---|---|---|---|---|---|
| TC-01 | RQ-01 | Selecting Phones shows only phone products, with no laptop/monitor leakage | Positive | P1 | Yes |
| TC-02 | RQ-02 | Selecting Laptops shows only laptop products, with no phone/monitor leakage | Positive | P1 | Yes |
| TC-03 | RQ-03 | Selecting Monitors shows only monitor products, with no phone/laptop leakage | Positive | P1 | Yes |
| TC-04 | RQ-04 | No stale products remain after switching from Phones to Monitors | Edge | P2 | Yes |
| TC-05 | RQ-05 | Each category (Phones/Laptops/Monitors) independently displays only its own products | Positive | P1 | Yes |

---

## 4. Structured Export (JSON)

```json
[
  {
    "testCaseId": "TC-01",
    "reqId": "RQ-01",
    "title": "Selecting Phones shows only phone products, with no laptop/monitor leakage",
    "module": "Home Page — Category Sidebar & Product Grid",
    "type": "Positive",
    "priority": "P1",
    "preconditions": [
      "User is on the Demoblaze homepage (https://www.demoblaze.com)",
      "No login required (anonymous visitor, per feature Background)"
    ],
    "testData": [
      "TBD — full phone-product list not enumerated in SPEC (see Test Plan Section 13)"
    ],
    "steps": [
      { "step": 1, "action": "Navigate to the Demoblaze homepage.", "expectedResult": "Homepage loads successfully." },
      { "step": 2, "action": "Click the \"Phones\" link in the category sidebar.", "expectedResult": "Product grid updates." },
      { "step": 3, "action": "Observe the product grid.", "expectedResult": "Only phone products are displayed; no laptop or monitor products are visible." }
    ],
    "postconditions": "None — read-only navigation state",
    "automationCandidate": true,
    "automationMapping": "TBD — proposed HomePage.selectCategory('Phones') + a product-list read/assert method; both are new methods (HomePage has no category-related methods today) pending Stage 4 Reuse Matcher confirmation",
    "tags": ["@regression", "@high"],
    "notes": "First When/Then pair of source Scenario 1. Watch for Risk R2 (stale-grid race condition, Test Plan Section 17) — use auto-retrying assertions, not a fixed wait."
  },
  {
    "testCaseId": "TC-02",
    "reqId": "RQ-02",
    "title": "Selecting Laptops shows only laptop products, with no phone/monitor leakage",
    "module": "Home Page — Category Sidebar & Product Grid",
    "type": "Positive",
    "priority": "P1",
    "preconditions": [
      "Continues from TC-01 within the same scenario sequence: user is on the homepage, Phones was just selected"
    ],
    "testData": [
      "TBD — full laptop-product list not enumerated in SPEC (see Test Plan Section 13)"
    ],
    "steps": [
      { "step": 1, "action": "From the current state (Phones selected), click the \"Laptops\" link in the category sidebar.", "expectedResult": "Product grid updates." },
      { "step": 2, "action": "Observe the product grid.", "expectedResult": "Only laptop products are displayed; no phone or monitor products are visible, including no leftover phone products from the prior selection." }
    ],
    "postconditions": "None",
    "automationCandidate": true,
    "automationMapping": "TBD — proposed HomePage.selectCategory('Laptops'), reusing the assert method from TC-01; pending Stage 4 Reuse Matcher confirmation",
    "tags": ["@regression", "@high"],
    "notes": "Second When/Then pair of source Scenario 1. Directly exercises the category-switch requirement, not just a fresh page load."
  },
  {
    "testCaseId": "TC-03",
    "reqId": "RQ-03",
    "title": "Selecting Monitors shows only monitor products, with no phone/laptop leakage",
    "module": "Home Page — Category Sidebar & Product Grid",
    "type": "Positive",
    "priority": "P1",
    "preconditions": [
      "Continues from TC-02 within the same scenario sequence: Laptops was just selected"
    ],
    "testData": [
      "TBD — full monitor-product list not enumerated in SPEC (see Test Plan Section 13)"
    ],
    "steps": [
      { "step": 1, "action": "From the current state (Laptops selected), click the \"Monitors\" link in the category sidebar.", "expectedResult": "Product grid updates." },
      { "step": 2, "action": "Observe the product grid.", "expectedResult": "Only monitor products are displayed; no phone or laptop products are visible." }
    ],
    "postconditions": "None",
    "automationCandidate": true,
    "automationMapping": "TBD — proposed HomePage.selectCategory('Monitors'), reusing the assert method from TC-01/TC-02; pending Stage 4 Reuse Matcher confirmation",
    "tags": ["@regression", "@high"],
    "notes": "Third When/Then pair of source Scenario 1. TC-01 → TC-02 → TC-03 are one continuous scenario upstream and should automate as a single Playwright test(), not three independent tests, unless explicitly requested otherwise."
  },
  {
    "testCaseId": "TC-04",
    "reqId": "RQ-04",
    "title": "No stale products remain after switching from Phones to Monitors",
    "module": "Home Page — Category Sidebar & Product Grid",
    "type": "Edge",
    "priority": "P2",
    "preconditions": [
      "User is on the Demoblaze homepage (fresh navigation, independent of TC-01–03)"
    ],
    "testData": [
      "Samsung galaxy s6 — must appear under Phones, must not appear under Monitors",
      "Nokia lumia 1520 — must not appear under Monitors"
    ],
    "steps": [
      { "step": 1, "action": "Navigate to the Demoblaze homepage.", "expectedResult": "Homepage loads successfully." },
      { "step": 2, "action": "Click the \"Phones\" link in the category sidebar.", "expectedResult": "Product grid updates to phone products." },
      { "step": 3, "action": "Verify the product grid contains \"Samsung galaxy s6\".", "expectedResult": "\"Samsung galaxy s6\" is visible." },
      { "step": 4, "action": "Click the \"Monitors\" link in the category sidebar.", "expectedResult": "Product grid updates to monitor products." },
      { "step": 5, "action": "Verify the product grid does not contain \"Samsung galaxy s6\".", "expectedResult": "\"Samsung galaxy s6\" is absent." },
      { "step": 6, "action": "Verify the product grid does not contain \"Nokia lumia 1520\".", "expectedResult": "\"Nokia lumia 1520\" is absent." }
    ],
    "postconditions": "None",
    "automationCandidate": true,
    "automationMapping": "TBD — reuses HomePage.selectCategory() plus a named-product visibility/absence assertion helper (new); pending Stage 4 Reuse Matcher confirmation",
    "tags": ["@regression", "@medium"],
    "notes": "Most exposed to Risk R2 (stale-grid race condition) — this case exists specifically to catch that race, so absence must be asserted with auto-retrying assertions evaluated after the click settles, not immediately on click. Also exposed to Risk R1 (public demo data drift) if either named product is removed from the live catalog."
  },
  {
    "testCaseId": "TC-05",
    "reqId": "RQ-05",
    "title": "Each category (Phones/Laptops/Monitors) independently displays only its own products",
    "module": "Home Page — Category Sidebar & Product Grid",
    "type": "Positive",
    "priority": "P1",
    "preconditions": [
      "User is on the Demoblaze homepage (fresh navigation per data row — Scenario Outline runs each category independently)"
    ],
    "testData": [
      "Data-driven over category ∈ {Phones, Laptops, Monitors} (source Scenario Outline Examples table)",
      "TBD — full expected per-category product list (see Test Plan Section 13)"
    ],
    "steps": [
      { "step": 1, "action": "Navigate to the Demoblaze homepage.", "expectedResult": "Homepage loads successfully." },
      { "step": 2, "action": "Click the <category> link in the category sidebar.", "expectedResult": "Product grid updates." },
      { "step": 3, "action": "Observe the product grid.", "expectedResult": "Only <category> products are displayed." }
    ],
    "postconditions": "None",
    "automationCandidate": true,
    "automationMapping": "TBD — data-driven Playwright test parameterized over ['Phones', 'Laptops', 'Monitors'], reusing HomePage.selectCategory(); pending Stage 4 Reuse Matcher confirmation",
    "tags": ["@regression", "@high"],
    "notes": "Narrower than TC-01–03: the source Scenario Outline only asserts \"only <category> products displayed\" — it does not repeat the explicit \"no other category visible\" clause per row the way Scenario 1 does. Not merged with TC-01–03 (steps/preconditions differ: fresh navigation per row vs. sequential switching) per the no-over-merge rule. Flagged for Stage 4 to evaluate whether this needs a distinct automated test or is subsumed by TC-01–03's coverage."
  }
]
```

---

## 5. Traceability Integrity Report

| Req ID | Test Case ID | Chain Status |
|---|---|---|
| RQ-01 | TC-01 | ✅ Intact — Test Plan RTM → Stage 2 → Stage 3, unaltered |
| RQ-02 | TC-02 | ✅ Intact |
| RQ-03 | TC-03 | ✅ Intact |
| RQ-04 | TC-04 | ✅ Intact |
| RQ-05 | TC-05 | ✅ Intact |

**Note on RTM structure inherited from Stage 1:** the source Test Plan's RTM (Section 31) listed `RQ-01`/`TC-01` twice — once as a `Positive` row and once as a `Negative` row, both pointing at the same `TC-01`. Stage 2 already collapsed these into one detailed case; this stage's Type-vocabulary resolution (Summary, item 1) is a direct consequence of that same upstream structure. The chain is intact but non-standard (one `Test Case ID` satisfying two RTM row entries for the same `Req ID`) — flagged here for visibility, not treated as a break.

No missing `Req ID` values, no cases entered without traceability (this is the pipeline path, not the manual entry path — Gate A′ does not apply).

---

## 6. Rejected / Open Items Log

| Item | Detail | Disposition |
|---|---|---|
| Ticket / Epic ID | Both still TBD from Stage 1; this document keys to the working slug `product-category-verification` | Not blocking Stage 4 (read-only), but should be resolved before any code is committed |
| TC-01 test data | Full phone-product list not enumerated in SPEC | TBD — carried forward, not fabricated |
| TC-02 test data | Full laptop-product list not enumerated in SPEC | TBD — carried forward, not fabricated |
| TC-03 test data | Full monitor-product list not enumerated in SPEC | TBD — carried forward, not fabricated |
| TC-05 test data | Full per-category product list not enumerated in SPEC | TBD — carried forward, not fabricated |
| All `automationMapping` fields | Marked TBD pending Stage 4 (Reuse Matcher) confirmation against the actual codebase — this stage does not verify code, only formats the field | By design — Stage 4 is the correct owner |
| TC-05 vs. TC-01–03 overlap | Possible redundant coverage, not resolved here (would require altering scope, which this stage does not own) | Carried forward to Stage 4 for evaluation |

No cases were rejected. No duplicates were merged.
