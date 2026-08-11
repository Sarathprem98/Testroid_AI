# Test Plan — Demoblaze API: Catalog, Category Filter, Product Details, Auth & Cart

<!-- Generated-by: Test Plan Generator Agent (Stage 1) · demoblaze-api-catalog-cart-auth · 2026-07-28 · AI-generated, human review required -->
> Pipeline stage: 1 — Test Plan Generator | Ticket: **demoblaze-api-catalog-cart-auth** | Epic: **TBD** | Generated: 2026-07-28

---

## 1. Project Information

| Item | Details |
|---|---|
| Project Name | DemoBlaze E-Commerce Test Automation |
| Application Under Test (AUT) | DemoBlaze REST API — `https://api.demoblaze.com` |
| Feature | Product Catalog, Category Filter, Product Details, User Authentication, and Shopping Cart APIs (5 features, combined into one ticket per reviewer decision) |
| Ticket / Story ID | demoblaze-api-catalog-cart-auth |
| Epic | TBD — no formal Epic ID supplied; reviewer named this a combined slug rather than a Jira/ADO Epic |
| Test Plan Version | 1.0 |
| Prepared By | TESTpal — Test Plan Generator (Stage 1) |
| Date | 2026-07-28 |
| Test Framework | Playwright + TypeScript (`api` project — no browser, see `api/**`) |
| Reviewed By | saratprem.chebiyyam@sailssoftware.com |
| Approved By | saratprem.chebiyyam@sailssoftware.com (proceed-as-draft) |
| Approved Date | 2026-07-29 |

> ✅ **HITL Gate A cleared** on 2026-07-29 by saratprem.chebiyyam@sailssoftware.com — explicit "proceed" instruction, approving as draft (SPEC-vs-implementation discrepancies in Section 2 and the RQ-15/TC-17 gap in Section 31 carried forward as-is, not resolved before approval). Stage 2 (Test Case Generator) may proceed.

---

## 2. Requirement Summary

Source: five feature descriptions supplied directly as SPEC input (no formal Jira/ADO ticket, BRD/FRD, or Gherkin file):

1. **Product Catalog API (`/entries`)** — return the complete product list with correct fields (`id`, `title`, `price`, `category`, `description`, `image`), correct structure, and 200 OK for valid requests.
2. **Product Category Filter API (`/prodByCat`)** — POST query by category (Phones, Laptops, Monitors) returns only that category's products, validates schema, handles invalid/non-existent categories gracefully (empty array or appropriate error).
3. **Product Details API (`/viewproduct`)** — fetch a single product by ID, returns accurate/complete details matching the UI; invalid/non-existent ID returns an appropriate error response, not a server crash.
4. **User Authentication API (`/signup`, `/login`)** — signup succeeds with valid unique credentials, fails appropriately on duplicate usernames; login succeeds with correct credentials (returns auth token/session), fails with proper error messages on incorrect username/password.
5. **Shopping Cart API (`/addtocart`, `/viewcart`, `/deleteitem`)** — add-to-cart persists and is reflected in cart view, totals/quantities update as expected, removal deletes the item, and cart operations require valid authentication/session where applicable.

> ⚠ **Critical SPEC-vs-implementation discrepancy (flagged, not silently corrected — anti-fabrication guardrail).** The endpoint names/paths and field names named in the SPEC do **not** match this repo's existing, already-verified API client (`api/clients/DemoblazeApiClient.ts`, `api/types/demoblazeApiTypes.ts`), which was reverse-engineered from the live site's own `js/prod.js`/`js/cart.js` and cross-checked against live `curl` responses:
>
> | SPEC says | Actual verified endpoint | Actual verified field names |
> |---|---|---|
> | `/entries` | `/entries` (GET) — matches | `id`, `title`, `price`, `cat` (not `category`), `desc` (not `description`), `img` (not `image`) |
> | `/prodByCat` | `/bycat` (POST, body `{ cat }`) | same field mismatches as above |
> | `/viewproduct` | `/view` (POST, body `{ id }`) — `/prodbyid` and `/viewproduct` both 404 per existing client comments | same field mismatches as above |
> | `/signup`, `/login` | matches | — |
> | `/addtocart`, `/viewcart`, `/deleteitem` | matches (a separate `/deletecart` also exists for clearing a whole cart, not requested here) | — |
>
> Also critical: **the live API never uses HTTP status codes to signal business-logic failure.** Signup/login/cart calls all return `200 OK`; failure is signaled by an `errorMessage` field in the JSON body instead (confirmed in `api/types/demoblazeApiTypes.ts` and exercised in `tests/api/api.001.spec.ts`). The SPEC's language ("proper status codes," "appropriate error response instead of a server crash," "proper error messages") reads as REST-idiomatic (4xx/5xx) but the actual AUT does not behave that way for at least signup/login. This must be reconciled at Gate A — test cases will be written against the **actual verified behavior**, not the SPEC's assumed status-code semantics, unless a human overrides this.

---

## 3. Business Objective

- Ensure the Demoblaze API layer (catalog, category filter, product details, auth, cart) behaves correctly and consistently, independent of and complementary to existing UI coverage.
- Broader business value (conversion impact, SLAs, KPIs) — **TBD**, not stated in the SPEC.

---

## 4. Scope

### 4.1 In Scope

- `GET /entries` — full catalog retrieval: response shape (`Items[]`, `Cat[]`), per-product fields, status code.
- `POST /bycat` — category filter for Phones, Laptops, Monitors; schema validation; invalid/non-existent category handling.
- `POST /view` — single product lookup by ID; field accuracy; invalid/non-existent ID handling.
- `POST /signup` — new user registration (unique credentials succeed; duplicate username fails via `errorMessage`).
- `POST /login` — successful login returns `Auth_token:`-prefixed string; incorrect username/password returns `errorMessage`.
- `POST /addtocart`, `POST /viewcart`, `POST /deleteitem` — add, view, and remove a single cart line item; reflection of adds/removes in the cart view; both anonymous (`loggedIn: false`) and authenticated (`loggedIn: true`) cart flows to the extent the existing client supports them.
- Response status code and `errorMessage`-body validation for all of the above, based on **actual observed behavior**, not the SPEC's assumed status-code model (see Section 2 discrepancy note).

### 4.2 Out of Scope

- UI-to-API parity checks (comparing API responses against rendered DOM content) — not requested by the SPEC; **TBD** if desired as a follow-up.
- `POST /check` (token validation) and `POST /deletecart` (whole-cart clear) — implemented in the existing client but not named in the SPEC's 5 features; **TBD** whether to include.
- Cart quantity/total **calculation** logic — the verified `DemoblazeCartMutationResponse`/`DemoblazeViewCartResponse` types carry no `total`/`quantity` field beyond `Items[]`; the SPEC's "cart totals/quantities update as expected" cannot be verified against a field that doesn't exist in the observed response shape. Flagged as **TBD** — either the SPEC expects UI-computed totals (out of scope for an API-only ticket) or this needs a live response sample to confirm, not a guess.
- Non-functional testing: load/performance, security/penetration, accessibility (not applicable to a JSON API), localization.
- Any endpoint not named in Section 4.1.

---

## 5. Test Objectives

- Verify `/entries` returns the full catalog with correct structure and all documented fields (per actual field names — `cat`/`desc`/`img`, not the SPEC's `category`/`description`/`image`).
- Verify `/bycat` returns only the requested category's products for Phones, Laptops, and Monitors, and behaves predictably (empty array vs. error — to be confirmed against a live call, not assumed) for an invalid category.
- Verify `/view` returns complete, accurate product details for a valid ID and a well-defined (not crashing) response for an invalid/non-existent ID.
- Verify `/signup` succeeds for unique credentials and fails with an `errorMessage` for a duplicate username.
- Verify `/login` succeeds for correct credentials (returns a usable `Auth_token:` string) and fails with an accurate `errorMessage` for wrong username or wrong password (distinct messages, per the existing spec's precedent: `"User does not exist."` vs. `"Wrong password."`).
- Verify `/addtocart` → `/viewcart` reflects the added item, and `/deleteitem` removes it, for both anonymous and authenticated sessions.
- Achieve automation coverage for all net-new scenarios using the existing `DemoblazeApiClient` / `BaseApiClient` pattern.

---

## 6. Test Items / Modules

| Module | Description |
|---|---|
| Catalog API | `GET /entries` |
| Category Filter API | `POST /bycat` |
| Product Details API | `POST /view` |
| Authentication API | `POST /signup`, `POST /login` |
| Cart API | `POST /addtocart`, `POST /viewcart`, `POST /deleteitem` |

---

## 7. Features to be Tested

- Catalog completeness and field-level correctness (`/entries`).
- Category filter accuracy and invalid-category handling (`/bycat`).
- Product detail accuracy and invalid-ID handling (`/view`).
- Signup success/duplicate-username handling (`/signup`).
- Login success/invalid-credential handling, distinguishing wrong-username vs. wrong-password messages (`/login`).
- Cart add/view/remove round-trip, anonymous and authenticated (`/addtocart`, `/viewcart`, `/deleteitem`).

---

## 8. Features Not to be Tested

- `/check` (token validation) — TBD, not named in SPEC.
- `/deletecart` (whole-cart clear) — TBD, not named in SPEC.
- Cart totals/quantity math — no such field in the verified response shape (see Section 4.2).
- UI-API parity, load, security, accessibility, localization.

---

## 9. Test Types

| Test Type | Applicable | Notes |
|---|---|---|
| Functional Testing | Yes | All 5 features |
| API Testing | Yes | Primary test type for this ticket |
| Negative Testing | Yes | Duplicate signup, wrong login credentials, invalid category, invalid product ID |
| Boundary Testing | Partial | Invalid/non-existent category and product ID; no numeric boundary values named in SPEC |
| Regression Testing | Yes | To be tagged `@api` (existing project convention) and `@regression` |
| Contract/Schema Testing | Yes | Response shape validation against `api/types/demoblazeApiTypes.ts` |
| Security Testing | TBD | Not requested; no auth-token misuse/injection scenarios in SPEC |
| Performance Testing | No | Explicitly out of scope per shared-environment guardrail (no load generation against a public demo) |
| Cross-Browser / Device / Localization | N/A | API-only ticket, no browser involved |

---

## 10. Test Environment

| Item | Details |
|---|---|
| API Base URL | `https://api.demoblaze.com` (default `apiBaseURL` in `playwright.config.ts`, overridable via `API_BASE_URL` env var) |
| Environment Type | Public demo / shared environment — API layer, no browser |
| Test Framework | Playwright Test `^1.61.1` + TypeScript, `api` project (`testDir: './tests/api'`, no browser) |
| Client Layer | `api/clients/BaseApiClient.ts` (typed `ApiResponse<T>`, GET retries ≤2× on `>=500`, other verbs never auto-retry) + `api/clients/DemoblazeApiClient.ts` |
| Node.js Version | TBD — no `engines` field in `package.json` |
| Configuration | `.env` via `dotenv` — `API_BASE_URL`, `RETRIES`, `WORKERS` (confirmed in `playwright.config.ts`) |
| Execution Modes | Local (`npm run test:api`), CI (`.github/workflows/playwright.yml` present) |
| Known live-environment fact | `api.demoblaze.com` has been observed returning intermittent `500`s independent of request correctness (per `CLAUDE.md`) — test design must tolerate this as an environment fact, not paper over it with a loosened assertion |

---

## 11. Browser Coverage

Not applicable — this is an API-only ticket (`api` Playwright project runs with no browser).

---

## 12. Device Coverage

Not applicable — API-only ticket.

---

## 13. Test Data Requirements

| Data Item | Description | Source |
|---|---|---|
| Signup/login credentials | Dynamically generated username (`automation_<timestamp>_<random>`) + fixed base password | `utils/randomData.ts` → `generateCredentials()` (existing, reusable) |
| Duplicate-username case | Signup twice with the same generated username | Derive from `generateCredentials()`, reuse the same object across two calls |
| Category values | `Phones`, `Laptops`, `Monitors` (valid) + one deliberately invalid string (e.g. `NonExistentCategory`) | Named in SPEC (valid); invalid value is a test-authored constant, not a guess about server behavior |
| Product ID (valid) | Existing product ID `1`, consistent with the existing example spec (`tests/api/api.001.spec.ts`) | Existing precedent in repo |
| Product ID (invalid) | A clearly out-of-range/non-existent ID (e.g. `999999` or `-1`) — **exact expected response TBD**, must be confirmed via a live call before asserting a specific shape | To be confirmed at Stage 2/5b, not fabricated here |
| Cart item ID / cookie | Client-generated unique strings (`api-test-<timestamp>` pattern), consistent with existing example spec | Existing precedent in repo |
| Expected catalog field names | `id`, `title`, `price`, `cat`, `desc`, `img` (verified) — **not** the SPEC's `category`/`description`/`image` | `api/types/demoblazeApiTypes.ts` |
| Category filter values | `phone`, `notebook`, `monitor` (verified live at Stage 5b, 2026-07-29) — **not** the SPEC's/UI's `Phones`/`Laptops`/`Monitors`; `POST /bycat` with `{"cat":"Phones"}` returns `{"Items":[]}` (silently empty, not an error). `/bycat` also returns `{"Items":[...]}`, not a bare array as the original client type declared. | Live `curl` verification against `https://api.demoblaze.com/bycat` and `/entries`, cross-checked with `api/clients/DemoblazeApiClient.ts` |

---

## 14. Entry Criteria

- `https://api.demoblaze.com` is reachable.
- Playwright framework installed and executable (`npx playwright test --project=api` runs).
- This Test Plan reviewed and approved (Gate A), including explicit sign-off on the SPEC-vs-actual-implementation discrepancies in Section 2, before Stage 2 consumes it.

---

## 15. Exit Criteria

- 100% of planned test cases (from the 5 features, scoped per Section 4) executed.
- All High-priority scenarios (signup/login success and failure, cart add/view/remove) passed.
- No open Critical/High defects attributable to the framework/client (as opposed to the known live-environment 500s, which are tracked separately, not treated as a defect to "fix").
- Automation suite green for two consecutive CI runs, excluding known intermittent live-environment 500s.

---

## 16. Assumptions

- The reviewer's decision to combine all 5 features into a single ticket (`demoblaze-api-catalog-cart-auth`) holds; no further ticket-splitting is expected downstream.
- The existing `DemoblazeApiClient` methods (`getEntries`, `getProductsByCategory`, `getProductById`, `signup`, `login`, `addToCart`, `viewCart`, `deleteCartItem`) are the correct, current, verified implementations of the SPEC's intent, superseding the SPEC's stated endpoint names/paths (see Section 2).
- No dedicated QA/sandbox environment exists; all testing runs against the live public API — **TBD** confirmation, but consistent with the UI suite's existing operating model per `CLAUDE.md`.
- "Authentication/session where applicable" for cart (feature 5) refers to the existing `loggedIn`/`cookie` flag pattern already implemented, not a stricter bearer-token-required model — **TBD**, not explicitly confirmed against live behavior yet.

---

## 17. Risks

| # | Risk | Likelihood | Impact |
|---|---|---|---|
| R1 | SPEC-named endpoints/fields (`/prodByCat`, `/viewproduct`, `category`/`description`/`image`) don't exist as named — a naive implementation against the literal SPEC text would 404 or mis-assert field names | High | High |
| R2 | SPEC assumes REST status-code semantics for auth failures; actual API always returns 200 with `errorMessage` — tests asserting a 4xx/5xx on bad login would always fail against the real service | High | High |
| R3 | `api.demoblaze.com` returns intermittent 500s independent of request correctness (confirmed live-dependency fact) — can cause flaky results unrelated to code correctness | Medium | Medium |
| R4 | Cart "totals/quantities" requested by the SPEC have no corresponding field in the verified response types — risk of either under-testing (skipping it) or fabricating an assertion against a non-existent field | Medium | Medium |
| R5 | No dedicated QA/sandbox environment — all calls hit the live shared public API; repeated signup/cart calls must stay minimal per the shared-environment guardrail | Medium | Medium |
| R6 | Invalid-ID / invalid-category exact response shape is unconfirmed — asserting a specific error format without a live sample risks a fabricated expectation | Medium | Medium |

---

## 18. Risk Mitigation Plan

| Risk | Mitigation |
|---|---|
| R1 | Implementation (Stage 5b) uses the existing, already-verified `DemoblazeApiClient` methods and endpoint paths; do not reintroduce the SPEC's literal (unverified) endpoint names |
| R2 | Test cases assert against actual observed status/body behavior (200 + `errorMessage`), matching the existing precedent in `tests/api/api.001.spec.ts`; Gate A reviewer explicitly confirms this reconciliation before Stage 2 |
| R3 | Rely on `BaseApiClient`'s existing GET retry-on-≥500 behavior; report residual 500s as an observed live-dependency fact in the Validation Report, not a code defect, per `CLAUDE.md` |
| R4 | Mark cart totals/quantities as **TBD**/out of scope pending a live response sample or explicit reviewer decision at Gate A, rather than asserting against a guessed field |
| R5 | Limit cart/signup mutations to the minimum needed per scenario (one signup per test, one cart item add/remove per test), consistent with `purchase.001.spec.ts`'s existing precedent for acceptable side effects |
| R6 | Stage 2/5b confirms the exact invalid-ID/invalid-category response via a live call before asserting a specific shape; document the finding rather than assuming it |

---

## 19. Dependencies

- Availability and stability of `https://api.demoblaze.com` (external, uncontrolled, known-intermittent-500s per Section 10).
- Existing `api/clients/BaseApiClient.ts` and `api/clients/DemoblazeApiClient.ts` (already implemented — most of this ticket is Full/Partial Reuse territory, to be confirmed at Stage 4).
- `utils/randomData.ts` (`generateCredentials`) for test data generation.
- GitHub Actions workflow (`.github/workflows/playwright.yml`) for CI execution.

---

## 20. Test Deliverables

- This Test Plan (`docs/Test Plans/demoblaze-api-catalog-cart-auth_test_plan.md`).
- Detailed test cases (Stage 2 output — pending Gate A approval).
- Normalized test cases and Reuse Mapping Report (Stages 3–4).
- Automated API spec additions (Stage 5b output, `tests/api/**`).
- Execution reports (Playwright HTML, JUnit XML, JSON — already configured in `playwright.config.ts`).

---

## 21. Defect Management Process

| Step | Description |
|---|---|
| Logging | Defect tracking tool — **TBD** (not specified) |
| Severity Classification | Critical (wrong data returned / crash), High (auth or cart round-trip broken), Medium (invalid-input handling incorrect), Low (cosmetic/logging) |
| Triage | TBD |
| Retest | Fixed defects retested; linked automated test added as regression guard; known live-environment 500s tracked separately, not triaged as code defects |

---

## 22. Test Execution Strategy

1. **Catalog** — `GET /entries`: full-list retrieval, field-level checks, status code.
2. **Category Filter** — `POST /bycat` for each of Phones/Laptops/Monitors (data-driven), plus one invalid-category case.
3. **Product Details** — `POST /view` for a known-valid ID, plus one invalid/non-existent ID case.
4. **Authentication** — `POST /signup` (unique success + duplicate-username failure), `POST /login` (success + wrong-username + wrong-password, each asserting the correct distinct `errorMessage`).
5. **Cart** — `POST /addtocart` → `POST /viewcart` (reflects add) → `POST /deleteitem` (reflects removal), for both anonymous and authenticated flows where the existing client supports it.

All scenarios tagged `@api` (existing project convention) plus `@regression`.

---

## 23. Automation Strategy

| Aspect | Approach |
|---|---|
| Framework | Playwright Test + TypeScript, `api` project |
| Design Pattern | Existing `BaseApiClient` / `DemoblazeApiClient` client layer — extend only if a genuinely net-new endpoint call is needed (none identified; all 5 features map to already-implemented client methods) |
| Data-Driven | Parameterize category filter over `[Phones, Laptops, Monitors]` |
| Fixtures | `api/fixtures/apiFixture.ts` (typed client injection), `registerApiHooks` from `api/fixtures/apiHooks.ts` |
| Tagging | `@api`, `@regression` |
| Reuse | Section 19/Stage 4 to confirm, but on current evidence this ticket is expected to be predominantly **Full Reuse** of the existing client, with **Net New** limited to additional `test()` cases in `tests/api/**` |

---

## 24. Reporting Strategy

- Playwright HTML Report (`playwright-report/`) — already configured.
- JUnit XML (`test-results/junit.xml`) — already configured.
- JSON Report (`test-results/results.json`) — already configured.

---

## 25. Logging Strategy

- Use the existing `api/clients/BaseApiClient.ts` request/response logging (`logger.api.*`) — already active for every client call, no additional wiring needed.
- Log generated usernames/cart IDs at test start for traceability on failure, consistent with `tests/api/api.001.spec.ts`'s existing pattern.

---

## 26. Screenshot Strategy

- Not applicable — API-only project has no browser/page context.

---

## 27. Trace Collection Strategy

- Not applicable in the same sense as UI traces; standard request/response logging via `logger.api.*` serves as the API equivalent.

---

## 28. Retry Strategy

- Current config: `retries` from `RETRIES` env var, default `0` (confirmed in `playwright.config.ts`).
- `BaseApiClient` retries GET calls up to 2× on `>=500` regardless of Playwright-level retry config; POST/PUT/PATCH/DELETE never auto-retry, to avoid duplicating a signup/cart mutation on a transient failure (confirmed in `api/clients/BaseApiClient.ts`).

---

## 29. Parallel Execution Strategy

- Current config: `fullyParallel: false`, `workers` from `WORKERS` env var, default `1` (confirmed in `playwright.config.ts`).
- Signup/cart scenarios generate unique usernames/cart IDs per test, so they are structurally parallel-safe if the global config changes — **TBD**, no change recommended without a broader decision.

---

## 30. Test Metrics

| Metric | Definition / Target |
|---|---|
| Test Case Execution Rate | Executed / Planned — target 100% |
| Pass Rate | Passed / Executed — target 100% for High-priority scenarios |
| Automation Coverage | Target 100% of in-scope scenarios (Section 4.1) automatable with the existing client |
| Flakiness Rate | Tests passing only on retry / total — tracked separately from known live-environment 500s (R3) |

---

## 31. Requirement Traceability Matrix

| Req ID | Requirement | Test Case ID | Scenario | Type | Priority | Automation |
|---|---|---|---|---|---|---|
| RQ-01 | `/entries` returns full catalog with 200 OK | TC-01 | GET entries → assert 200, `Items[]` non-empty | Positive | High | Yes |
| RQ-02 | Each catalog item has correct fields (`id`, `title`, `price`, `cat`, `desc`, `img`) | TC-02 | GET entries → assert field presence/types on a sample item | Positive | High | Yes |
| RQ-03 | Category filter returns only matching products (Phones) | TC-03 | POST bycat `{cat: 'Phones'}` → assert all items `cat === 'Phones'` | Positive | High | Yes |
| RQ-03 | Category filter returns only matching products (Laptops) | TC-04 | POST bycat `{cat: 'Laptops'}` → assert all items `cat === 'Laptops'` | Positive | High | Yes |
| RQ-03 | Category filter returns only matching products (Monitors) | TC-05 | POST bycat `{cat: 'Monitors'}` → assert all items `cat === 'Monitors'` | Positive | High | Yes |
| RQ-04 | Invalid/non-existent category handled gracefully | TC-06 | POST bycat with an invalid category string → assert well-defined response (exact shape TBD, confirm live) | Negative | Medium | Yes |
| RQ-05 | Product details lookup by valid ID returns accurate data | TC-07 | POST view `{id: <valid>}` → assert title/price/desc/img present and correct | Positive | High | Yes |
| RQ-06 | Product details lookup by invalid/non-existent ID does not crash | TC-08 | POST view `{id: <invalid>}` → assert well-defined response, not a 5xx crash (exact shape TBD, confirm live) | Negative | High | Yes |
| RQ-07 | Signup succeeds with unique valid credentials | TC-09 | POST signup with generated credentials → assert success body (empty string, no `errorMessage`) | Positive | High | Yes |
| RQ-08 | Signup fails for a duplicate username | TC-10 | POST signup twice with same username → assert second call returns `errorMessage` | Negative | High | Yes |
| RQ-09 | Login succeeds with correct credentials, returns usable token | TC-11 | Signup then POST login → assert 200, body contains `Auth_token:` | Positive | High | Yes |
| RQ-10 | Login fails for unregistered username with correct error message | TC-12 | POST login with unregistered username → assert `errorMessage: "User does not exist."` | Negative | High | Yes |
| RQ-11 | Login fails for wrong password with correct error message | TC-13 | Signup, then POST login with wrong password → assert `errorMessage: "Wrong password."` | Negative | High | Yes |
| RQ-12 | Add-to-cart persists and is reflected in view-cart | TC-14 | POST addtocart → POST viewcart → assert added item present in `Items[]` | Positive | High | Yes |
| RQ-13 | Removing a cart item deletes it from view-cart | TC-15 | Add item → POST deleteitem → POST viewcart → assert item absent | Positive | High | Yes |
| RQ-14 | Cart operations behave consistently for authenticated (`loggedIn: true`) sessions | TC-16 | Signup/login → addtocart with `loggedIn: true` → viewcart → assert reflected | Positive | Medium | Yes |
| RQ-15 | Cart totals/quantities update as expected | TC-17 | **Blocked/TBD** — no corresponding field in verified response types (see Section 4.2, R4); requires reviewer decision before a test case can be written | TBD | TBD | TBD |

> Req IDs (`RQ-##`) are assigned here for the first time since no upstream ticket/story with existing IDs was supplied — flagged per the Traceability Contract for confirmation at Gate A. RQ-15/TC-17 is deliberately left incomplete rather than fabricated; see Section 4.2.
>
> **Post-approval correction (2026-07-29, discovered during Stage 5b live verification, no traceability break — `RQ-03`/`TC-03`–`TC-05` IDs and intent unchanged, only the literal category value corrected):** RQ-03's "Phones/Laptops/Monitors" wording describes the UI category names correctly, but the `POST /bycat` request body must use `phone`/`notebook`/`monitor` — the exact SPEC-cased values return an empty result silently, not an error. See Section 13 (Test Data Requirements) for the verified values. `docs/test_cases/demoblaze-api-catalog-cart-auth.md` and `docs/normalizer/demoblaze-api-catalog-cart-auth.md` (TC-03–TC-06) were corrected to match.

---

## 32. Test Summary Template

```markdown
# Test Summary Report — Demoblaze API: Catalog, Category Filter, Product Details, Auth & Cart

| Item | Value |
|---|---|
| Test Cycle | <cycle name / build id> |
| Execution Window | <start date> – <end date> |
| Environment | `https://api.demoblaze.com` |
| Total Test Cases | <n> |
| Executed | <n> |
| Passed | <n> |
| Failed | <n> |
| Blocked | <n> |
| Pass Rate | <x>% |
| Defects Raised (C/H/M/L) | <c>/<h>/<m>/<l> |
| Defects Open | <n> |
| Flaky Tests (excl. known live 500s) | <n> |
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

- Resolve RQ-15 (cart totals/quantities) once a live response sample or explicit product decision confirms the intended field/behavior.
- Add `/check` (token validation) and `/deletecart` (whole-cart clear) coverage if brought into scope.
- Add UI-API parity checks (API response vs. rendered DOM) as a follow-up ticket.
- Revisit R2 (status-code vs. body-error semantics) if the AUT's API behavior ever changes to standard REST status codes.
