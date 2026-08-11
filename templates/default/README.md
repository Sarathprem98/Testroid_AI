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

Run the full suite:
```bash
npx playwright test
```

## Structure

- `agents/` — multi-agent test generation pipeline (plan, generate, normalize, reuse-match, implement, validate)
- `pages/` — Page Object Model classes for your site
- `api/` — API client and fixtures
- `mobile/` — mobile automation support
- `docs/` — agent documentation and generated pipeline output
- `tests/` — Playwright test specs
