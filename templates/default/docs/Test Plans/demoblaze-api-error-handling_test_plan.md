# Test Plan — Demoblaze API: Method Validation, Payload Validation, Authorization, Conflict & Boundary/Error Handling

<!-- Generated-by: Test Plan Generator Agent (Stage 1) · demoblaze-api-error-handling · 2026-07-29 · AI-generated, human review required -->
> Pipeline stage: 1 — Test Plan Generator | Ticket: **demoblaze-api-error-handling** | Epic: **TBD** | Generated: 2026-07-29

---

## 1. Project Information

| Item | Details |
|---|---|
| Project Name | DemoBlaze E-Commerce Test Automation |
| Application Under Test (AUT) | DemoBlaze REST API — `https://api.demoblaze.com` |
| Feature | HTTP Method Validation & Error Handling; Request Payload Validation; Authorization & Access Control; Duplicate & Conflict Handling; Server Error & Boundary Condition Handling (5 features, combined into one ticket — negative/resilience companion to the existing `demoblaze-api-catalog-cart-auth` positive-path ticket) |
| Ticket / Story ID | demoblaze-api-error-handling |
| Epic | TBD — no formal Epic ID supplied; five feature descriptions submitted directly as SPEC input |
| Test Plan Version | 1.0 |
| Prepared By | TESTpal — Test Plan Generator (Stage 1) |
| Date | 2026-07-29 |
| Test Framework | Playwright + TypeScript (`api` project — no browser, see `api/**`) |
| Reviewed By | saratprem.chebiyyam@sailssoftware.com |
| Approved By | saratprem.chebiyyam@sailssoftware.com (proceed-as-draft) |
| Approved Date | 2026-07-29 |

> ✅ **HITL Gate A cleared** on 2026-07-29 by saratprem.chebiyyam@sailssoftware.com — explicit "ok" instruction in direct response to this plan's review request, approving as draft. The Section 2 discrepancies (status-code model split across routing/business-logic/crash layers, no cart authorization, two verified 500-crash defects) and the RQ-09/RQ-11/RQ-12 TBD gaps in Section 31 carry forward as-is, not resolved before approval. Stage 2 (Test Case Generator) may proceed.

---

## 2. Requirement Summary

Source: five feature descriptions supplied directly as SPEC input (no formal Jira/ADO ticket, BRD/FRD, or Gherkin file):

1. **HTTP Method Validation & Error Handling** — verify each endpoint responds correctly to its intended HTTP method and returns appropriate error codes (405 Method Not Allowed, 404 Not Found) for an unsupported method or non-existent endpoint.
2. **Request Payload Validation (Malformed / Missing Data)** — verify behavior when required fields are missing, empty, or malformed (blank username, `null` `prod_id`, invalid JSON syntax). Expected: 400 Bad Request or equivalent, not silent failures or 500s.
3. **Authorization & Access Control on Protected Endpoints** — verify endpoints requiring an authenticated session reject requests without a valid token/cookie (401/403), and that expired/tampered tokens are also rejected.
4. **Duplicate & Conflict Handling** — verify that creating a resource that already exists (duplicate signup username) returns a proper conflict response (400/409) with a clear error message, not a silent duplicate or misleading 200 OK.
5. **Server Error & Boundary Condition Handling** — verify resilience against edge-case/boundary inputs (long strings, special characters/SQLi-style payloads, wrong data types, out-of-range IDs). Expected: graceful 400/422, never an unhandled 500 exposing stack traces.

> ⚠ **Critical SPEC-vs-actual-implementation discrepancy (flagged, not silently corrected — anti-fabrication guardrail).** All five features are written assuming REST-idiomatic HTTP status-code semantics (405/404/400/401/403/409/422) for *every* failure mode. Live verification against `https://api.demoblaze.com` (read-only/minimal-footprint `curl` checks performed 2026-07-29 while drafting this plan) shows the AUT actually uses **two different, inconsistent failure-signaling mechanisms** depending on where the failure occurs:
>
> | Failure layer | Mechanism | Verified example |
> |---|---|---|
> | **Routing / transport layer** (wrong HTTP verb, unknown path, unparseable JSON) | Real, correct HTTP status codes — this layer matches the SPEC's expectations | `POST /entries` → **405**; `GET /addtocart` → **405**; `GET /nonexistentendpoint123` → **404**; malformed JSON body → **400** (generic Werkzeug HTML error page, not a JSON body) |
> | **Business logic layer** (missing fields, duplicate username, bad token, not-found resource) | Always **200 OK**, failure signaled via an `errorMessage` field in a JSON body — confirmed in `api/types/demoblazeApiTypes.ts` and `tests/api/api.001.spec.ts`, and re-confirmed live below | Missing signup fields → `200` `{"errorMessage":"Bad parameter, missing username or password"}`; duplicate signup → `200` `{"errorMessage":"This user already exist."}`; tampered `/check` token → `200` `{"errorMessage":"Bad parameter, token malformed."}`; out-of-range product id → `200` `{"errorMessage":"Not found."}` |
> | **Unhandled crashes** (wrong data type, empty required field in some paths) | Genuine, unmitigated **500 Internal Server Error** with a generic Werkzeug HTML stack-trace-style page — this is exactly the failure mode Feature 5 asks to verify does *not* happen, and it does | `POST /view` with `{"id":"abc"}` (string instead of number) → **500**; `POST /check` with `{"token":""}` (empty string) → **500** |
>
> This must be reconciled at Gate A. Test cases will assert the **actual verified status/body behavior** per failure layer above, not a blanket 4xx/format assumption — except where the observed behavior is itself the 500-crash defect Feature 5 was written to catch, which is asserted as a **known defect to be raised**, not accepted as correct.
>
> **Second critical finding — Feature 3's premise does not hold.** `POST /viewcart` with a completely fabricated, never-issued cookie string returns `200` `{"Items":[]}` — there is **no server-side authorization/session validation on cart endpoints at all**. The API's cart model is cookie-*identified* (any client-supplied string works as a bucket key), not cookie/token-*authenticated*. There is no verified mechanism to produce a distinctly "expired" token (only "malformed" was reproducible), so RQ-09 (expired token rejection) is marked **TBD**, not fabricated. This is a scope-narrowing finding, not a defect — the AUT was never designed with real access control on these endpoints, and no test can prove a 401/403 that the system is not built to return.

---

## 3. Business Objective

- Harden and document the Demoblaze API's negative-path/error-handling behavior, complementary to the existing positive-path coverage in `demoblaze-api-catalog-cart-auth` and `tests/api/api.001.spec.ts`.
- Surface the real (verified, not assumed) failure-signaling model of the AUT so downstream automation asserts against actual behavior instead of a REST-idiomatic assumption that doesn't hold.
- Broader business value (compliance, risk reduction from the two verified defects) — **TBD**, not stated in the SPEC.

---

## 4. Scope

### 4.1 In Scope

- **HTTP method validation**: wrong-verb requests against known endpoints (e.g. `GET /addtocart`, `POST /entries`) and requests to non-existent paths — asserting the verified real status codes (405/404).
- **Payload validation**: missing/blank required fields on `POST /signup`; malformed JSON syntax on a request body; `null`/wrong-type values on mutation endpoints (e.g. `prod_id`) — asserting the verified actual behavior per failure layer (Section 2).
- **Authorization/session behavior on cart endpoints**: documenting and asserting the verified absence of session validation (Section 2), rather than testing a 401/403 contract that does not exist. Tampered-token behavior on `/check` (business-logic `errorMessage`, not a status code).
- **Duplicate/conflict handling**: repeat `/signup` with an already-registered username, asserting the verified `200` + `errorMessage` behavior.
- **Boundary/server-error conditions**: wrong data type where a number is expected (`/view` with string `id`), out-of-range numeric IDs, empty required token field — asserting verified behavior, including flagging the two confirmed 500-crash defects as defects, not accepted behavior.

### 4.2 Out of Scope

- Extremely long strings (Feature 5) and SQL-injection-style payloads (Feature 5) — **not exercised live during planning** to avoid creating oversized or malformed persistent junk data on the shared public demo; exact assertions deferred to Stage 5b with a bounded-length, non-destructive probe (see Section 13, Section 17 R-risk).
- "Expired" session token rejection (RQ-09) — no verified mechanism exists to produce a token that is expired-but-not-malformed within this planning session; **TBD**, needs reviewer input (does the AUT's token even expire, or was Feature 3's "expired" language written against an assumed-but-nonexistent capability?).
- Filing/tracking the two verified 500-crash defects in an external defect tracker — this plan documents them; filing is a human action (Section 21).
- Any endpoint or feature not named in Section 4.1 (e.g. `/deletecart`, cart quantity/total math — already scoped out in the sibling `demoblaze-api-catalog-cart-auth` ticket).
- Non-functional testing: load/performance, penetration/security testing beyond the specific SQLi-*string* probes named in Feature 5, accessibility, localization.

---

## 5. Test Objectives

- Confirm wrong-HTTP-verb and unknown-path requests return the correct transport-layer status code (405/404) — verified true for all sampled cases.
- Confirm missing/malformed payload fields are rejected in some well-defined way — verified as `200` + `errorMessage` for business-logic fields, and a real `400` for unparseable JSON syntax — and are **not** silently accepted, except where a genuine gap is found (see `addtocart` null `prod_id` finding below).
- Document, rather than assume, the AUT's actual authorization model for cart endpoints, since no session/token check exists to test.
- Confirm duplicate signup is rejected via `errorMessage`, and assert the exact message text as a regression guard.
- Confirm wrong-data-type and empty-required-field inputs either fail gracefully or, where they don't (the two verified 500s), are captured as explicit defect-reproducing regression tests — not swept under a "boundary case" label.
- Achieve automation coverage for all net-new scenarios using the existing `DemoblazeApiClient` / `BaseApiClient` pattern.

---

## 6. Test Items / Modules

| Module | Description |
|---|---|
| Method/Routing Validation | Wrong-verb and unknown-path requests across representative endpoints |
| Payload Validation | Missing/blank/malformed fields on `/signup`, `/addtocart` |
| Authorization / Session Behavior | `/viewcart` with no valid session; `/check` with tampered/empty token |
| Conflict Handling | Duplicate `/signup` |
| Boundary / Server Error | Wrong data type and out-of-range values on `/view`; empty token on `/check` |

---

## 7. Features to be Tested

- Correct 405/404 responses for method/path mismatches.
- Rejection behavior (whatever its actual shape) for missing/blank signup fields and malformed JSON.
- Actual (documented, not assumed) behavior of cart endpoints under no/fabricated session.
- Duplicate-signup conflict messaging.
- Boundary/wrong-type input handling, explicitly including the two verified 500-crash defects as regression-guard candidates.

---

## 8. Features Not to be Tested

- Long-string and SQL-injection-style payload exact assertions — deferred to Stage 5b (Section 4.2).
- Expired-token rejection — TBD pending reviewer input on whether the capability exists at all.
- Filing defects in an external tracker — human action, not an automation task.
- Anything covered by the sibling `demoblaze-api-catalog-cart-auth` ticket's existing scope.

---

## 9. Test Types

| Test Type | Applicable | Notes |
|---|---|---|
| Functional Testing | Yes | Method/routing validation, payload validation |
| API Testing | Yes | Primary test type for this ticket |
| Negative Testing | Yes | Primary focus — this entire ticket is negative-path coverage |
| Boundary Testing | Yes | Wrong data type, out-of-range ID, empty token |
| Regression Testing | Yes | Tagged `@api` + `@regression`; the two verified 500-crash cases become permanent regression guards |
| Contract/Schema Testing | Partial | Asserting actual status/body shape per failure layer (Section 2), not a single assumed contract |
| Security Testing | Partial | SQL-injection-*style* string probes (Feature 5) are a lightweight input-hardening check, not a full penetration test |
| Performance Testing | No | Explicitly out of scope per shared-environment guardrail |
| Cross-Browser / Device / Localization | N/A | API-only ticket, no browser involved |

---

## 10. Test Environment

| Item | Details |
|---|---|
| API Base URL | `https://api.demoblaze.com` (default `apiBaseURL` in `playwright.config.ts`, overridable via `API_BASE_URL` env var) |
| Environment Type | Public demo / shared environment — API layer, no browser |
| Test Framework | Playwright Test + TypeScript, `api` project (`testDir: './tests/api'`, no browser) |
| Client Layer | `api/clients/BaseApiClient.ts` (typed `ApiResponse<T>`, GET retries ≤2× on `>=500`, other verbs never auto-retry) + `api/clients/DemoblazeApiClient.ts` |
| Node.js Version | TBD — no `engines` field in `package.json` |
| Configuration | `.env` via `dotenv` — `API_BASE_URL`, `RETRIES`, `WORKERS` (confirmed in `playwright.config.ts`) |
| Execution Modes | Local (`npm run test:api`), CI (`.github/workflows/playwright.yml` present) |
| Known live-environment facts | (1) `api.demoblaze.com` has been observed returning intermittent `500`s independent of request correctness (per `CLAUDE.md`) — do not conflate a transient 500 with the two *reproducible* 500-crash defects verified in Section 2. (2) The two verified 500 crashes (non-numeric `/view` id, empty-string `/check` token) were reproduced on 2026-07-29 and are believed deterministic, not intermittent — Stage 5b should re-confirm determinism before asserting on them as regression guards. |

---

## 11. Browser Coverage

Not applicable — API-only ticket (`api` Playwright project runs with no browser).

---

## 12. Device Coverage

Not applicable — API-only ticket.

---

## 13. Test Data Requirements

| Data Item | Description | Source |
|---|---|---|
| Signup credentials (fresh) | Dynamically generated username/password, for duplicate-signup and payload-validation scenarios | `utils/randomData.ts` → `generateCredentials()` (existing, reusable) |
| Duplicate-username case | Signup twice with the same generated username | Derive from `generateCredentials()`, reuse across two calls — verified live: second call returns `200` `{"errorMessage":"This user already exist."}` |
| Missing-field signup payload | `{}` (no username/password) | Test-authored constant — verified live: `200` `{"errorMessage":"Bad parameter, missing username or password"}` |
| Malformed JSON body | Deliberately invalid JSON syntax (e.g. unquoted keys) | Test-authored constant — verified live: real `400` Bad Request, HTML body (not JSON) |
| `addtocart` with `null prod_id` | `{ id, cookie, prod_id: null, flag: false }` | Test-authored constant — verified live: `200`, empty JSON body, **no `errorMessage`** — item accepted with a null product id and no validation error; flagged as a gap against the SPEC's own "not silent failures" expectation (see Section 17, R7) |
| Fabricated/never-issued cart cookie | Random string never produced by a real signup/session | Test-authored constant — verified live: `200` `{"Items":[]}`, no rejection — documents the no-authorization finding (Section 2) |
| Tampered `/check` token | Random string, not a real issued token | Test-authored constant — verified live: `200` `{"errorMessage":"Bad parameter, token malformed."}` |
| Empty `/check` token | `{ "token": "" }` | Test-authored constant — verified live: **500 Internal Server Error** (defect) |
| Non-numeric `/view` id | `{ "id": "abc" }` | Test-authored constant — verified live: **500 Internal Server Error** (defect) |
| Out-of-range `/view` id | `{ "id": 999999999 }` | Test-authored constant — verified live: `200` `{"errorMessage":"Not found."}` (graceful — not a defect) |
| Wrong-verb requests | `GET /addtocart`, `POST /entries` | Verified live: both return `405` |
| Unknown-path request | e.g. `GET /nonexistentendpoint123` | Verified live: `404` |
| Long-string / SQLi-style payloads | Exact strings **TBD** — to be authored at Stage 5b as bounded-length, non-destructive probes | Not fabricated here; see Section 4.2 |

---

## 14. Entry Criteria

- `https://api.demoblaze.com` is reachable.
- Playwright framework installed and executable (`npx playwright test --project=api` runs).
- This Test Plan reviewed and approved (Gate A), including explicit sign-off on the two SPEC-vs-actual discrepancies in Section 2 (status-code model, no cart authorization), before Stage 2 consumes it.

---

## 15. Exit Criteria

- 100% of planned test cases (from the 5 features, scoped per Section 4) executed.
- All High-priority scenarios (method/path validation, payload validation, duplicate signup, the two verified 500-crash regression guards) passed or explicitly triaged.
- The two verified 500-crash findings raised as defects (human action) or explicitly accepted as known/won't-fix by the reviewer — not silently dropped.
- Automation suite green for two consecutive CI runs, excluding known intermittent live-environment 500s (Section 10) — distinguished from the two deterministic 500-crash regression guards, which are *expected* to keep failing until fixed, or are asserted as "currently reproduces defect X" rather than "passes."

---

## 16. Assumptions

- The reviewer's decision to combine all 5 features into a single ticket (`demoblaze-api-error-handling`) holds; no further ticket-splitting is expected downstream.
- This ticket is the negative-path companion to the existing `demoblaze-api-catalog-cart-auth` ticket and shares its client layer, test data helpers, and environment facts.
- No dedicated QA/sandbox environment exists; all testing runs against the live public API, consistent with the sibling ticket and `CLAUDE.md`.
- The two verified 500 crashes are treated as genuine framework/AUT defects worth a regression guard (asserting the current, unwanted behavior so a future fix is caught as a test change, not silently). **TBD** — reviewer may instead prefer these are only documented, not asserted as permanent regression tests; to be confirmed at Gate A.
- "Authorization & Access Control" (Feature 3) cannot be tested as originally envisioned because the AUT has no such control on the endpoints in scope; the reviewer accepts the narrowed scope in Section 4.2, or requests it be raised as a product/security finding instead — **TBD**, Gate A decision.

---

## 17. Risks

| # | Risk | Likelihood | Impact |
|---|---|---|---|
| R1 | SPEC assumes uniform REST status-code semantics across all 5 features; actual AUT splits behavior across three different layers (routing/business-logic/crash) — a naive implementation against the literal SPEC text would assert the wrong status code almost everywhere except method/routing checks | High | High |
| R2 | Feature 3 (Authorization & Access Control) has no corresponding server-side control to test — risk of either fabricating a 401/403 assertion that will never pass, or under-communicating to the reviewer that this feature is effectively unimplementable as written | High | High |
| R3 | The two verified 500-crash defects, if asserted as permanent regression tests, will fail the moment the AUT is fixed — needs an explicit reviewer decision on whether that's the intended semantics (Section 16) | Medium | Medium |
| R4 | `api.demoblaze.com` returns intermittent 500s independent of request correctness (confirmed live-dependency fact, Section 10) — risk of conflating a transient 500 with the two deterministic 500-crash defects if not carefully distinguished | Medium | Medium |
| R5 | No dedicated QA/sandbox environment — all calls hit the live shared public API; repeated signup calls must stay minimal per the shared-environment guardrail | Medium | Medium |
| R6 | Long-string/SQLi-style payload exact behavior is unconfirmed (deliberately not probed live during planning to avoid persistent junk data) — risk of Stage 5b either skipping this or fabricating an assertion without a live check | Medium | Medium |
| R7 | `addtocart` with `null prod_id` was verified to be silently accepted (`200`, no error) rather than rejected — if this is a genuine defect, asserting the current behavior as "expected" would encode a bug into the regression suite | Medium | High |

---

## 18. Risk Mitigation Plan

| Risk | Mitigation |
|---|---|
| R1 | Test cases assert per-layer verified behavior (Section 2 table), not a blanket 4xx assumption; Gate A reviewer explicitly confirms this reconciliation before Stage 2 |
| R2 | Section 4.2 narrows Feature 3 to "document the verified absence of authorization," and the Requirement Traceability Matrix (Section 31) reflects this rather than inventing a passing 401/403 test |
| R3 | Gate A reviewer explicitly decides whether the two verified 500s become permanent "defect-reproducing" regression tests (expected-fail-until-fixed, clearly labeled) or documentation-only findings |
| R4 | Rely on `BaseApiClient`'s existing GET retry-on-≥500 behavior for transient noise; Stage 5b re-confirms the two crash cases are deterministic (reproduce 2–3× before treating as a stable regression guard) |
| R5 | Limit signup mutations to the minimum needed per scenario (one signup per test, duplicate-signup reusing the same generated user), consistent with `purchase.001.spec.ts`'s and the sibling ticket's existing precedent |
| R6 | Stage 5b authors a bounded-length (not unbounded) long string and a non-destructive SQLi-style string (e.g. `' OR '1'='1`, no actual injection risk against this AUT) and confirms behavior live before asserting a specific shape |
| R7 | Flag explicitly at Gate A rather than silently asserting the current silent-acceptance behavior as correct; reviewer decides whether this becomes a defect-reproducing regression test (like R3) or is raised as a product defect instead |

---

## 19. Dependencies

- Availability and stability of `https://api.demoblaze.com` (external, uncontrolled, known-intermittent-500s per Section 10).
- Existing `api/clients/BaseApiClient.ts` and `api/clients/DemoblazeApiClient.ts` (already implemented — most non-defect scenarios in this ticket are expected Full/Partial Reuse territory, to be confirmed at Stage 4).
- `utils/randomData.ts` (`generateCredentials`) for test data generation.
- The sibling `demoblaze-api-catalog-cart-auth` ticket's existing findings (shared field names, shared client methods) — this ticket builds on, and should stay consistent with, that plan's discrepancy notes.
- GitHub Actions workflow (`.github/workflows/playwright.yml`) for CI execution.

---

## 20. Test Deliverables

- This Test Plan (`docs/Test Plans/demoblaze-api-error-handling_test_plan.md`).
- Detailed test cases (Stage 2 output — pending Gate A approval).
- Normalized test cases and Reuse Mapping Report (Stages 3–4).
- Automated API spec additions (Stage 5b output, `tests/api/**`).
- Execution reports (Playwright HTML, JUnit XML, JSON — already configured in `playwright.config.ts`).

---

## 21. Defect Management Process

| Step | Description |
|---|---|
| Logging | Defect tracking tool — **TBD** (not specified) |
| Severity Classification | Critical (unhandled 500 crash exposing a stack-trace-style page — the two verified findings), High (silent acceptance of invalid data, e.g. `addtocart` null `prod_id`), Medium (status-code mismatch vs. SPEC where the underlying behavior is otherwise correct, e.g. duplicate signup returning `200`+`errorMessage` instead of `409`), Low (cosmetic/logging) |
| Triage | TBD |
| Retest | Fixed defects retested; linked automated test added/updated as regression guard; known intermittent live-environment 500s (Section 10) tracked separately, not triaged as code defects |

---

## 22. Test Execution Strategy

1. **Method/Routing Validation** — `GET /addtocart`, `POST /entries` (wrong verb), `GET /nonexistentendpoint123` (unknown path) → assert verified 405/404.
2. **Payload Validation** — `POST /signup` with `{}` → assert `200`+`errorMessage`; malformed JSON body → assert real `400`; `POST /addtocart` with `null prod_id` → assert current (silent-acceptance) behavior, flagged per R7.
3. **Authorization/Session Behavior** — `POST /viewcart` with a fabricated cookie → assert `200`+`{"Items":[]}` (documents absence of authorization, per Section 2); `POST /check` with a tampered token → assert `200`+`errorMessage`; expired-token case marked Blocked/TBD (RQ-09).
4. **Conflict Handling** — `POST /signup` twice with the same generated username → assert second call's `errorMessage`.
5. **Boundary/Server Error** — `POST /view` with `{"id":"abc"}` → assert (and flag) the verified 500; `POST /view` with `{"id":999999999}` → assert graceful `200`+`errorMessage`; `POST /check` with `{"token":""}` → assert (and flag) the verified 500; long-string/SQLi-style probes deferred to Stage 5b (R6).

All scenarios tagged `@api` (existing project convention) plus `@regression`.

---

## 23. Automation Strategy

| Aspect | Approach |
|---|---|
| Framework | Playwright Test + TypeScript, `api` project |
| Design Pattern | Existing `BaseApiClient` / `DemoblazeApiClient` client layer; only extend if Stage 4 confirms a genuinely net-new call is needed (e.g. a raw wrong-verb/unknown-path helper not currently exposed by the typed client methods) |
| Data-Driven | Parameterize method/routing checks over `[{method: GET, path: /addtocart}, {method: POST, path: /entries}]`-style table |
| Fixtures | `api/fixtures/apiFixture.ts` (typed client injection), `registerApiHooks` from `api/fixtures/apiHooks.ts` |
| Tagging | `@api`, `@regression` |
| Reuse | Section 19/Stage 4 to confirm, but expected to be a mix of Full Reuse (existing client methods for payload/conflict/boundary cases) and Net New (raw-request helpers for method/routing checks, which the typed client doesn't currently model since it only issues correctly-shaped requests) |

---

## 24. Reporting Strategy

- Playwright HTML Report (`playwright-report/`) — already configured.
- JUnit XML (`test-results/junit.xml`) — already configured.
- JSON Report (`test-results/results.json`) — already configured.

---

## 25. Logging Strategy

- Use the existing `api/clients/BaseApiClient.ts` request/response logging (`logger.api.*`) — already active for every client call, no additional wiring needed.
- Log the exact verified status/body pairing for each defect-reproducing test at assertion time, so a future fix (behavior change) is visible in the failure message, not just a bare assertion mismatch.

---

## 26. Screenshot Strategy

- Not applicable — API-only project has no browser/page context.

---

## 27. Trace Collection Strategy

- Not applicable in the same sense as UI traces; standard request/response logging via `logger.api.*` serves as the API equivalent.

---

## 28. Retry Strategy

- Current config: `retries` from `RETRIES` env var, default `0` (confirmed in `playwright.config.ts`).
- `BaseApiClient` retries GET calls up to 2× on `>=500` regardless of Playwright-level retry config; POST/PUT/PATCH/DELETE never auto-retry. **Caution**: the two verified 500-crash cases use POST (`/view`, `/check`), so they will not be masked by GET's auto-retry — good for defect visibility, but confirm this doesn't interact badly with Playwright's own `retries` config inflating a deterministic-crash test into a flaky-looking one (should fail consistently, not intermittently, if truly deterministic).

---

## 29. Parallel Execution Strategy

- Current config: `fullyParallel: false`, `workers` from `WORKERS` env var, default `1` (confirmed in `playwright.config.ts`).
- All scenarios in this ticket use either read-only requests or a single, isolated generated username — structurally parallel-safe if the global config changes — **TBD**, no change recommended without a broader decision.

---

## 30. Test Metrics

| Metric | Definition / Target |
|---|---|
| Test Case Execution Rate | Executed / Planned — target 100% |
| Pass Rate | Passed / Executed — target 100% for High-priority scenarios, excluding the two defect-reproducing tests (Section 15) which are expected to fail until a fix ships, per whatever labeling convention Gate A settles on |
| Automation Coverage | Target 100% of in-scope scenarios (Section 4.1) automatable with the existing or minimally extended client |
| Flakiness Rate | Tests passing only on retry / total — tracked separately from known intermittent live-environment 500s (R4) and separately from the two *deterministic* crash findings |

---

## 31. Requirement Traceability Matrix

| Req ID | Requirement | Test Case ID | Scenario | Type | Priority | Automation |
|---|---|---|---|---|---|---|
| RQ-01 | Wrong-verb request to a POST-only endpoint returns 405 | TC-01 | `GET /addtocart` → assert `405` | Negative | High | Yes |
| RQ-02 | Wrong-verb request to a GET-only endpoint returns 405 | TC-02 | `POST /entries` → assert `405` | Negative | High | Yes |
| RQ-03 | Request to a non-existent endpoint returns 404 | TC-03 | `GET /nonexistentendpoint123` → assert `404` | Negative | High | Yes |
| RQ-04 | Signup with missing/blank required fields is rejected | TC-04 | `POST /signup` `{}` → assert `200` + `errorMessage: "Bad parameter, missing username or password"` (status-code mismatch vs. SPEC noted, see Section 2) | Negative | High | Yes |
| RQ-05 | Malformed JSON request body returns 400 | TC-05 | `POST /signup` with invalid JSON syntax → assert real `400` | Negative | High | Yes |
| RQ-06 | `addtocart` with `null prod_id` is validated, not silently accepted | TC-06 | `POST /addtocart` `{prod_id: null, ...}` → **current verified behavior is `200`, no error — flagged as a defect candidate (R7), not asserted as "correct" without Gate A sign-off** | Negative | High | TBD (pending Gate A decision on defect-reproducing vs. documentation-only) |
| RQ-07 | Cart endpoints reject requests without a valid session | TC-07 | `POST /viewcart` with a fabricated cookie → **verified: no rejection occurs (`200` + `{"Items":[]}`); test documents this absence of authorization rather than asserting a 401/403 that cannot occur** | Negative | High | Yes (as a documentation/characterization test, not a pass/fail against the SPEC's literal expectation) |
| RQ-08 | Tampered session token is rejected | TC-08 | `POST /check` with a fabricated token → assert `200` + `errorMessage: "Bad parameter, token malformed."` (status-code mismatch vs. SPEC noted) | Negative | Medium | Yes |
| RQ-09 | Expired session token is rejected | TC-09 | **Blocked/TBD** — no verified mechanism to produce a token that is expired-but-not-malformed; requires reviewer input on whether tokens expire at all | TBD | TBD | TBD |
| RQ-10 | Duplicate signup (already-registered username) returns a conflict response | TC-10 | `POST /signup` twice with same username → assert second call's `200` + `errorMessage: "This user already exist."` (status-code mismatch vs. SPEC noted) | Negative | High | Yes |
| RQ-11 | Extremely long strings in signup fields are handled gracefully | TC-11 | **Blocked/TBD** — exact long-string value and expected behavior not verified live during planning (Section 4.2/R6); to be confirmed at Stage 5b | TBD | TBD | TBD |
| RQ-12 | Special characters / SQL-injection-style payloads in signup fields are handled gracefully | TC-12 | **Blocked/TBD** — exact payload and expected behavior not verified live during planning (Section 4.2/R6); to be confirmed at Stage 5b with a non-destructive probe | TBD | TBD | TBD |
| RQ-13 | Invalid data type (string) where a number is expected does not crash the server | TC-13 | `POST /view` `{"id":"abc"}` → **verified: 500 Internal Server Error — this is the exact failure mode the SPEC says should never happen; asserted as a defect-reproducing regression test pending Gate A labeling decision (R3)** | Negative/Boundary | Critical | Yes |
| RQ-14 | Product ID far outside the valid range is handled gracefully | TC-14 | `POST /view` `{"id":999999999}` → assert `200` + `errorMessage: "Not found."` (graceful — confirmed not a defect) | Boundary | Medium | Yes |
| RQ-15 | Empty required token field does not crash the server | TC-15 | `POST /check` `{"token":""}` → **verified: 500 Internal Server Error — second defect-reproducing case, same R3 labeling decision applies** | Negative/Boundary | Critical | Yes |

> Req IDs (`RQ-##`) are assigned here for the first time since no upstream ticket/story with existing IDs was supplied — flagged per the Traceability Contract for confirmation at Gate A. RQ-09, RQ-11, and RQ-12 are deliberately left Blocked/TBD rather than fabricated — see Section 4.2 and Section 17 (R2, R6). RQ-06, RQ-13, and RQ-15 surface verified defects (silent acceptance / unhandled 500s); whether these become permanent "expected-fail" regression tests or documentation-only findings is an explicit Gate A decision (R3, R7), not assumed here.

---

## 32. Test Summary Template

```markdown
# Test Summary Report — Demoblaze API: Method Validation, Payload Validation, Authorization, Conflict & Boundary/Error Handling

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
| Defects Raised (Critical/High/Medium/Low) | <c>/<h>/<m>/<l> |
| Defects Open | <n> |
| Flaky Tests (excl. known intermittent live 500s) | <n> |
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

- Resolve RQ-09 (expired-token rejection) once a reviewer confirms whether the AUT's tokens expire at all, and if so, how to produce one for testing.
- Resolve RQ-11/RQ-12 (long-string/SQLi-style payloads) with a live-verified Stage 5b probe rather than leaving them Blocked.
- File the two verified 500-crash defects (RQ-13/RQ-06 `null prod_id` silent acceptance/RQ-15) with the product team once Gate A confirms severity/ownership.
- Revisit RQ-07's scope if the AUT ever adds real session validation to cart endpoints — the current "documents the absence" framing would then need to become a real positive/negative authorization test.
- Consider whether the sibling `demoblaze-api-catalog-cart-auth` ticket's Test Plan should be updated to cross-reference these newly verified defects, since both tickets share the same client/endpoints.
