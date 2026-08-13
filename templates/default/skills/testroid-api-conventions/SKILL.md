---
name: testroid-api-conventions
description: Use when scanning api/**, tests/api/**, or fixtures under api/fixtures/** for reuse (Testroid Stage 4 — Reuse Matcher, for API-typed test cases), or when writing/extending API clients or API spec files (Testroid Stage 5b — API Automator Agent). Covers the project's BaseApiClient pattern, ApiResponse shape, and API fixture/spec conventions that must be matched exactly.
---

# Testroid API Testing Conventions

Grounded in the framework's actual code — [api/clients/BaseApiClient.ts](../../api/clients/BaseApiClient.ts) and [api/fixtures/apiFixture.ts](../../api/fixtures/apiFixture.ts). Applies to Stage 4 (Reuse Matcher, read-only, for API-typed cases) and Stage 5b (API Automator Agent, writes code). For the pipeline-wide traceability/HITL/anti-fabrication rules that also apply here, see [[guardrails]]. For the UI-side equivalent (locators, Page Objects), see [[testroid-locator-conventions]].

## Why API testing is a separate layer, not a Page Object

API specs never need a browser. They use Playwright's built-in `request` fixture (`APIRequestContext`), not `page`. Keeping `api/**` and `tests/api/**` fully separate from `pages/**`/`fixtures/testFixture.ts`/`tests/hooks.ts` means:

- The dedicated `api` Playwright project (see `playwright.config.ts`) never launches Chromium.
- The `chromium` project's `testIgnore` excludes `tests/api/**`, so UI and API suites never double-run each other's specs.
- API Automator Agent's write-allowlist (`api/**`, `tests/api/**`) never overlaps with Implement Agent's (`pages/**`, `locators/locatorConstants.ts`, `tests/**` excluding `tests/api/**`).

## Client pattern: `BaseApiClient`

Every API client extends `BaseApiClient` (`api/clients/BaseApiClient.ts`) and only touches `APIRequestContext` through its protected primitives — never `this.request.fetch()` directly in a domain client or a spec:

- `get<T>(path, options?)`, `post<T>(path, data?, options?)`, `put<T>(path, data?, options?)`, `patch<T>(path, data?, options?)`, `delete<T>(path, options?)` — all return `Promise<ApiResponse<T>>`.
- `ApiResponse<T>` = `{ status, ok, headers, body, rawText, durationMs }`. Specs assert against these fields, never against a raw `APIResponse` object.
- Logging goes through `logger.api.*` (`request`, `response`, `headers`, `timing`) and `logger.error.exception`/`logger.warning.retry` on failure/retry — never `console.log`, matching the UI side's `logger.ui.*` convention.
- **Retry policy is method-aware, not blanket**: `GET` retries up to 2x on a `>=500` status (idempotent, safe to repeat); `POST`/`PUT`/`PATCH`/`DELETE` never auto-retry, so a transient 5xx can't silently duplicate a signup, cart mutation, or order. Do not change this default per-client — override via the `retries` option on a single call if a specific test genuinely needs different behavior, and document why.

## Domain client pattern

- One class per API domain/module, e.g. `{Module}ApiClient` in `api/clients/{module}ApiClient.ts`, extending `BaseApiClient`.
- Each method wraps exactly one endpoint and returns a typed `ApiResponse<T>` using a domain type from `api/types/{module}ApiTypes.ts` — never an inline anonymous shape in the client or the spec.
- New/changed domain client methods go in `api/clients/{module}ApiClient.ts` per the `{module}` naming convention (see [[guardrails]]'s Naming Conventions table) — new modules are new files, not new unrelated methods bolted onto an existing client.
- Response schema fields you have not verified against a live, healthy response are typed loosely (optional, or `Record<string, unknown>` fallback) rather than asserted as a confirmed contract — the anti-fabrication rule applies to inferred API schemas exactly as it does to business data.

## Fixture and hook pattern

- API specs use `api/fixtures/apiFixture.ts` for typed client injection (mirrors `fixtures/testFixture.ts` for Page Objects) and call `registerApiHooks(test, '<suite name>')` from `api/fixtures/apiHooks.ts` (mirrors `tests/hooks.ts`'s `registerHooks`) — never the UI `registerHooks`, since it destructures `page` and would force a browser launch.
- Adding a new API client requires registering it as a fixture in `api/fixtures/apiFixture.ts`, the same way a new Page Object is registered in `fixtures/testFixture.ts`.

## Spec pattern

- New API spec files: `tests/api/{epic}/{ticketNo}.spec.ts`, matched by the `api` Playwright project (`testDir: './tests/api'` in `playwright.config.ts`).
- Group tests under a tagged `test.describe('@tag', ...)` consistent with the project's Automation Strategy tags (`@api`, plus `@smoke`/`@regression` where applicable).
- Assertions target `ApiResponse` fields directly (`response.status`, `response.body`, `response.headers`) via the project's standard `expect` — no new assertion-helper file unless a genuinely repeated pattern emerges across multiple specs.
- Test data (usernames, passwords) comes from `utils/randomData.ts` (`generateCredentials`, etc.) exactly like the UI side — never hardcoded or invented per spec.

## Reuse classification (Stage 4) — API-typed cases

When checking whether a normalized test case with `Type: API` is already covered, scan `api/**` (not `pages/**`) using the same three-bucket model as the UI side, with an API-specific heuristic set:

| Classification | Criteria | Required evidence |
|---|---|---|
| Full Reuse | An existing client method already calls the exact endpoint + HTTP method + payload shape the test case describes | Cite exact file, class, method/line |
| Partial Reuse | An existing client method covers the endpoint/verb but needs a new parameter, header, or assertion | Cite existing asset **and** the specific gap |
| Net New | No existing client method addresses the endpoint/verb | State explicitly — never force a match |
| Unverifiable | `api/**` not inspectable for this case | Mark `TBD` — never guess |

Match on: **endpoint + HTTP method overlap** (same path and verb already wrapped by a client method), **response-shape overlap** (an existing domain type already models the fields the test case asserts on), **scenario overlap at the spec level** (an existing `test()` in `tests/api/**` already exercises the same call, even under a different title), and **fixture overlap** (the client is already wired into `api/fixtures/apiFixture.ts`).

## Implementation rules (Stage 5b — API Automator Agent)

- Implement only what Stage 4 marked Net New / Partial Reuse for API-typed cases; Full Reuse API assets are not touched.
- New client methods always return `ApiResponse<T>` via `BaseApiClient`'s `get`/`post`/`put`/`patch`/`delete` — never a raw `fetch` call or a third-party HTTP library (no new dependency is needed; Playwright's `request` fixture covers this).
- Test data must match the Normalized Test Case's `testData` field exactly (endpoint, method, headers, body); if `TBD`, surface that rather than inventing a value.
- No drive-by refactors — the smallest edit that satisfies the documented gap.
- Typecheck and run the affected spec(s) via `npm run test:api` (or `npx playwright test --project=api`) before declaring the stage complete; if a live third-party endpoint is unavailable/flaky, report the actual observed status codes and mark the affected item **Blocked**, not Pass — never assume success from a request that returned an error status.
