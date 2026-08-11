# Test Plan — Product Category Verification

> Pipeline stage: 1 — Test Plan Generator | Ticket: **product-category-verification** | Epic: **TBD** | Generated: 2026-07-14
> This replaces the previous draft of this file (broader scope, no traceable SPEC source) with a plan generated strictly from the Gherkin feature "Product Category Verification" supplied as SPEC input.
> **File renamed 2026-07-29** from `docs/Test Plans/TestPlan_ProductCategoryNavigation.md` to `docs/Test Plans/product-category-verification_test_plan.md` (briefly moved to a flat `docs/product-category-verification_test_plan.md`, then moved back into `docs/Test Plans/` per follow-up instruction), and `Ticket / Story ID` resolved from `TBD` to `product-category-verification` below, to match the slug already used consistently by every downstream artifact (`docs/test_cases/product-category-verification.md`, `docs/normalizer/…`, `docs/reuse_map/…`) — no content beyond the ID/path changed.

---

## 1. Project Information

| Item | Details |
|---|---|
| Project Name | DemoBlaze E-Commerce Test Automation |
| Application Under Test (AUT) | DemoBlaze Product Store — `https://www.demoblaze.com` |
| Feature | Product Category Verification |
| Ticket / Story ID | product-category-verification |
| Epic | TBD |
| Test Plan Version | 2.0 |
| Prepared By | TESTpal — Test Plan Generator (Stage 1) |
| Date | 2026-07-14 |
| Test Framework | Playwright + TypeScript (Page Object Model) |
| Reviewed By | saratprem.chebiyyam@sailssoftware.com |
| Approved By | saratprem.chebiyyam@sailssoftware.com |
| Approved Date | 2026-07-14 |

> ✅ **HITL Gate A cleared** on 2026-07-14 by saratprem.chebiyyam@sailssoftware.com. Stage 2 (Test Case Generator) may proceed.

---

## 2. Requirement Summary

Source: Gherkin feature "Product Category Verification," supplied directly as the SPEC input.

```gherkin
Feature: Product Category Verification
  As a visitor to the Demoblaze website
  I want to browse products by category
  So that I can view only the products relevant to the category I select
```

A visitor on the Demoblaze homepage must be able to select the **Phones**, **Laptops**, or **Monitors** category and see the product list update to show only that category's products:

- Selecting a category displays only that category's products.
- No products from the other two categories are visible after selection.
- Switching categories in sequence (Phones → Laptops → Monitors) updates the list correctly at each step, with no leftover/stale products from a previously selected category.
- This behavior holds for each category individually (data-driven check).

---

## 3. Business Objective

- Enable visitors to view only the products relevant to the category they select (stated directly in the feature's "So that" clause).
- Broader business value (conversion impact, KPIs, revenue linkage) — **TBD**, not stated in the SPEC.

---

## 4. Scope

### 4.1 In Scope

- Category selection for **Phones**, **Laptops**, and **Monitors** from the homepage.
- Verification that only products belonging to the selected category are displayed.
- Verification that unrelated products are **not** displayed after filtering (both immediately and after switching again).
- Sequential category switching: Phones → Laptops → Monitors.
- Stale-product check: a product visible under one category (e.g., "Samsung galaxy s6" under Phones) must not remain visible after switching to a different category (Monitors), and unrelated products (e.g., "Nokia lumia 1520") must not appear either.
- Data-driven verification that each category (Phones, Laptops, Monitors) independently displays only its own products.

### 4.2 Out of Scope

Not present in the supplied Gherkin spec — excluded pending an explicit requirement, or **TBD** if intended:

- Pagination (Next/Previous) on the product grid.
- Navigation from a filtered product card to the product detail page.
- Cart, checkout, and order placement flows.
- Login/logged-in-state behavior of category filtering.
- Cross-browser and responsive/device coverage (spec does not name any).
- Accessibility (keyboard navigation) of the category sidebar.
- Backend/API-level validation of the category endpoint.

> Note: This document previously held a broader plan covering several of the above (pagination, API parity, cross-browser, login state). That content was not traceable to a supplied SPEC and has been superseded here per the anti-fabrication guardrail — this version strictly reflects the Gherkin SPEC actually provided. Restoring any of that broader scope is a decision for the reviewer at Gate A.

---

## 5. Test Objectives

- Verify each category link (Phones, Laptops, Monitors) filters the product list to that category only.
- Verify no cross-category leakage in either direction after a single selection.
- Verify category switching is correct across a full sequence (Phones → Laptops → Monitors).
- Verify no stale products from a prior category remain visible after switching.
- Achieve automation coverage for all three scenarios in the SPEC using Playwright + TypeScript.

---

## 6. Test Items / Modules

| Module | Description |
|---|---|
| Home Page — Category Sidebar | Phones, Laptops, Monitors links |
| Home Page — Product Grid | Product list rendered per selected category |

---

## 7. Features to be Tested

- Category link clickability (Phones, Laptops, Monitors).
- Product list filtering accuracy per category.
- Exclusion of unrelated-category products after filtering.
- Correctness of the product list across a full switch sequence.
- Absence of stale products from a previously selected category after switching.

---

## 8. Features Not to be Tested

- Pagination controls.
- Add to Cart / Place Order / Checkout.
- Sign-up, login, logout.
- Product detail page navigation.
- Anything not named in Section 4.1.

---

## 9. Test Types

| Test Type | Applicable | Notes |
|---|---|---|
| Functional Testing | Yes | Category filtering behavior — all 3 scenarios |
| UI Testing | Yes | Product list content per category |
| Regression Testing | Yes | All 3 scenarios tagged `@regression` |
| Negative Testing | Partial | "should not be visible / should not contain" assertions are embedded in the positive flows; no dedicated failure/error scenario supplied |
| Boundary Testing | TBD | Not present in SPEC |
| API Testing | TBD | Not present in SPEC |
| Cross-Browser Testing | TBD | SPEC does not name browsers; current framework config runs Chromium only |
| Responsive Testing | TBD | Not present in SPEC |
| Accessibility Testing | TBD | Not present in SPEC |
| Performance Testing | TBD | Not present in SPEC |
| Security Testing | No | Not applicable to this feature |
| Localization Testing | TBD | Not present in SPEC |

---

## 10. Test Environment

| Item | Details |
|---|---|
| Application URL | `https://www.demoblaze.com` (default `baseURL` in `playwright.config.ts`; overridable via `BASE_URL` env var) |
| Environment Type | Public demo / shared environment |
| Test Framework | Playwright Test `^1.61.1` + TypeScript |
| Node.js Version | TBD — no `engines` field in `package.json` |
| Configuration | `.env` via `dotenv` — `BASE_URL`, `HEADLESS`, `SLOW_MO`, `TIMEOUT` (confirmed in `playwright.config.ts`) |
| Execution Modes | Local (`headless`/`headed` via `HEADLESS` env var), CI (`.github/workflows/playwright.yml` present) |
| Test Data Source | Live public catalog (no seeded/controlled QA environment) |

---

## 11. Browser Coverage

| Browser | Channel | Priority | Status |
|---|---|---|---|
| Chromium (Desktop Chrome) | Latest | P1 | Configured in `playwright.config.ts` (only project currently defined) |
| Firefox | — | TBD | Not configured; not requested by SPEC |
| WebKit (Safari) | — | TBD | Not configured; not requested by SPEC |
| Microsoft Edge | — | TBD | Not configured; not requested by SPEC |

---

## 12. Device Coverage

Not addressed by the SPEC — **TBD**. Current `playwright.config.ts` defines a single desktop Chromium project; no device emulation profiles configured.

---

## 13. Test Data Requirements

| Data Item | Description | Source |
|---|---|---|
| Phone product used in stale-check | `Samsung galaxy s6` | Named explicitly in Scenario "Verify no stale products remain after switching categories" |
| Phone product used as negative check under Monitors | `Nokia lumia 1520` | Named explicitly in the same scenario |
| Category-to-product membership (Phones/Laptops/Monitors) | Full expected product lists per category | **TBD** — not enumerated in the SPEC beyond the two products above; recommend deriving dynamically from the live catalog rather than hard-coding, since this is a shared public demo (see Risks, R1) |

---

## 14. Entry Criteria

- AUT (`https://www.demoblaze.com`) is reachable.
- Playwright framework installed and executable (`npx playwright test` runs).
- This Test Plan reviewed and approved (Gate A) before Stage 2 consumes it.

---

## 15. Exit Criteria

- 100% of planned test cases (from the 3 scenarios) executed.
- All `@high`-tagged scenarios passed.
- No open Critical/High defects in category filtering.
- Automation suite green for two consecutive CI runs.

---

## 16. Assumptions

- The category sidebar (Phones, Laptops, Monitors) is available on the homepage without authentication (not stated explicitly, but implied by "visitor" in the feature's actor role and no login step in the Background).
- Product data on the public demo site is reasonably stable during the test cycle.
- No requirement exists for URL deep-linking to a category — **TBD**, not addressed by the SPEC.

---

## 17. Risks

| # | Risk | Likelihood | Impact |
|---|---|---|---|
| R1 | Shared public demo data changes (e.g., "Samsung galaxy s6" or "Nokia lumia 1520" removed/renamed), breaking the stale-check scenario | High | High |
| R2 | Category filter renders stale products briefly during the switch (race condition) before settling — the SPEC's stale-check scenario exists precisely to catch this | Medium | High |
| R3 | Category links have no stated test IDs; locator strategy must rely on text/role, which is more brittle | Medium | Medium |
| R4 | No dedicated QA/sandbox environment — cannot control or seed catalog data | High | Medium |

---

## 18. Risk Mitigation Plan

| Risk | Mitigation |
|---|---|
| R1 | Where possible, verify category membership structurally (e.g., product count > 0, product belongs to expected set) rather than hard-coding exhaustive lists; keep the two SPEC-named products as the primary fixture since they are explicit requirements |
| R2 | Use Playwright's auto-retrying web-first assertions (`toBeVisible`/`toHaveCount`) after each category click rather than a fixed sleep, so the assertion naturally waits out the grid refresh |
| R3 | Centralize locators in the page object/locator constants file; prefer role/text locators with fallback strategies |
| R4 | Design assertions to be data-shape driven (category membership, non-empty grid) rather than exact-count driven |

---

## 19. Dependencies

- Availability and stability of `https://www.demoblaze.com` (external, uncontrolled).
- Playwright browsers installed in local and CI environments.
- GitHub Actions workflow (`.github/workflows/playwright.yml`) for CI execution.

---

## 20. Test Deliverables

- This Test Plan (`docs/Test Plans/product-category-verification_test_plan.md`).
- Detailed test cases (Stage 2 output — pending Gate A approval).
- Automated Playwright spec (Stage 5 output — pending Stages 2–4).
- Execution reports (Playwright HTML, JUnit XML, JSON — already configured in `playwright.config.ts`).

---

## 21. Defect Management Process

| Step | Description |
|---|---|
| Logging | Defect tracking tool — **TBD** (not specified) |
| Severity Classification | Critical (wrong category shown), High (leakage/stale products, matching `@high` tags), Medium (matching `@medium` tag), Low (cosmetic) |
| Triage | TBD |
| Retest | Fixed defects retested; linked automated test added as regression guard |

---

## 22. Test Execution Strategy

1. **Scenario 1** (`@high`) — sequential switch Phones → Laptops → Monitors, verifying correct/only products at each step.
2. **Scenario 2** (`@medium`) — stale-product check: Phones shows "Samsung galaxy s6"; after switching to Monitors, neither "Samsung galaxy s6" nor "Nokia lumia 1520" should appear.
3. **Scenario 3** (`@high`, data-driven) — each of Phones/Laptops/Monitors independently shows only its own products.

All three are tagged `@regression`; execute as part of the regression suite.

---

## 23. Automation Strategy

| Aspect | Approach |
|---|---|
| Framework | Playwright Test + TypeScript |
| Design Pattern | Page Object Model — extend `HomePage` with a category-selection method and a product-list read method |
| Data-Driven | Parameterize Scenario 3 over `[Phones, Laptops, Monitors]` |
| Synchronization | Rely on Playwright web-first assertions (auto-retry) after each category click instead of fixed waits, to correctly handle R2 |
| Tagging | `@regression`, plus `@high`/`@medium` priority tags carried from the Gherkin source into test titles or Playwright tags |

---

## 24. Reporting Strategy

- Playwright HTML Report (`playwright-report/`) — already configured.
- JUnit XML (`test-results/junit.xml`) — already configured.
- JSON Report (`test-results/results.json`) — already configured.

---

## 25. Logging Strategy

- Use the existing framework loggers (`utils/logger`) for step-level execution logs, consistent with `tests/purchase.001.spec.ts`.
- Log the selected category and expected-vs-actual product list on assertion failure.

---

## 26. Screenshot Strategy

- Automatic screenshot on failure only (`screenshot: 'only-on-failure'`, confirmed in `playwright.config.ts`).

---

## 27. Trace Collection Strategy

- Trace collection on first retry (`trace: 'on-first-retry'`, confirmed in `playwright.config.ts`).

---

## 28. Retry Strategy

- Current config: `retries: 0` (confirmed in `playwright.config.ts`) — no retries locally or in CI under the present setting.
- Recommendation: consider CI-only retries given R1/R4 (shared public demo) — **TBD**, requires a config change decision, not made here.

---

## 29. Parallel Execution Strategy

- Current config: `fullyParallel: false`, `workers: 1` (confirmed in `playwright.config.ts`).
- These 3 scenarios are read-only category browsing and are candidates for parallel-safe execution if the project's global config allows it in the future — **TBD**, no change recommended without a broader decision.

---

## 30. Test Metrics

| Metric | Definition / Target |
|---|---|
| Test Case Execution Rate | Executed / Planned — target 100% |
| Pass Rate | Passed / Executed — target 100% for `@high` scenarios |
| Automation Coverage | 3/3 scenarios automatable with the current framework |
| Flakiness Rate | Tests passing only on retry / total — target 0% (retries are currently disabled) |

---

## 31. Requirement Traceability Matrix

| Req ID | Requirement | Test Case ID | Scenario | Type | Priority | Automation |
|---|---|---|---|---|---|---|
| RQ-01 | Phones category shows only phone products | TC-01 | Select Phones → assert only phone products visible | Positive | High | Yes |
| RQ-01 | No laptop/monitor products visible under Phones | TC-01 | Select Phones → assert no laptop/monitor products | Negative | High | Yes |
| RQ-02 | Laptops category shows only laptop products | TC-02 | Select Laptops → assert only laptop products visible | Positive | High | Yes |
| RQ-02 | No phone/monitor products visible under Laptops | TC-02 | Select Laptops → assert no phone/monitor products | Negative | High | Yes |
| RQ-03 | Monitors category shows only monitor products | TC-03 | Select Monitors → assert only monitor products visible | Positive | High | Yes |
| RQ-03 | No phone/laptop products visible under Monitors | TC-03 | Select Monitors → assert no phone/laptop products | Negative | High | Yes |
| RQ-04 | No stale products after switching category | TC-04 | Select Phones (assert "Samsung galaxy s6" present) → select Monitors → assert "Samsung galaxy s6" and "Nokia lumia 1520" absent | Edge | Medium | Yes |
| RQ-05 | Each category independently displays only its own products | TC-05 | Data-driven: for each of Phones/Laptops/Monitors, assert only that category's products shown | Positive | High | Yes |

> Req IDs (`RQ-##`) are assigned here for the first time since no upstream ticket/story with existing IDs was supplied — flagged per the Traceability Contract for confirmation at Gate A.

---

## 32. Test Summary Template

```markdown
# Test Summary Report — Product Category Verification

| Item | Value |
|---|---|
| Test Cycle | <cycle name / build id> |
| Execution Window | <start date> – <end date> |
| Environment | <URL / browser matrix> |
| Total Test Cases | <n> |
| Executed | <n> |
| Passed | <n> |
| Failed | <n> |
| Blocked | <n> |
| Pass Rate | <x>% |
| Defects Raised (C/H/M/L) | <c>/<h>/<m>/<l> |
| Defects Open | <n> |
| Flaky Tests | <n> |
| Exit Criteria Met | Yes / No |
| Go / No-Go Recommendation | <recommendation> |

## Key Findings
- <finding 1>

## Open Risks
- <risk 1>

## Sign-off
- QA Lead: ______  Date: ______
- Product Owner: ______  Date: ______
```

---

## 33. Future Enhancements

- Extend coverage to pagination, product-detail navigation, and login-state behavior once/if those are brought into scope.
- Add cross-browser (Firefox/WebKit) and responsive coverage if required.
- Add API-level validation of the category endpoint for UI/API parity.
