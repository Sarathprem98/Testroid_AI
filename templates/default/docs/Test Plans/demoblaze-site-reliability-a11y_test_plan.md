<!-- Generated-by: TestPlanGeneratorAgent · demoblaze-site-reliability-a11y · 2026-07-20 · AI-generated, human review required -->

# Test Plan — demoblaze-site-reliability-a11y

> **STATUS: Proceeded as draft.** Human explicitly instructed the pipeline to continue to Stage 2 on 2026-07-20 without filling in formal `Reviewed By` / `Approved By` sign-off. Gate A logged as cleared-as-draft rather than silently bypassed.
> **File renamed 2026-07-29** from `docs/Test Plans/TestPlan_DemoblazeSiteReliabilityA11y.md` to `docs/Test Plans/demoblaze-site-reliability-a11y_test_plan.md` (briefly moved to a flat `docs/demoblaze-site-reliability-a11y_test_plan.md`, then moved back into `docs/Test Plans/` per follow-up instruction) — no content changed, only the filename casing/prefix and folder round-trip.

## 1. Project Information

| Field | Value |
|---|---|
| Project | Demoblaze Playwright Automation Suite (TESTpal pipeline) |
| Epic No | TBD — no formal Epic/Jira ID supplied with this SPEC |
| Ticket No | `demoblaze-site-reliability-a11y` |
| SPEC Source | Gherkin feature file supplied directly by user (extends an external `demoblaze.feature`, not present in this repo — no overlap with the existing 25 scenarios claimed by that file) |
| Author (AI-generated) | TESTpal Test Plan Generator Agent |
| Date | 2026-07-20 |
| Reviewed By | Proceeded as draft (human instruction, 2026-07-20) |
| Approved By | Proceeded as draft (human instruction, 2026-07-20) |

## 2. Requirement Summary

The SPEC introduces five new regression scenarios for the Demoblaze storefront, grouped under a "site reliability, security, and accessibility" theme rather than a single functional flow:

1. Pagination — the "»" (Next) control on the home page loads a different product set.
2. Page reload — refreshing the browser produces no unhandled console errors and leaves the carousel/product grid intact.
3. Transport security — the site is served over valid HTTPS with a non-expired certificate and no mixed-content warnings.
4. Keyboard accessibility — Tab navigation through the navbar follows a logical order with visible focus indicators.
5. Branding — the favicon renders correctly in the browser tab.

All five scenarios share a common `Background`: starting from the Demoblaze home page.

## 3. Business Objective

TBD — the SPEC does not state a business driver (e.g., a specific incident, audit finding, or compliance deadline). Inferred value: these scenarios harden regression coverage around site stability, transport security, and baseline accessibility for a public-facing storefront, which the existing suite (`purchase.001.spec.ts`, `category-navigation.002.spec.ts`, `additional-test-cases.003.spec.ts`) does not currently cover.

## 4. Scope

### In Scope

- Home page pagination behavior (Next/`»` link).
- Browser reload behavior and console error monitoring.
- HTTPS/TLS validation and mixed-content detection on page load.
- Keyboard-only Tab navigation through the navbar and focus-indicator visibility.
- Favicon presence and correctness in the browser tab.

### Out of Scope

- The original 25 scenarios referenced in the external `demoblaze.feature` (not supplied, assumed already covered elsewhere).
- Any purchase, cart, login/signup, or category-browsing flows already covered by the existing suite.
- Mobile/responsive viewports — SPEC does not mention device coverage (see Section 12).
- Deep certificate-chain/cipher-suite auditing beyond "valid and not expired" (would require tooling outside Playwright's page-level APIs — flagged as a risk in Section 17).

## 5. Test Objectives

- Verify pagination advances the product listing to a distinct set of items.
- Verify a page reload does not surface unhandled console errors and preserves key above-the-fold UI (carousel, product grid).
- Verify the site is served over HTTPS with a valid, non-expired certificate and without mixed-content warnings.
- Verify the navbar is fully keyboard-navigable in a logical tab order with visible focus states.
- Verify the favicon renders as expected.

## 6. Test Items / Modules

| Module | Scenario(s) |
|---|---|
| Pagination | Pagination Next link loads more products |
| Page Lifecycle | Page reload behaves cleanly |
| Security/Transport | Site loads over valid HTTPS |
| Accessibility | Keyboard Tab navigation through navbar |
| Branding | Favicon displays correctly |

## 7. Features to be Tested

- Home page pagination control (`»`) and resulting product grid change.
- Console error surface on reload.
- Carousel and product grid presence/integrity post-reload.
- HTTPS connection state, certificate validity, and mixed-content warnings.
- Keyboard focus traversal order and visible focus indicators across navbar links.
- Favicon rendering.

## 8. Features Not to be Tested

- Backend/API-level product data correctness (pagination is verified at the UI/DOM level only).
- Certificate issuer/chain-of-trust deep inspection (TBD — see Section 17 Risks).
- Screen-reader / ARIA semantics beyond visible focus indicators — SPEC scopes accessibility to keyboard Tab order only.
- Cross-browser focus-indicator styling differences (single `chromium` project per current `playwright.config.ts`).

## 9. Test Types

- Functional / UI regression (pagination, reload, favicon).
- Security — transport-layer validation (HTTPS, certificate, mixed content).
- Accessibility — keyboard navigation and focus visibility.
- Negative/edge cases: TBD — SPEC provides only positive-path scenarios for all five items; no explicit negative scenarios given.

## 10. Test Environment

| Item | Value |
|---|---|
| Application Under Test | `https://www.demoblaze.com` (per `playwright.config.ts` default `BASE_URL`) |
| Environment type | Shared public demo (not an isolated sandbox) |
| Browser | Chromium (single `chromium` project currently configured) |
| Execution mode | Headless/headed per `.env` `HEADLESS` flag |

## 11. Browser Coverage

- Chromium only, per current `playwright.config.ts` project configuration.
- Firefox/WebKit: TBD — not currently configured as projects; would require a config change outside Stage 5's allowlisted paths if requested later.

## 12. Device Coverage

- Desktop viewport only (suite fixes a 1440x900 viewport in `tests/hooks.ts`).
- Mobile/tablet emulation: TBD — not mentioned in SPEC, not currently configured.

## 13. Test Data Requirements

- No user-specific or purchase test data required for these five scenarios (no login/signup/checkout involved).
- No credentials, PII, or secrets are needed or should be introduced — confirmed no such content present in the SPEC.

## 14. Entry Criteria

- This Test Plan has cleared **HITL Gate A** (Reviewed By / Approved By populated).
- Demoblaze (`https://www.demoblaze.com`) is reachable and serving its normal home page.
- Existing suite (`npm test`) is green on `main` prior to adding new specs, to isolate new failures.

## 15. Exit Criteria

- All five scenarios automated and passing consistently (accounting for the shared-environment caveat in Section 17).
- `npm run typecheck` passes.
- Stage 6 Validator issues a Pass verdict per Test Case ID.

## 16. Assumptions

- "a different set of products" for pagination means the product name/ID set on the page changes after clicking `»`, not necessarily a fixed count.
- "unhandled console errors" refers to browser console `error`-level messages/page errors, not warnings.
- "SSL certificate should be valid and not expired" is verifiable via the browser's TLS state as observed by Playwright (e.g., no certificate-error navigation, `page.url()` reporting `https:`), not full external chain validation.
- "logical order" for Tab navigation means DOM/visual order of navbar links (left-to-right as rendered), absent an explicit `tabindex` spec.
- All assumptions are TBD for explicit confirmation at Gate A.

## 17. Risks

| Risk | Impact |
|---|---|
| Demoblaze is a shared public demo; product catalog/pagination content can change independently of this suite | Pagination assertions on specific product names may become flaky |
| Playwright has no native "SSL certificate expiry" API | Certificate validity may need to be inferred indirectly (e.g., absence of Chromium interstitial/`net::ERR_CERT_*`) rather than asserted with an expiry date, or may require a supplementary Node `tls` check outside Page Object scope |
| "Mixed-content warnings" are not directly exposed as a Playwright API | Detection likely via console message monitoring for mixed-content messages, which is best-effort |
| Console error monitoring is not currently wired into any active spec (per `CLAUDE.md`, `consoleHelper.ts` is only used by the dead `registerHooks` in `fixtures/testFixture.ts`) | Reload scenario may require enabling console listening for this suite, a decision beyond Stage 1's scope |
| Keyboard focus-indicator "visibility" is a CSS/visual property | May require computed-style assertions (e.g., outline/box-shadow present) rather than a simple accessibility-tree check |

## 18. Risk Mitigation Plan

- Prefer structural assertions (product set changed, count differs) over asserting specific product names for pagination.
- For HTTPS/certificate validation, scope automated assertions to what Playwright can observe (URL protocol, absence of certificate-error navigation, response `security details` via CDP if available) and mark anything requiring external tooling as **TBD/Blocked** rather than fabricating a pass.
- Flag the `consoleHelper.ts` wiring gap to the human at Gate A so a decision is made before Stage 5 implements the reload scenario.
- For focus-indicator visibility, assert on computed style properties known to indicate focus (e.g., `outline-style`, `outline-width`, `box-shadow`) rather than a subjective visual check.

## 19. Dependencies

- `https://www.demoblaze.com` availability and stability (external, shared).
- Existing `BasePage` primitives and `LocatorStrategyList` conventions in `pages/**` / `locators/locatorConstants.ts`.
- Decision on whether to wire up `networkHelper.ts`/`consoleHelper.ts` for console-error capture in the reload scenario (currently dormant per `CLAUDE.md`).

## 20. Test Deliverables

- This Test Plan (`docs/Test Plans/demoblaze-site-reliability-a11y_test_plan.md`).
- Detailed Test Cases (`docs/test_cases/demoblaze-site-reliability-a11y.md`).
- Normalized Test Cases (`docs/normalizer/demoblaze-site-reliability-a11y.md`).
- Reuse Mapping Report (`docs/reuse_map/demoblaze-site-reliability-a11y.md`).
- Playwright spec(s) and any new/extended Page Object(s).
- Implementation Summary (`docs/implementation/demoblaze-site-reliability-a11y.md`).
- Validation Report (`docs/validation/demoblaze-site-reliability-a11y.md`).

## 21. Defect Management Process

- Stage 6 Fail verdicts route to the specific stage owning the root cause per the [Feedback Loop](../agents/README.md#feedback-loop) table, capped at 2 automatic retries (3 total attempts) before HITL Gate C escalation.
- No defect tracker (Jira/ADO) integration specified — TBD.

## 22. Test Execution Strategy

- Run via `npx playwright test tests/{epic}/site-reliability-a11y.004.spec.ts` for targeted execution, or full `npm test` for regression.
- Tag new tests `@regression`, plus `@security` (HTTPS scenario) and `@accessibility` (keyboard nav scenario), matching the SPEC's own tags and the project's existing `@purchase`/`@regression`/`@category`/`@smoke` tagging convention.
- `fullyParallel: false` per current `playwright.config.ts` — tests run sequentially within the suite.

## 23. Automation Strategy

- Playwright + TypeScript, Page Object Model, extending `pages/BasePage.ts` primitives exclusively (no raw `page` calls, no inline selectors).
- New/updated locators added to `locators/locatorConstants.ts` as `LocatorStrategyList`s (or parameterized functions), never inline strings.
- Reuse existing `HomePage` fixture/page object where possible for the Background step and navbar/pagination interactions (to be confirmed by Stage 4 Reuse Matcher).
- No data-driven or API-level testing required for these scenarios.

## 24. Reporting Strategy

- Playwright HTML Report (`playwright-report/`, `npm run test:report`).
- JUnit XML (`test-results/junit.xml`) and JSON (`test-results/results.json`) per existing `playwright.config.ts` reporters.
- Allure: TBD — not currently configured in this repo.

## 25. Logging Strategy

- All UI actions logged via `utils/logger.ts` (Winston) through `BasePage` primitives — no `console.log`.
- Console-error capture for the reload scenario depends on the Section 17/19 decision regarding `consoleHelper.ts`.

## 26. Screenshot Strategy

- Failure screenshots captured automatically via `utils/screenshotHelper.ts` in `tests/hooks.ts`'s `afterEach`, consistent with the rest of the suite.

## 27. Trace Collection Strategy

- Governed by existing `playwright.config.ts` trace settings — no scenario-specific override identified as necessary.

## 28. Retry Strategy

- Suite-level `RETRIES` env var applies (default `0` per `CLAUDE.md`); no scenario-specific retry override identified.
- Pipeline-level Stage 5↔6 feedback-loop retries are separate and capped at 2 automatic attempts per the Feedback Loop policy.

## 29. Parallel Execution Strategy

- `fullyParallel: false` and single `chromium` project per current config — these five scenarios run sequentially, consistent with the rest of the suite. No change to `playwright.config.ts` proposed (out of Stage 5's allowlisted scope).

## 30. Test Metrics

- Pass/fail count per Test Case ID (Section 31).
- Flake rate for the pagination scenario specifically, given shared-catalog risk (Section 17).
- Console-error count for the reload scenario, once capture is wired up.

## 31. Requirement Traceability Matrix

| Req ID | Test Case ID | Scenario | Tags |
|---|---|---|---|
| RQ-01 | TC-01 | Pagination Next link loads more products | `@regression` |
| RQ-02 | TC-02 | Page reload behaves cleanly | `@regression` |
| RQ-03 | TC-03 | Site loads over valid HTTPS | `@regression`, `@security` |
| RQ-04 | TC-04 | Keyboard Tab navigation through navbar | `@regression`, `@accessibility` |
| RQ-05 | TC-05 | Favicon displays correctly | `@regression` |

## 32. Test Summary Template

| Field | Value |
|---|---|
| Ticket No | `demoblaze-site-reliability-a11y` |
| Total Test Cases | 5 |
| Passed | TBD (post-execution) |
| Failed | TBD (post-execution) |
| Blocked | TBD (post-execution) |
| Automation Coverage | TBD (post-Stage 5) |

## 33. Future Enhancements

- Extend browser coverage to Firefox/WebKit if cross-browser focus-indicator or HTTPS behavior needs verification (requires a `playwright.config.ts` change, out of current scope).
- Add mobile/responsive viewport coverage for pagination and accessibility scenarios.
- Wire up `networkHelper.ts`/`consoleHelper.ts` suite-wide rather than scenario-specific, if console-error monitoring proves broadly useful.
- Consider a dedicated external TLS/certificate-chain check (outside Playwright) if deeper security assurance is required than page-level observation can provide.
