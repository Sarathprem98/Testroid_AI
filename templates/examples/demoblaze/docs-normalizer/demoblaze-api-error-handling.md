<!-- Generated-by: TestCaseNormalizerAgent · demoblaze-api-error-handling · 2026-07-29 · AI-generated, human review required -->

# Normalized Test Cases — demoblaze-api-error-handling

> Source: [`docs/test_cases/demoblaze-api-error-handling.md`](../test_cases/demoblaze-api-error-handling.md) (Stage 2, pipeline path — Test Case Generator Agent)
> Pipeline Stage: 3 (Test Case Normalizer) · Version: 1.0 · Date: 2026-07-29

## 1. Normalization Summary

| Metric | Value |
|---|---|
| Cases in | 15 |
| Cases out | 15 (11 fully normalized, 1 carried forward with an open reviewer decision (TC-06), 3 carried forward Blocked (TC-09, TC-11, TC-12)) |
| Duplicates merged | 0 |
| Schema violations found | 3 — TC-09, TC-11, TC-12: `Priority` is `TBD`, not a member of the restricted `P1/P2/P3` vocabulary; not coerced to a guessed priority (see Section 6) |
| TBDs remaining | 3 cases fully Blocked (TC-09, TC-11, TC-12 — Priority, Test Data, Steps, and Automation Candidate all TBD), plus 1 case (TC-06) whose verified result stands but whose Automation Candidate/labeling is an open Gate A decision |

`Type` normalized to the single restricted-vocabulary value **`API`** for all 15 cases (Stage 2's per-case field tables already used `Type: API` consistently; the Positive/Negative/Boundary qualifier shown in Stage 2's summary table was descriptive only, not a second vocabulary value — preserved as part of each case's `Title`/`Notes`, not invented as a hybrid category). No changes to test intent, steps, or expected results were made — only field-format normalization. All test data, status codes, and response bodies below were verified live against `https://api.demoblaze.com` on 2026-07-29 during Stage 1/2 drafting, except where explicitly marked TBD/Blocked.

## 2. Normalized Test Case Table

### Module: Method/Routing Validation

| Field | TC-01 |
|---|---|
| Req ID | RQ-01 |
| Title | Wrong-verb GET request to a POST-only endpoint returns 405 |
| Type | API (Negative) |
| Priority | P1 |
| Preconditions | None — no account, session, or seeded data required |
| Test Data | Endpoint: `GET /addtocart`; Headers: `Content-Type: application/json`; Body: none |
| Steps (1) | Send GET request to `/addtocart` with no body → Response status is `405` (confirmed live) |
| Postconditions | No state change — request rejected before any cart mutation occurs |
| Automation Candidate | Yes — Net New (no existing client method issues a wrong-verb request; raw-request helper design TBD at Stage 4/5b) |
| Tags | `@api`, `@regression` |
| Notes | Routing-layer failure — uses a real HTTP status code, unlike the business-logic layer (Test Plan Section 2) |

| Field | TC-02 |
|---|---|
| Req ID | RQ-02 |
| Title | Wrong-verb POST request to a GET-only endpoint returns 405 |
| Type | API (Negative) |
| Priority | P1 |
| Preconditions | None |
| Test Data | Endpoint: `POST /entries`; Headers: `Content-Type: application/json`; Body: `{}` |
| Steps (1) | Send POST request to `/entries` with body `{}` → Response status is `405` (confirmed live) |
| Postconditions | No state change |
| Automation Candidate | Yes — Net New, same rationale as TC-01 |
| Tags | `@api`, `@regression` |
| Notes | None |

| Field | TC-03 |
|---|---|
| Req ID | RQ-03 |
| Title | Request to a non-existent endpoint returns 404 |
| Type | API (Negative) |
| Priority | P1 |
| Preconditions | None |
| Test Data | Endpoint: `GET /nonexistentendpoint123`; Headers: `Content-Type: application/json`; Body: none |
| Steps (1) | Send GET request to `/nonexistentendpoint123` → Response status is `404` (confirmed live) |
| Postconditions | No state change |
| Automation Candidate | Yes — Net New (one-off raw request, not a new domain method) |
| Tags | `@api`, `@regression` |
| Notes | None |

### Module: Payload Validation

| Field | TC-04 |
|---|---|
| Req ID | RQ-04 |
| Title | Signup with missing username and password fields |
| Type | API (Negative) |
| Priority | P1 |
| Preconditions | None |
| Test Data | Endpoint: `POST /signup`; Headers: `Content-Type: application/json`; Body: `{}` |
| Steps (1) | Send POST request to `/signup` with body `{}` → Response status is `200`; body is `{"errorMessage":"Bad parameter, missing username or password"}` (confirmed live) |
| Postconditions | No account created |
| Automation Candidate | Yes — Net New (existing `signup()` requires both arguments; missing-field call needs a raw-body variant) |
| Tags | `@api`, `@regression` |
| Notes | SPEC expects `400`; actual business-logic layer never uses non-200 status codes (Test Plan Section 2) — asserted against actual verified behavior |

| Field | TC-05 |
|---|---|
| Req ID | RQ-05 |
| Title | Malformed JSON syntax in request body returns 400 |
| Type | API (Negative) |
| Priority | P1 |
| Preconditions | None |
| Test Data | Endpoint: `POST /signup`; Headers: `Content-Type: application/json`; Body: deliberately invalid JSON syntax (e.g. `{username: bad json`) |
| Steps (1) | Send POST request to `/signup` with a syntactically invalid JSON body → Response status is `400`; body is a generic HTML error page, not JSON (confirmed live) |
| Postconditions | No account created |
| Automation Candidate | Yes — Net New (requires a raw, non-serialized body; typed `signup()` cannot send invalid JSON) |
| Tags | `@api`, `@regression` |
| Notes | Assert against `rawText`/`headers['content-type']`, not a JSON-parsed `body` (per `ApiResponse` shape) |

| Field | TC-06 |
|---|---|
| Req ID | RQ-06 |
| Title | Add-to-cart with `null prod_id` is not validated (defect candidate) |
| Type | API (Negative) |
| Priority | P1 |
| Preconditions | None |
| Test Data | Endpoint: `POST /addtocart`; Headers: `Content-Type: application/json`; Body: `{"id":"<generated>","cookie":"<generated>","prod_id":null,"flag":false}` |
| Steps (1) | Send POST request to `/addtocart` with `prod_id: null` → Response status is `200`; body contains no `errorMessage` — request silently accepted (confirmed live) |
| Postconditions | A cart line item with a `null` product id may now exist under the generated cookie — cleanup via `deleteCartItem` recommended |
| Automation Candidate | **TBD — open Gate A decision**: whether to assert the current (silent-acceptance) behavior as a defect-reproducing regression test, or await a corrected `400`/`errorMessage` contract (Test Plan Section 17, R7) |
| Tags | `@api`, `@regression` (provisional — pending the decision above) |
| Notes | Result verified; only the automation/labeling approach is open, not the underlying data |

### Module: Authorization / Session Behavior

| Field | TC-07 |
|---|---|
| Req ID | RQ-07 |
| Title | Cart view with a fabricated/never-issued cookie is not rejected (characterization) |
| Type | API (Negative) |
| Priority | P1 |
| Preconditions | None — deliberately no signup/login/addtocart precedes this call |
| Test Data | Endpoint: `POST /viewcart`; Headers: `Content-Type: application/json`; Body: `{"cookie":"totally-made-up-nonexistent-cookie","flag":false}` |
| Steps (1) | Send POST request to `/viewcart` with a never-issued cookie → Response status is `200`; body is `{"Items":[]}` — no authorization rejection occurs (confirmed live) |
| Postconditions | No state change |
| Automation Candidate | Yes — Full Reuse of `DemoblazeApiClient.viewCart(cookie, loggedIn)`, called with a locally-generated cookie never registered via `addToCart` |
| Tags | `@api`, `@regression` |
| Notes | Characterization test, not a pass/fail against the SPEC's original `401`/`403` expectation — no server-side control exists to test (Test Plan Section 2) |

| Field | TC-08 |
|---|---|
| Req ID | RQ-08 |
| Title | Tampered session token to `/check` returns a body-level error |
| Type | API (Negative) |
| Priority | P2 |
| Preconditions | None |
| Test Data | Endpoint: `POST /check`; Headers: `Content-Type: application/json`; Body: `{"token":"totally-tampered-fake-token-xyz"}` |
| Steps (1) | Send POST request to `/check` with a never-issued token → Response status is `200`; body is `{"errorMessage":"Bad parameter, token malformed."}` (confirmed live) |
| Postconditions | No state change |
| Automation Candidate | Yes — Full Reuse of `DemoblazeApiClient.checkToken(token)` |
| Tags | `@api`, `@regression` |
| Notes | SPEC expects `401`; actual rejection is via body-level `errorMessage` on `200` (Test Plan Section 2) |

| Field | TC-09 |
|---|---|
| Req ID | RQ-09 |
| Title | Expired session token rejection |
| Type | API |
| Priority | **TBD — schema violation, not coerced to P1/P2/P3** |
| Preconditions | TBD (Blocked) |
| Test Data | TBD (Blocked) |
| Steps (1) | Blocked — no verified mechanism exists to produce a token that is expired-but-not-malformed; only "malformed" (TC-08) was reproducible |
| Postconditions | N/A |
| Automation Candidate | No — blocked pending reviewer input on whether the AUT's tokens expire at all, and if so, how to obtain one |
| Tags | — (none assigned; not automatable in current form) |
| Notes | Carried forward unresolved from Stage 1/2 per the anti-fabrication guardrail |

### Module: Conflict Handling

| Field | TC-10 |
|---|---|
| Req ID | RQ-10 |
| Title | Duplicate signup with an already-registered username |
| Type | API (Negative) |
| Priority | P1 |
| Preconditions | A username has already been successfully registered via a prior `/signup` call in this test |
| Test Data | Endpoint: `POST /signup`; Headers: `Content-Type: application/json`; Body: `{"username":"<generated>","password":"<generated>"}` (reused across both calls) |
| Steps (1) | Send POST request to `/signup` with a freshly generated, unique username → Response status is `200`; body is `""` (empty string, no `errorMessage`) |
| Steps (2) | Send POST request to `/signup` again with the same username → Response status is `200`; body is `{"errorMessage":"This user already exist."}` (confirmed live) |
| Postconditions | One account persists under the generated username; step 2 creates no second account |
| Automation Candidate | Yes — Full Reuse of `DemoblazeApiClient.signup()`, called twice with the same `generateCredentials()` output |
| Tags | `@api`, `@regression` |
| Notes | SPEC expects `400`/`409`; actual conflict signaling is via body-level `errorMessage` on `200` (Test Plan Section 2). Limit to one generated username per test run (shared-environment guardrail) |

### Module: Boundary / Server Error

| Field | TC-11 |
|---|---|
| Req ID | RQ-11 |
| Title | Extremely long strings in signup fields |
| Type | API |
| Priority | **TBD — schema violation, not coerced to P1/P2/P3** |
| Preconditions | None |
| Test Data | TBD (Blocked) — exact string length not exercised live to avoid persistent junk data on the shared public demo |
| Steps (1) | Blocked — pending Stage 5b confirming a bounded (non-destructive) length via a live check |
| Postconditions | TBD — no delete-account endpoint currently exists in `DemoblazeApiClient` if an oversized username is persisted |
| Automation Candidate | No — blocked pending Stage 5b live confirmation |
| Tags | — (none assigned; not automatable in current form) |
| Notes | Carried forward unresolved from Stage 1/2 per the anti-fabrication guardrail (Test Plan Section 4.2/17 R6) |

| Field | TC-12 |
|---|---|
| Req ID | RQ-12 |
| Title | SQL-injection-style payload in signup fields |
| Type | API |
| Priority | **TBD — schema violation, not coerced to P1/P2/P3** |
| Preconditions | None |
| Test Data | TBD (Blocked) — candidate non-destructive probe (e.g. `' OR '1'='1`) not yet exercised live |
| Steps (1) | Blocked — pending Stage 5b confirming a safe probe value via a live check |
| Postconditions | TBD |
| Automation Candidate | No — blocked pending Stage 5b live confirmation |
| Tags | — (none assigned; not automatable in current form) |
| Notes | Lightweight input-hardening check, not a penetration test; carried forward unresolved from Stage 1/2 (Test Plan Section 4.2/17 R6) |

| Field | TC-13 |
|---|---|
| Req ID | RQ-13 |
| Title | Non-numeric product id crashes `/view` with 500 (defect) |
| Type | API (Boundary) |
| Priority | P1 |
| Preconditions | None |
| Test Data | Endpoint: `POST /view`; Headers: `Content-Type: application/json`; Body: `{"id":"abc"}` |
| Steps (1) | Send POST request to `/view` with `id` set to `"abc"` → Response status is `500`; body is a generic HTML error page, not JSON (confirmed live) |
| Postconditions | No state change |
| Automation Candidate | Yes — Full Reuse of `DemoblazeApiClient.getProductById("abc")` |
| Tags | `@api`, `@regression` |
| Notes | Exact failure mode the SPEC's Feature 5 says should never happen; asserted as a defect-reproducing regression test pending Gate A's labeling decision (Test Plan Section 17 R3). Reproduce 2–3× at Stage 5b to rule out an intermittent live-environment 500 (Test Plan Section 10) |

| Field | TC-14 |
|---|---|
| Req ID | RQ-14 |
| Title | Out-of-range product id handled gracefully by `/view` |
| Type | API (Boundary) |
| Priority | P2 |
| Preconditions | None |
| Test Data | Endpoint: `POST /view`; Headers: `Content-Type: application/json`; Body: `{"id":999999999}` |
| Steps (1) | Send POST request to `/view` with `id` set to `999999999` → Response status is `200`; body is `{"errorMessage":"Not found."}` (confirmed live) |
| Postconditions | No state change |
| Automation Candidate | Yes — Full Reuse of `DemoblazeApiClient.getProductById(999999999)` |
| Tags | `@api`, `@regression` |
| Notes | Confirmed not a defect — contrast case to TC-13 |

| Field | TC-15 |
|---|---|
| Req ID | RQ-15 |
| Title | Empty token crashes `/check` with 500 (defect) |
| Type | API (Boundary) |
| Priority | P1 |
| Preconditions | None |
| Test Data | Endpoint: `POST /check`; Headers: `Content-Type: application/json`; Body: `{"token":""}` |
| Steps (1) | Send POST request to `/check` with `token` set to `""` → Response status is `500`; body is a generic HTML error page (confirmed live) |
| Postconditions | No state change |
| Automation Candidate | Yes — Full Reuse of `DemoblazeApiClient.checkToken("")` |
| Tags | `@api`, `@regression` |
| Notes | Second defect-reproducing case (see TC-13) — same Gate A labeling decision applies. Reproduce 2–3× at Stage 5b before treating as a stable regression guard |

## 3. Structured Export (JSON)

```json
[
  { "testCaseId": "TC-01", "reqId": "RQ-01", "title": "Wrong-verb GET request to a POST-only endpoint returns 405", "module": "Method/Routing Validation", "type": "API", "priority": "P1", "preconditions": ["None — no account, session, or seeded data required"], "testData": ["Endpoint: GET /addtocart", "Headers: Content-Type: application/json", "Body: none"], "steps": [ { "step": 1, "action": "Send GET request to /addtocart with no body", "expectedResult": "Response status is 405 (confirmed live)" } ], "postconditions": "No state change — request rejected before any cart mutation occurs", "automationCandidate": true, "automationMapping": "Net New — no existing client method issues a wrong-verb request; raw-request helper design TBD at Stage 4/5b", "tags": ["@api", "@regression"], "notes": "Routing-layer failure — uses a real HTTP status code, unlike the business-logic layer" },
  { "testCaseId": "TC-02", "reqId": "RQ-02", "title": "Wrong-verb POST request to a GET-only endpoint returns 405", "module": "Method/Routing Validation", "type": "API", "priority": "P1", "preconditions": ["None"], "testData": ["Endpoint: POST /entries", "Headers: Content-Type: application/json", "Body: {}"], "steps": [ { "step": 1, "action": "Send POST request to /entries with body {}", "expectedResult": "Response status is 405 (confirmed live)" } ], "postconditions": "No state change", "automationCandidate": true, "automationMapping": "Net New, same rationale as TC-01", "tags": ["@api", "@regression"], "notes": "None" },
  { "testCaseId": "TC-03", "reqId": "RQ-03", "title": "Request to a non-existent endpoint returns 404", "module": "Method/Routing Validation", "type": "API", "priority": "P1", "preconditions": ["None"], "testData": ["Endpoint: GET /nonexistentendpoint123", "Headers: Content-Type: application/json", "Body: none"], "steps": [ { "step": 1, "action": "Send GET request to /nonexistentendpoint123", "expectedResult": "Response status is 404 (confirmed live)" } ], "postconditions": "No state change", "automationCandidate": true, "automationMapping": "Net New — one-off raw request, not a new domain method", "tags": ["@api", "@regression"], "notes": "None" },
  { "testCaseId": "TC-04", "reqId": "RQ-04", "title": "Signup with missing username and password fields", "module": "Payload Validation", "type": "API", "priority": "P1", "preconditions": ["None"], "testData": ["Endpoint: POST /signup", "Headers: Content-Type: application/json", "Body: {}"], "steps": [ { "step": 1, "action": "Send POST request to /signup with body {}", "expectedResult": "Response status is 200; body is {\"errorMessage\":\"Bad parameter, missing username or password\"} (confirmed live)" } ], "postconditions": "No account created", "automationCandidate": true, "automationMapping": "Net New — existing signup() requires both arguments; missing-field call needs a raw-body variant", "tags": ["@api", "@regression"], "notes": "SPEC expects 400; actual business-logic layer never uses non-200 status codes" },
  { "testCaseId": "TC-05", "reqId": "RQ-05", "title": "Malformed JSON syntax in request body returns 400", "module": "Payload Validation", "type": "API", "priority": "P1", "preconditions": ["None"], "testData": ["Endpoint: POST /signup", "Headers: Content-Type: application/json", "Body: deliberately invalid JSON syntax"], "steps": [ { "step": 1, "action": "Send POST request to /signup with a syntactically invalid JSON body", "expectedResult": "Response status is 400; body is a generic HTML error page, not JSON (confirmed live)" } ], "postconditions": "No account created", "automationCandidate": true, "automationMapping": "Net New — requires a raw, non-serialized body", "tags": ["@api", "@regression"], "notes": "Assert against rawText/headers['content-type'], not a JSON-parsed body" },
  { "testCaseId": "TC-06", "reqId": "RQ-06", "title": "Add-to-cart with null prod_id is not validated (defect candidate)", "module": "Payload Validation", "type": "API", "priority": "P1", "preconditions": ["None"], "testData": ["Endpoint: POST /addtocart", "Headers: Content-Type: application/json", "Body: {\"id\":\"<generated>\",\"cookie\":\"<generated>\",\"prod_id\":null,\"flag\":false}"], "steps": [ { "step": 1, "action": "Send POST request to /addtocart with prod_id: null", "expectedResult": "Response status is 200; body contains no errorMessage — request silently accepted (confirmed live)" } ], "postconditions": "A cart line item with a null product id may now exist under the generated cookie — cleanup via deleteCartItem recommended", "automationCandidate": "TBD", "automationMapping": "TBD — open Gate A decision on defect-reproducing vs. corrected-contract assertion", "tags": ["@api", "@regression"], "notes": "Result verified; only the automation/labeling approach is open" },
  { "testCaseId": "TC-07", "reqId": "RQ-07", "title": "Cart view with a fabricated/never-issued cookie is not rejected (characterization)", "module": "Authorization / Session Behavior", "type": "API", "priority": "P1", "preconditions": ["None — deliberately no signup/login/addtocart precedes this call"], "testData": ["Endpoint: POST /viewcart", "Headers: Content-Type: application/json", "Body: {\"cookie\":\"totally-made-up-nonexistent-cookie\",\"flag\":false}"], "steps": [ { "step": 1, "action": "Send POST request to /viewcart with a never-issued cookie", "expectedResult": "Response status is 200; body is {\"Items\":[]} — no authorization rejection occurs (confirmed live)" } ], "postconditions": "No state change", "automationCandidate": true, "automationMapping": "Full Reuse — DemoblazeApiClient.viewCart(cookie, loggedIn)", "tags": ["@api", "@regression"], "notes": "Characterization test, not a pass/fail against the SPEC's original 401/403 expectation" },
  { "testCaseId": "TC-08", "reqId": "RQ-08", "title": "Tampered session token to /check returns a body-level error", "module": "Authorization / Session Behavior", "type": "API", "priority": "P2", "preconditions": ["None"], "testData": ["Endpoint: POST /check", "Headers: Content-Type: application/json", "Body: {\"token\":\"totally-tampered-fake-token-xyz\"}"], "steps": [ { "step": 1, "action": "Send POST request to /check with a never-issued token", "expectedResult": "Response status is 200; body is {\"errorMessage\":\"Bad parameter, token malformed.\"} (confirmed live)" } ], "postconditions": "No state change", "automationCandidate": true, "automationMapping": "Full Reuse — DemoblazeApiClient.checkToken(token)", "tags": ["@api", "@regression"], "notes": "SPEC expects 401; actual rejection is via body-level errorMessage on 200" },
  { "testCaseId": "TC-09", "reqId": "RQ-09", "title": "Expired session token rejection", "module": "Authorization / Session Behavior", "type": "API", "priority": "TBD", "preconditions": ["TBD (Blocked)"], "testData": ["TBD (Blocked)"], "steps": [ { "step": 1, "action": "Blocked — no verified mechanism exists to produce a token that is expired-but-not-malformed", "expectedResult": "Blocked — pending reviewer input on whether tokens expire at all" } ], "postconditions": "N/A", "automationCandidate": false, "automationMapping": "TBD — blocked pending reviewer input", "tags": [], "notes": "Carried forward unresolved from Stage 1/2 per the anti-fabrication guardrail" },
  { "testCaseId": "TC-10", "reqId": "RQ-10", "title": "Duplicate signup with an already-registered username", "module": "Conflict Handling", "type": "API", "priority": "P1", "preconditions": ["A username has already been successfully registered via a prior /signup call in this test"], "testData": ["Endpoint: POST /signup", "Headers: Content-Type: application/json", "Body: { username: <generated>, password: <generated> } (reused across both calls)"], "steps": [ { "step": 1, "action": "Send POST request to /signup with a freshly generated, unique username", "expectedResult": "Response status is 200; body is \"\" (empty string, no errorMessage)" }, { "step": 2, "action": "Send POST request to /signup again with the same username", "expectedResult": "Response status is 200; body is {\"errorMessage\":\"This user already exist.\"} (confirmed live)" } ], "postconditions": "One account persists under the generated username; step 2 creates no second account", "automationCandidate": true, "automationMapping": "Full Reuse — DemoblazeApiClient.signup() called twice", "tags": ["@api", "@regression"], "notes": "SPEC expects 400/409; actual conflict signaling is via body-level errorMessage on 200. Limit to one generated username per test run" },
  { "testCaseId": "TC-11", "reqId": "RQ-11", "title": "Extremely long strings in signup fields", "module": "Boundary / Server Error", "type": "API", "priority": "TBD", "preconditions": ["None"], "testData": ["TBD (Blocked) — exact string length not exercised live"], "steps": [ { "step": 1, "action": "Blocked — pending Stage 5b confirming a bounded, non-destructive length via a live check", "expectedResult": "TBD" } ], "postconditions": "TBD", "automationCandidate": false, "automationMapping": "TBD — blocked pending Stage 5b live confirmation", "tags": [], "notes": "Carried forward unresolved from Stage 1/2 per the anti-fabrication guardrail" },
  { "testCaseId": "TC-12", "reqId": "RQ-12", "title": "SQL-injection-style payload in signup fields", "module": "Boundary / Server Error", "type": "API", "priority": "TBD", "preconditions": ["None"], "testData": ["TBD (Blocked) — candidate probe not yet exercised live"], "steps": [ { "step": 1, "action": "Blocked — pending Stage 5b confirming a safe probe value via a live check", "expectedResult": "TBD" } ], "postconditions": "TBD", "automationCandidate": false, "automationMapping": "TBD — blocked pending Stage 5b live confirmation", "tags": [], "notes": "Lightweight input-hardening check, not a penetration test" },
  { "testCaseId": "TC-13", "reqId": "RQ-13", "title": "Non-numeric product id crashes /view with 500 (defect)", "module": "Boundary / Server Error", "type": "API", "priority": "P1", "preconditions": ["None"], "testData": ["Endpoint: POST /view", "Headers: Content-Type: application/json", "Body: {\"id\":\"abc\"}"], "steps": [ { "step": 1, "action": "Send POST request to /view with id set to \"abc\"", "expectedResult": "Response status is 500; body is a generic HTML error page, not JSON (confirmed live)" } ], "postconditions": "No state change", "automationCandidate": true, "automationMapping": "Full Reuse — DemoblazeApiClient.getProductById(\"abc\")", "tags": ["@api", "@regression"], "notes": "Exact failure mode the SPEC's Feature 5 says should never happen; defect-reproducing regression test pending Gate A labeling decision. Reproduce 2-3x at Stage 5b" },
  { "testCaseId": "TC-14", "reqId": "RQ-14", "title": "Out-of-range product id handled gracefully by /view", "module": "Boundary / Server Error", "type": "API", "priority": "P2", "preconditions": ["None"], "testData": ["Endpoint: POST /view", "Headers: Content-Type: application/json", "Body: {\"id\":999999999}"], "steps": [ { "step": 1, "action": "Send POST request to /view with id set to 999999999", "expectedResult": "Response status is 200; body is {\"errorMessage\":\"Not found.\"} (confirmed live)" } ], "postconditions": "No state change", "automationCandidate": true, "automationMapping": "Full Reuse — DemoblazeApiClient.getProductById(999999999)", "tags": ["@api", "@regression"], "notes": "Confirmed not a defect — contrast case to TC-13" },
  { "testCaseId": "TC-15", "reqId": "RQ-15", "title": "Empty token crashes /check with 500 (defect)", "module": "Boundary / Server Error", "type": "API", "priority": "P1", "preconditions": ["None"], "testData": ["Endpoint: POST /check", "Headers: Content-Type: application/json", "Body: {\"token\":\"\"}"], "steps": [ { "step": 1, "action": "Send POST request to /check with token set to \"\"", "expectedResult": "Response status is 500; body is a generic HTML error page (confirmed live)" } ], "postconditions": "No state change", "automationCandidate": true, "automationMapping": "Full Reuse — DemoblazeApiClient.checkToken(\"\")", "tags": ["@api", "@regression"], "notes": "Second defect-reproducing case (see TC-13) — same Gate A labeling decision applies" }
]
```

## 4. Traceability Integrity Report

| Req ID | Test Case ID | Chain Intact? |
|---|---|---|
| RQ-01 | TC-01 | Yes — unchanged from Test Plan RTM through Stage 2 |
| RQ-02 | TC-02 | Yes — unchanged |
| RQ-03 | TC-03 | Yes — unchanged |
| RQ-04 | TC-04 | Yes — unchanged |
| RQ-05 | TC-05 | Yes — unchanged |
| RQ-06 | TC-06 | Yes, chain intact — case content verified, only the automation/labeling decision is open (not a traceability break) |
| RQ-07 | TC-07 | Yes — unchanged |
| RQ-08 | TC-08 | Yes — unchanged |
| RQ-09 | TC-09 | Yes, chain intact — but case content itself is Blocked (not a traceability break; see Section 6) |
| RQ-10 | TC-10 | Yes — unchanged |
| RQ-11 | TC-11 | Yes, chain intact — case content Blocked (see Section 6) |
| RQ-12 | TC-12 | Yes, chain intact — case content Blocked (see Section 6) |
| RQ-13 | TC-13 | Yes — unchanged |
| RQ-14 | TC-14 | Yes — unchanged |
| RQ-15 | TC-15 | Yes — unchanged |

No breaks detected. All 15 `Req ID`s and 15 `Test Case ID`s match the source Test Plan RTM (Section 31) exactly.

## 5. Rejected / Open Items Log

No cases rejected outright. Three schema violations and one open labeling decision, all carried forward rather than dropped or guessed:

| # | Test Case ID | Issue | Disposition |
|---|---|---|---|
| 1 | TC-09 | `Priority` is `TBD`, not a member of the restricted `P1/P2/P3` vocabulary | Not coerced to a guessed priority; case carried forward Blocked pending reviewer input on token-expiry mechanism |
| 2 | TC-11 | `Priority` is `TBD`, not a member of the restricted `P1/P2/P3` vocabulary | Not coerced; case carried forward Blocked pending Stage 5b live confirmation of a bounded long-string value |
| 3 | TC-12 | `Priority` is `TBD`, not a member of the restricted `P1/P2/P3` vocabulary | Not coerced; case carried forward Blocked pending Stage 5b live confirmation of a safe SQLi-style probe value |
| 4 | TC-06 | `Automation Candidate` is `TBD` — the case's result is fully verified, but whether to assert it as a defect-reproducing regression test or await a corrected contract is unresolved | Not defaulted either way; flagged for Gate A / reviewer decision (mirrors TC-13/TC-15's labeling question, tracked separately since TC-06 is a silent-acceptance gap rather than a crash) |

Carried-forward TBDs (still unresolved information, not defects in this stage's own output):

| # | Test Case ID | TBD |
|---|---|---|
| 1 | TC-06 | Whether the silent-acceptance behavior for `null prod_id` becomes a permanent regression guard or a documentation-only finding |
| 2 | TC-09 | Whether the AUT's session tokens expire at all, and if so, how to produce one in that state |
| 3 | TC-11 | Exact long-string length/value to probe live at Stage 5b |
| 4 | TC-12 | Exact SQL-injection-style probe value to use live at Stage 5b |
| 5 | TC-13, TC-15 | Whether the two verified 500-crash cases become permanent "expected-fail-until-fixed" regression tests or documentation-only findings (Test Plan Section 17 R3) — result itself is not TBD, only the labeling |
