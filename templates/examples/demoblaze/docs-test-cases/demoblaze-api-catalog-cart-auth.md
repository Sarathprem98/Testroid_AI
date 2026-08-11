<!-- Generated-by: TestCaseGeneratorAgent · demoblaze-api-catalog-cart-auth · 2026-07-29 · AI-generated, human review required -->

# Test Cases — demoblaze-api-catalog-cart-auth

> Source Test Plan: [`docs/Test Plans/demoblaze-api-catalog-cart-auth_test_plan.md`](../Test%20Plans/demoblaze-api-catalog-cart-auth_test_plan.md) — Gate A cleared 2026-07-29 by saratprem.chebiyyam@sailssoftware.com (proceed-as-draft; SPEC-vs-implementation discrepancies in Test Plan Section 2 and the RQ-15/TC-17 gap in Section 31 carried forward as-is), Requirement Traceability Matrix (Section 31).
> Version: 1.0 · Date: 2026-07-29
> All 17 RTM rows are `Type: API` — every case below uses the [API Test Case Guidance](../agents/TestCaseGeneratorAgent.md#api-test-case-guidance) template; none describe UI actions.

---

## 1. Test Case Summary Table

| Test Case ID | Title | Type | Priority | Automation Candidate |
|---|---|---|---|---|
| TC-01 | Entries endpoint returns full catalog with 200 OK | API / Positive | P1 | Yes |
| TC-02 | Catalog item fields match the verified schema | API / Positive | P1 | Yes |
| TC-03 | Category filter returns only Phones products | API / Positive | P1 | Yes |
| TC-04 | Category filter returns only Laptops products | API / Positive | P1 | Yes |
| TC-05 | Category filter returns only Monitors products | API / Positive | P1 | Yes |
| TC-06 | Invalid category is handled gracefully | API / Negative | P2 | Yes |
| TC-07 | Product details lookup by valid ID returns accurate data | API / Positive | P1 | Yes |
| TC-08 | Product details lookup by invalid ID does not crash | API / Negative | P1 | Yes |
| TC-09 | Signup succeeds with unique valid credentials | API / Positive | P1 | Yes |
| TC-10 | Signup fails for a duplicate username | API / Negative | P1 | Yes |
| TC-11 | Login succeeds with correct credentials and returns a usable token | API / Positive | P1 | Yes |
| TC-12 | Login fails for an unregistered username | API / Negative | P1 | Yes |
| TC-13 | Login fails for a wrong password | API / Negative | P1 | Yes |
| TC-14 | Add-to-cart is reflected in view-cart (anonymous) | API / Positive | P1 | Yes |
| TC-15 | Removing a cart item deletes it from view-cart | API / Positive | P1 | Yes |
| TC-16 | Cart add/view reflects correctly for an authenticated session | API / Positive | P2 | Yes |
| TC-17 | Cart totals/quantities update as expected | API | TBD (Blocked) | TBD (Blocked) |

---

## 2. Detailed Test Cases

### Module: Catalog API

## TC-01 — Entries endpoint returns full catalog with 200 OK

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-01 |
| Module | Catalog API |
| Type | API |
| Preconditions | None — public, unauthenticated endpoint |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | GET /entries |
| Headers | TBD (existing client sends no explicit headers beyond Playwright's `APIRequestContext` defaults) |
| Request Body | None (GET request) |

**Test Steps:**

1. Send GET request to `/entries` with no body.
2. Extract the `Items` array from the response body.

**Expected Result:**

1. Response status code is `200`; response body is valid JSON containing an `Items` field.
2. `Items` is an array with at least one element (non-empty live catalog).

**Postconditions:** None — read-only request.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.getEntries()` (Full Reuse — confirm at Stage 4); already exercised by `tests/api/api.001.spec.ts` ("entries endpoint returns the product catalog").

**Notes:** SPEC named this endpoint `/entries` and it matches the verified client exactly — no discrepancy here (see Test Plan Section 2).

---

## TC-02 — Catalog item fields match the verified schema

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-02 |
| Module | Catalog API |
| Type | API |
| Preconditions | None — public, unauthenticated endpoint |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | GET /entries |
| Headers | TBD |
| Request Body | None (GET request) |

**Test Steps:**

1. Send GET request to `/entries` with no body.
2. Select the first item in the response `Items` array.
3. Verify the selected item's field names.

**Expected Result:**

1. Response status code is `200`.
2. An item object is present at `Items[0]`.
3. The item exposes `id`, `title`, `price`, `cat`, `desc`, and `img` — **not** `category`/`description`/`image` as the SPEC's literal wording states (see Test Plan Section 2 discrepancy note); `id` is a number, `title` is a non-empty string, `price` is a number greater than 0.

**Postconditions:** None.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.getEntries()` (Full Reuse) plus new field-level assertions against `DemoblazeProduct`/`DemoblazeEntriesResponse` (`api/types/demoblazeApiTypes.ts`) — Net New assertions on an existing call.

**Notes:** This case is the primary vehicle for confirming the SPEC-vs-implementation field-name discrepancy in automation, not just documentation.

---

### Module: Category Filter API

## TC-03 — Category filter returns only Phones products

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-03 |
| Module | Category Filter API |
| Type | API |
| Preconditions | None — public, unauthenticated endpoint |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /bycat |
| Headers | `Content-Type: application/json` (confirmed via live verification, Stage 5b) |
| Request Body | `{ "cat": "phone" }` (corrected 2026-07-29 — the literal SPEC/UI name `"Phones"` returns an empty result silently; see Test Plan Section 13/31) |

**Test Steps:**

1. Send POST request to `/bycat` with body `{ "cat": "phone" }`.
2. Verify the `cat` field of every returned item.

**Expected Result:**

1. Response status code is `200`; response body is `{ "Items": [...] }` — an object with an `Items` array, not a bare array (confirmed live, corrected from the client's original type).
2. Every item in `Items` has `cat` equal to `"phone"` — no items from other categories are present.

**Postconditions:** None.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.getProductsByCategory('phone')` (Full Reuse for the call — confirm at Stage 4).

**Notes:** SPEC named this endpoint `/prodByCat`; verified implementation is `/bycat` (see Test Plan Section 2). Category value corrected from SPEC's `"Phones"` to the live-verified `"phone"`.

---

## TC-04 — Category filter returns only Laptops products

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-03 |
| Module | Category Filter API |
| Type | API |
| Preconditions | None — public, unauthenticated endpoint |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /bycat |
| Headers | `Content-Type: application/json` (confirmed via live verification, Stage 5b) |
| Request Body | `{ "cat": "notebook" }` (corrected 2026-07-29 — the live category value for "Laptops" is `"notebook"`, not `"Laptops"`; see Test Plan Section 13/31) |

**Test Steps:**

1. Send POST request to `/bycat` with body `{ "cat": "notebook" }`.
2. Verify the `cat` field of every returned item.

**Expected Result:**

1. Response status code is `200`; response body is `{ "Items": [...] }`.
2. Every item in `Items` has `cat` equal to `"notebook"` — no items from other categories are present.

**Postconditions:** None.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.getProductsByCategory('notebook')` (Full Reuse for the call — confirm at Stage 4).

**Notes:** Same endpoint/discrepancy note as TC-03; data-driven sibling case. Category value corrected from SPEC's `"Laptops"` to the live-verified `"notebook"`.

---

## TC-05 — Category filter returns only Monitors products

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-03 |
| Module | Category Filter API |
| Type | API |
| Preconditions | None — public, unauthenticated endpoint |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /bycat |
| Headers | `Content-Type: application/json` (confirmed via live verification, Stage 5b) |
| Request Body | `{ "cat": "monitor" }` (corrected 2026-07-29 — the live category value for "Monitors" is `"monitor"`, not `"Monitors"`; see Test Plan Section 13/31) |

**Test Steps:**

1. Send POST request to `/bycat` with body `{ "cat": "monitor" }`.
2. Verify the `cat` field of every returned item.

**Expected Result:**

1. Response status code is `200`; response body is `{ "Items": [...] }`.
2. Every item in `Items` has `cat` equal to `"monitor"` — no items from other categories are present.

**Postconditions:** None.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.getProductsByCategory('monitor')` (Full Reuse for the call — confirm at Stage 4).

**Notes:** Same endpoint/discrepancy note as TC-03/TC-04; data-driven sibling case. Category value corrected from SPEC's `"Monitors"` to the live-verified `"monitor"`. TC-03/TC-04/TC-05 are strong candidates to automate as one parameterized Playwright `test()` over `[phone, notebook, monitor]`, per the Test Plan's Automation Strategy (Section 23).

---

## TC-06 — Invalid category is handled gracefully

| Field | Value |
|---|---|
| Priority | P2 |
| Req ID | RQ-04 |
| Module | Category Filter API |
| Type | API |
| Preconditions | None — public, unauthenticated endpoint |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /bycat |
| Headers | `Content-Type: application/json` (TBD to confirm) |
| Request Body | `{ "cat": "NonExistentCategory" }` |

**Test Steps:**

1. Send POST request to `/bycat` with body `{ "cat": "NonExistentCategory" }`.
2. Inspect the response status and body shape.

**Expected Result:**

1. Response status code is `200` (confirmed live, 2026-07-29 — the SPEC's "empty array or appropriate error" resolves to the former: no error, no non-200 status).
2. Response body is `{ "Items": [] }` — an empty array under `Items`, not a top-level error/exception (confirmed live).

**Postconditions:** None.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.getProductsByCategory()` (Full Reuse for the call); new assertions (Net New) now confirmed and ready to implement.

**Notes:** Live-confirmed 2026-07-29 during Stage 5b (Test Plan R6 resolved) — no longer Blocked.

---

### Module: Product Details API

## TC-07 — Product details lookup by valid ID returns accurate data

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-05 |
| Module | Product Details API |
| Type | API |
| Preconditions | None — public, unauthenticated endpoint; product ID `1` is known-valid per existing precedent (`tests/api/api.001.spec.ts`) |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /view |
| Headers | `Content-Type: application/json` (TBD to confirm) |
| Request Body | `{ "id": 1 }` |

**Test Steps:**

1. Send POST request to `/view` with body `{ "id": 1 }`.
2. Verify the response body fields.

**Expected Result:**

1. Response status code is `200`.
2. Response body contains `title` (non-empty string) and `price` (number greater than 0); `desc` and `img` are present per the verified `DemoblazeProduct` shape.

**Postconditions:** None.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.getProductById(1)` (Full Reuse — confirm at Stage 4); already exercised by `tests/api/api.001.spec.ts` ("product lookup by id returns a product payload").

**Notes:** SPEC named this endpoint `/viewproduct`; verified implementation is `/view` (`/prodbyid` and `/viewproduct` both 404 per existing client comments — see Test Plan Section 2).

---

## TC-08 — Product details lookup by invalid ID does not crash

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-06 |
| Module | Product Details API |
| Type | API |
| Preconditions | None — public, unauthenticated endpoint |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /view |
| Headers | `Content-Type: application/json` (TBD to confirm) |
| Request Body | `{ "id": 999999 }` (out-of-range, presumed non-existent product ID) |

**Test Steps:**

1. Send POST request to `/view` with body `{ "id": 999999 }`.
2. Inspect the response status and body shape.

**Expected Result:**

1. Response status code is `200` (confirmed live, 2026-07-29 — not a `5xx`/crash; the API signals "not found" via a `200` + `errorMessage` body, consistent with its signup/login error pattern).
2. Response body is `{ "errorMessage": "Not found." }` (confirmed live).

**Postconditions:** None.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.getProductById()` (Full Reuse for the call); new assertions (Net New) now confirmed and ready to implement.

**Notes:** Live-confirmed 2026-07-29 during Stage 5b (Test Plan R6 resolved) — no longer Blocked.

---

### Module: Authentication API

## TC-09 — Signup succeeds with unique valid credentials

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-07 |
| Module | Authentication API |
| Type | API |
| Preconditions | None — new, never-used username generated for this test |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /signup |
| Headers | `Content-Type: application/json` (TBD to confirm) |
| Request Body | `{ "username": "<generated via utils/randomData.ts generateCredentials()>", "password": "<CONSTANTS.basePassword>" }` |

**Test Steps:**

1. Generate a unique username/password pair via `generateCredentials()`.
2. Send POST request to `/signup` with the generated credentials.

**Expected Result:**

1. A unique username string is produced (non-empty, no collision with a prior run given the timestamp+random suffix pattern).
2. Response status code is `200`; response body does **not** contain an `errorMessage` field (success body is the empty string `""` per the verified `DemoblazeSignupResponse` shape).

**Postconditions:** The created user persists on the shared live environment for the remainder of the test session (used by TC-10/TC-11/TC-13); no cleanup endpoint exists to delete it.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.signup()` + `utils/randomData.ts.generateCredentials()` (Full Reuse — confirm at Stage 4); already exercised by `tests/api/api.001.spec.ts` ("signup followed by login...").

**Notes:** Per the shared-environment guardrail, generate exactly one signup per test run for this case — do not loop or bulk-create accounts.

---

## TC-10 — Signup fails for a duplicate username

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-08 |
| Module | Authentication API |
| Type | API |
| Preconditions | A username has already been successfully registered once in this test (first signup call within the same test, not a cross-test dependency) |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /signup |
| Headers | `Content-Type: application/json` (TBD to confirm) |
| Request Body | `{ "username": "<same generated username as the first call>", "password": "<CONSTANTS.basePassword>" }` |

**Test Steps:**

1. Send POST request to `/signup` with a newly generated username (first call — expected to succeed).
2. Send POST request to `/signup` again with the **same** username (second call — expected to fail).

**Expected Result:**

1. Response status code is `200`; response body does not contain `errorMessage` (matches TC-09 behavior).
2. Response status code is `200`; response body contains `errorMessage: "This user already exist."` (confirmed live, 2026-07-29).

**Postconditions:** One user account persists on the shared live environment (the same one created in step 1).

**Automation Candidate:** Yes — existing `DemoblazeApiClient.signup()` called twice with the same generated credentials (Full Reuse for the call; Net New for the duplicate-call assertion).

**Notes:** Live-confirmed 2026-07-29 during Stage 5b. This case must generate its own username (do not depend on TC-09's test-level username, since Stage 2/3 test cases should be independently executable) and call signup twice within the same test.

---

## TC-11 — Login succeeds with correct credentials and returns a usable token

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-09 |
| Module | Authentication API |
| Type | API |
| Preconditions | A registered user exists (signup performed as part of this test's setup) |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /login |
| Headers | `Content-Type: application/json` (TBD to confirm) |
| Request Body | `{ "username": "<generated>", "password": "<CONSTANTS.basePassword>" }` |

**Test Steps:**

1. Send POST request to `/signup` with generated credentials (setup).
2. Send POST request to `/login` with the same credentials.

**Expected Result:**

1. Response status code is `200`; response body does not contain `errorMessage`.
2. Response status code is `200`; response body is a string containing `"Auth_token:"` (per the verified `DemoblazeLoginResponse` shape).

**Postconditions:** A usable session token exists for the duration of the test; no logout/token-revocation endpoint is in scope.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.signup()` + `login()` (Full Reuse — confirm at Stage 4); already exercised by `tests/api/api.001.spec.ts` ("signup followed by login returns a usable session for a new user").

**Notes:** None.

---

## TC-12 — Login fails for an unregistered username

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-10 |
| Module | Authentication API |
| Type | API |
| Preconditions | Username has never been registered (freshly generated, no signup call made for it) |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /login |
| Headers | `Content-Type: application/json` (TBD to confirm) |
| Request Body | `{ "username": "<generated, never signed up>", "password": "<CONSTANTS.basePassword>" }` |

**Test Steps:**

1. Generate a username/password pair via `generateCredentials()` without calling `/signup`.
2. Send POST request to `/login` with the generated (unregistered) credentials.

**Expected Result:**

1. A unique, never-registered username string is produced.
2. Response status code is `200`; response body contains `errorMessage` equal to `"User does not exist."` (verified exact string, per `tests/api/api.001.spec.ts`'s existing "login with an unregistered user..." case).

**Postconditions:** None — no account created.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.login()` (Full Reuse — confirm at Stage 4); already exercised by `tests/api/api.001.spec.ts`.

**Notes:** Confirms the SPEC's "proper error messages" requirement resolves to a body-level `errorMessage` on a `200` response, not a `4xx` status (see Test Plan Section 2/R2).

---

## TC-13 — Login fails for a wrong password

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-11 |
| Module | Authentication API |
| Type | API |
| Preconditions | A registered user exists (signup performed as part of this test's setup) |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /login |
| Headers | `Content-Type: application/json` (TBD to confirm) |
| Request Body | `{ "username": "<generated, registered>", "password": "<deliberately wrong value>" }` |

**Test Steps:**

1. Send POST request to `/signup` with generated credentials (setup).
2. Send POST request to `/login` using the same username but an incorrect password.

**Expected Result:**

1. Response status code is `200`; response body does not contain `errorMessage`.
2. Response status code is `200`; response body contains `errorMessage` equal to `"Wrong password."` — distinct from TC-12's `"User does not exist."` message.

**Postconditions:** One user account persists on the shared live environment.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.signup()` + `login()` (Full Reuse — confirm at Stage 4).

**Notes:** Pairs with TC-12 to confirm the two distinct `errorMessage` strings the SPEC's "proper error messages" requirement resolves to.

---

### Module: Cart API

## TC-14 — Add-to-cart is reflected in view-cart (anonymous)

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-12 |
| Module | Cart API |
| Type | API |
| Preconditions | Anonymous session — no login required; a client-generated `cartItemId` and `cookie` are prepared |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /addtocart, then POST /viewcart |
| Headers | `Content-Type: application/json` (TBD to confirm) |
| Request Body | addtocart: `{ "id": "<generated cartItemId>", "cookie": "<generated cookie>", "prod_id": 1, "flag": false }`; viewcart: `{ "cookie": "<same cookie>", "flag": false }` |

**Test Steps:**

1. Send POST request to `/addtocart` with the body above (`flag: false` for anonymous).
2. Send POST request to `/viewcart` with the same `cookie` and `flag: false`.
3. Verify the added item is present in the `viewcart` response.

**Expected Result:**

1. Response status code is `200`.
2. Response status code is `200`; response body contains an `Items` array.
3. The `Items` array contains an entry whose `id` field equals the `cartItemId` sent in step 1, and whose `prod_id` field equals `1` (both confirmed live, 2026-07-29 — `viewcart` echoes back `{ id, cookie, prod_id }` per item).

**Postconditions:** One cart item persists for this `cookie` on the shared live environment until explicitly deleted (see TC-15).

**Automation Candidate:** Yes — existing `DemoblazeApiClient.addToCart()` + `viewCart()` (Full Reuse — confirm at Stage 4); already exercised by `tests/api/api.001.spec.ts` ("add to cart followed by view cart...").

**Notes:** Per the shared-environment guardrail, always pair an add with a corresponding delete (TC-15) in the same test rather than leaving cart items behind indefinitely.

---

## TC-15 — Removing a cart item deletes it from view-cart

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-13 |
| Module | Cart API |
| Type | API |
| Preconditions | A cart item was previously added (via `/addtocart`) within the same test |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /addtocart, POST /deleteitem, then POST /viewcart |
| Headers | `Content-Type: application/json` (TBD to confirm) |
| Request Body | addtocart: `{ "id": "<generated cartItemId>", "cookie": "<generated cookie>", "prod_id": 1, "flag": false }`; deleteitem: `{ "id": "<same cartItemId>" }`; viewcart: `{ "cookie": "<same cookie>", "flag": false }` |

**Test Steps:**

1. Send POST request to `/addtocart` with the body above.
2. Send POST request to `/deleteitem` with `{ "id": "<same cartItemId>" }`.
3. Send POST request to `/viewcart` with the same `cookie` and `flag: false`.
4. Verify the deleted item is absent from the `viewcart` response.

**Expected Result:**

1. Response status code is `200`.
2. Response status code is `200`.
3. Response status code is `200`; response body contains an `Items` array.
4. The `Items` array does not contain an entry with the deleted `cartItemId`.

**Postconditions:** No cart item remains for this `cookie` on the shared live environment — this test is self-cleaning.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.addToCart()` + `deleteCartItem()` + `viewCart()` (Full Reuse — confirm at Stage 4).

**Notes:** SPEC named this endpoint `/deleteitem`, which matches the verified implementation exactly — no discrepancy here (unlike TC-03/TC-07).

---

## TC-16 — Cart add/view reflects correctly for an authenticated session

| Field | Value |
|---|---|
| Priority | P2 |
| Req ID | RQ-14 |
| Module | Cart API |
| Type | API |
| Preconditions | A registered, logged-in user exists (signup + login performed as part of this test's setup); a valid `Auth_token:`-bearing session obtained |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | POST /signup, POST /login, POST /addtocart, then POST /viewcart |
| Headers | `Content-Type: application/json` (confirmed) |
| Request Body | addtocart: `{ "id": "<generated cartItemId>", "cookie": "<Auth_token value from login>", "prod_id": 1, "flag": true }`; viewcart: `{ "cookie": "<same Auth_token value>", "flag": true }` — **corrected 2026-07-29**: for `flag: true`, `cookie` must be the `Auth_token` value returned by login, not an arbitrary client-generated string; an arbitrary cookie returns `{ "errorMessage": "Bad parameter, token malformed." }` (confirmed live, not previously documented anywhere in the codebase) |

**Test Steps:**

1. Send POST request to `/signup` then `/login` with generated credentials (setup).
2. Send POST request to `/addtocart` with `flag: true` (authenticated).
3. Send POST request to `/viewcart` with the same `cookie` and `flag: true`.
4. Verify the added item is present in the `viewcart` response.

**Expected Result:**

1. Response status code is `200` for both calls; login response contains `"Auth_token:"`.
2. Response status code is `200`.
3. Response status code is `200`; response body contains an `Items` array.
4. The `Items` array contains an entry whose `id` field equals the `cartItemId` and whose `prod_id` field equals `1` (same confirmed shape as TC-14 step 3).

**Postconditions:** One user account and one cart item persist on the shared live environment; cart item should be cleaned up via `/deleteitem` at the end of the test.

**Automation Candidate:** Yes — existing `DemoblazeApiClient.signup()` + `login()` + `addToCart(..., loggedIn: true)` + `viewCart(..., true)` (Full Reuse — confirm at Stage 4); this specific `flag: true` path is not yet exercised by the existing example spec (`tests/api/api.001.spec.ts` only exercises `flag: false`), so it is a genuinely new test scenario even though the client method already supports it.

**Notes:** This is the closest case to the SPEC's "cart operations require valid authentication/session where applicable." Live-confirmed 2026-07-29: `flag: true` does enforce a real token check — an arbitrary `cookie` is rejected with `errorMessage: "Bad parameter, token malformed."`, so this is closer to genuine authentication enforcement than the Test Plan's original Assumption (Section 16) suggested. Whether anonymous (`flag: false`) cart access is ever *disallowed* for a case that should require login remains unconfirmed — only the `flag: true` path's token validation was verified here.

---

## TC-17 — Cart totals/quantities update as expected

| Field | Value |
|---|---|
| Priority | TBD (Blocked) |
| Req ID | RQ-15 |
| Module | Cart API |
| Type | API |
| Preconditions | TBD (Blocked) |

**Test Data:**

| Field | Value |
|---|---|
| Endpoint | TBD (Blocked) |
| Headers | TBD (Blocked) |
| Request Body | TBD (Blocked) |

**Test Steps:**

1. **Blocked** — cannot be authored. No `total`/`quantity` field exists in the verified `DemoblazeViewCartResponse`/`DemoblazeCartMutationResponse` types (`api/types/demoblazeApiTypes.ts`); only `Items[]` is confirmed.

**Expected Result:**

1. **Blocked** — pending a reviewer decision (Test Plan Section 4.2/17, R4): either (a) a live response sample surfaces a totals/quantity field not currently reflected in the types, or (b) the SPEC's "totals/quantities" requirement is confirmed to mean a UI-computed value out of scope for this API-only ticket, or (c) the requirement is descoped. No assertion is written against a guessed field.

**Postconditions:** N/A.

**Automation Candidate:** No — blocked pending the decision above.

**Notes:** Carried forward unresolved from the Test Plan per the anti-fabrication guardrail — do not close this case with a fabricated status. Escalate at Gate A/A′ review or the next available human checkpoint.

---

## 3. Traceability Cross-Check

| Test Plan RTM Row | Corresponding Test Case | Status |
|---|---|---|
| RQ-01 / TC-01 | TC-01 | Covered |
| RQ-02 / TC-02 | TC-02 | Covered |
| RQ-03 / TC-03 | TC-03 | Covered |
| RQ-03 / TC-04 | TC-04 | Covered |
| RQ-03 / TC-05 | TC-05 | Covered |
| RQ-04 / TC-06 | TC-06 | Covered (assertion body deliberately incomplete — see Open Items) |
| RQ-05 / TC-07 | TC-07 | Covered |
| RQ-06 / TC-08 | TC-08 | Covered (assertion body deliberately incomplete — see Open Items) |
| RQ-07 / TC-09 | TC-09 | Covered |
| RQ-08 / TC-10 | TC-10 | Covered |
| RQ-09 / TC-11 | TC-11 | Covered |
| RQ-10 / TC-12 | TC-12 | Covered |
| RQ-11 / TC-13 | TC-13 | Covered |
| RQ-12 / TC-14 | TC-14 | Covered |
| RQ-13 / TC-15 | TC-15 | Covered |
| RQ-14 / TC-16 | TC-16 | Covered |
| RQ-15 / TC-17 | TC-17 | Blocked — no gap in traceability (row exists), but the case itself cannot be executed/automated as written |

No RTM row is missing a corresponding test case; no test case introduces a `Req ID` absent from the source RTM (no scope invention).

---

## 4. Open Items / TBD Log

| Item | Test Case(s) | What's Needed |
|---|---|---|
| Exact response shape for an invalid category | TC-06 | Live call to `/bycat` with an invalid category value, performed and documented during Stage 5b implementation |
| Exact response shape for an invalid/non-existent product ID | TC-08 | Live call to `/view` with an out-of-range ID, performed and documented during Stage 5b implementation |
| Exact `errorMessage` text for duplicate signup | TC-10 | Live call, since the SPEC does not quote the string and it hasn't been previously exercised in this repo |
| Exact matching field for a cart item in `viewcart` response (`id` vs. `prod_id`) | TC-14, TC-16 | Live response inspection — `DemoblazeCartItem` type only loosely types both fields as optional |
| Cart totals/quantities requirement | TC-17 | Human decision at Gate A/A′ or later checkpoint — cannot proceed without either a confirmed field or an explicit descope |
| `Content-Type` header behavior | All API cases | Existing `DemoblazeApiClient`/`BaseApiClient` does not explicitly set `Content-Type`; confirm whether Playwright's default JSON serialization is sufficient or whether an explicit header is required — informational only, not expected to block automation since the existing example spec already passes without it |
