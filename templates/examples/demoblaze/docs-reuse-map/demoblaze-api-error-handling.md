<!-- Generated-by: ReuseMatcherAgent · demoblaze-api-error-handling · 2026-07-29 · AI-generated, human review required -->

# Reuse Mapping Report — demoblaze-api-error-handling

> Source: [`docs/normalizer/demoblaze-api-error-handling.md`](../normalizer/demoblaze-api-error-handling.md) (Stage 3)
> Pipeline Stage: 4 (Reuse Matcher, read-only) · Version: 1.0 · Date: 2026-07-29
> Codebase scanned (API-typed cases only, per [`testpal-api-conventions`](../../.claude/skills/testpal-api-conventions/SKILL.md)): `api/clients/BaseApiClient.ts`, `api/clients/DemoblazeApiClient.ts`, `api/types/demoblazeApiTypes.ts`, `api/fixtures/apiFixture.ts`, `api/fixtures/apiHooks.ts`, `tests/api/api.001.spec.ts`, **and `tests/api/api-catalog-cart-auth.002.spec.ts`** (the sibling ticket's own Stage 5b output — highly relevant here, see Section 1). No `pages/**`/`locators/**` scan performed — all 15 normalized cases are `Type: API`.

## 1. Reuse Summary

| Classification | Count |
|---|---|
| Full Reuse | 2 (TC-10, TC-14) |
| Partial Reuse | 7 (TC-04, TC-05, TC-06, TC-07, TC-08, TC-13, TC-15) |
| Net New | 3 (TC-01, TC-02, TC-03) |
| Unverifiable | 3 (TC-09, TC-11, TC-12) |
| **Total** | **15** |

**Headline finding #1 — two of this ticket's cases are already fully automated, in a *different* ticket's spec file.** `tests/api/api-catalog-cart-auth.002.spec.ts` (Stage 5b output for the sibling `demoblaze-api-catalog-cart-auth` ticket) already contains:
- **TC-10** (duplicate signup) — implemented verbatim at [tests/api/api-catalog-cart-auth.002.spec.ts:67-77](../../tests/api/api-catalog-cart-auth.002.spec.ts) as that ticket's own TC-10, asserting the exact same `errorMessage: "This user already exist."` this ticket's RQ-10 requires.
- **TC-14** (out-of-range product id) — implemented at [tests/api/api-catalog-cart-auth.002.spec.ts:59-64](../../tests/api/api-catalog-cart-auth.002.spec.ts) as that ticket's own TC-08, using id `999999` (this ticket's case uses `999999999` — a non-functional difference, same behavior class), asserting the exact same `errorMessage: "Not found."` this ticket's RQ-14 requires.

This is a **cross-ticket duplication risk requiring a reviewer decision**, not a normal Full Reuse — see Section 5.

**Headline finding #2 — zero new API client methods or types are needed for 12 of the 15 cases; exactly one small, generic client addition covers the remaining 3.** TC-01/TC-02/TC-03 (wrong-verb/unknown-path checks) are the only cases with no existing client capability at all, because every existing `DemoblazeApiClient` method deliberately issues only the *correct* verb for its endpoint — there is no "send the wrong verb" escape hatch today. One new thin passthrough method (Section 4) closes all three, and incidentally also simplifies TC-04/TC-05 (see their notes).

## 2. Reuse Mapping Table

### Module: Method/Routing Validation

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-01 | RQ-01 | **Net New** | `demoblazeApiClient` fixture ([api/fixtures/apiFixture.ts:8-11](../../api/fixtures/apiFixture.ts)) — fixture only, no method targets `GET /addtocart` | 0.1 | Every existing method issues only its endpoint's correct verb by design (`addToCart()` only issues `POST`); no method or spec exercises an intentionally wrong verb |
| TC-02 | RQ-02 | **Net New** | Same fixture only — no method targets `POST /entries` (`getEntries()` only issues `GET`) | 0.1 | Same reasoning as TC-01 |
| TC-03 | RQ-03 | **Net New** | Same fixture only — no method targets any endpoint by design, let alone a nonexistent one | 0.1 | Same reasoning as TC-01/TC-02 |

### Module: Payload Validation

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-04 | RQ-04 | **Partial Reuse** | `DemoblazeApiClient.signup()` ([api/clients/DemoblazeApiClient.ts:19-21](../../api/clients/DemoblazeApiClient.ts)) — correct endpoint (`POST /signup`) but its typed signature `(username: string, password: string)` cannot send an empty `{}` body | 0.5 | Endpoint/verb match is exact; the gap is payload flexibility, not a wrong target. Closed by the same new passthrough method recommended for TC-01–03 (Section 4) rather than changing `signup()`'s signature |
| TC-05 | RQ-05 | **Partial Reuse** | `DemoblazeApiClient.signup()` (same as TC-04) — correct endpoint but always serializes a well-formed object, never a syntactically invalid raw string | 0.5 | Same reasoning as TC-04; also closed by the new passthrough method, which can accept a raw string body |
| TC-06 | RQ-06 | **Partial Reuse** | `DemoblazeApiClient.addToCart()` ([api/clients/DemoblazeApiClient.ts:54-57](../../api/clients/DemoblazeApiClient.ts)); `DemoblazeCartMutationResponse` ([api/types/demoblazeApiTypes.ts:54](../../api/types/demoblazeApiTypes.ts)) | 0.6 | Exact endpoint/verb match; typed parameter `productId: number \| string` doesn't currently admit `null` — needs either a call-site type assertion (`null as unknown as number`) or a small signature widening. No existing test exercises this |

### Module: Authorization / Session Behavior

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-07 | RQ-07 | **Partial Reuse** | `DemoblazeApiClient.viewCart()` ([api/clients/DemoblazeApiClient.ts:59-61](../../api/clients/DemoblazeApiClient.ts)); `DemoblazeViewCartResponse` ([api/types/demoblazeApiTypes.ts:52](../../api/types/demoblazeApiTypes.ts)) | 0.7 | Method + type fully capable of this exact call (a fabricated cookie is just an argument value, not new code); however **no existing test calls `viewCart()` standalone with a never-registered cookie** — both existing specs always pair it with a prior `addToCart()`. Per this repo's established scoring practice (see the sibling ticket's TC-16 precedent), full method capability without an existing covering test stays in the Partial Reuse band, not Full Reuse |
| TC-08 | RQ-08 | **Partial Reuse** | `DemoblazeApiClient.checkToken()` ([api/clients/DemoblazeApiClient.ts:28-30](../../api/clients/DemoblazeApiClient.ts)); `DemoblazeCheckResponse` ([api/types/demoblazeApiTypes.ts:24](../../api/types/demoblazeApiTypes.ts)) | 0.7 | Method + type fully capable; **no existing test in either `tests/api/api.001.spec.ts` or `tests/api/api-catalog-cart-auth.002.spec.ts` calls `/check` at all** — this would be the first |
| TC-09 | RQ-09 | **Unverifiable** | — | N/A (TBD) | Case content itself is Blocked upstream (Test Plan Section 4.2, Normalizer Section 6) — no scenario exists yet to match against the codebase. Not scored 0.0/Net New because "build it net-new" isn't actionable without first knowing what "it" is |

### Module: Conflict Handling

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-10 | RQ-10 | **Full Reuse** | **Existing spec test**, a different ticket: [tests/api/api-catalog-cart-auth.002.spec.ts:67-77](../../tests/api/api-catalog-cart-auth.002.spec.ts) ("signup with an already-registered username returns a duplicate-user errorMessage") — calls `signup()` twice with `generateCredentials()`, asserts the second call's `errorMessage: "This user already exist."`; `DemoblazeApiClient.signup()` ([api/clients/DemoblazeApiClient.ts:19-21](../../api/clients/DemoblazeApiClient.ts)) | 1.0 | **Exact scenario, already passing, in a sibling ticket's spec file.** See Section 1 (Headline finding #1) and Section 5 — this needs an explicit reviewer decision on how to handle cross-ticket duplication before Stage 5b, not a default "write it again" |

### Module: Boundary / Server Error

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-11 | RQ-11 | **Unverifiable** | — | N/A (TBD) | Case content Blocked upstream (exact long-string value undetermined) — same reasoning as TC-09 |
| TC-12 | RQ-12 | **Unverifiable** | — | N/A (TBD) | Case content Blocked upstream (exact SQLi-style probe undetermined) — same reasoning as TC-09 |
| TC-13 | RQ-13 | **Partial Reuse** | `DemoblazeApiClient.getProductById(id: number \| string)` ([api/clients/DemoblazeApiClient.ts:46-48](../../api/clients/DemoblazeApiClient.ts)) — signature already types `id` as `number \| string`, so calling with `"abc"` needs no code change | 0.7 | Method already accepts a string id with zero signature change; **no existing test in either spec file sends a non-numeric id** — both existing invalid-id tests (`tests/api/api.001.spec.ts` and the sibling ticket's spec) use numeric out-of-range values (`999999`), never a wrong-type string. Purely a new `test()` |
| TC-14 | RQ-14 | **Full Reuse** | **Existing spec test**, a different ticket: [tests/api/api-catalog-cart-auth.002.spec.ts:59-64](../../tests/api/api-catalog-cart-auth.002.spec.ts) ("product lookup by a non-existent id returns a Not found errorMessage, not a crash") — calls `getProductById(999999)`, asserts `errorMessage: "Not found."`; `DemoblazeApiClient.getProductById()` (same as TC-13) | 0.9 | Near-exact — same scenario class, this ticket's case uses `999999999` vs. the existing test's `999999` (non-functional difference, same "far out of range" intent). Same cross-ticket duplication consideration as TC-10 (Section 5), though lower stakes since both use the same numeric-boundary concept |
| TC-15 | RQ-15 | **Partial Reuse** | `DemoblazeApiClient.checkToken("")` (same method as TC-08) — signature already accepts an empty string with zero code change | 0.7 | Same reasoning as TC-08: method fully capable, but zero existing test exercises `/check` at all, empty-string or otherwise |

## 3. Structured Export (JSON)

```json
[
  { "testCaseId": "TC-01", "reqId": "RQ-01", "module": "Method/Routing Validation", "classification": "Net New", "confidenceScore": 0.1, "matchedAssets": [ { "type": "fixture", "file": "api/fixtures/apiFixture.ts", "reference": "demoblazeApiClient:8-11" } ], "gap": null, "recommendedNewAssets": [ { "type": "method", "target": "api/clients/DemoblazeApiClient.ts", "signature": "sendRaw<T = unknown>(method: HttpMethod, path: string, data?: unknown): Promise<ApiResponse<T>>" } ], "riskFlags": [], "notes": "No existing method issues a wrong-verb GET to /addtocart; closed by one new generic passthrough (Section 4), shared with TC-02/03/04/05." },
  { "testCaseId": "TC-02", "reqId": "RQ-02", "module": "Method/Routing Validation", "classification": "Net New", "confidenceScore": 0.1, "matchedAssets": [ { "type": "fixture", "file": "api/fixtures/apiFixture.ts", "reference": "demoblazeApiClient:8-11" } ], "gap": null, "recommendedNewAssets": [ { "type": "method", "target": "api/clients/DemoblazeApiClient.ts", "signature": "sendRaw<T = unknown>(method: HttpMethod, path: string, data?: unknown): Promise<ApiResponse<T>>" } ], "riskFlags": [], "notes": "No existing method issues a wrong-verb POST to /entries; same recommended asset as TC-01." },
  { "testCaseId": "TC-03", "reqId": "RQ-03", "module": "Method/Routing Validation", "classification": "Net New", "confidenceScore": 0.1, "matchedAssets": [ { "type": "fixture", "file": "api/fixtures/apiFixture.ts", "reference": "demoblazeApiClient:8-11" } ], "gap": null, "recommendedNewAssets": [ { "type": "method", "target": "api/clients/DemoblazeApiClient.ts", "signature": "sendRaw<T = unknown>(method: HttpMethod, path: string, data?: unknown): Promise<ApiResponse<T>>" } ], "riskFlags": [], "notes": "No existing method targets a nonexistent path; same recommended asset as TC-01/02." },
  { "testCaseId": "TC-04", "reqId": "RQ-04", "module": "Payload Validation", "classification": "Partial Reuse", "confidenceScore": 0.5, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.signup():19-21" } ], "gap": "signup(username, password) cannot send an empty {} body — needs the new sendRaw() passthrough (shared with TC-01-03) rather than a signature change to signup() itself.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Endpoint/verb match is exact; closed by the same new passthrough recommended for TC-01-03." },
  { "testCaseId": "TC-05", "reqId": "RQ-05", "module": "Payload Validation", "classification": "Partial Reuse", "confidenceScore": 0.5, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.signup():19-21" } ], "gap": "signup() always serializes a well-formed object body — needs sendRaw() to send a raw, syntactically invalid string.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Same passthrough covers this case." },
  { "testCaseId": "TC-06", "reqId": "RQ-06", "module": "Payload Validation", "classification": "Partial Reuse", "confidenceScore": 0.6, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.addToCart():54-57" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeCartMutationResponse:54" } ], "gap": "addToCart()'s productId parameter is typed number | string, not null — needs a call-site type assertion or a small signature widening.", "recommendedNewAssets": [], "riskFlags": [], "notes": "No existing test exercises a null prod_id." },
  { "testCaseId": "TC-07", "reqId": "RQ-07", "module": "Authorization / Session Behavior", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.viewCart():59-61" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeViewCartResponse:52" } ], "gap": "No existing test calls viewCart() standalone with a never-registered cookie; both existing specs always pair it with a prior addToCart().", "recommendedNewAssets": [], "riskFlags": [], "notes": "Method/type fully capable already; only a new test() is needed." },
  { "testCaseId": "TC-08", "reqId": "RQ-08", "module": "Authorization / Session Behavior", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.checkToken():28-30" }, { "type": "apiType", "file": "api/types/demoblazeApiTypes.ts", "reference": "DemoblazeCheckResponse:24" } ], "gap": "No existing test calls /check at all, in either spec file — this would be the first.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Method/type fully capable already; only a new test() is needed." },
  { "testCaseId": "TC-09", "reqId": "RQ-09", "module": "Authorization / Session Behavior", "classification": "Unverifiable", "confidenceScore": null, "matchedAssets": [], "gap": "TBD", "recommendedNewAssets": [], "riskFlags": ["blocked-pending-human-decision"], "notes": "Case content Blocked upstream — no scenario exists yet to match against the codebase." },
  { "testCaseId": "TC-10", "reqId": "RQ-10", "module": "Conflict Handling", "classification": "Full Reuse", "confidenceScore": 1.0, "matchedAssets": [ { "type": "spec", "file": "tests/api/api-catalog-cart-auth.002.spec.ts", "reference": "signup with an already-registered username returns a duplicate-user errorMessage:67-77" }, { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.signup():19-21" } ], "gap": null, "recommendedNewAssets": [], "riskFlags": ["cross-ticket-spec-duplication"], "notes": "Exact scenario already implemented and passing in a different ticket's spec file — needs a reviewer decision before Stage 5b (see Section 5), not a default re-implementation." },
  { "testCaseId": "TC-11", "reqId": "RQ-11", "module": "Boundary / Server Error", "classification": "Unverifiable", "confidenceScore": null, "matchedAssets": [], "gap": "TBD", "recommendedNewAssets": [], "riskFlags": ["blocked-pending-human-decision"], "notes": "Case content Blocked upstream — exact long-string value undetermined." },
  { "testCaseId": "TC-12", "reqId": "RQ-12", "module": "Boundary / Server Error", "classification": "Unverifiable", "confidenceScore": null, "matchedAssets": [], "gap": "TBD", "recommendedNewAssets": [], "riskFlags": ["blocked-pending-human-decision"], "notes": "Case content Blocked upstream — exact SQLi-style probe undetermined." },
  { "testCaseId": "TC-13", "reqId": "RQ-13", "module": "Boundary / Server Error", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.getProductById():46-48" } ], "gap": "No existing test sends a non-numeric id; method signature already types id as number | string so no client change is needed.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Purely a new defect-reproducing test()." },
  { "testCaseId": "TC-14", "reqId": "RQ-14", "module": "Boundary / Server Error", "classification": "Full Reuse", "confidenceScore": 0.9, "matchedAssets": [ { "type": "spec", "file": "tests/api/api-catalog-cart-auth.002.spec.ts", "reference": "product lookup by a non-existent id returns a Not found errorMessage, not a crash:59-64" }, { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.getProductById():46-48" } ], "gap": null, "recommendedNewAssets": [], "riskFlags": ["cross-ticket-spec-duplication"], "notes": "Near-exact — existing test uses id 999999 vs. this case's 999999999 (non-functional difference, same scenario class). Same reviewer-decision consideration as TC-10." },
  { "testCaseId": "TC-15", "reqId": "RQ-15", "module": "Boundary / Server Error", "classification": "Partial Reuse", "confidenceScore": 0.7, "matchedAssets": [ { "type": "method", "file": "api/clients/DemoblazeApiClient.ts", "reference": "DemoblazeApiClient.checkToken():28-30" } ], "gap": "No existing test exercises /check at all, empty-string or otherwise.", "recommendedNewAssets": [], "riskFlags": [], "notes": "Purely a new defect-reproducing test(); same underlying method as TC-08." }
]
```

## 4. Recommended New Automation Assets

**Exactly one new API client method is recommended, covering all 3 Net New cases and simplifying 2 of the Partial Reuse cases. No new request/response types, no new API client files, and no new fixtures are needed.**

| New Asset | Target | Signature | Covers |
|---|---|---|---|
| Generic raw-request passthrough | `api/clients/DemoblazeApiClient.ts` (thin wrapper around the inherited protected `BaseApiClient.send()`) | `async sendRaw<T = unknown>(method: HttpMethod, path: string, data?: unknown): Promise<ApiResponse<T>>` | TC-01 (`GET /addtocart`), TC-02 (`POST /entries`), TC-03 (`GET /nonexistentendpoint123`), TC-04 (`POST /signup` with `{}`), TC-05 (`POST /signup` with a raw malformed-JSON string) |

Rationale: every domain method on `DemoblazeApiClient` is intentionally narrow (one endpoint, one verb, one well-formed payload shape) — appropriate for positive-path automation, but structurally unable to express "the wrong verb" or "a deliberately malformed body." `BaseApiClient.send()` already supports arbitrary method/path/data (it's how every existing method is implemented — [api/clients/BaseApiClient.ts:78-105](../../api/clients/BaseApiClient.ts)); it's simply `protected`, so a spec can't call it directly. `sendRaw()` exposes exactly that capability, publicly, without duplicating any request/retry/logging logic — it delegates straight through. This keeps `tests/api/**` still going through the client layer (per [`testpal-api-conventions`](../../.claude/skills/testpal-api-conventions/SKILL.md)'s "never `this.request.fetch()` directly in a domain client or a spec" rule) rather than reaching into `request` directly.

No new asset is recommended for TC-06 (call-site type assertion, e.g. `addToCart({ ..., productId: null as unknown as number })`, is simpler and lower-risk than widening `addToCart()`'s public signature for one negative test — flag as a reviewer preference, not a forced decision), TC-07/TC-08/TC-13/TC-15 (existing methods already fully capable; only new `test()` cases are needed), or TC-10/TC-14 (already implemented — see Section 5).

## 5. Risk & Collision Flags

| Flag | Test Case(s) | Detail |
|---|---|---|
| `cross-ticket-spec-duplication` | TC-10, TC-14 | Both scenarios are already implemented and passing in `tests/api/api-catalog-cart-auth.002.spec.ts` (a different ticket). Writing them again in this ticket's spec file would create two near-identical tests hitting the same endpoints with the same assertions under different titles. **Recommend a reviewer decision before Stage 5b**: (a) this ticket's `docs/implementation/{ticketNo}.md` cites the existing tests as satisfying RQ-10/RQ-14 and Stage 5b writes no new test for them, or (b) if per-ticket spec-file self-containment is required by convention, Stage 5b adds a thin duplicate explicitly commented as intentionally mirroring the cited existing test, for this ticket's own traceability. Either is defensible; silently doing (b) without the comment/citation would look like accidental duplication to a future reader |
| `blocked-pending-human-decision` | TC-09, TC-11, TC-12 | No reusable or new-to-build asset can be identified until the respective Test Plan/Normalizer TBDs are resolved by a human |
| No naming collisions found | — | `sendRaw()` does not exist today on `DemoblazeApiClient` or `BaseApiClient`; the proposed name doesn't shadow any existing public or protected member |
| Defect-reproducing test risk (not a collision, but a related flag) | TC-13, TC-15 | These two new tests will assert a `500` status (the AUT's current, verified-buggy behavior) as documented in the Test Plan/Normalizer. If the reviewer's Gate A/Section 17-R3 decision is "document only, don't wire into pass/fail," these should not be added to `tests/api/**` as regular assertions — flagging so Stage 5b doesn't default to writing them as ordinary regression tests without checking that decision first |

## 6. Traceability Cross-Check

| Normalized Test Case | Reuse Classification Assigned? |
|---|---|
| TC-01, TC-02, TC-03 | Yes — Net New |
| TC-04, TC-05, TC-06, TC-07, TC-08, TC-13, TC-15 | Yes — Partial Reuse |
| TC-10, TC-14 | Yes — Full Reuse |
| TC-09, TC-11, TC-12 | Yes — Unverifiable (correct classification for cases whose content is itself still Blocked upstream; not a gap in this stage's coverage) |

All 15 normalized test cases received exactly one classification. No case was skipped or silently dropped.

---

## Post-Run Chat Summary

- **Test cases processed:** 15 total — Full Reuse: 2 (TC-10, TC-14) · Partial Reuse: 7 (TC-04, TC-05, TC-06, TC-07, TC-08, TC-13, TC-15) · Net New: 3 (TC-01, TC-02, TC-03) · Unverifiable: 3 (TC-09, TC-11, TC-12)
- **Existing API client methods reused:** 5 distinct methods (`signup`, `addToCart`, `viewCart`, `checkToken`, `getProductById`) — no method needed for this ticket is missing from `DemoblazeApiClient`
- **Existing locators reused:** N/A — API-only ticket, no `locatorConstants.ts` scan performed
- **New API client methods recommended:** 1 (`DemoblazeApiClient.sendRaw()` — a generic passthrough, not a domain-specific method)
- **New request/response types recommended:** 0
- **New Page Object methods recommended:** 0 (not applicable — API-only ticket)
- **Risk & Collision flags raised:** 3 (`cross-ticket-spec-duplication` ×2 cases, `blocked-pending-human-decision` ×3 cases, plus one non-collision defect-reproducing-test caution) — no naming collisions
- **Confidence scores:** Full Reuse — 1.0 (TC-10, exact existing test) and 0.9 (TC-14, near-exact); Partial Reuse — range 0.5–0.7 (payload-flexibility gaps score lower at 0.5–0.6, method-fully-capable-but-untested gaps score 0.7); Net New — 0.1 (fixture-only credit, no method exists for any wrong-verb/unknown-path call); Unverifiable — `null` ×3
