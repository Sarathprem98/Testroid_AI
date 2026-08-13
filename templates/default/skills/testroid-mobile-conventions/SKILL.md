---
name: testroid-mobile-conventions
description: Use when scanning mobile/**, tests/mobile/**, or fixtures under mobile/fixtures/** for reuse (Testroid Stage 4 — Reuse Matcher, for `Type: MobileApp` test cases), or when writing/extending Screen Objects, mobile locators, capability configs, or mobile spec files (Testroid Stage 5c — Mobile Automator Agent). Covers the project's BaseMobileClient pattern, MobileLocatorStrategyList fallback, Appium/WebdriverIO environment setup (Android/iOS, local/cloud), and predefined gesture/session steps that must be matched exactly.
---

# Testroid Mobile App Automation Conventions

Grounded in the framework's actual code — [mobile/clients/BaseMobileClient.ts](../../mobile/clients/BaseMobileClient.ts), [mobile/types/mobileLocatorTypes.ts](../../mobile/types/mobileLocatorTypes.ts), [mobile/capabilities/capabilityBuilder.ts](../../mobile/capabilities/capabilityBuilder.ts), and [mobile/fixtures/mobileFixture.ts](../../mobile/fixtures/mobileFixture.ts). Applies to Stage 4 (Reuse Matcher, read-only, for `Type: MobileApp` cases) and Stage 5c ([Mobile Automator Agent](../../docs/agents/MobileAutomatorAgent.md), writes code). For the pipeline-wide traceability/HITL/anti-fabrication rules that also apply here, see [[guardrails]]. For the UI-web-emulation equivalent (`Platform: Mobile` — Playwright's `mobile-chrome` project), see [[testroid-locator-conventions]]'s Mobile Web Testing section — that is a different thing from everything below.

## Why this is a separate layer from `pages/**` and `api/**`

Playwright cannot drive a native or hybrid mobile app at all — it only automates browsers/web content (even its Android support is Chrome-only, via CDP, and it has no iOS native story whatsoever). Real Android/iOS app automation requires **Appium** (the WebDriver-based protocol/server for mobile) driven here via the **WebdriverIO** client library (`webdriverio`'s `remote()`), not `page`/`APIRequestContext`. Consequences:

- The dedicated `mobile-app` Playwright project (see `playwright.config.ts`) has no `use.browserName` — it never launches Chromium. Its `testDir` is `./tests/mobile`.
- `chromium` and `mobile-chrome`'s `testIgnore` excludes both `tests/api/**` and `tests/mobile/**`, so no project double-runs another's specs.
- Stage 5c's write-allowlist (`mobile/**`, `tests/mobile/**`) never overlaps with Stage 5's (`pages/**`, `locators/locatorConstants.ts`, `tests/**` excluding `tests/api/**`/`tests/mobile/**`) or Stage 5b's (`api/**`, `tests/api/**`).
- Playwright's `test()` runner is still the single entry point (`npx playwright test --project=mobile-app` / `npm run test:mobile-app`) — only the driven session differs. Do not introduce a second, competing test runner (`@wdio/cli`, Mocha, Jest) for this layer.

## Screen Object pattern: `BaseMobileClient`

Every Screen Object extends `BaseMobileClient` (`mobile/clients/BaseMobileClient.ts`) and only touches the Appium session through its protected primitives — never `this.driver.$()` directly in a domain Screen Object or a spec:

- `tap(strategies, options?)`, `fill(strategies, value, options?)`, `getText(strategies, options?)`, `isVisible(strategies, options?)`, `waitForElement(strategies, state?, timeoutMs?)`, `swipe(direction, percent?)`, `takeScreenshot(name)`.
- `findElement` walks a `MobileLocatorStrategyList` in order, skipping any strategy that doesn't apply to the current session's platform (an `androidUiAutomator` entry is skipped on an iOS session and vice versa), retried via `retryAsync` — the same auto-healing shape as `pages/BasePage.ts`'s `findElement`.
- All actions log through `logger.mobile.*` (`session`, `gesture`, `element`, `capabilities`) — never `console.log`, matching `logger.ui.*`/`logger.api.*`.

## Locator pattern: `MobileLocatorStrategyList`

Every element is an ordered array of fallback strategies (`mobile/types/mobileLocatorTypes.ts`), the mobile-native counterpart to `locators/locatorConstants.ts`'s `LocatorStrategyList`:

```ts
{ kind: 'accessibilityId'; id: string }              // '~id' — cross-platform: content-desc (Android) / accessibilityIdentifier (iOS). Try this first.
{ kind: 'androidUiAutomator'; expression: string }   // 'android=UiSelector...' — Android only; skipped automatically on an iOS session
{ kind: 'iosPredicate'; expression: string }         // '-ios predicate string:...' — iOS only; skipped automatically on an Android session
{ kind: 'id'; resourceId: string }                   // native resource-id (Android) / name (iOS) — platform-specific but stable
{ kind: 'xpath'; selector: string }                  // last resort — native XML tree is not a stable contract, use sparingly
```

- **Fallback order**: accessibility id (cross-platform, most semantic) → platform-specific native strategy → resource id → xpath (most brittle, last).
- Strategies live in `mobile/locators/mobileLocatorConstants.ts`, grouped by screen/module (e.g. `mobileLocatorConstants.sampleLoginScreen.usernameInput`).
- **Never invent a real app's element identifiers.** This project ships with no real native app — `mobileLocatorConstants.ts`'s existing `sampleLoginScreen` group is explicitly labeled illustrative/placeholder for that reason. Once a real `{ticketNo}` supplies a real app, replace placeholders with identifiers actually confirmed against it (e.g. via Appium Inspector) — a plausible-looking but unverified accessibility id is a fabrication, not a shortcut.

## Predefined gesture/session steps

`BaseMobileClient` wraps the modern Appium `mobile:` execute-script gesture APIs (the legacy `TouchAction` API is deprecated across current Appium 2.x/3.x drivers) — always platform-branch gestures rather than assuming one cross-platform primitive:

| Step | Android (UiAutomator2) | iOS (XCUITest) |
|---|---|---|
| Swipe | `driver.execute('mobile: swipeGesture', { left, top, width, height, direction, percent })` | `driver.execute('mobile: swipe', { direction })` |
| Tap | W3C `element.click()` (works cross-platform via the resolved element) | same |
| Text entry | `element.setValue(text)` | same |
| Screenshot | `driver.saveScreenshot(path)` | same |

`BaseMobileClient.swipe(direction, percent?)` already branches on `this.platform` per the table above — call it rather than issuing a raw `driver.execute(...)` in a Screen Object. For "scroll until an element is visible," retry `findElement` in a loop with an interposed `swipe('up')`/`swipe('down')` rather than hand-rolling per-driver scroll-to-element scripts, unless a specific ticket's scenario genuinely needs the precision of `mobile: scrollGesture`/`mobile: scroll`.

## Session/capability pattern: local vs. cloud, provider-agnostic

`mobile/capabilities/capabilityBuilder.ts`'s `buildMobileSessionConfig(platform)` is the single source of connection + capability config, driven entirely by environment variables (see `.env`) — never hardcode a hostname, port, or credential in a Screen Object, spec, or capability file:

| Env var | Purpose | Local default | Cloud |
|---|---|---|---|
| `MOBILE_PLATFORM` | `android` \| `ios` | `android` | same |
| `MOBILE_EXECUTION_TARGET` | `local` \| `cloud` | `local` | `cloud` |
| `APPIUM_SERVER_HOSTNAME` / `_PORT` / `_PATH` | Local Appium server connection | `127.0.0.1:4723/` | n/a |
| `ANDROID_APP_PATH` / `IOS_APP_PATH` | Path to the real `.apk` / `.ipa`/`.app` under test | — (required for local execution) | — (required unless the app is already uploaded to the cloud provider) |
| `MOBILE_CLOUD_HOSTNAME` / `_PORT` / `_PATH` / `_PROTOCOL` | Cloud device-farm hub endpoint | n/a | provider-specific (e.g. BrowserStack's `hub.browserstack.com`, Sauce Labs' `ondemand.<region>.saucelabs.com`, LambdaTest's `mobile-hub.lambdatest.com`) |
| `MOBILE_CLOUD_USERNAME` / `MOBILE_CLOUD_ACCESS_KEY` | Cloud auth, passed via WebdriverIO's own `user`/`key` config fields (never embedded in a URL string) | n/a | provider account credentials — from env/secrets only, never committed |
| `MOBILE_CLOUD_CAPABILITIES_JSON` | Provider-specific capability additions, merged in as-is (e.g. BrowserStack's `bstack:options`, Sauce Labs' `sauce:options`, LambdaTest's `lt:options`) | n/a | set to that provider's JSON blob |

This project is **not locked to one cloud vendor** — `capabilityBuilder.ts` never hardcodes a provider-specific capability key. Picking a provider means setting the generic env vars above to that provider's actual values; it does not require a code change.

### Local Android setup (the only path verifiable without macOS)

1. Install Android Studio (or standalone `cmdline-tools`) and set `ANDROID_HOME`/`ANDROID_SDK_ROOT`.
2. Create/launch an emulator (AVD) via `avdmanager`/Android Studio's Device Manager, or connect a real device with USB debugging enabled (`adb devices` must show it).
3. Install the Appium server + Android driver (already devDependencies of this project): `appium`, `appium-uiautomator2-driver`.
4. Start the server: `npx appium` (defaults to `127.0.0.1:4723`, matching `APPIUM_SERVER_HOSTNAME`/`_PORT`'s defaults).
5. Set `ANDROID_APP_PATH` to the real `.apk` under test.
6. Run: `npm run test:mobile-app`.

### Local iOS setup (macOS-only)

1. Requires a macOS host with Xcode installed (the XCUITest driver shells out to `xcodebuild`) — there is no Windows/Linux path for local iOS execution.
2. Install the Appium server + iOS driver: `appium`, `appium-xcuitest-driver`; the driver will prompt for/require WebDriverAgent signing setup on first run.
3. Boot a Simulator (`xcrun simctl boot "iPhone 15"` or via Xcode) or connect a real device with developer mode enabled.
4. Set `MOBILE_PLATFORM=ios` and `IOS_APP_PATH` to the real `.app`/`.ipa`.
5. Run: `npm run test:mobile-app`.

### Cloud execution (any provider)

1. Set `MOBILE_EXECUTION_TARGET=cloud`.
2. Set `MOBILE_CLOUD_HOSTNAME`/`_PORT`/`_PATH`/`_PROTOCOL` to the chosen provider's hub endpoint (from that provider's own Appium setup docs).
3. Set `MOBILE_CLOUD_USERNAME`/`MOBILE_CLOUD_ACCESS_KEY` from that provider's account (via a secrets manager or local shell env — never committed to `.env` with a real value).
4. Set `MOBILE_CLOUD_CAPABILITIES_JSON` to that provider's required capability additions (app upload id, build name, etc. — see that provider's docs for the exact shape).
5. Run: `npm run test:mobile-app`.

## Fixture and hook pattern

- Mobile specs use `mobile/fixtures/mobileFixture.ts` for typed Screen Object injection (mirrors `fixtures/testFixture.ts`/`api/fixtures/apiFixture.ts`) and call `registerMobileHooks(test, '<suite name>')` from `mobile/fixtures/mobileHooks.ts` (mirrors `tests/hooks.ts`/`api/fixtures/apiHooks.ts`) — never the UI `registerHooks` or API `registerApiHooks`, neither of which manage an Appium session.
- `mobileFixture.ts` owns the Appium session lifecycle (`remote()` on setup, `driver.deleteSession()` on teardown) — a Screen Object never opens or closes its own session.
- Adding a new Screen Object requires registering it as a fixture in `mobile/fixtures/mobileFixture.ts`, the same way a new Page Object is registered in `fixtures/testFixture.ts`.

## Spec pattern

- New mobile spec files: `tests/mobile/{epic}/{ticketNo}.spec.ts`, matched by the `mobile-app` Playwright project (`testDir: './tests/mobile'`).
- Group tests under a tagged `test.describe('@tag', ...)` consistent with the project's Automation Strategy tags (`@mobile-app`, plus `@smoke`/`@regression` where applicable) — see `tests/mobile/sample-app.appium.spec.ts` for the established shape.
- **Declare environment requirements, don't let them surface as failures.** If the app/Appium environment isn't configured (no `ANDROID_APP_PATH`/`IOS_APP_PATH`, not targeting cloud), call `test.skip(condition, reason)` at the `describe` level — evaluated before any fixture (including the Appium session) runs — so an unconfigured environment reports as **skipped**, never a fabricated failure or a fabricated pass.
- Test data (usernames, passwords, etc.) comes from `utils/randomData.ts` exactly like the UI/API sides — never hardcoded or invented per spec.

## Reuse classification (Stage 4) — `Type: MobileApp` cases

When checking whether a normalized test case with `Type: MobileApp` is already covered, scan `mobile/**` (not `pages/**` or `api/**`) using the same three-bucket model as the other layers, with a mobile-specific heuristic set:

| Classification | Criteria | Required evidence |
|---|---|---|
| Full Reuse | An existing Screen Object method + existing locator(s) already implement the exact screen/action/expected-result the test case describes | Cite exact file, class, method/line |
| Partial Reuse | An existing Screen Object method or locator covers part of the flow but needs a new parameter, assertion, or small extension | Cite existing asset **and** the specific gap |
| Net New | No existing Screen Object method or locator addresses the behavior | State explicitly — never force a match |
| Unverifiable | `mobile/**` not inspectable for this case, or the real app isn't available to confirm a locator against | Mark `TBD` — never guess |

Match on: **method/responsibility overlap** (an existing Screen Object method's name and behavior semantically match the test case's action), **locator overlap** (the element(s) already have an entry in `mobileLocatorConstants.ts`), **scenario overlap at the spec level** (an existing `test()` already exercises the same flow, even under a different title), and **fixture overlap** (the Screen Object is already wired into `mobileFixture.ts`).

## Implementation rules (Stage 5c — Mobile Automator Agent)

- Implement only what Stage 4 marked Net New / Partial Reuse for `Type: MobileApp` cases; Full Reuse mobile assets are not touched.
- New locators always go into `mobileLocatorConstants.ts` as a `MobileLocatorStrategyList`, never inline — and never invented for an app that hasn't actually been inspected.
- Test data must match the Normalized Test Case's `testData` field exactly; if `TBD`, surface that rather than inventing a value.
- No drive-by refactors — the smallest edit that satisfies the documented gap.
- Typecheck and run the affected spec(s) via `npm run test:mobile-app` before declaring the stage complete; if no Appium server/device/cloud access is available in the current environment, report that explicitly and mark the affected item **Blocked** — never assume success from a session that was never actually created.
