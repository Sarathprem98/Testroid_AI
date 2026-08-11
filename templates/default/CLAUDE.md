# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Two things layered together:

1. A Playwright + TypeScript automation suite that drives [Demoblaze](https://www.demoblaze.com/) — a UI layer (Page Object Model) against `https://www.demoblaze.com`, and an API layer (`api/**`) against its backend, `https://api.demoblaze.com`. Both are shared public demo services, not an isolated sandbox. A `mobile/**` layer also exists for **native/hybrid mobile app** automation via Appium + WebdriverIO — but Demoblaze has no native app, so this layer is ready-to-use scaffolding (typechecked, wired end to end) pointed at illustrative placeholders, not a real target, until a real app is supplied for a ticket.
2. **TESTpal** — a Claude agent pipeline (Test Plan Generator → Test Case Generator → Normalizer → Reuse Matcher → Implement / API Automator / Mobile Automator → Validator) that turns an Epic + SPEC file, or manually authored test cases, into validated, merge-ready specs — UI, API, or native mobile app — for this same suite. Stage 5 splits into three independent tracks: **Implement Agent** for UI-typed test cases, **API Automator Agent** for API-typed (`Type: API`) test cases, **Mobile Automator Agent** for native-app-typed (`Type: MobileApp`) test cases; a ticket with more than one type runs all that apply.

Before touching anything under `docs/agents/`, `pages/**`, `locators/locatorConstants.ts`, `api/**`, `mobile/**`, or `tests/**` as part of pipeline work, read `docs/agents/README.md` and load the `guardrails` Claude Code Skill (all stages), the `testpal-locator-conventions` Skill (Stage 4/Reuse Matcher and Stage 5/Implement, for UI-typed cases), the `testpal-api-conventions` Skill (Stage 4/Reuse Matcher and Stage 5b/API Automator, for API-typed cases), and the `testpal-mobile-conventions` Skill (Stage 4/Reuse Matcher and Stage 5c/Mobile Automator, for `Type: MobileApp` cases). Key rules from there worth internalizing up front:

- No agent commits, pushes, merges, deploys, or publishes. A Stage 6 Pass is a recommendation, never an auto-merge trigger — a human always reviews the diff.
- Stage 5 (Implement) may only write to `pages/**`, `locators/locatorConstants.ts`, and `tests/**` excluding `tests/api/**`/`tests/mobile/**` — never `playwright.config.ts`, `global-setup.ts`, `global-teardown.ts`, `.env`, `package.json`, `api/**`, `mobile/**`, or CI files without explicit separate instruction.
- Stage 5b (API Automator) may only write to `api/**` and `tests/api/**` — never `pages/**`, `locators/locatorConstants.ts`, `mobile/**`, `tests/**` outside `tests/api/**`, or any of the config files above.
- Stage 5c (Mobile Automator) may only write to `mobile/**` and `tests/mobile/**` — never `pages/**`, `locators/locatorConstants.ts`, `api/**`, `tests/**` outside `tests/mobile/**`, or any of the config files above.
- Unknowns are marked `TBD`, never fabricated (business data, credentials, locators, endpoint contracts, native-app element identifiers, expected results, or verdicts).
- Demoblaze (UI and API) is a shared public demo, not an isolated sandbox — no test may cause irreversible, costly, or disruptive side effects beyond what `tests/purchase.001.spec.ts` already does (test purchases with generated data). `api.demoblaze.com` has been observed returning intermittent 500s independent of request correctness — don't loosen an assertion to paper over that; report it as an observed live-dependency failure instead. The same "report, don't mask" rule applies to a genuinely unavailable mobile environment (no Appium server/device/cloud access) — mark it Blocked, never a fabricated pass.

## Commands

```bash
npm install                    # install dependencies
npx playwright install         # install browsers (one-time)

npm test                       # run full suite, headless (npm alias for `playwright test`) — runs chromium + mobile-chrome + api + mobile-app
npm run test:headed            # run full suite, headed
npm run test:chrome            # run UI suite, chromium project only (desktop)
npm run test:mobile            # run UI suite, mobile-chrome project only (Pixel 5 emulation)
npm run test:mobile-app        # run native mobile app suite, mobile-app project only (Appium — skips cleanly if no app/Appium env is configured)
npm run test:api               # run API suite only, api project only
npm run test:report            # open the last HTML report
npm run typecheck              # tsc --noEmit
npm run clean:logs             # delete the logs/ directory

npx playwright test tests/purchase.001.spec.ts                 # run a single spec file
npx playwright test -g "should sign up, log in, add a product, and complete the purchase in one flow"  # run a single test by name
npx playwright test --grep @purchase                       # run by tag (@purchase, @regression, @category, @smoke, @api, @mobile-app)
npx playwright test --project=api                          # equivalent to npm run test:api
```

There is no separate lint script — `npm run typecheck` is the closest correctness gate besides running the tests themselves.

Runtime behavior (base URL, headless, timeouts, retries, workers) is controlled by `.env`, read in `playwright.config.ts` (`BASE_URL`, `API_BASE_URL`, `HEADLESS`, `SLOW_MO`, `TIMEOUT`, `RETRIES`, `WORKERS`, `STORAGE_STATE`, plus the `mobile/**` env vars documented in `.env` itself — `MOBILE_PLATFORM`, `MOBILE_EXECUTION_TARGET`, `APPIUM_SERVER_*`, `ANDROID_APP_PATH`/`IOS_APP_PATH`, `MOBILE_CLOUD_*`). Default `baseURL` is `https://www.demoblaze.com`; default `API_BASE_URL` is `https://api.demoblaze.com`. Four projects: `chromium` (UI, desktop viewport, `testIgnore`s `tests/api/**`/`tests/mobile/**`), `mobile-chrome` (UI, `devices['Pixel 5']` emulation — touch, mobile UA, mobile viewport — same `testIgnore`, reuses the same specs and Page Objects as `chromium`), `api` (`testDir: './tests/api'`, no browser), and `mobile-app` (`testDir: './tests/mobile'`, no browser — an Appium/WebdriverIO session owned by `mobile/fixtures/mobileFixture.ts`, not a Playwright BrowserContext). `fullyParallel: false`, retries default to `0`. `tests/hooks.ts`'s `registerHooks` only forces the 1440x900 desktop viewport in `beforeEach` when `testInfo.project.use.isMobile` is falsy, so the mobile project's emulated viewport/touch profile isn't clobbered.

## Architecture

**Locators are never inline.** Every element is an ordered `LocatorStrategyList` (`locators/locatorConstants.ts`), an array of fallback strategies tried in order — role → label/placeholder/text → css → xpath (most semantic/robust first, most brittle last). Parameterized locators (e.g. `productCard(name)`, `categoryLink(category)`) are functions returning a `LocatorStrategyList`, not string templates. A Page Object must never hold a raw CSS/XPath selector — it belongs in `locatorConstants.ts`.

**Every Page Object extends `pages/BasePage.ts`** and only touches `page` through its protected primitives: `click`, `fill`, `selectOption`, `check`, `uncheck`, `hover`, `waitForElement`, `scrollIntoView`, `getText`, `getAllTexts`, `isVisible`, `expectVisible`/`expectHidden`/`expectText`, `expectImageLoaded`/`expectAllImagesLoaded`, `assertCurrentUrl`/`assertTitle`, `takeScreenshot`, `acceptDialog`, `withRetry`. `findElement`/`findElements` walk a strategy list and return the first match that resolves within `timeoutMs` (default 5000ms), wrapped in `retryAsync` (`utils/retryHelper.ts`). All UI actions log through `logger.*` (`utils/logger.ts`, Winston-backed) — never `console.log`.

Existing Page Objects (`pages/HomePage.ts`, `SignUpPage.ts`, `LoginPage.ts`, `ProductPage.ts`, `CartPage.ts`, `CheckoutPage.ts`, `ContactPage.ts`, `AboutPage.ts`) are flat files and predate the `pages/{module}/*.ts` convention TESTpal targets for new output — they are not retroactively moved unless a migration is explicitly requested.

**Fixtures and hooks are split across two files** — don't confuse them:
- `fixtures/testFixture.ts` extends `@playwright/test`'s `test` with one fixture per Page Object (`homePage`, `signUpPage`, `loginPage`, `productPage`, `cartPage`, `checkoutPage`) plus a `purchaseData` fixture built from `utils/randomData.ts`. It also exports its own `registerHooks`, but that export is dead code — every spec imports `registerHooks` from `tests/hooks.ts` instead.
- `tests/hooks.ts` is the `registerHooks` actually used. It wires `beforeAll`/`afterAll` suite-level logging, sets a fixed 1440x900 viewport in `beforeEach`, and on a failed `afterEach` captures a screenshot via `utils/screenshotHelper.ts`.

Specs (`tests/purchase.001.spec.ts`, `tests/category-navigation.002.spec.ts`, `tests/additional-test-cases.003.spec.ts`) import `test`/`expect` from `../fixtures/testFixture`, call `registerHooks(test, '<suite name>')` from `./hooks`, and group cases under a tagged `test.describe('@tag', ...)` (`@purchase`, `@regression`, `@category`, `@smoke`). New TESTpal-generated specs land at `tests/{epic}/{ticketNo}.spec.ts`.

`utils/` holds cross-cutting helpers: `logger.ts` (Winston logger with named channels like `logger.ui.click`, `logger.execution.testStart`, `logger.application.startup`), `retryHelper.ts` (`retryAsync`), `randomData.ts` (dynamic user/purchase data — `@faker-js/faker`), `assertionHelpers.ts`, `screenshotHelper.ts`, `executionHelper.ts`, `constants.ts` (`PurchaseData` type, etc.). `networkHelper.ts`/`consoleHelper.ts` (request/response and console/page-error logging) are only wired up inside `fixtures/testFixture.ts`'s dead `registerHooks` export — since specs use `tests/hooks.ts`'s `registerHooks` instead, network/console logging is not actually active in any current test run.

`global-setup.ts` / `global-teardown.ts` only log framework startup/shutdown — no environment provisioning happens there.

**API testing layer (`api/**`) never touches a browser.** `api/clients/BaseApiClient.ts` wraps Playwright's `request`/`APIRequestContext` fixture with `get`/`post`/`put`/`patch`/`delete` primitives returning a typed `ApiResponse<T>` (`{ status, ok, headers, body, rawText, durationMs }`); `GET` retries up to 2x on a `>=500` status, other verbs never auto-retry (avoids duplicating a signup/cart mutation on a transient failure). `api/clients/DemoblazeApiClient.ts` is the concrete client (signup, login, entries, bycat, prodbyid, addtocart, viewcart, delcart) with types in `api/types/demoblazeApiTypes.ts`. Specs use `api/fixtures/apiFixture.ts` (typed client injection) and `registerApiHooks` from `api/fixtures/apiHooks.ts` (logging only — deliberately never touches `page`, unlike the UI's `registerHooks`). Example/regression suite: `tests/api/api.001.spec.ts`, tagged `@api`. New pipeline-generated API specs land at `tests/api/{epic}/{ticketNo}.spec.ts`, matched by the dedicated `api` Playwright project. `api.demoblaze.com` was observed returning HTTP 500 for every endpoint during framework verification — treat that as a live-environment fact, not a client bug, when a run fails.

**Mobile app testing layer (`mobile/**`) uses Appium/WebdriverIO, never Playwright's browser APIs** — Playwright cannot drive a native/hybrid app at all. `mobile/clients/BaseMobileClient.ts` is the Screen Object base (mirrors `pages/BasePage.ts`), wrapping a WebdriverIO `remote()` Appium session with `tap`/`fill`/`getText`/`isVisible`/`waitForElement`/`swipe`/`takeScreenshot` primitives; `mobile/types/mobileLocatorTypes.ts`'s `MobileLocatorStrategyList` mirrors `LocatorStrategyList`'s fallback-array pattern (accessibility id → platform-specific native strategy → resource id → xpath), platform-filtered at runtime. `mobile/capabilities/capabilityBuilder.ts` builds local-vs-cloud, Android-vs-iOS session config entirely from `.env` vars — no vendor-specific cloud provider is hardcoded. Specs use `mobile/fixtures/mobileFixture.ts` (typed Screen Object injection, owns the Appium session lifecycle) and `registerMobileHooks` from `mobile/fixtures/mobileHooks.ts` (logging only, mirrors `registerApiHooks`). Matched by the dedicated `mobile-app` Playwright project (`testDir: './tests/mobile'`). **This project has no real native app** — `mobile/screens/SampleLoginScreen.ts` and its locators in `mobile/locators/mobileLocatorConstants.ts` are explicitly-labeled illustrative placeholders, and `tests/mobile/sample-app.appium.spec.ts` declaratively `test.skip()`s itself (not a fabricated pass) whenever `ANDROID_APP_PATH`/`IOS_APP_PATH`/cloud config isn't set. Local Android execution needs `ANDROID_HOME` + a running emulator/device + `npx appium`; local iOS execution needs a macOS host with Xcode (untestable on this project's Windows dev environment) — see the `testpal-mobile-conventions` Skill for full setup steps.

## TESTpal pipeline reference

Full details, per-stage docs, naming conventions (`{epicNo}`, `{ticketNo}`, `{module}`, `{epic}`), the traceability contract, HITL gates, and the feedback-loop routing table all live in `docs/agents/README.md` — read it rather than re-deriving pipeline behavior. Output locations:

| Artifact | Path |
|---|---|
| Test Plan | `docs/Test Plans/{ticketNo}_test_plan.md` |
| Detailed Test Cases | `docs/test_cases/{ticketNo}.md` |
| Normalized Test Cases | `docs/normalizer/{ticketNo}.md` |
| Reuse Mapping Report | `docs/reuse_map/{ticketNo}.md` |
| Implementation code + summary (UI — Stage 5) | `pages/{module}/*.ts`, `tests/{epic}/{ticketNo}.spec.ts`, `docs/implementation/{ticketNo}.md` |
| Implementation code + summary (API — Stage 5b) | `api/clients/{module}ApiClient.ts`, `api/types/{module}ApiTypes.ts`, `tests/api/{epic}/{ticketNo}.spec.ts`, `docs/implementation/{ticketNo}.md` |
| Implementation code + summary (Mobile App — Stage 5c) | `mobile/screens/{module}/*.ts`, `mobile/locators/mobileLocatorConstants.ts`, `tests/mobile/{epic}/{ticketNo}.spec.ts`, `docs/implementation/{ticketNo}.md` |
| Validation Report | `docs/validation/{ticketNo}.md` |

Invoke the **Pipeline Orchestrator** (`docs/agents/PipelineOrchestratorAgent.md`) for end-to-end runs rather than the stage agents one at a time by hand. See `docs/agents/ApiAutomatorAgent.md` for the Stage 5b agent's own doc, and `docs/agents/MobileAutomatorAgent.md` for the Stage 5c agent's own doc.

## Reports

- HTML report: `playwright-report/` (open via `npm run test:report`)
- JUnit: `test-results/junit.xml`
- JSON: `test-results/results.json`
- Screenshots/traces/videos on failure: `test-results/artifacts/`
