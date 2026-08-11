# Test Cases — Demoblaze API: Method Validation, Payload Validation, Authorization, Conflict & Boundary/Error Handling

<!-- Generated-by: Test Case Generator Agent (Stage 2) · demoblaze-api-error-handling · 2026-07-29 · AI-generated, human review required -->
> Pipeline stage: 2 — Test Case Generator | Ticket: **demoblaze-api-error-handling** | Source Test Plan: [`docs/Test Plans/demoblaze-api-error-handling_test_plan.md`](../Test%20Plans/demoblaze-api-error-handling_test_plan.md) (Gate A cleared 2026-07-29 by saratprem.chebiyyam@sailssoftware.com, approved as draft) | Version: 1.0 | Date: 2026-07-29

Every case below expands one row of the source Test Plan's Requirement Traceability Matrix (Section 31) — no scope beyond those 15 rows has been added. `Req ID` / `Test Case ID` values are carried unchanged from the Test Plan.

---

## Test Case Summary Table

| Test Case ID | Title | Type | Priority | Automation Candidate |
|---|---|---|---|---|
| TC-01 | Wrong-verb GET on a POST-only endpoint returns 405 | Negative | P1 | Yes |
| TC-02 | Wrong-verb POST on a GET-only endpoint returns 405 | Negative | P1 | Yes |
| TC-03 | Request to a non-existent endpoint returns 404 | Negative | P1 | Yes |
| TC-04 | Signup with missing username and password fields | Negative | P1 | Yes |
| TC-05 | Malformed JSON syntax in request body returns 400 | Negative | P1 | Yes |
| TC-06 | Add-to-cart with `null prod_id` is not validated (defect candidate) | Negative | P1 | TBD |
| TC-07 | Cart view with a fabricated/never-issued cookie is not rejected (characterization) | Negative | P1 | Yes |
| TC-08 | Tampered session token to `/check` returns a body-level error | Negative | P2 | Yes |
| TC-09 | Expired session token rejection | Negative | TBD | TBD (Blocked) |
| TC-10 | Duplicate signup with an already-registered username | Negative | P1 | Yes |
| TC-11 | Extremely long strings in signup fields | Boundary | TBD | TBD (Blocked) |
| TC-12 | SQL-injection-style payload in signup fields | Boundary | TBD | TBD (Blocked) |
| TC-13 | Non-numeric product id crashes `/view` with 500 (defect) | Boundary | P1 | Yes |
| TC-14 | Out-of-range product id handled gracefully by `/view` | Boundary | P2 | Yes |
| TC-15 | Empty token crashes `/check` with 500 (defect) | Boundary | P1 | Yes |

---

## Module: Method/Routing Validation

## TC-01 — Wrong-verb GET on a POST-only endpoint returns 405

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-01 |
| Module | Method/Routing Validation |
| Type | API |
| Preconditions | None — no account, session, or seeded data required |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | GET /addtocart |
| Headers | Content-Type: application/json |
| Request Body | (none — GET request) |

**Test Steps:**

1. Send a GET request to `/addtocart` with no body

**Expected Result:**

1. Response status code is `405` (Method Not Allowed) — verified live 2026-07-29 against `https://api.demoblaze.com`

**Postconditions:** No state change — request is rejected before any cart mutation occurs.

**Automation Candidate:** Yes — Net New. No existing `DemoblazeApiClient` method issues a wrong-verb request (its methods only call the correct verb for each endpoint); exact client-level design (e.g., a raw-request test helper) is a Stage 4/5b decision, not fabricated here.

**Notes:** Routing-layer failure — confirmed to use a real HTTP status code, unlike the business-logic layer (see Test Plan Section 2).

---

## TC-02 — Wrong-verb POST on a GET-only endpoint returns 405

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-02 |
| Module | Method/Routing Validation |
| Type | API |
| Preconditions | None |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /entries |
| Headers | Content-Type: application/json |
| Request Body | `{}` |

**Test Steps:**

1. Send a POST request to `/entries` with body `{}`

**Expected Result:**

1. Response status code is `405` (Method Not Allowed) — verified live 2026-07-29

**Postconditions:** No state change.

**Automation Candidate:** Yes — Net New, same rationale as TC-01 (existing `getEntries()` only issues GET).

**Notes:** None.

---

## TC-03 — Request to a non-existent endpoint returns 404

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-03 |
| Module | Method/Routing Validation |
| Type | API |
| Preconditions | None |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | GET /nonexistentendpoint123 |
| Headers | Content-Type: application/json |
| Request Body | (none) |

**Test Steps:**

1. Send a GET request to `/nonexistentendpoint123`

**Expected Result:**

1. Response status code is `404` (Not Found) — verified live 2026-07-29

**Postconditions:** No state change.

**Automation Candidate:** Yes — Net New. No client method targets an intentionally-unknown path; likely implemented as a one-off raw request rather than a new domain method, per Stage 4/5b.

**Notes:** None.

---

## Module: Payload Validation

## TC-04 — Signup with missing username and password fields

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-04 |
| Module | Payload Validation |
| Type | API |
| Preconditions | None |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /signup |
| Headers | Content-Type: application/json |
| Request Body | `{}` |

**Test Steps:**

1. Send a POST request to `/signup` with body `{}` (no `username`/`password`)

**Expected Result:**

1. Response status code is `200`; response body is `{"errorMessage":"Bad parameter, missing username or password"}` — verified live 2026-07-29. **Note:** the source SPEC expects a `400`; the AUT's business-logic layer never uses non-200 status codes (Test Plan Section 2) — this expected result reflects actual verified behavior, not the SPEC's literal wording.

**Postconditions:** No account created.

**Automation Candidate:** Yes — Net New. Existing `DemoblazeApiClient.signup(username, password)` requires both arguments; a missing-field call needs either a new overload/raw-body variant or a direct `post('/signup', {})` bypass, a Stage 4/5b design decision.

**Notes:** None.

---

## TC-05 — Malformed JSON syntax in request body returns 400

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-05 |
| Module | Payload Validation |
| Type | API |
| Preconditions | None |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /signup |
| Headers | Content-Type: application/json |
| Request Body | Deliberately invalid JSON syntax (e.g. `{username: bad json`) |

**Test Steps:**

1. Send a POST request to `/signup` with a body that is not syntactically valid JSON

**Expected Result:**

1. Response status code is `400` (Bad Request); response body is a generic HTML error page (not JSON) — verified live 2026-07-29. This is a transport-layer (Werkzeug) rejection that occurs before the request reaches application/business logic.

**Postconditions:** No account created.

**Automation Candidate:** Yes — Net New. Requires sending a raw, non-JSON-serialized string body, which the typed `signup()` method cannot do (it always serializes a valid object); needs a raw-request capability.

**Notes:** Response is HTML, not JSON — the automated assertion must check `rawText`/`headers['content-type']` rather than parsing `body` as JSON, per `ApiResponse`'s shape (`api/clients/BaseApiClient.ts`).

---

## TC-06 — Add-to-cart with `null prod_id` is not validated (defect candidate)

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-06 |
| Module | Payload Validation |
| Type | API |
| Preconditions | None — no signup/login required; endpoint accepts an arbitrary cookie/id pair |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /addtocart |
| Headers | Content-Type: application/json |
| Request Body | `{"id":"<generated cart item id>","cookie":"<generated cookie>","prod_id":null,"flag":false}` |

**Test Steps:**

1. Send a POST request to `/addtocart` with `prod_id` set to `null`

**Expected Result:**

1. **Verified actual behavior (2026-07-29):** response status code is `200`; response body contains no `errorMessage` — the request is silently accepted with no validation error, contradicting the SPEC's explicit "not silent failures" expectation. **Whether this expected result should be asserted as "current behavior" (defect-reproducing test) or the case should instead assert a corrected `400`/`errorMessage` response is an open Gate A/reviewer decision (Test Plan Section 17, R7) — not resolved here.**

**Postconditions:** A cart line item with a `null` product id may now exist under the generated cookie — cleanup via `deleteCartItem` recommended if the test executes the mutation.

**Automation Candidate:** TBD — pending the reviewer decision above on which behavior to assert. If proceeding as a defect-reproducing test: existing `DemoblazeApiClient.addToCart()` (Full Reuse, called with `productId: null as unknown as number`, which requires a type-signature accommodation — flag at Stage 4).

**Notes:** This case's automation approach depends on a product decision, not a testing one — flagged rather than defaulting silently to either option.

---

## Module: Authorization / Session Behavior

## TC-07 — Cart view with a fabricated/never-issued cookie is not rejected (characterization)

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-07 |
| Module | Authorization / Session Behavior |
| Type | API |
| Preconditions | None — deliberately no signup/login/addtocart precedes this call, to test session-less access |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /viewcart |
| Headers | Content-Type: application/json |
| Request Body | `{"cookie":"totally-made-up-nonexistent-cookie","flag":false}` |

**Test Steps:**

1. Send a POST request to `/viewcart` using a cookie value that was never produced by any prior signup, login, or cart mutation

**Expected Result:**

1. **Verified actual behavior (2026-07-29):** response status code is `200`; response body is `{"Items":[]}` — no authorization/session-validation rejection occurs. This test **documents/characterizes** the AUT's actual (no-authorization) behavior; it does not and cannot assert the SPEC's originally expected `401`/`403`, because no such server-side control exists to test (Test Plan Section 2, second finding).

**Postconditions:** No state change (an empty cart view for an unused cookie is not a mutation).

**Automation Candidate:** Yes — Full Reuse of existing `DemoblazeApiClient.viewCart(cookie, loggedIn)`, called with a locally-generated random cookie that is never registered via `addToCart` first.

**Notes:** If the reviewer wants this scenario tracked as a security/product finding rather than a "passing" automated test, retitle/relabel at Stage 3 (Normalizer) or Stage 6 rather than silently asserting a false 401/403 expectation.

---

## TC-08 — Tampered session token to `/check` returns a body-level error

| Field | Value |
|---|---|
| Priority | P2 |
| Req ID | RQ-08 |
| Module | Authorization / Session Behavior |
| Type | API |
| Preconditions | None |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /check |
| Headers | Content-Type: application/json |
| Request Body | `{"token":"totally-tampered-fake-token-xyz"}` |

**Test Steps:**

1. Send a POST request to `/check` with a token string that was never issued by `/login`

**Expected Result:**

1. Response status code is `200`; response body is `{"errorMessage":"Bad parameter, token malformed."}` — verified live 2026-07-29. **Note:** the SPEC expects a `401`; actual rejection is signaled via `errorMessage` in a `200` body (Test Plan Section 2), consistent with the AUT's business-logic-layer pattern.

**Postconditions:** No state change.

**Automation Candidate:** Yes — Full Reuse of existing `DemoblazeApiClient.checkToken(token)`.

**Notes:** None.

---

## TC-09 — Expired session token rejection

| Field | Value |
|---|---|
| Priority | TBD |
| Req ID | RQ-09 |
| Module | Authorization / Session Behavior |
| Type | API |
| Preconditions | TBD — would require a token that is valid-but-expired, distinct from "malformed" |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /check |
| Headers | Content-Type: application/json |
| Request Body | TBD |

**Test Steps:**

1. **Blocked** — no verified mechanism exists to produce a token that is expired-but-not-malformed. Only "malformed" (TC-08) was reproducible during planning. Executing this case requires either (a) a reviewer confirming the AUT's tokens actually expire and how to obtain one in that state, or (b) descoping this row as not applicable to this AUT.

**Expected Result:**

1. TBD — cannot be determined without a live sample of a genuinely expired (not malformed) token.

**Postconditions:** TBD.

**Automation Candidate:** TBD (Blocked) — cannot be scoped until the precondition above is resolved.

**Notes:** Carried forward from Test Plan Section 4.2/33 (Future Enhancements) — not fabricated here.

---

## Module: Conflict Handling

## TC-10 — Duplicate signup with an already-registered username

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-10 |
| Module | Conflict Handling |
| Type | API |
| Preconditions | A username has already been successfully registered via a prior `/signup` call in this test |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /signup |
| Headers | Content-Type: application/json |
| Request Body | `{"username":"<generated username, reused from a prior successful signup>","password":"<same or generated password>"}` |

**Test Steps:**

1. Send a POST request to `/signup` with a freshly generated, unique username and password
2. Send a second POST request to `/signup` with the exact same username used in step 1

**Expected Result:**

1. Response status code is `200`; response body is `""` (empty string, no `errorMessage`) — signup succeeds
2. Response status code is `200`; response body is `{"errorMessage":"This user already exist."}` — verified live 2026-07-29. **Note:** the SPEC expects `400`/`409`; actual conflict signaling is via `errorMessage` in a `200` body (Test Plan Section 2).

**Postconditions:** One account exists under the generated username (from step 1); step 2 creates no second account.

**Automation Candidate:** Yes — Full Reuse of existing `DemoblazeApiClient.signup()`, called twice with `utils/randomData.ts`'s `generateCredentials()` output reused across both calls.

**Notes:** Limit to a single generated username per test run, consistent with the shared-environment guardrail (minimize signup mutations against the live public demo).

---

## Module: Boundary / Server Error

## TC-11 — Extremely long strings in signup fields

| Field | Value |
|---|---|
| Priority | TBD |
| Req ID | RQ-11 |
| Module | Boundary / Server Error |
| Type | API |
| Preconditions | None |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /signup |
| Headers | Content-Type: application/json |
| Request Body | TBD — exact string length not determined; not exercised live during Stage 1/2 planning to avoid creating oversized persistent junk data on the shared public demo (Test Plan Section 4.2/17 R6) |

**Test Steps:**

1. **Blocked** — send a POST request to `/signup` with an extremely long string in `username` and/or `password`, once Stage 5b confirms a bounded (non-destructive) length via a live check.

**Expected Result:**

1. TBD — to be confirmed live at Stage 5b; not assumed to be a graceful `400`/`422` given this ticket's evidence that the AUT does not consistently use status codes for business-logic validation (Test Plan Section 2).

**Postconditions:** TBD — if the AUT accepts and persists an oversized username, cleanup approach TBD (no delete-account endpoint currently in `DemoblazeApiClient`).

**Automation Candidate:** TBD (Blocked) — pending Stage 5b live confirmation and a decision on the exact bounded string length to use.

**Notes:** Carried forward from Test Plan Section 4.2 — not fabricated here.

---

## TC-12 — SQL-injection-style payload in signup fields

| Field | Value |
|---|---|
| Priority | TBD |
| Req ID | RQ-12 |
| Module | Boundary / Server Error |
| Type | API |
| Preconditions | None |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /signup |
| Headers | Content-Type: application/json |
| Request Body | TBD — candidate non-destructive probe string (e.g. `' OR '1'='1`) not yet exercised live; exact value to be confirmed at Stage 5b (Test Plan Section 4.2/17 R6) |

**Test Steps:**

1. **Blocked** — send a POST request to `/signup` with a SQL-injection-style string in `username` and/or `password`, once Stage 5b confirms a safe, non-destructive probe value via a live check.

**Expected Result:**

1. TBD — to be confirmed live at Stage 5b; given this ticket's evidence (Section 2), a `200`+`errorMessage` or silent-acceptance outcome is at least as likely as a clean `400`/`422`, so no specific status is assumed in advance.

**Postconditions:** TBD.

**Automation Candidate:** TBD (Blocked) — pending Stage 5b live confirmation.

**Notes:** This is a lightweight input-hardening check (per Test Plan Section 9), not a full penetration test — carried forward from Section 4.2, not fabricated here.

---

## TC-13 — Non-numeric product id crashes `/view` with 500 (defect)

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-13 |
| Module | Boundary / Server Error |
| Type | API |
| Preconditions | None |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /view |
| Headers | Content-Type: application/json |
| Request Body | `{"id":"abc"}` |

**Test Steps:**

1. Send a POST request to `/view` with `id` set to the non-numeric string `"abc"`

**Expected Result:**

1. **Verified actual behavior (2026-07-29):** response status code is `500` (Internal Server Error); response body is a generic Werkzeug HTML error page, not a JSON error. **This is the exact failure mode the source SPEC's Feature 5 states should never happen ("never an unhandled 500 Internal Server Error exposing stack traces").** This test is written to assert the current (defective) behavior as a regression guard pending Gate A's labeling decision (Test Plan Section 17 R3) on whether it stays an "expected-fail-until-fixed" defect-reproducing test or becomes documentation-only.

**Postconditions:** No state change (read-only lookup).

**Automation Candidate:** Yes — Full Reuse of existing `DemoblazeApiClient.getProductById(id)`, called with a string argument (requires a type-signature accommodation, since the method's declared parameter type is `number | string` and already permits this call as written).

**Notes:** Reproduce 2–3× at Stage 5b to confirm this is deterministic, not one of the AUT's known intermittent live-environment 500s (Test Plan Section 10), before treating it as a stable regression guard.

---

## TC-14 — Out-of-range product id handled gracefully by `/view`

| Field | Value |
|---|---|
| Priority | P2 |
| Req ID | RQ-14 |
| Module | Boundary / Server Error |
| Type | API |
| Preconditions | None |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /view |
| Headers | Content-Type: application/json |
| Request Body | `{"id":999999999}` |

**Test Steps:**

1. Send a POST request to `/view` with `id` set to a numeric value far outside the valid product-id range

**Expected Result:**

1. Response status code is `200`; response body is `{"errorMessage":"Not found."}` — verified live 2026-07-29. Confirmed **not** a defect — contrast case to TC-13.

**Postconditions:** No state change.

**Automation Candidate:** Yes — Full Reuse of existing `DemoblazeApiClient.getProductById(999999999)`.

**Notes:** None.

---

## TC-15 — Empty token crashes `/check` with 500 (defect)

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-15 |
| Module | Boundary / Server Error |
| Type | API |
| Preconditions | None |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /check |
| Headers | Content-Type: application/json |
| Request Body | `{"token":""}` |

**Test Steps:**

1. Send a POST request to `/check` with `token` set to an empty string

**Expected Result:**

1. **Verified actual behavior (2026-07-29):** response status code is `500` (Internal Server Error); response body is a generic Werkzeug HTML error page. Second defect-reproducing case in this ticket (see TC-13) — same Gate A labeling decision applies (Test Plan Section 17 R3).

**Postconditions:** No state change.

**Automation Candidate:** Yes — Full Reuse of existing `DemoblazeApiClient.checkToken("")`.

**Notes:** Reproduce 2–3× at Stage 5b to confirm determinism before treating as a stable regression guard (same caveat as TC-13).

---

## Traceability Cross-Check

| Test Plan RTM Row | Corresponding Test Case | Status |
|---|---|---|
| RQ-01 / TC-01 | TC-01 | ✅ Present |
| RQ-02 / TC-02 | TC-02 | ✅ Present |
| RQ-03 / TC-03 | TC-03 | ✅ Present |
| RQ-04 / TC-04 | TC-04 | ✅ Present |
| RQ-05 / TC-05 | TC-05 | ✅ Present |
| RQ-06 / TC-06 | TC-06 | ✅ Present (Automation Candidate deliberately TBD, per open reviewer decision) |
| RQ-07 / TC-07 | TC-07 | ✅ Present (characterization test, not a pass/fail against the SPEC's literal 401/403 expectation) |
| RQ-08 / TC-08 | TC-08 | ✅ Present |
| RQ-09 / TC-09 | TC-09 | ✅ Present (Blocked/TBD, not fabricated) |
| RQ-10 / TC-10 | TC-10 | ✅ Present |
| RQ-11 / TC-11 | TC-11 | ✅ Present (Blocked/TBD, not fabricated) |
| RQ-12 / TC-12 | TC-12 | ✅ Present (Blocked/TBD, not fabricated) |
| RQ-13 / TC-13 | TC-13 | ✅ Present |
| RQ-14 / TC-14 | TC-14 | ✅ Present |
| RQ-15 / TC-15 | TC-15 | ✅ Present |

No gaps — all 15 RTM rows from the source Test Plan (Section 31) have a corresponding detailed test case. No scenario beyond those 15 rows was added.

---

## Open Items / TBD Log

| Item | Test Case(s) | Description | Resolution Owner |
|---|---|---|---|
| Defect-reproducing vs. documentation-only labeling | TC-06, TC-13, TC-15 | Whether these assert the AUT's current (arguably buggy) behavior as a permanent regression guard, or are documentation-only findings not wired into the automated pass/fail suite | Gate A reviewer / QA Lead (Test Plan Section 17 R3, R7) |
| Expired-token mechanism | TC-09 | No verified way to produce a token that is expired-but-not-malformed; unclear if the AUT's tokens expire at all | Reviewer / Product Owner |
| Long-string boundary value | TC-11 | Exact string length not determined; deliberately not probed live to avoid persistent junk data | Stage 5b (live-verify with a bounded value) |
| SQL-injection-style probe value | TC-12 | Exact non-destructive payload not determined | Stage 5b (live-verify with a safe probe string) |
| `null prod_id` cleanup mechanism | TC-06 | No `deleteCartItem`-equivalent exists for a malformed cart entry beyond the existing `deleteCartItem(cartItemId)`, which should still work since the entry has a valid `id` | Stage 5b to confirm during implementation |
| Long-username cleanup mechanism | TC-11 | No account-deletion endpoint currently exists in `DemoblazeApiClient` | Reviewer — accept permanent test-account creation, or descope |
