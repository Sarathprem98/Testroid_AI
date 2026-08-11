<!-- Generated-by: TestCaseNormalizerAgent · demoblaze-api-catalog-cart-auth · 2026-07-29 · AI-generated, human review required -->

# Normalized Test Cases — demoblaze-api-catalog-cart-auth

> Source: [`docs/test_cases/demoblaze-api-catalog-cart-auth.md`](../test_cases/demoblaze-api-catalog-cart-auth.md) (Stage 2, pipeline path — Test Case Generator Agent)
> Pipeline Stage: 3 (Test Case Normalizer) · Version: 1.0 · Date: 2026-07-29

## 1. Normalization Summary

| Metric | Value |
|---|---|
| Cases in | 17 |
| Cases out | 17 (16 fully normalized, 1 carried forward Blocked) |
| Duplicates merged | 0 |
| Schema violations found | 1 (TC-17 — `Priority` is `TBD`, not a member of the restricted `P1/P2/P3` vocabulary; not coerced to a guessed priority, see Section 6) |
| TBDs remaining | 9 individual TBD items across 8 cases (see Section 6), plus TC-17 entirely |

`Type` normalized to the single restricted-vocabulary value **`API`** for all 17 cases (Stage 2's per-case field tables already used `Type: API` consistently; the Positive/Negative qualifier shown in Stage 2's summary table was descriptive only, not a second vocabulary value — preserved instead as part of each case's `Title` and in this document's own Type column commentary, not invented as a new hybrid category). No changes to test intent, steps, or expected results were made — only field-format normalization.

> **Post-normalization correction (2026-07-29, applied during Stage 5b live verification, no traceability break):** TC-03/TC-04/TC-05's category request-body values and TC-06/TC-08/TC-10/TC-14/TC-16's previously-TBD expected results were confirmed against the live API and corrected below and in the JSON export — see [`docs/Test Plans/demoblaze-api-catalog-cart-auth_test_plan.md`](../Test%20Plans/demoblaze-api-catalog-cart-auth_test_plan.md) Section 31 for the full rationale.

## 2. Normalized Test Case Table

### Module: Catalog API

| Field | TC-01 |
|---|---|
| Req ID | RQ-01 |
| Title | Entries endpoint returns full catalog with 200 OK |
| Type | API (Positive) |
| Priority | P1 |
| Preconditions | None — public, unauthenticated endpoint |
| Test Data | Endpoint: `GET /entries`; Headers: TBD; Body: none |
| Steps (1) | Send GET request to `/entries` with no body → Response status is `200`; body is valid JSON containing an `Items` field |
| Steps (2) | Extract the `Items` array from the response body → `Items` is an array with at least one element |
| Postconditions | None |
| Automation Candidate | Yes — `DemoblazeApiClient.getEntries()` (existing) |
| Tags | `@api`, `@regression` |
| Notes | SPEC's `/entries` matches the verified endpoint exactly — no discrepancy |

| Field | TC-02 |
|---|---|
| Req ID | RQ-02 |
| Title | Catalog item fields match the verified schema |
| Type | API (Positive) |
| Priority | P1 |
| Preconditions | None — public, unauthenticated endpoint |
| Test Data | Endpoint: `GET /entries`; Headers: TBD; Body: none |
| Steps (1) | Send GET request to `/entries` with no body → Response status is `200` |
| Steps (2) | Select the first item in the response `Items` array → An item object is present at `Items[0]` |
| Steps (3) | Verify the selected item's field names → Item exposes `id`, `title`, `price`, `cat`, `desc`, `img` (not SPEC's `category`/`description`/`image`); `id` is a number, `title` is a non-empty string, `price` is a number greater than 0 |
| Postconditions | None |
| Automation Candidate | Yes — `DemoblazeApiClient.getEntries()` (existing) + new field-level assertions against `DemoblazeProduct`/`DemoblazeEntriesResponse` |
| Tags | `@api`, `@regression` |
| Notes | Primary vehicle for confirming the SPEC-vs-implementation field-name discrepancy in automation |

### Module: Category Filter API

| Field | TC-03 |
|---|---|
| Req ID | RQ-03 |
| Title | Category filter returns only Phones products |
| Type | API (Positive) |
| Priority | P1 |
| Preconditions | None — public, unauthenticated endpoint |
| Test Data | Endpoint: `POST /bycat`; Headers: `Content-Type: application/json` (confirmed); Body: `{ "cat": "phone" }` (corrected — `"Phones"` returns empty silently) |
| Steps (1) | Send POST request to `/bycat` with body `{ "cat": "phone" }` → Response status is `200`; body is `{ "Items": [...] }` |
| Steps (2) | Verify the `cat` field of every item in `Items` → Every item's `cat` equals `"phone"` |
| Postconditions | None |
| Automation Candidate | Yes — `DemoblazeApiClient.getProductsByCategory('phone')` (existing) |
| Tags | `@api`, `@regression` |
| Notes | SPEC's `/prodByCat` is actually `/bycat`; category value corrected from `"Phones"` to `"phone"` (live-verified) |

| Field | TC-04 |
|---|---|
| Req ID | RQ-03 |
| Title | Category filter returns only Laptops products |
| Type | API (Positive) |
| Priority | P1 |
| Preconditions | None — public, unauthenticated endpoint |
| Test Data | Endpoint: `POST /bycat`; Headers: `Content-Type: application/json` (confirmed); Body: `{ "cat": "notebook" }` (corrected — `"Laptops"` returns empty silently) |
| Steps (1) | Send POST request to `/bycat` with body `{ "cat": "notebook" }` → Response status is `200`; body is `{ "Items": [...] }` |
| Steps (2) | Verify the `cat` field of every item in `Items` → Every item's `cat` equals `"notebook"` |
| Postconditions | None |
| Automation Candidate | Yes — `DemoblazeApiClient.getProductsByCategory('notebook')` (existing) |
| Tags | `@api`, `@regression` |
| Notes | Data-driven sibling of TC-03/TC-05; category value corrected from `"Laptops"` to `"notebook"` (live-verified) |

| Field | TC-05 |
|---|---|
| Req ID | RQ-03 |
| Title | Category filter returns only Monitors products |
| Type | API (Positive) |
| Priority | P1 |
| Preconditions | None — public, unauthenticated endpoint |
| Test Data | Endpoint: `POST /bycat`; Headers: `Content-Type: application/json` (confirmed); Body: `{ "cat": "monitor" }` (corrected — `"Monitors"` returns empty silently) |
| Steps (1) | Send POST request to `/bycat` with body `{ "cat": "monitor" }` → Response status is `200`; body is `{ "Items": [...] }` |
| Steps (2) | Verify the `cat` field of every item in `Items` → Every item's `cat` equals `"monitor"` |
| Postconditions | None |
| Automation Candidate | Yes — `DemoblazeApiClient.getProductsByCategory('monitor')` (existing) |
| Tags | `@api`, `@regression` |
| Notes | Data-driven sibling of TC-03/TC-04; category value corrected from `"Monitors"` to `"monitor"` (live-verified); TC-03/04/05 are candidates for one parameterized `test()` over `[phone, notebook, monitor]` |

| Field | TC-06 |
|---|---|
| Req ID | RQ-04 |
| Title | Invalid category is handled gracefully |
| Type | API (Negative) |
| Priority | P2 |
| Preconditions | None — public, unauthenticated endpoint |
| Test Data | Endpoint: `POST /bycat`; Headers: `Content-Type: application/json` (confirmed); Body: `{ "cat": "NonExistentCategory" }` |
| Steps (1) | Send POST request to `/bycat` with body `{ "cat": "NonExistentCategory" }` → Response status is `200` (confirmed live) |
| Steps (2) | Inspect the response status and body shape → Body is `{ "Items": [] }` — empty array, not an error (confirmed live) |
| Postconditions | None |
| Automation Candidate | Yes — `DemoblazeApiClient.getProductsByCategory()` (existing) |
| Tags | `@api`, `@regression` |
| Notes | Live-confirmed 2026-07-29 — no longer Blocked |

### Module: Product Details API

| Field | TC-07 |
|---|---|
| Req ID | RQ-05 |
| Title | Product details lookup by valid ID returns accurate data |
| Type | API (Positive) |
| Priority | P1 |
| Preconditions | None — product ID `1` known-valid per existing precedent |
| Test Data | Endpoint: `POST /view`; Headers: TBD; Body: `{ "id": 1 }` |
| Steps (1) | Send POST request to `/view` with body `{ "id": 1 }` → Response status is `200` |
| Steps (2) | Verify the response body fields → Body contains `title` (non-empty string), `price` (> 0); `desc`, `img` present |
| Postconditions | None |
| Automation Candidate | Yes — `DemoblazeApiClient.getProductById(1)` (existing) |
| Tags | `@api`, `@regression` |
| Notes | SPEC's `/viewproduct` is actually `/view` (`/prodbyid` also 404s) |

| Field | TC-08 |
|---|---|
| Req ID | RQ-06 |
| Title | Product details lookup by invalid ID does not crash |
| Type | API (Negative) |
| Priority | P1 |
| Preconditions | None — public, unauthenticated endpoint |
| Test Data | Endpoint: `POST /view`; Headers: `Content-Type: application/json` (confirmed); Body: `{ "id": 999999 }` |
| Steps (1) | Send POST request to `/view` with body `{ "id": 999999 }` → Response status is `200` (confirmed live, not `5xx`) |
| Steps (2) | Inspect the response status and body shape → Body is `{ "errorMessage": "Not found." }` (confirmed live) |
| Postconditions | None |
| Automation Candidate | Yes — `DemoblazeApiClient.getProductById()` (existing) |
| Tags | `@api`, `@regression` |
| Notes | Live-confirmed 2026-07-29 — no longer Blocked |

### Module: Authentication API

| Field | TC-09 |
|---|---|
| Req ID | RQ-07 |
| Title | Signup succeeds with unique valid credentials |
| Type | API (Positive) |
| Priority | P1 |
| Preconditions | New, never-used username generated for this test |
| Test Data | Endpoint: `POST /signup`; Headers: TBD; Body: `{ "username": "<generated>", "password": "<basePassword>" }` |
| Steps (1) | Generate a unique username/password via `generateCredentials()` → Unique username string produced |
| Steps (2) | Send POST request to `/signup` with the generated credentials → Response status `200`; body does not contain `errorMessage` |
| Postconditions | Created user persists on the shared live environment (used by TC-10/TC-11/TC-13); no cleanup endpoint exists |
| Automation Candidate | Yes — `DemoblazeApiClient.signup()` + `utils/randomData.ts.generateCredentials()` (existing) |
| Tags | `@api`, `@regression` |
| Notes | Exactly one signup per test run — no bulk account creation (shared-environment guardrail) |

| Field | TC-10 |
|---|---|
| Req ID | RQ-08 |
| Title | Signup fails for a duplicate username |
| Type | API (Negative) |
| Priority | P1 |
| Preconditions | Same username registered once already within this test |
| Test Data | Endpoint: `POST /signup`; Headers: TBD; Body: `{ "username": "<same generated username>", "password": "<basePassword>" }` |
| Steps (1) | Send POST request to `/signup` with a newly generated username → Response status `200`; body does not contain `errorMessage` |
| Steps (2) | Send POST request to `/signup` again with the same username → Response status `200`; body contains `errorMessage: "This user already exist."` (confirmed live) |
| Postconditions | One user account persists on the shared live environment |
| Automation Candidate | Yes — `DemoblazeApiClient.signup()` called twice (existing, call only; duplicate-call assertion Net New) |
| Tags | `@api`, `@regression` |
| Notes | Generates its own username — independently executable of TC-09 |

| Field | TC-11 |
|---|---|
| Req ID | RQ-09 |
| Title | Login succeeds with correct credentials and returns a usable token |
| Type | API (Positive) |
| Priority | P1 |
| Preconditions | A registered user exists (signup performed as this test's setup) |
| Test Data | Endpoint: `POST /login`; Headers: TBD; Body: `{ "username": "<generated>", "password": "<basePassword>" }` |
| Steps (1) | Send POST request to `/signup` with generated credentials (setup) → Response status `200`; body does not contain `errorMessage` |
| Steps (2) | Send POST request to `/login` with the same credentials → Response status `200`; body is a string containing `"Auth_token:"` |
| Postconditions | Usable session token exists for the test duration; no logout/token-revocation endpoint in scope |
| Automation Candidate | Yes — `DemoblazeApiClient.signup()` + `login()` (existing) |
| Tags | `@api`, `@regression` |
| Notes | None |

| Field | TC-12 |
|---|---|
| Req ID | RQ-10 |
| Title | Login fails for an unregistered username |
| Type | API (Negative) |
| Priority | P1 |
| Preconditions | Username never registered (no signup call made for it) |
| Test Data | Endpoint: `POST /login`; Headers: TBD; Body: `{ "username": "<generated, never signed up>", "password": "<basePassword>" }` |
| Steps (1) | Generate a username/password without calling `/signup` → Unique, never-registered username produced |
| Steps (2) | Send POST request to `/login` with the unregistered credentials → Response status `200`; body contains `errorMessage: "User does not exist."` |
| Postconditions | None — no account created |
| Automation Candidate | Yes — `DemoblazeApiClient.login()` (existing) |
| Tags | `@api`, `@regression` |
| Notes | Confirms the SPEC's "proper error messages" resolves to a body-level `errorMessage` on a `200` response |

| Field | TC-13 |
|---|---|
| Req ID | RQ-11 |
| Title | Login fails for a wrong password |
| Type | API (Negative) |
| Priority | P1 |
| Preconditions | A registered user exists (signup performed as this test's setup) |
| Test Data | Endpoint: `POST /login`; Headers: TBD; Body: `{ "username": "<generated, registered>", "password": "<deliberately wrong>" }` |
| Steps (1) | Send POST request to `/signup` with generated credentials (setup) → Response status `200`; body does not contain `errorMessage` |
| Steps (2) | Send POST request to `/login` with the same username and an incorrect password → Response status `200`; body contains `errorMessage: "Wrong password."` |
| Postconditions | One user account persists on the shared live environment |
| Automation Candidate | Yes — `DemoblazeApiClient.signup()` + `login()` (existing) |
| Tags | `@api`, `@regression` |
| Notes | Pairs with TC-12 to confirm the two distinct `errorMessage` strings |

### Module: Cart API

| Field | TC-14 |
|---|---|
| Req ID | RQ-12 |
| Title | Add-to-cart is reflected in view-cart (anonymous) |
| Type | API (Positive) |
| Priority | P1 |
| Preconditions | Anonymous session; client-generated `cartItemId`/`cookie` prepared |
| Test Data | Endpoints: `POST /addtocart`, `POST /viewcart`; Body (addtocart): `{ "id": "<cartItemId>", "cookie": "<cookie>", "prod_id": 1, "flag": false }`; Body (viewcart): `{ "cookie": "<cookie>", "flag": false }` |
| Steps (1) | Send POST request to `/addtocart` with `flag: false` → Response status `200` |
| Steps (2) | Send POST request to `/viewcart` with the same `cookie` and `flag: false` → Response status `200`; body contains an `Items` array |
| Steps (3) | Verify the added item is present in the `viewcart` response → `Items` contains an entry whose `id` equals the `cartItemId` and whose `prod_id` equals `1` (confirmed live) |
| Postconditions | One cart item persists for this `cookie` until deleted (see TC-15) |
| Automation Candidate | Yes — `DemoblazeApiClient.addToCart()` + `viewCart()` (existing) |
| Tags | `@api`, `@regression` |
| Notes | Always pair an add with a corresponding delete in the same test (shared-environment guardrail) |

| Field | TC-15 |
|---|---|
| Req ID | RQ-13 |
| Title | Removing a cart item deletes it from view-cart |
| Type | API (Positive) |
| Priority | P1 |
| Preconditions | A cart item was previously added within the same test |
| Test Data | Endpoints: `POST /addtocart`, `POST /deleteitem`, `POST /viewcart`; Body (deleteitem): `{ "id": "<same cartItemId>" }` |
| Steps (1) | Send POST request to `/addtocart` → Response status `200` |
| Steps (2) | Send POST request to `/deleteitem` with `{ "id": "<same cartItemId>" }` → Response status `200` |
| Steps (3) | Send POST request to `/viewcart` with the same `cookie` and `flag: false` → Response status `200`; body contains an `Items` array |
| Steps (4) | Verify the deleted item is absent from the `viewcart` response → `Items` does not contain an entry with the deleted `cartItemId` |
| Postconditions | No cart item remains for this `cookie` — self-cleaning |
| Automation Candidate | Yes — `DemoblazeApiClient.addToCart()` + `deleteCartItem()` + `viewCart()` (existing) |
| Tags | `@api`, `@regression` |
| Notes | SPEC's `/deleteitem` matches the verified implementation exactly — no discrepancy |

| Field | TC-16 |
|---|---|
| Req ID | RQ-14 |
| Title | Cart add/view reflects correctly for an authenticated session |
| Type | API (Positive) |
| Priority | P2 |
| Preconditions | A registered, logged-in user exists; valid `Auth_token:`-bearing session obtained |
| Test Data | Endpoints: `POST /signup`, `POST /login`, `POST /addtocart`, `POST /viewcart`; Body (addtocart): `{ "id": "<cartItemId>", "cookie": "<Auth_token value from login>", "prod_id": 1, "flag": true }`; Body (viewcart): `{ "cookie": "<same Auth_token value>", "flag": true }` — corrected 2026-07-29: `cookie` must be the real `Auth_token`, not an arbitrary string (confirmed live) |
| Steps (1) | Send POST request to `/signup` then `/login` with generated credentials (setup) → Both status `200`; login body contains `"Auth_token:"` |
| Steps (2) | Send POST request to `/addtocart` with `flag: true` → Response status `200` |
| Steps (3) | Send POST request to `/viewcart` with the same `cookie` and `flag: true` → Response status `200`; body contains an `Items` array |
| Steps (4) | Verify the added item is present in the `viewcart` response → `Items` contains an entry whose `id` equals the `cartItemId` and whose `prod_id` equals `1` (confirmed live, same shape as TC-14) |
| Postconditions | One user account and one cart item persist; cart item should be cleaned up via `/deleteitem` at test end |
| Automation Candidate | Yes — `DemoblazeApiClient.signup()` + `login()` + `addToCart(..., loggedIn: true)` + `viewCart(..., true)` (existing methods; `flag: true` path not yet exercised by any current spec — genuinely new scenario) |
| Tags | `@api`, `@regression` |
| Notes | Whether cart operations strictly *require* authentication (vs. merely supporting it) is unconfirmed — see Test Plan Assumption, Section 16 |

| Field | TC-17 |
|---|---|
| Req ID | RQ-15 |
| Title | Cart totals/quantities update as expected |
| Type | API |
| Priority | **TBD — schema violation, not coerced to P1/P2/P3** |
| Preconditions | TBD (Blocked) |
| Test Data | TBD (Blocked) |
| Steps (1) | Blocked — no `total`/`quantity` field exists in the verified `DemoblazeViewCartResponse`/`DemoblazeCartMutationResponse` types; only `Items[]` is confirmed |
| Postconditions | N/A |
| Automation Candidate | No — blocked pending a reviewer decision |
| Tags | — (none assigned; not automatable in current form) |
| Notes | Carried forward unresolved from the Test Plan/Stage 2 per the anti-fabrication guardrail; requires human decision (confirmed field, confirmed out-of-scope, or explicit descope) before this row can be completed or removed |

## 3. Structured Export (JSON)

```json
[
  { "testCaseId": "TC-01", "reqId": "RQ-01", "title": "Entries endpoint returns full catalog with 200 OK", "module": "Catalog API", "type": "API", "priority": "P1", "preconditions": ["None — public, unauthenticated endpoint"], "testData": ["Endpoint: GET /entries", "Headers: TBD", "Body: none"], "steps": [ { "step": 1, "action": "Send GET request to /entries with no body", "expectedResult": "Response status is 200; body is valid JSON containing an Items field" }, { "step": 2, "action": "Extract the Items array from the response body", "expectedResult": "Items is an array with at least one element" } ], "postconditions": "None", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.getEntries() (existing)", "tags": ["@api", "@regression"], "notes": "SPEC's /entries matches the verified endpoint exactly" },
  { "testCaseId": "TC-02", "reqId": "RQ-02", "title": "Catalog item fields match the verified schema", "module": "Catalog API", "type": "API", "priority": "P1", "preconditions": ["None — public, unauthenticated endpoint"], "testData": ["Endpoint: GET /entries", "Headers: TBD", "Body: none"], "steps": [ { "step": 1, "action": "Send GET request to /entries with no body", "expectedResult": "Response status is 200" }, { "step": 2, "action": "Select the first item in the response Items array", "expectedResult": "An item object is present at Items[0]" }, { "step": 3, "action": "Verify the selected item's field names", "expectedResult": "Item exposes id, title, price, cat, desc, img (not SPEC's category/description/image); id is a number, title is a non-empty string, price is a number greater than 0" } ], "postconditions": "None", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.getEntries() (existing) + new field-level assertions", "tags": ["@api", "@regression"], "notes": "Primary vehicle for confirming the SPEC-vs-implementation field-name discrepancy" },
  { "testCaseId": "TC-03", "reqId": "RQ-03", "title": "Category filter returns only Phones products", "module": "Category Filter API", "type": "API", "priority": "P1", "preconditions": ["None — public, unauthenticated endpoint"], "testData": ["Endpoint: POST /bycat", "Headers: Content-Type: application/json (confirmed)", "Body: { \"cat\": \"phone\" }"], "steps": [ { "step": 1, "action": "Send POST request to /bycat with body { cat: 'phone' }", "expectedResult": "Response status is 200; body is { Items: [...] }" }, { "step": 2, "action": "Verify the cat field of every item in Items", "expectedResult": "Every item's cat equals 'phone'" } ], "postconditions": "None", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.getProductsByCategory('phone') (existing)", "tags": ["@api", "@regression"], "notes": "SPEC's /prodByCat is actually /bycat; category value corrected from 'Phones' to 'phone' (live-verified)" },
  { "testCaseId": "TC-04", "reqId": "RQ-03", "title": "Category filter returns only Laptops products", "module": "Category Filter API", "type": "API", "priority": "P1", "preconditions": ["None — public, unauthenticated endpoint"], "testData": ["Endpoint: POST /bycat", "Headers: Content-Type: application/json (confirmed)", "Body: { \"cat\": \"notebook\" }"], "steps": [ { "step": 1, "action": "Send POST request to /bycat with body { cat: 'notebook' }", "expectedResult": "Response status is 200; body is { Items: [...] }" }, { "step": 2, "action": "Verify the cat field of every item in Items", "expectedResult": "Every item's cat equals 'notebook'" } ], "postconditions": "None", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.getProductsByCategory('notebook') (existing)", "tags": ["@api", "@regression"], "notes": "Data-driven sibling of TC-03/TC-05; category value corrected from 'Laptops' to 'notebook' (live-verified)" },
  { "testCaseId": "TC-05", "reqId": "RQ-03", "title": "Category filter returns only Monitors products", "module": "Category Filter API", "type": "API", "priority": "P1", "preconditions": ["None — public, unauthenticated endpoint"], "testData": ["Endpoint: POST /bycat", "Headers: Content-Type: application/json (confirmed)", "Body: { \"cat\": \"monitor\" }"], "steps": [ { "step": 1, "action": "Send POST request to /bycat with body { cat: 'monitor' }", "expectedResult": "Response status is 200; body is { Items: [...] }" }, { "step": 2, "action": "Verify the cat field of every item in Items", "expectedResult": "Every item's cat equals 'monitor'" } ], "postconditions": "None", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.getProductsByCategory('monitor') (existing)", "tags": ["@api", "@regression"], "notes": "Data-driven sibling of TC-03/TC-04; category value corrected from 'Monitors' to 'monitor' (live-verified); candidate for one parameterized test() over [phone, notebook, monitor]" },
  { "testCaseId": "TC-06", "reqId": "RQ-04", "title": "Invalid category is handled gracefully", "module": "Category Filter API", "type": "API", "priority": "P2", "preconditions": ["None — public, unauthenticated endpoint"], "testData": ["Endpoint: POST /bycat", "Headers: Content-Type: application/json (confirmed)", "Body: { \"cat\": \"NonExistentCategory\" }"], "steps": [ { "step": 1, "action": "Send POST request to /bycat with body { cat: 'NonExistentCategory' }", "expectedResult": "Response status is 200 (confirmed live)" }, { "step": 2, "action": "Inspect the response status and body shape", "expectedResult": "Body is { Items: [] } — empty array, not an error (confirmed live)" } ], "postconditions": "None", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.getProductsByCategory() (existing)", "tags": ["@api", "@regression"], "notes": "Live-confirmed 2026-07-29 — no longer Blocked" },
  { "testCaseId": "TC-07", "reqId": "RQ-05", "title": "Product details lookup by valid ID returns accurate data", "module": "Product Details API", "type": "API", "priority": "P1", "preconditions": ["None — product ID 1 known-valid per existing precedent"], "testData": ["Endpoint: POST /view", "Headers: TBD", "Body: { \"id\": 1 }"], "steps": [ { "step": 1, "action": "Send POST request to /view with body { id: 1 }", "expectedResult": "Response status is 200" }, { "step": 2, "action": "Verify the response body fields", "expectedResult": "Body contains title (non-empty string), price (> 0); desc, img present" } ], "postconditions": "None", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.getProductById(1) (existing)", "tags": ["@api", "@regression"], "notes": "SPEC's /viewproduct is actually /view" },
  { "testCaseId": "TC-08", "reqId": "RQ-06", "title": "Product details lookup by invalid ID does not crash", "module": "Product Details API", "type": "API", "priority": "P1", "preconditions": ["None — public, unauthenticated endpoint"], "testData": ["Endpoint: POST /view", "Headers: Content-Type: application/json (confirmed)", "Body: { \"id\": 999999 }"], "steps": [ { "step": 1, "action": "Send POST request to /view with body { id: 999999 }", "expectedResult": "Response status is 200 (confirmed live, not 5xx)" }, { "step": 2, "action": "Inspect the response status and body shape", "expectedResult": "Body is { errorMessage: 'Not found.' } (confirmed live)" } ], "postconditions": "None", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.getProductById() (existing)", "tags": ["@api", "@regression"], "notes": "Live-confirmed 2026-07-29 — no longer Blocked" },
  { "testCaseId": "TC-09", "reqId": "RQ-07", "title": "Signup succeeds with unique valid credentials", "module": "Authentication API", "type": "API", "priority": "P1", "preconditions": ["New, never-used username generated for this test"], "testData": ["Endpoint: POST /signup", "Headers: TBD", "Body: { username: <generated>, password: <basePassword> }"], "steps": [ { "step": 1, "action": "Generate a unique username/password via generateCredentials()", "expectedResult": "Unique username string produced" }, { "step": 2, "action": "Send POST request to /signup with the generated credentials", "expectedResult": "Response status 200; body does not contain errorMessage" } ], "postconditions": "Created user persists on the shared live environment; no cleanup endpoint exists", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.signup() + utils/randomData.ts.generateCredentials() (existing)", "tags": ["@api", "@regression"], "notes": "Exactly one signup per test run (shared-environment guardrail)" },
  { "testCaseId": "TC-10", "reqId": "RQ-08", "title": "Signup fails for a duplicate username", "module": "Authentication API", "type": "API", "priority": "P1", "preconditions": ["Same username registered once already within this test"], "testData": ["Endpoint: POST /signup", "Headers: TBD", "Body: { username: <same generated username>, password: <basePassword> }"], "steps": [ { "step": 1, "action": "Send POST request to /signup with a newly generated username", "expectedResult": "Response status 200; body does not contain errorMessage" }, { "step": 2, "action": "Send POST request to /signup again with the same username", "expectedResult": "Response status 200; body contains errorMessage: 'This user already exist.' (confirmed live)" } ], "postconditions": "One user account persists on the shared live environment", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.signup() called twice (existing)", "tags": ["@api", "@regression"], "notes": "Live-confirmed 2026-07-29. Generates its own username — independently executable of TC-09" },
  { "testCaseId": "TC-11", "reqId": "RQ-09", "title": "Login succeeds with correct credentials and returns a usable token", "module": "Authentication API", "type": "API", "priority": "P1", "preconditions": ["A registered user exists (signup performed as this test's setup)"], "testData": ["Endpoint: POST /login", "Headers: TBD", "Body: { username: <generated>, password: <basePassword> }"], "steps": [ { "step": 1, "action": "Send POST request to /signup with generated credentials (setup)", "expectedResult": "Response status 200; body does not contain errorMessage" }, { "step": 2, "action": "Send POST request to /login with the same credentials", "expectedResult": "Response status 200; body is a string containing 'Auth_token:'" } ], "postconditions": "Usable session token exists for the test duration", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.signup() + login() (existing)", "tags": ["@api", "@regression"], "notes": "None" },
  { "testCaseId": "TC-12", "reqId": "RQ-10", "title": "Login fails for an unregistered username", "module": "Authentication API", "type": "API", "priority": "P1", "preconditions": ["Username never registered"], "testData": ["Endpoint: POST /login", "Headers: TBD", "Body: { username: <generated, never signed up>, password: <basePassword> }"], "steps": [ { "step": 1, "action": "Generate a username/password without calling /signup", "expectedResult": "Unique, never-registered username produced" }, { "step": 2, "action": "Send POST request to /login with the unregistered credentials", "expectedResult": "Response status 200; body contains errorMessage: 'User does not exist.'" } ], "postconditions": "None — no account created", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.login() (existing)", "tags": ["@api", "@regression"], "notes": "Confirms body-level errorMessage on a 200 response" },
  { "testCaseId": "TC-13", "reqId": "RQ-11", "title": "Login fails for a wrong password", "module": "Authentication API", "type": "API", "priority": "P1", "preconditions": ["A registered user exists (signup performed as this test's setup)"], "testData": ["Endpoint: POST /login", "Headers: TBD", "Body: { username: <generated, registered>, password: <deliberately wrong> }"], "steps": [ { "step": 1, "action": "Send POST request to /signup with generated credentials (setup)", "expectedResult": "Response status 200; body does not contain errorMessage" }, { "step": 2, "action": "Send POST request to /login with the same username and an incorrect password", "expectedResult": "Response status 200; body contains errorMessage: 'Wrong password.'" } ], "postconditions": "One user account persists on the shared live environment", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.signup() + login() (existing)", "tags": ["@api", "@regression"], "notes": "Pairs with TC-12 to confirm the two distinct errorMessage strings" },
  { "testCaseId": "TC-14", "reqId": "RQ-12", "title": "Add-to-cart is reflected in view-cart (anonymous)", "module": "Cart API", "type": "API", "priority": "P1", "preconditions": ["Anonymous session; client-generated cartItemId/cookie prepared"], "testData": ["Endpoints: POST /addtocart, POST /viewcart", "Body (addtocart): { id: <cartItemId>, cookie: <cookie>, prod_id: 1, flag: false }", "Body (viewcart): { cookie: <cookie>, flag: false }"], "steps": [ { "step": 1, "action": "Send POST request to /addtocart with flag: false", "expectedResult": "Response status 200" }, { "step": 2, "action": "Send POST request to /viewcart with the same cookie and flag: false", "expectedResult": "Response status 200; body contains an Items array" }, { "step": 3, "action": "Verify the added item is present in the viewcart response", "expectedResult": "Items contains an entry whose id equals the cartItemId and whose prod_id equals 1 (confirmed live)" } ], "postconditions": "One cart item persists for this cookie until deleted (see TC-15)", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.addToCart() + viewCart() (existing)", "tags": ["@api", "@regression"], "notes": "Always pair an add with a corresponding delete (shared-environment guardrail)" },
  { "testCaseId": "TC-15", "reqId": "RQ-13", "title": "Removing a cart item deletes it from view-cart", "module": "Cart API", "type": "API", "priority": "P1", "preconditions": ["A cart item was previously added within the same test"], "testData": ["Endpoints: POST /addtocart, POST /deleteitem, POST /viewcart", "Body (deleteitem): { id: <same cartItemId> }"], "steps": [ { "step": 1, "action": "Send POST request to /addtocart", "expectedResult": "Response status 200" }, { "step": 2, "action": "Send POST request to /deleteitem with { id: <same cartItemId> }", "expectedResult": "Response status 200" }, { "step": 3, "action": "Send POST request to /viewcart with the same cookie and flag: false", "expectedResult": "Response status 200; body contains an Items array" }, { "step": 4, "action": "Verify the deleted item is absent from the viewcart response", "expectedResult": "Items does not contain an entry with the deleted cartItemId" } ], "postconditions": "No cart item remains for this cookie — self-cleaning", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.addToCart() + deleteCartItem() + viewCart() (existing)", "tags": ["@api", "@regression"], "notes": "SPEC's /deleteitem matches the verified implementation exactly" },
  { "testCaseId": "TC-16", "reqId": "RQ-14", "title": "Cart add/view reflects correctly for an authenticated session", "module": "Cart API", "type": "API", "priority": "P2", "preconditions": ["A registered, logged-in user exists; valid Auth_token:-bearing session obtained"], "testData": ["Endpoints: POST /signup, POST /login, POST /addtocart, POST /viewcart", "Body (addtocart): { id: <cartItemId>, cookie: <Auth_token value from login>, prod_id: 1, flag: true }", "Body (viewcart): { cookie: <same Auth_token value>, flag: true }"], "steps": [ { "step": 1, "action": "Send POST request to /signup then /login with generated credentials (setup)", "expectedResult": "Both status 200; login body contains 'Auth_token:'" }, { "step": 2, "action": "Send POST request to /addtocart with flag: true", "expectedResult": "Response status 200" }, { "step": 3, "action": "Send POST request to /viewcart with the same cookie and flag: true", "expectedResult": "Response status 200; body contains an Items array" }, { "step": 4, "action": "Verify the added item is present in the viewcart response", "expectedResult": "Items contains an entry whose id equals the cartItemId and whose prod_id equals 1 (confirmed live, same shape as TC-14)" } ], "postconditions": "One user account and one cart item persist; cart item should be cleaned up via /deleteitem", "automationCandidate": true, "automationMapping": "DemoblazeApiClient.signup() + login() + addToCart(..., loggedIn: true) + viewCart(..., true) (existing methods; flag: true path not yet exercised by any current spec)", "tags": ["@api", "@regression"], "notes": "Live-confirmed 2026-07-29: cookie must be the real Auth_token for flag: true, not an arbitrary string (rejected with 'Bad parameter, token malformed.')" },
  { "testCaseId": "TC-17", "reqId": "RQ-15", "title": "Cart totals/quantities update as expected", "module": "Cart API", "type": "API", "priority": "TBD", "preconditions": ["TBD (Blocked)"], "testData": ["TBD (Blocked)"], "steps": [ { "step": 1, "action": "Blocked — no total/quantity field exists in the verified response types", "expectedResult": "Blocked — pending reviewer decision (confirmed field, confirmed out-of-scope, or explicit descope)" } ], "postconditions": "N/A", "automationCandidate": false, "automationMapping": "TBD — blocked pending reviewer decision", "tags": [], "notes": "Carried forward unresolved from the Test Plan/Stage 2 per the anti-fabrication guardrail" }
]
```

## 4. Traceability Integrity Report

| Req ID | Test Case ID | Chain Intact? |
|---|---|---|
| RQ-01 | TC-01 | Yes — unchanged from Test Plan RTM through Stage 2 |
| RQ-02 | TC-02 | Yes — unchanged from Test Plan RTM through Stage 2 |
| RQ-03 | TC-03, TC-04, TC-05 | Yes — unchanged (one Req ID spanning three data-driven cases, as in the source Test Plan RTM) |
| RQ-04 | TC-06 | Yes — unchanged |
| RQ-05 | TC-07 | Yes — unchanged |
| RQ-06 | TC-08 | Yes — unchanged |
| RQ-07 | TC-09 | Yes — unchanged |
| RQ-08 | TC-10 | Yes — unchanged |
| RQ-09 | TC-11 | Yes — unchanged |
| RQ-10 | TC-12 | Yes — unchanged |
| RQ-11 | TC-13 | Yes — unchanged |
| RQ-12 | TC-14 | Yes — unchanged |
| RQ-13 | TC-15 | Yes — unchanged |
| RQ-14 | TC-16 | Yes — unchanged |
| RQ-15 | TC-17 | Yes, chain intact — but the case content itself is Blocked (not a traceability break; see Section 6) |

No breaks detected. All 15 `Req ID`s and 17 `Test Case ID`s match the source Test Plan RTM (Section 31) exactly.

## 5. Rejected / Open Items Log

No cases rejected outright. One schema violation and one structurally incomplete case, both carried forward rather than dropped or guessed:

| # | Test Case ID | Issue | Disposition |
|---|---|---|---|
| 1 | TC-17 | `Priority` is `TBD`, not a member of the restricted `P1/P2/P3` vocabulary | Not coerced to a guessed priority; flagged as a schema violation, case carried forward with TBD content pending a human decision |

TBDs resolved during Stage 5b live verification (2026-07-29), no longer open: exact response for an invalid category (TC-06), exact response for an invalid product ID (TC-08), exact `errorMessage` text for duplicate signup (TC-10), exact matching field for a cart item in `viewcart` (TC-14, TC-16 — `id`/`prod_id`), and whether an explicit `Content-Type` header is needed (confirmed present in verification calls; existing client's implicit Playwright JSON serialization was already sufficient for all passing tests, so no client change made). A new discrepancy was also discovered and corrected: TC-03/TC-04/TC-05's category request-body values (see Section 1 note).

Carried-forward TBDs (still unresolved information, not defects):

| # | Test Case ID | TBD |
|---|---|---|
| 1 | TC-16 | Whether anonymous (`flag: false`) cart access is ever *disallowed* where authentication should be required — resolved for the `flag: true` path itself (confirmed live 2026-07-29: `cookie` must be a real `Auth_token`, an arbitrary string is rejected with `"Bad parameter, token malformed."`), but not for whether `flag: false` access is ever blocked |
| 2 | TC-17 | Priority/automation status pending reviewer decision on cart totals/quantities (see schema violation above) |
| 3 | TC-17 | Entire case content (preconditions, test data, steps, expected result) blocked pending the same decision |
