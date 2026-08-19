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

To cleanly remove what Testroid added — the reverse of `testroid init` — run `testroid undo`:

```bash
npx testroid undo
```

This only works inside a project that has a `.testroid-manifest.json` at its root (written by the `init` run that set the project up, recording exactly what it added). `testroid undo` reads it, shows you a full summary of what's about to happen, and asks for confirmation before deleting anything:
- every file/folder Testroid added
- the specific `package.json` dependency/script keys Testroid added — never a pre-existing key, even one with the same name
- for `.mcp.json` and `playwright.config.ts`: the whole file if Testroid created it fresh (already covered by the files/folders above), or just the entry Testroid added if it was merged into a file that already existed — never the rest of that file

Nothing that existed before Testroid touched this project is removed. If `.testroid-manifest.json` isn't present (already used, or this project wasn't set up by Testroid), it says so and exits without doing anything.

Run the full suite:
```bash
npx playwright test
```

This runs all four Playwright projects: `chromium` (desktop), `mobile-chrome` (`devices['Pixel 5']` emulation of the same UI specs — always defined, not something you opt into at setup time), `api`, and `mobile-app`. Whether a given UI scenario actually needs to target `mobile-chrome` is a per-ticket judgment call the AI pipeline makes by reading the scenario's own content (mobile-specific wording, touch gestures, an explicit mobile tag) at implementation time, not a question asked during `testroid init`.

## Structure

- `docs/agents/` — multi-agent test generation pipeline (plan, generate, normalize, reuse-match, implement, validate), run end-to-end as one continuous flow by the Pipeline Orchestrator rather than stage-by-stage — see `docs/agents/README.md`
- `pages/` — Page Object Model classes for your site, all extending `pages/BasePage.ts`
- `locators/` — `locatorConstants.ts`, the auto-healing locator definitions your Page Objects use
- `skills/` — Claude Code Skills documenting this framework's conventions
- `api/` — API client and fixtures
- `mobile/` — native/hybrid mobile *app* automation support via Appium — distinct from the `mobile-chrome` Playwright project above, which is mobile *web* emulation of the regular UI suite
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

## Network request logging

Every first-party network request/response (same domain as `BASE_URL`) is logged via `logger.network`/`logger.api` (`utils/networkHelper.ts`) during a test run. Third-party requests — analytics/ads/tracking beacons like Facebook Pixel, Google Ads, or Clevertap, which a real commercial site fires constantly and which aren't part of what you're testing — are still allowed to execute normally but are **not** logged by default, to keep the log readable.

By default the log stays deliberately bare — one line per completed request with just enough to scan for success/failure, no URL:
```
[NETWORK] GET → 200 (152ms)
[NETWORK] POST → 201 (110ms)
[NETWORK] Failed request: GET /inventory → 500 (343ms)
```
A failed request still shows its last path segment (e.g. `/inventory`) as a minimal hint of what failed, since a bare status code isn't enough to tell same-status failures apart.

To log third-party requests too, set in `.env`:
```
LOG_THIRD_PARTY_REQUESTS=true
```

For full detail — the full URL on every line, plus POST payloads and JSON response bodies — set in `.env`:
```
LOG_VERBOSE_NETWORK=true
```
This also disables the noise filters and body/path truncation, so everything logs in full regardless of domain, pattern match, or size. Use it for deep debugging, not everyday runs.

## Playwright MCP (optional)

`testroid init` offers to install the [Playwright MCP server](https://github.com/microsoft/playwright-mcp) (`@playwright/mcp`) as a dev dependency and register it in `.mcp.json`. MCP (Model Context Protocol) lets Claude Code — or any other MCP-aware AI client — drive a real browser directly: navigate, click, fill forms, and read the page's accessibility tree as part of a conversation, without you writing or running a Playwright script yourself.

For a Testroid project, that's useful for things like exploring an unfamiliar page to figure out what locators/roles to add to `locators/locatorConstants.ts`, reproducing a flaky test interactively, or letting an agent verify a flow live before it writes the corresponding spec. It's independent of the `mobile-app` project's Appium/WebdriverIO layer — this is browser automation for the AI assistant itself, not part of the test suite that runs in CI.

When `.mcp.json` registers the `playwright` server, the pipeline's own generated guidance asks — right before Implementation starts writing locators — whether to use it to inspect the live page interactively or stick with the semantic auto-healing strategy without live inspection. No `.mcp.json` entry means no question: it proceeds straight to the auto-healing strategy.

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
