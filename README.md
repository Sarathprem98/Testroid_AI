# Testroid

AI-powered, multi-agent Playwright test automation framework generator — scaffold a complete, ready-to-run test framework into any project with a single command.

## What it does

`testroid init` scans your target folder and:
- **Empty folder** → scaffolds the full framework (multi-agent pipeline docs, Page Object Model structure, API client, mobile support, utilities, and config)
- **Existing Playwright project** → merges in non-destructively (adds missing files, merges `package.json` dependencies/scripts, never overwrites what you already have)
- **Unrecognized project** → adds Testroid into a separate `testroid/` subfolder to stay safe

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
- Project name
- Base URL of the site you're testing
- Test suite type (Smoke, Regression, Sanity, Full Suite)
- Environment

These are written to a `.env` file, which the framework's Playwright config reads at runtime.

## What's included

- `agents/` (docs) — multi-agent test generation pipeline: test plan, test case generation, normalization, reuse matching, implementation, and validation agents
- `api/` — base API client and fixtures
- `mobile/` — mobile automation support (Android/iOS capabilities, base client)
- `fixtures/`, `utils/` — shared test fixtures and helper utilities
- `docs/agents/` — documentation for each agent in the pipeline
- `templates/examples/demoblaze/` — a full worked example (page objects, generated test plans/cases, specs) showing the framework applied to a real site

## Requirements

- Node.js 18 or later
- npm

## License

MIT