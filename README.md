# Testroid

![Testroid](https://raw.githubusercontent.com/Sarathprem98/Testroid_AI/main/docs/testroid-banner.png)

[![CI](https://github.com/Sarathprem98/Testroid_AI/actions/workflows/ci.yml/badge.svg)](https://github.com/Sarathprem98/Testroid_AI/actions/workflows/ci.yml)

AI-powered, multi-agent Playwright test automation framework generator — scaffold a complete, ready-to-run test framework into any project with a single command.

## What it does

`testroid init` scans your target folder and:
- **Empty folder** → scaffolds the full framework (multi-agent pipeline docs, Page Object Model structure with auto-healing locators, API client, mobile support, utilities, and config)
- **Existing Playwright project** → syncs in non-destructively: adds missing files, merges `package.json` dependencies/scripts (existing versions always win), merges or creates `.env` — never overwrites anything you already have
- **Existing Playwright + Cucumber project** → automatic sync for this combination isn't built yet, so Testroid is added into a separate `testroid/` subfolder instead, leaving your project untouched
- **Unrecognized project** → same `testroid/` subfolder fallback, to stay safe

It also automatically installs npm dependencies and Playwright browsers — skipping either step if they're already present.

## Usage

Run directly with `npx` — no install step needed:

```bash
npx testroid init
```

Or install it globally if you'll use it often:

```bash
npm install -g testroid
testroid init
```

You'll be prompted for:
- Project name — only asked when scaffolding fresh (empty folder or unrecognized project). Syncing into an existing project skips this entirely and never touches its `package.json` `"name"`; the label used in `.env`/generated docs is instead auto-derived from that project's own `package.json` `"name"`, falling back to the folder's basename.
- Base URL of the site you're testing — optional; leave it blank to add later. If one's already detectable (an existing `.env`'s `BASE_URL`, or a `baseURL` already wired into `playwright.config.ts`), it's pre-filled for you to confirm rather than asked cold.
- Test suite type (Smoke, Regression, Sanity, Full Suite)
- Environment
- Whether to install Playwright MCP (see below)
- Which AI coding assistant you use (see below)
- Which test report you want, Allure or Ortoni (see below)

Project name (fresh scaffolds only)/base URL/suite type/environment are written to a `.env` file, which the framework's Playwright config reads at runtime. A fresh scaffold also gets its `package.json` `"name"` set from your answer.

Every run prints a colorized banner up front, an animated spinner for each step (npm install, Playwright browser install, reporting setup, MCP setup — each one skipped cleanly if it's already done), and finishes with a short **Next steps** summary tailored to what you actually configured: the exact command to run your tests, whether your chosen report needs a manual follow-up command, and which AI-assistant file got generated.

### Non-interactive mode (`--yes`)

For CI or quick re-testing, `--yes` (or `-y`) skips every prompt and scaffolds with sensible defaults (project name `my-testroid-project` for a fresh scaffold unless one's already set — or auto-derived from the existing project's `package.json`/folder name when syncing — Smoke suite, QA environment, Playwright MCP enabled, Allure reporting, and whichever AI assistant config is already detected in the folder). Every field has a safe default except the base URL, which can't be guessed — pass it with `--url`:

```bash
npx testroid init --yes --url https://example.com
```

If `--yes` is used without `--url` and no `BASE_URL` is already set in an existing `.env`, `testroid init` exits with a clear error explaining that `--url` is required.

## Undoing an init (`testroid undo`)

Every `testroid init` run — fresh scaffold or sync into an existing project — writes a `.testroid-manifest.json` at the project root recording exactly what it added: every new file/folder, which `package.json` dependency/script keys it added (never touching a key that already existed, even one with the same name), and whether `.mcp.json`/`playwright.config.ts` were created fresh or just had an entry merged into a file that already existed.

```bash
npx testroid undo
```

`testroid undo` reads that manifest, shows you exactly what it's about to remove, and asks for confirmation before touching anything. On confirmation it:
- deletes exactly the files/folders the manifest recorded — nothing else
- removes exactly the `package.json` keys Testroid added — every pre-existing key is left alone, even ones with the same name
- removes just the `playwright` entry from `.mcp.json` or just the reporter entries from `playwright.config.ts` if those were merged into files that already existed (rather than deleting the whole file, which only happens when Testroid created it fresh)
- deletes the manifest itself last

If there's no `.testroid-manifest.json` in the current folder — this project wasn't scaffolded by Testroid, or the manifest was already removed — it says so clearly and exits without touching anything.

## What's included

- `pages/` — Page Object Model base (`BasePage.ts`), driving **auto-healing locators**: every element in `locators/locatorConstants.ts` is an ordered list of fallback strategies (role → label/text → css → xpath) tried in sequence, so a markup change breaks one strategy instead of breaking the test
- `api/` — base API client and fixtures
- `mobile/` — native/hybrid mobile app automation support via Appium (Android/iOS capabilities, base client) — separate from `mobile-chrome` below, which is mobile *web* emulation of the same UI suite
- `fixtures/`, `utils/` — shared test fixtures and helper utilities, including first-party network request/response logging (kept deliberately terse by default — method/status/duration only, no URL; set `LOG_VERBOSE_NETWORK=true` in `.env` for full detail)
- Four Playwright projects out of the box: `chromium` (desktop), `mobile-chrome` (`devices['Pixel 5']` emulation — always present, not an install-time choice), `api`, and `mobile-app`. The AI pipeline decides per scenario, from the ticket's own content, whether a test needs to target `mobile-chrome` — not something you configure up front.
- `docs/agents/` — documentation for each stage of the multi-agent test generation pipeline (Test Plan Generator → Test Case Generator → Normalizer → Reuse Matcher → Implement / API Automator / Mobile Automator → Validator), run as one continuous flow by the Pipeline Orchestrator (Stage 1 through Stage 6) rather than stage-by-stage, pausing only at its human-in-the-loop gates
- `skills/` — four Claude Code Skills documenting the framework's own conventions (`guardrails`, `testroid-locator-conventions`, `testroid-api-conventions`, `testroid-mobile-conventions`), so an AI assistant working in a scaffolded project can load them instead of re-deriving the patterns
- `templates/examples/demoblaze/` — a full worked example (page objects, generated test plans/cases, specs) showing the framework applied to a real site

## AI coding assistant integration

`testroid init` asks which AI coding assistant you use and generates the same project-aware guidance (stack, the agent pipeline, reporting, conventions) into whichever file that tool expects — never overwriting one that's already there:

| Assistant | File generated |
|---|---|
| Claude Code | `CLAUDE.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursor/rules/testroid.mdc` (with Cursor's Project Rules frontmatter) |
| Other | `AGENTS.md` — the tool-agnostic convention several assistants are converging on |
| Skip | nothing written; add one later by re-running `testroid init` |

The content itself adapts to how you're using Testroid: a fresh scaffold gets Testroid's generic reference guide, while syncing into an existing Playwright project generates guidance that describes the stack, folders, and scripts actually detected there. Re-running `testroid init` on a project that already has one of these files pre-selects that same tool as the prompt's default.

## Reporting

`testroid init` asks which test report you want — **Allure Report** or **Ortoni Report** — installs what's needed, and wires it into `playwright.config.ts`'s `reporter: [...]` array alongside the always-on `list`/`html`/`junit`/`json` reporters.

- **Ortoni Report** — opens automatically after every local run (skipped in CI). Nothing else to run.
- **Allure Report** — regenerates into `allure-report/` after every run, but its own viewer needs a local server, so run `npm run report:allure` afterward to generate + open it.

Switch later by re-running `testroid init` and picking the other option, or by editing `playwright.config.ts`'s `reporter: [...]` array directly.

## Playwright MCP (optional)

`testroid init` can install the [Playwright MCP server](https://github.com/microsoft/playwright-mcp) (`@playwright/mcp`) as a dev dependency and register it in `.mcp.json`. MCP (Model Context Protocol) lets an MCP-aware AI client — Claude Code and others — drive a real browser directly (navigate, click, fill forms, read the accessibility tree) as part of a conversation, without writing or running a Playwright script by hand. It's independent of the test suite itself — useful for exploring an unfamiliar page to figure out locators, reproducing a flaky test interactively, or letting an assistant verify a flow before writing the corresponding spec.

If it's registered, the agent pipeline's own generated guidance asks before Implementation starts writing locators: use Playwright MCP to inspect the live page interactively, or use the framework's semantic auto-healing locator strategy without live inspection. If it isn't registered, the pipeline just proceeds with the auto-healing strategy — no question asked.

Say yes at the prompt (the default, including under `--yes`) to opt in, or skip it and add it later:

```bash
npm install -D @playwright/mcp@0.0.79
```

then register the `playwright` entry in `.mcp.json` yourself, or just re-run `testroid init`.

## Requirements

- Node.js 18 or later
- npm

## License

MIT
