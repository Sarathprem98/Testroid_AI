# Testroid

AI-powered, multi-agent Playwright automation framework using TypeScript and the Page Object Model.

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

Configure your target site in `.env` (see `.env.example`).

To re-run `testroid init` non-interactively (e.g. in CI, or to quickly re-scaffold), pass `--yes`/`-y` with `--url`:

```bash
npx testroid init --yes --url https://example.com
```

This skips every prompt and uses sensible defaults (Smoke suite, QA environment, Playwright MCP enabled, Allure reporting, whichever AI assistant config is already detected) — the base URL is the one thing it can't default, so `--url` is required unless `BASE_URL` is already set in `.env`.

Run the full suite:
```bash
npx playwright test
```

## Structure

- `docs/agents/` — multi-agent test generation pipeline (plan, generate, normalize, reuse-match, implement, validate)
- `pages/` — Page Object Model classes for your site, all extending `pages/BasePage.ts`
- `locators/` — `locatorConstants.ts`, the auto-healing locator definitions your Page Objects use
- `skills/` — Claude Code Skills documenting this framework's conventions
- `api/` — API client and fixtures
- `mobile/` — mobile automation support
- `docs/` — agent documentation and generated pipeline output
- `tests/` — Playwright test specs

## Auto-healing locators

Every element `pages/BasePage.ts` interacts with is described as an ordered **`LocatorStrategyList`** — an array of fallback strategies — instead of a single selector:

```ts
export const locatorConstants = {
  login: {
    submitButton: [
      { kind: 'role', role: 'button', name: 'Log in' },   // tried first: most semantic
      { kind: 'text', text: 'Log in' },
      { kind: 'css', selector: '#login-button' },          // last resort: most brittle
    ] as const,
  },
} as const;
```

`BasePage`'s primitives (`click`, `fill`, `findElement`, etc.) walk the list in order and act on the first strategy that actually resolves on the page. If a later markup/CSS change breaks the primary strategy, the Page Object keeps working off a fallback instead of failing outright — no runtime AI/ML involved, just an ordered list of alternatives checked at test time. Order strategies most-semantic-first (`role`/`label`/`placeholder`/`text`) and most-brittle-last (`css`/`xpath`), and add your own site's locators to `locators/locatorConstants.ts` following that pattern.

Every Page Object should extend `pages/BasePage.ts` to get this behavior automatically, plus its shared primitives (`click`, `fill`, `selectOption`, `expectVisible`, `expectText`, `assertCurrentUrl`, `takeScreenshot`, `withRetry`, ...) and Winston-backed logging via `utils/logger.ts`.

## Skills

`skills/` ships four [Claude Code Skills](https://docs.claude.com/en/docs/claude-code/skills) documenting this framework's own conventions, so an agent working in a scaffolded project can load them instead of re-deriving the patterns:

- `guardrails` — shared traceability contract, anti-fabrication rule, HITL gates, and safety rules for the multi-agent pipeline in `docs/agents/`.
- `testroid-locator-conventions` — the auto-healing `LocatorStrategyList` pattern above, `BasePage` usage, and Page Object/spec conventions.
- `testroid-api-conventions` — the `BaseApiClient`/`ApiResponse` pattern and API client/spec conventions.
- `testroid-mobile-conventions` — the `BaseMobileClient`/`MobileLocatorStrategyList` pattern (Appium/WebdriverIO) and mobile Screen Object/spec conventions.

## AI coding assistant config

`testroid init` asks which AI coding assistant you use and writes the same generated guidance (project stack, the agent pipeline, reporting, conventions) to whichever location that tool expects — never overwriting a file that's already there:

| Choice | File written |
|---|---|
| Claude Code | `CLAUDE.md` (project root) |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursor/rules/testroid.mdc` (with Cursor's Project Rules frontmatter — `description`/`globs`/`alwaysApply`) |
| Other | `AGENTS.md` (project root) — the tool-agnostic convention several AI coding assistants are converging on |
| Skip | Nothing is written; add one later by re-running `testroid init` |

If a re-run detects one of these files already present, it pre-selects that tool as the prompt's default. The prompt defaults to Claude Code when none are detected.

## Reporting

`testroid init` asks which test report you want — **Allure Report** or **Ortoni Report** — installs the packages it needs, and wires it into `playwright.config.ts`'s `reporter: [...]` array alongside the always-on `list`/`html`/`junit`/`json` reporters.

- **Ortoni Report** (`ortoni-report`) — `utils/ortoniAutoOpenReporter.ts` opens `ortoni-report/index.html` automatically after every local run (skipped in CI). Nothing else to run.
- **Allure Report** (`allure-playwright` + `allure-commandline`) — `utils/allureReportGenerator.ts` regenerates the static report into `allure-report/` after every run, but Allure's own viewer starts a local server, so it can't auto-open the way Ortoni does. Run `npm run report:allure` after tests to generate + open it.

Switch later by re-running `testroid init` and picking the other option, or by editing `playwright.config.ts`'s `reporter: [...]` array directly.

## Mobile emulation (mobile-chrome)

`testroid init` asks whether to also run the UI suite against `mobile-chrome` (`devices['Pixel 5']` emulation) alongside the standard desktop `chromium` project — it defaults to **no** (desktop-only), since that matches typical first-run expectations on a new project. Decline it and only `chromium` (plus `api`/`mobile-app`, unaffected by this choice) stays active in `playwright.config.ts`'s `projects: [...]` array, so `npm test` doesn't run mobile emulation you didn't ask for.

Say yes to keep both — `npm test` then runs `chromium` + `mobile-chrome` + `api` + `mobile-app`, same as before this prompt existed. Add it later by re-running `testroid init`, or manually re-adding the `mobile-chrome` project entry to `playwright.config.ts` (see the Testroid template's own copy for the exact shape).

## Network request logging

Every first-party network request/response (same domain as `BASE_URL`) is logged via `logger.network`/`logger.api` (`utils/networkHelper.ts`) during a test run. Third-party requests — analytics/ads/tracking beacons like Facebook Pixel, Google Ads, or Clevertap, which a real commercial site fires constantly and which aren't part of what you're testing — are still allowed to execute normally but are **not** logged by default, to keep the log readable.

To log third-party requests too, set in `.env`:
```
LOG_THIRD_PARTY_REQUESTS=true
```

## Playwright MCP (optional)

`testroid init` offers to install the [Playwright MCP server](https://github.com/microsoft/playwright-mcp) (`@playwright/mcp`) as a dev dependency and register it in `.mcp.json`. MCP (Model Context Protocol) lets Claude Code — or any other MCP-aware AI client — drive a real browser directly: navigate, click, fill forms, and read the page's accessibility tree as part of a conversation, without you writing or running a Playwright script yourself.

For a Testroid project, that's useful for things like exploring an unfamiliar page to figure out what locators/roles to add to `locators/locatorConstants.ts`, reproducing a flaky test interactively, or letting an agent verify a flow live before it writes the corresponding spec. It's independent of the `mobile-app` project's Appium/WebdriverIO layer — this is browser automation for the AI assistant itself, not part of the test suite that runs in CI.

Say yes at the `testroid init` prompt to opt in (installs `@playwright/mcp` and writes/merges the `playwright` entry into `.mcp.json`), or skip it and add it later with:

```bash
npm install -D @playwright/mcp@0.0.79
```

then register it in `.mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@0.0.79"]
    }
  }
}
```

<!-- @playwright/mcp version pinned to avoid breaking changes — review periodically, keep in sync with src/mcp.ts -->
