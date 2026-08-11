# Test Cases — Product Category Verification

> Pipeline stage: 2 — Test Case Generator | Ticket: **TBD** (working slug: `product-category-verification`) | Epic: TBD
> Source Test Plan: [`docs/Test Plans/product-category-verification_test_plan.md`](../Test%20Plans/product-category-verification_test_plan.md) (v2.0, approved 2026-07-14 by saratprem.chebiyyam@sailssoftware.com — Gate A cleared)
> Generated: 2026-07-14

---

## 2. Test Case Summary Table

| Test Case ID | Title | Type | Priority | Automation Candidate |
|---|---|---|---|---|
| TC-01 | Selecting Phones shows only phone products | Positive / Negative | High | Yes |
| TC-02 | Selecting Laptops shows only laptop products | Positive / Negative | High | Yes |
| TC-03 | Selecting Monitors shows only monitor products | Positive / Negative | High | Yes |
| TC-04 | No stale products remain after switching from Phones to Monitors | Edge | Medium | Yes |
| TC-05 | Each category (Phones/Laptops/Monitors) independently displays only its own products | Positive | High | Yes |

---

## 3. Detailed Test Cases

### Module: Home Page — Category Sidebar & Product Grid
(Test Plan Section 6)

---

#### TC-01

| Field | Detail |
|---|---|
| Test Case ID | TC-01 |
| Req ID | RQ-01 |
| Title | Selecting Phones shows only phone products, with no laptop/monitor leakage |
| Module | Home Page — Category Sidebar & Product Grid |
| Type | Positive / Negative |
| Priority | High |
| Preconditions | User is on the Demoblaze homepage (`https://www.demoblaze.com`); no login required (Background step, anonymous visitor) |
| Test Data | Expected full phone-product list: **TBD** (not enumerated in SPEC beyond the "Samsung galaxy s6" / "Nokia lumia 1520" phone names referenced elsewhere in the feature — see Test Plan Section 13) |
| Test Steps | 1. Navigate to the Demoblaze homepage.<br>2. Click the "Phones" link in the category sidebar.<br>3. Observe the product grid. |
| Expected Result | Step 3: Only phone products are displayed in the product grid; no laptop or monitor products are visible. |
| Postconditions | None — read-only navigation state |
| Automation Candidate | Yes — `HomePage.selectCategory('Phones')` + a product-list read/assert method (new methods; page object currently has no category-related methods, see Reuse Matcher for confirmation) |
| Notes | Corresponds to the first `When`/`Then` pair of Scenario 1 ("Verify switching between all three categories..."). Watch for R2 (stale-grid race condition) per Test Plan Section 17 — use auto-retrying assertions, not a fixed wait. |

---

#### TC-02

| Field | Detail |
|---|---|
| Test Case ID | TC-02 |
| Req ID | RQ-02 |
| Title | Selecting Laptops shows only laptop products, with no phone/monitor leakage |
| Module | Home Page — Category Sidebar & Product Grid |
| Type | Positive / Negative |
| Priority | High |
| Preconditions | Continues from TC-01 within the same scenario sequence: user is on the homepage, Phones was just selected |
| Test Data | Expected full laptop-product list: **TBD** (not enumerated in SPEC — see Test Plan Section 13) |
| Test Steps | 1. From the current state (Phones selected), click the "Laptops" link in the category sidebar.<br>2. Observe the product grid. |
| Expected Result | Step 2: Only laptop products are displayed; no phone or monitor products are visible (including no leftover phone products from the prior selection). |
| Postconditions | None |
| Automation Candidate | Yes — `HomePage.selectCategory('Laptops')` + product-list assert method (reuse from TC-01) |
| Notes | Corresponds to the second `When`/`Then` pair of Scenario 1. Directly exercises the "switch between categories" requirement, not just a fresh page load. |

---

#### TC-03

| Field | Detail |
|---|---|
| Test Case ID | TC-03 |
| Req ID | RQ-03 |
| Title | Selecting Monitors shows only monitor products, with no phone/laptop leakage |
| Module | Home Page — Category Sidebar & Product Grid |
| Type | Positive / Negative |
| Priority | High |
| Preconditions | Continues from TC-02 within the same scenario sequence: Laptops was just selected |
| Test Data | Expected full monitor-product list: **TBD** (not enumerated in SPEC — see Test Plan Section 13) |
| Test Steps | 1. From the current state (Laptops selected), click the "Monitors" link in the category sidebar.<br>2. Observe the product grid. |
| Expected Result | Step 2: Only monitor products are displayed; no phone or laptop products are visible. |
| Postconditions | None |
| Automation Candidate | Yes — `HomePage.selectCategory('Monitors')` + product-list assert method (reuse from TC-01/TC-02) |
| Notes | Corresponds to the third `When`/`Then` pair of Scenario 1. TC-01 → TC-02 → TC-03 together automate as one continuous test (single Playwright `test()`), mirroring the single Gherkin scenario they came from — do not split into 3 independent tests unless explicitly requested, per "no scope invention." |

---

#### TC-04

| Field | Detail |
|---|---|
| Test Case ID | TC-04 |
| Req ID | RQ-04 |
| Title | No stale products remain after switching from Phones to Monitors |
| Module | Home Page — Category Sidebar & Product Grid |
| Type | Edge |
| Priority | Medium |
| Preconditions | User is on the Demoblaze homepage (fresh navigation, independent of TC-01–03) |
| Test Data | `Samsung galaxy s6` (must appear under Phones, must not appear under Monitors); `Nokia lumia 1520` (must not appear under Monitors) — both explicit in SPEC |
| Test Steps | 1. Navigate to the Demoblaze homepage.<br>2. Click the "Phones" link in the category sidebar.<br>3. Verify the product grid contains "Samsung galaxy s6".<br>4. Click the "Monitors" link in the category sidebar.<br>5. Verify the product grid does not contain "Samsung galaxy s6".<br>6. Verify the product grid does not contain "Nokia lumia 1520". |
| Expected Result | Step 3: "Samsung galaxy s6" is visible. Step 5: "Samsung galaxy s6" is absent. Step 6: "Nokia lumia 1520" is absent (never appeared for Monitors in the first place, confirming no cross-category leakage in addition to no staleness). |
| Postconditions | None |
| Automation Candidate | Yes — `HomePage.selectCategory()` (reuse) + a named-product visibility/absence assertion helper |
| Notes | This is the scenario most exposed to Risk R2 (stale-grid race condition, Test Plan Section 17) — the entire point of this test case is to catch that race, so the automated version must assert absence *after* the click settles via auto-retrying assertions, not immediately on click. Also exposed to R1 (public demo data drift) if "Samsung galaxy s6" or "Nokia lumia 1520" is ever removed from the live catalog. |

---

#### TC-05

| Field | Detail |
|---|---|
| Test Case ID | TC-05 |
| Req ID | RQ-05 |
| Title | Each category (Phones, Laptops, Monitors) independently displays only its own products |
| Module | Home Page — Category Sidebar & Product Grid |
| Type | Positive |
| Priority | High |
| Preconditions | User is on the Demoblaze homepage (fresh navigation per data row — Scenario Outline implies each `<category>` is its own run) |
| Test Data | Data-driven over `category` ∈ {Phones, Laptops, Monitors} (Scenario Outline Examples table). Full expected per-category product list: **TBD** (see Test Plan Section 13) |
| Test Steps | 1. Navigate to the Demoblaze homepage.<br>2. Click the `<category>` link in the category sidebar.<br>3. Observe the product grid. |
| Expected Result | Step 3: Only `<category>` products are displayed. |
| Postconditions | None |
| Automation Candidate | Yes — data-driven Playwright test parameterized over `['Phones', 'Laptops', 'Monitors']`, reusing `HomePage.selectCategory()` |
| Notes | This case is narrower than TC-01–03: the Scenario Outline only asserts "only `<category>` products displayed," it does **not** repeat the explicit "no other category visible" `Then` clause per row the way Scenario 1 does. Per "no scope invention," do not silently add the negative assertion here — if it's wanted, it's a Test Plan/SPEC gap to flag, not something to add unilaterally. Overlaps substantially with TC-01–03 in what it exercises; the Reuse Matcher (Stage 4) should evaluate whether this needs a separate automated test or can be satisfied by TC-01–03's coverage. |

---

## 4. Traceability Cross-Check

| Test Plan RTM Row (Req ID / TC ID) | Covered By | Status |
|---|---|---|
| RQ-01 / TC-01 | TC-01 above | ✅ Covered |
| RQ-02 / TC-02 | TC-02 above | ✅ Covered |
| RQ-03 / TC-03 | TC-03 above | ✅ Covered |
| RQ-04 / TC-04 | TC-04 above | ✅ Covered |
| RQ-05 / TC-05 | TC-05 above | ✅ Covered |

No gaps: all 5 RTM rows from the source Test Plan (Section 31) have a corresponding detailed test case. No test cases were added beyond the RTM.

---

## 5. Open Items / TBD Log

| Item | Detail | Blocking? |
|---|---|---|
| Ticket / Epic ID | Both TBD at Test Plan stage; this document uses the working slug `product-category-verification` for file naming only, not a real ticket number | Non-blocking for drafting; should be resolved before Gate A′-equivalent confirmation downstream |
| Full per-category product lists | Not enumerated in the SPEC for any of Phones/Laptops/Monitors beyond the two phone products named in Scenario 2 | Non-blocking — recommend deriving expected membership dynamically from the live catalog at automation time (Test Plan Section 18, R1 mitigation) rather than hard-coding |
| TC-05 vs. TC-01–03 overlap | TC-05's Scenario Outline covers narrower assertions than TC-01–03's full scenario; possible redundancy | Flag for Stage 4 (Reuse Matcher) to resolve — do not de-duplicate here, as that would alter scope not owned by this stage |
