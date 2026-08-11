<!-- Generated-by: ReuseMatcherAgent · demoblaze-api-catalog-cart-auth · 2026-07-29 · AI-generated, human review required -->

# Reuse Mapping Report — demoblaze-api-catalog-cart-auth

> Source: [`docs/normalizer/demoblaze-api-catalog-cart-auth.md`](../normalizer/demoblaze-api-catalog-cart-auth.md) (Stage 3)
> Pipeline Stage: 4 (Reuse Matcher, read-only) · Version: 1.0 · Date: 2026-07-29
> Codebase scanned (API-typed cases only, per [`testpal-api-conventions`](../../.claude/skills/testpal-api-conventions/SKILL.md)): `api/clients/BaseApiClient.ts`, `api/clients/DemoblazeApiClient.ts`, `api/types/demoblazeApiTypes.ts`, `api/fixtures/apiFixture.ts`, `api/fixtures/apiHooks.ts`, `tests/api/api.001.spec.ts`, `utils/randomData.ts`. No `pages/**`/`locators/**` scan performed — all 17 normalized cases are `Type: API`.

## 1. Reuse Summary

| Classification | Count |
|---|---|
| Full Reuse | 4 (TC-01, TC-09, TC-11, TC-12) |
| Partial Reuse | 10 (TC-02, TC-03, TC-04, TC-05, TC-07, TC-10, TC-13, TC-14, TC-15, TC-16) |
| Net New | 2 (TC-06, TC-08) |
| Unverifiable | 1 (TC-17) |
| **Total** | **17** |

**Headline finding:** `DemoblazeApiClient` already wraps every endpoint this ticket needs (`signup`, `login`, `getEntries`, `getProductsByCategory`, `getProductById`, `addToCart`, `viewCart`, `deleteCartItem`) — **zero new client methods, zero new API client files, and zero new request/response types are required** for any of the 17 cases, including the 2 Net New ones. What's actually missing in every Partial/Net New case is **test-level coverage** (a new `test()` in `tests/api/**`, or new assertions inside one) — never new `api/**` code. Stage 5b should read this report's "Recommended New Automation Assets" section (Section 5) carefully: it deliberately recommends no new client/type stubs and instead scopes new/extended `test()` cases.

## 2. Reuse Mapping Table

### Module: Catalog API

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-01 | RQ-01 | **Full Reuse** | `DemoblazeApiClient.getEntries()` ([api/clients/DemoblazeApiClient.ts:32-34](../../api/clients/DemoblazeApiClient.ts)); `DemoblazeEntriesResponse` ([api/types/demoblazeApiTypes.ts:35-38](../../api/types/demoblazeApiTypes.ts)); existing spec `tests/api/api.001.spec.ts:9-14` ("entries endpoint returns the product catalog" — asserts status 200 and `Items` is an array); `demoblazeApiClient` fixture ([api/fixtures/apiFixture.ts:8-11](../../api/fixtures/apiFixture.ts)) | 1.0 | Existing test already asserts exactly what TC-01 requires. No new automation warranted. |
| TC-02 | RQ-02 | **Partial Reuse** | `DemoblazeApiClient.getEntries()` (same as TC-01); `DemoblazeProduct` ([api/types/demoblazeApiTypes.ts:26-33](../../api/types/demoblazeApiTypes.ts)) already models `id`/`title`/`price`/`cat`/`desc`/`img` | 0.7 | Call and type are fully reusable, but no existing test asserts individual field names/types on a catalog item — the exact SPEC-vs-implementation discrepancy (`cat` not `category`, etc.) is not currently exercised anywhere. New assertions needed, not a new call. |

### Module: Category Filter API

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-03 | RQ-03 | **Partial Reuse** | `DemoblazeApiClient.getProductsByCategory()` ([api/clients/DemoblazeApiClient.ts:36-38](../../api/clients/DemoblazeApiClient.ts)); `DemoblazeProduct.cat` field (same type as TC-02) | 0.7 | Method fully covers `POST /bycat`, but **no existing spec test calls this endpoint at all** — `tests/api/api.001.spec.ts` has no `bycat` test today. Entirely new `test()` needed asserting every returned item's `cat === 'Phones'`. |
| TC-04 | RQ-03 | **Partial Reuse** | Same as TC-03 | 0.7 | Same gap as TC-03, for `Laptops`. |
| TC-05 | RQ-03 | **Partial Reuse** | Same as TC-03 | 0.7 | Same gap as TC-03, for `Monitors`. TC-03/04/05 are strong candidates for one new parameterized `test()`. |
| TC-06 | RQ-04 | **Net New** | `DemoblazeApiClient.getProductsByCategory()` (call only — same method as TC-03/04/05) | 0.4 | The call itself is reusable, but zero existing type or test models an invalid-category response, and the live contract is unconfirmed (Test Plan R6). Scored Net New rather than Partial because there is no verified basis for *any* assertion yet — Stage 5b must exercise the endpoint live before writing one, per the anti-fabrication guardrail. No new client method needed once the shape is confirmed. |

### Module: Product Details API

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-07 | RQ-05 | **Partial Reuse** | `DemoblazeApiClient.getProductById()` ([api/clients/DemoblazeApiClient.ts:42-44](../../api/clients/DemoblazeApiClient.ts)); existing spec `tests/api/api.001.spec.ts:43-49` ("product lookup by id returns a product payload" — asserts status 200, `title` truthy, `price` > 0); `DemoblazeProduct` type | 0.7 | Existing test covers `title`/`price` but not `desc`/`img`, which TC-07 also requires per the verified `DemoblazeProduct` shape. Gap is additive assertions on an existing, passing test — not a new call. |
| TC-08 | RQ-06 | **Net New** | `DemoblazeApiClient.getProductById()` (call only) | 0.4 | Same reasoning as TC-06: call is reusable, but invalid-ID response shape is unconfirmed and no existing test/type covers it. No new client method needed once confirmed. |

### Module: Authentication API

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-09 | RQ-07 | **Full Reuse** | `DemoblazeApiClient.signup()` ([api/clients/DemoblazeApiClient.ts:18-20](../../api/clients/DemoblazeApiClient.ts)); `generateCredentials()` ([utils/randomData.ts:14-17](../../utils/randomData.ts)); `DemoblazeSignupResponse` ([api/types/demoblazeApiTypes.ts:17](../../api/types/demoblazeApiTypes.ts)); existing spec `tests/api/api.001.spec.ts:16-21` (signup portion of "signup followed by login...") | 1.0 | Existing test's signup assertions (status 200, no `errorMessage`) already satisfy TC-09 exactly. |
| TC-10 | RQ-08 | **Partial Reuse** | `DemoblazeApiClient.signup()` (same as TC-09); `DemoblazeErrorResponse` ([api/types/demoblazeApiTypes.ts:11-13](../../api/types/demoblazeApiTypes.ts)) | 0.7 | No existing test calls `/signup` twice with the same username or asserts a duplicate-username `errorMessage`. Call and error type are fully reusable; the two-call orchestration and assertion are new. |
| TC-11 | RQ-09 | **Full Reuse** | `DemoblazeApiClient.signup()` + `login()` ([api/clients/DemoblazeApiClient.ts:18-24](../../api/clients/DemoblazeApiClient.ts)); `DemoblazeLoginResponse` ([api/types/demoblazeApiTypes.ts:22](../../api/types/demoblazeApiTypes.ts)); existing spec `tests/api/api.001.spec.ts:16-28` (full "signup followed by login..." test) | 1.0 | Existing test's login assertions (status 200, string containing `Auth_token:`) already satisfy TC-11 exactly. |
| TC-12 | RQ-10 | **Full Reuse** | `DemoblazeApiClient.login()` ([api/clients/DemoblazeApiClient.ts:22-24](../../api/clients/DemoblazeApiClient.ts)); existing spec `tests/api/api.001.spec.ts:34-41` ("login with an unregistered user..." — asserts status 200 and `errorMessage: 'User does not exist.'`) | 1.0 | Exact match, including the exact error string TC-12 requires. |
| TC-13 | RQ-11 | **Partial Reuse** | `DemoblazeApiClient.signup()` + `login()` (same as TC-11); `DemoblazeErrorResponse` type | 0.7 | No existing test exercises a wrong-password (as opposed to unregistered-username) login, or asserts `errorMessage: 'Wrong password.'`. Calls and type are fully reusable; the scenario and assertion are new. |

### Module: Cart API

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-14 | RQ-12 | **Partial Reuse** | `DemoblazeApiClient.addToCart()` + `viewCart()` ([api/clients/DemoblazeApiClient.ts:50-57](../../api/clients/DemoblazeApiClient.ts)); `DemoblazeViewCartResponse`/`DemoblazeCartItem` ([api/types/demoblazeApiTypes.ts:40-45](../../api/types/demoblazeApiTypes.ts)); existing spec `tests/api/api.001.spec.ts:51-63` ("add to cart followed by view cart...") | 0.7 | Existing test calls both endpoints but only asserts `Items` is an array — it never verifies the **added item specifically** is present. TC-14's core requirement (reflection of the added item) is not yet asserted. |
| TC-15 | RQ-13 | **Partial Reuse** | `DemoblazeApiClient.deleteCartItem()` ([api/clients/DemoblazeApiClient.ts:61-63](../../api/clients/DemoblazeApiClient.ts)); same add/view assets as TC-14; existing spec calls `deleteCartItem()` at line 62 as cleanup only | 0.7 | Existing test calls `deleteCartItem()` but never re-calls `/viewcart` afterward to confirm removal — TC-15's core assertion (absence after delete) doesn't exist yet. |
| TC-16 | RQ-14 | **Partial Reuse** | `DemoblazeApiClient.signup()`/`login()`/`addToCart()`/`viewCart()` — all already accept the `loggedIn`/`flag: true` path via existing method signatures ([api/clients/DemoblazeApiClient.ts:50-57](../../api/clients/DemoblazeApiClient.ts)) | 0.7 | The client already fully supports `flag: true`; this is Full Reuse at the client-code level. But `tests/api/api.001.spec.ts` only ever exercises `flag: false` (line 55) — the authenticated path has zero spec-level coverage today, so a wholly new `test()` is needed even though no new client code is. |
| TC-17 | RQ-15 | **Unverifiable** | — | N/A | No field in the verified `DemoblazeViewCartResponse`/`DemoblazeCartMutationResponse` types models totals or quantities (see Test Plan Section 4.2/R4). Cannot determine reusability of anything — client, type, or test — until a human decision or a live response sample resolves RQ-15. Not scored 0.0/Net New because that would imply "build it net-new," which isn't actionable without first resolving what "it" is. |

## 3. Structured Export (JSON)

```json
[
  { "testCaseId": "TC-01", "reqId": "RQ-01", "module": "Catalog API", "classification": "Full Reuse", "confidenceScore": 1.0, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.getEntries():32-34" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeEntriesResponse:35-38" }, { "type": "spec", "file": "tests/api/api.001.spec.ts", "reference": "entries endpoint returns the product catalog:9-14" }, { "type": "fixture", "file": "api/fixtures/apiFixture.ts", "reference": "demoblazeApiClient:8-11" } ], "gap": null, "recommendedNewAssets": [], "riskFlags": [], "notes": "Existing test already asserts exactly what TC-01 requires." },
  { "testCaseId": "TC-02", "reqId": "RQ-02", "module": "Catalog API", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.getEntries():32-34" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeProduct:26-33" } ], "gap": "No existing test asserts individual catalog-item field names/types (id/title/price/cat/desc/img) — needs new assertions on an existing call.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Vehicle for confirming the SPEC-vs-implementation field-name discrepancy in automation; no new client code needed." },
  { "testCaseId": "TC-03", "reqId": "RQ-03", "module": "Category Filter API", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.getProductsByCategory():36-38" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeProduct.cat:26-33" } ], "gap": "No existing spec test calls POST /bycat at all — new test() needed asserting every item's cat === 'Phones'.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Candidate for a parameterized test() shared with TC-04/TC-05." },
  { "testCaseId": "TC-04", "reqId": "RQ-03", "module": "Category Filter API", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.getProductsByCategory():36-38" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeProduct.cat:26-33" } ], "gap": "Same as TC-03, for 'Laptops'.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Candidate for a parameterized test() shared with TC-03/TC-05." },
  { "testCaseId": "TC-05", "reqId": "RQ-03", "module": "Category Filter API", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.getProductsByCategory():36-38" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeProduct.cat:26-33" } ], "gap": "Same as TC-03, for 'Monitors'.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Candidate for a parameterized test() shared with TC-03/TC-04." },
  { "testCaseId": "TC-06", "reqId": "RQ-04", "module": "Category Filter API", "classification": "Net New", "confidenceScore": 0.4, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.getProductsByCategory():36-38" } ], "gap": null, "recommendedNewAssets": [], "riskFlags": ["unconfirmed-live-contract"], "notes": "Call is reusable; assertion is Net New pending a live confirmation step (Test Plan R6). No new client method required." },
  { "testCaseId": "TC-07", "reqId": "RQ-05", "module": "Product Details API", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.getProductById():42-44" }, { "type": "spec", "file": "tests/api/api.001.spec.ts", "reference": "product lookup by id returns a product payload:43-49" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeProduct:26-33" } ], "gap": "Existing test asserts title/price but not desc/img, which TC-07 also requires.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Additive assertions on an existing, passing test." },
  { "testCaseId": "TC-08", "reqId": "RQ-06", "module": "Product Details API", "classification": "Net New", "confidenceScore": 0.4, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.getProductById():42-44" } ], "gap": null, "recommendedNewAssets": [], "riskFlags": ["unconfirmed-live-contract"], "notes": "Same reasoning as TC-06 — call reusable, assertion Net New pending live confirmation." },
  { "testCaseId": "TC-09", "reqId": "RQ-07", "module": "Authentication API", "classification": "Full Reuse", "confidenceScore": 1.0, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.signup():18-20" }, { "type": "method", "file": "utils/randomData.ts", "reference": "generateCredentials():14-17" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeSignupResponse:17" }, { "type": "spec", "file": "tests/api/api.001.spec.ts", "reference": "signup followed by login... (signup portion):16-21" } ], "gap": null, "recommendedNewAssets": [], "riskFlags": [], "notes": "Existing signup assertions already satisfy TC-09 exactly." },
  { "testCaseId": "TC-10", "reqId": "RQ-08", "module": "Authentication API", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.signup():18-20" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeErrorResponse:11-13" } ], "gap": "No existing test calls /signup twice with the same username or asserts a duplicate-username errorMessage.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Two-call orchestration and assertion are new; call and type are fully reusable." },
  { "testCaseId": "TC-11", "reqId": "RQ-09", "module": "Authentication API", "classification": "Full Reuse", "confidenceScore": 1.0, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.signup():18-20 + login():22-24" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeLoginResponse:22" }, { "type": "spec", "file": "tests/api/api.001.spec.ts", "reference": "signup followed by login...:16-28" } ], "gap": null, "recommendedNewAssets": [], "riskFlags": [], "notes": "Existing login assertions already satisfy TC-11 exactly." },
  { "testCaseId": "TC-12", "reqId": "RQ-10", "module": "Authentication API", "classification": "Full Reuse", "confidenceScore": 1.0, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.login():22-24" }, { "type": "spec", "file": "tests/api/api.001.spec.ts", "reference": "login with an unregistered user...:34-41" } ], "gap": null, "recommendedNewAssets": [], "riskFlags": [], "notes": "Exact match, including the exact error string TC-12 requires." },
  { "testCaseId": "TC-13", "reqId": "RQ-11", "module": "Authentication API", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.signup():18-20 + login():22-24" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeErrorResponse:11-13" } ], "gap": "No existing test exercises a wrong-password login or asserts errorMessage: 'Wrong password.'", "recommendedNewAssets": [], "riskFlags": [], "notes": "Calls and type are fully reusable; scenario and assertion are new." },
  { "testCaseId": "TC-14", "reqId": "RQ-12", "module": "Cart API", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.addToCart():50-53 + viewCart():55-57" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeViewCartResponse/DemoblazeCartItem:40-45" }, { "type": "spec", "file": "tests/api/api.001.spec.ts", "reference": "add to cart followed by view cart...:51-63" } ], "gap": "Existing test only asserts Items is an array — never verifies the added item specifically is present.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Core TC-14 requirement (reflection of the added item) is not yet asserted." },
  { "testCaseId": "TC-15", "reqId": "RQ-13", "module": "Cart API", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.deleteCartItem():61-63" }, { "type": "spec", "file": "tests/api/api.001.spec.ts", "reference": "add to cart followed by view cart... (deleteCartItem as cleanup only):62" } ], "gap": "Existing test calls deleteCartItem() but never re-calls /viewcart afterward to confirm removal.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Core TC-15 requirement (absence after delete) doesn't exist yet." },
  { "testCaseId": "TC-16", "reqId": "RQ-14", "module": "Cart API", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.signup()/login()/addToCart()/viewCart():18-57" } ], "gap": "Client already fully supports flag: true (Full Reuse at code level), but no existing test exercises the authenticated path — tests/api/api.001.spec.ts:55 only uses flag: false.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Wholly new test() needed; zero new client code needed." },
  { "testCaseId": "TC-17", "reqId": "RQ-15", "module": "Cart API", "classification": "Unverifiable", "confidenceScore": null, "matchedAssets": [], "gap": "TBD", "recommendedNewAssets": [], "riskFlags": ["blocked-pending-human-decision"], "notes": "No field in verified response types models totals/quantities; cannot classify reuse until RQ-15 is resolved (see Test Plan Section 4.2/R4)." }
]
```

## 4. Recommended New Automation Assets

**No new API client methods, no new API client files, and no new request/response types are recommended for any of the 17 cases.** `DemoblazeApiClient` already exposes every method this ticket's endpoints need. What Stage 5b actually needs to add is test-level, all inside `tests/api/{epic}/{ticketNo}.spec.ts`:

| For Test Case(s) | What's needed | Why not a client change |
|---|---|---|
| TC-02 | New assertions on an existing `getEntries()` call: verify `id`/`title`/`price`/`cat`/`desc`/`img` field presence/types on a sample item | Existing method + existing `DemoblazeProduct` type already model everything needed |
| TC-03, TC-04, TC-05 | New (ideally parameterized) `test()` calling `getProductsByCategory()` for each of `Phones`/`Laptops`/`Monitors`, asserting per-item `cat` | Existing method already wraps `POST /bycat` correctly |
| TC-06 | New `test()` calling `getProductsByCategory()` with an invalid category — **assertion body must be written only after a live call confirms the actual response**, per Test Plan R6 | Existing method already wraps the call; only the assertion is unconfirmed |
| TC-07 | Extend the existing "product lookup by id" test (or add a case) to also assert `desc`/`img` | Existing method + test already cover `title`/`price` |
| TC-08 | New `test()` calling `getProductById()` with an invalid ID — **assertion body must be written only after a live call confirms the actual response** | Same reasoning as TC-06 |
| TC-10 | New `test()` calling `signup()` twice with the same generated username, asserting the second call's `errorMessage` | Existing method + error type already cover a single signup |
| TC-13 | New `test()` calling `signup()` then `login()` with a deliberately wrong password, asserting `errorMessage: 'Wrong password.'` | Existing methods + error type already cover the happy path and the unregistered-username path |
| TC-14 | Extend the existing "add to cart / view cart" test to assert the added item is actually present in `Items` (by `id` or `prod_id` — confirm which field live) | Existing methods + test already perform the calls |
| TC-15 | Extend the same test (or add a case) to re-call `viewCart()` after `deleteCartItem()` and assert the item is absent | Existing method already performs the delete call, just doesn't verify it |
| TC-16 | New `test()` mirroring the existing add/view-cart test but with `flag: true` end-to-end (signup → login → addToCart(loggedIn: true) → viewCart(..., true)) | Existing methods already accept `loggedIn`/`flag: true`; only the scenario is missing |
| TC-17 | Nothing to recommend yet — blocked on a human decision (Section RQ-15) | N/A |

## 5. Risk & Collision Flags

| Flag | Test Case(s) | Detail |
|---|---|---|
| `unconfirmed-live-contract` | TC-06, TC-08 | Live response shape for invalid category / invalid product ID has never been exercised in this repo; Stage 5b must confirm before asserting, not guess |
| `blocked-pending-human-decision` | TC-17 | No reusable or new-to-build asset can be identified until the cart-totals/quantities requirement (RQ-15) is resolved by a human |
| No naming collisions found | — | Every recommended change extends an existing method/test rather than introducing a new name; no proposed client method or type would shadow an existing `DemoblazeApiClient`/`demoblazeApiTypes.ts` member |
| No spec-duplication risk beyond the intended kind | TC-02, TC-07, TC-14, TC-15 | These deliberately **extend** existing passing tests (`tests/api/api.001.spec.ts`) rather than duplicate them — Stage 5b should confirm with the human reviewer whether to extend the existing spec file in place or add these assertions in the new `tests/api/{epic}/{ticketNo}.spec.ts` file instead, since the existing file predates this ticket's `{epic}`/`{ticketNo}` convention |

## 6. Traceability Cross-Check

| Normalized Test Case | Reuse Classification Assigned? |
|---|---|
| TC-01 through TC-16 | Yes — all 16 received one of Full Reuse / Partial Reuse / Net New |
| TC-17 | Yes — received **Unverifiable**, the correct classification for a case whose content is itself still Blocked upstream; not a gap in this stage's coverage |

All 17 normalized test cases received exactly one classification. No case was skipped or silently dropped.

---

## Post-Run Chat Summary

- **Test cases processed:** 17 total — Full Reuse: 4 (TC-01, TC-09, TC-11, TC-12) · Partial Reuse: 10 (TC-02–05, TC-07, TC-10, TC-13–16) · Net New: 2 (TC-06, TC-08) · Unverifiable: 1 (TC-17)
- **Existing API client methods reused:** 8 distinct methods (`getEntries`, `getProductsByCategory`, `getProductById`, `signup`, `login`, `addToCart`, `viewCart`, `deleteCartItem`) — every method this ticket needs already exists
- **New API client methods recommended:** 0
- **New request/response types recommended:** 0
- **New/extended `test()` cases needed:** ~10 (see Section 4) — all inside `tests/api/**`, none inside `api/**`
- **Risk & Collision flags raised:** 2 (`unconfirmed-live-contract` ×2 cases, `blocked-pending-human-decision` ×1 case) — no naming collisions
- **Confidence scores:** Full Reuse cases all scored 1.0 (exact existing-test matches); Partial Reuse cases all scored 0.7 (method/type fully reusable, assertion or scenario missing); Net New cases both scored 0.4 (call reusable, assertion basis entirely unconfirmed); TC-17 scored `null` (Unverifiable)
