# Playwright Demoblaze Automation Framework

Simple Playwright automation framework for [Demoblaze](https://www.demoblaze.com/) built with TypeScript, Playwright Test, and the Page Object Model.

## Project Setup

Prerequisites:
- Node.js 18 or later
- npm

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Run the full suite:

```bash
npx playwright test
```

## Installation

This project is ready to run after dependency installation. The base URL, headless mode, and timeout settings are controlled through [.env](.env) and [playwright.config.ts](playwright.config.ts).

## Running Tests

Run all tests:

```bash
npm test
```

Run the single end-to-end test:

```bash
npx playwright test tests/purchase.001.spec.ts
```

Run a single test by name:

```bash
npx playwright test -g "should sign up, log in, add a product, and complete the purchase in one flow"
```

Run tagged tests:

```bash
npx playwright test --grep @purchase
```

Run in Chromium:

```bash
npm run test:chrome
```

Run the API suite only:

```bash
npm run test:api
```

Run in headed mode:

```bash
npm run test:headed
```

Run in headless mode:

```bash
npm test
```

## Reports

The framework generates:
- HTML report in `playwright-report/`
- JUnit report in `test-results/junit.xml`
- JSON report in `test-results/results.json`
- Screenshots and traces on failure in `test-results/artifacts/`

Open the HTML report:

```bash
npm run test:report
```

## Folder Explanation

- [tests](tests): the end-to-end purchase journey and shared suite hooks
- [tests/api](tests/api): API-only specs, run under the dedicated `api` Playwright project (no browser)
- [pages](pages): Page Object Model layer for app actions and assertions
- [api](api): API testing layer — `api/clients` (BaseApiClient + per-domain clients), `api/types` (response shapes), `api/fixtures` (API-only fixtures/hooks, kept separate from the UI `fixtures/`/`tests/hooks.ts` pair so API specs never need a browser)
- [fixtures](fixtures): custom Playwright fixtures that inject page objects
- [utils](utils): reusable helpers for logging, data generation, screenshots, and assertions
- [locators](locators): centralized locator definitions and fallback chains
- [test-data](test-data): static test data used by scenarios

## Best Practices

- Use the Page Object Model for every page interaction.
- Prefer the shared `findElement()` strategy so locators degrade gracefully.
- Keep the full user journey in one test so the browser session continues from sign up to checkout.
- Generate dynamic usernames on every execution.
- Use explicit assertions for visibility, text, URL, and confirmation state.
- Capture evidence on failure using screenshot and trace settings.
- Keep secrets out of source control and use [.env](.env) for environment-specific configuration.

## Framework Notes

- Chromium project for the UI flows, plus a browser-less `api` project (`API_BASE_URL` in [.env](.env)) for API specs under `tests/api/**`
- Retries disabled
- Headless or headed execution via environment variables and npm scripts
- Custom fixtures inject the full page object set (UI) or API client set (`api/fixtures/apiFixture.ts`) into tests