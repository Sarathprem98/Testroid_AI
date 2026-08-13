---
name: testroid-locator-conventions
description: Use when scanning pages/**, locators/locatorConstants.ts, tests/**, or fixtures/testFixture.ts for reuse (Testroid Stage 4 — Reuse Matcher), or when writing/extending Page Objects, locators, or spec files (Testroid Stage 5 — Implement Agent), including mobile web emulation (`mobile-chrome` Playwright project) cases. Covers the project's auto-healing LocatorStrategyList fallback pattern, BasePage primitives, Page Object/spec conventions, and mobile-emulation-specific pitfalls that must be matched exactly.
---

# Testroid Locator & Page Object Conventions

Grounded in the framework's actual code — [locators/locatorConstants.ts](../../locators/locatorConstants.ts) and [pages/BasePage.ts](../../pages/BasePage.ts). Applies to Stage 4 (Reuse Matcher, read-only) and Stage 5 (Implement Agent, writes code). For the pipeline-wide traceability/HITL/anti-fabrication rules that also apply here, see [[guardrails]].

## Locator pattern: `LocatorStrategyList` (auto-healing)

Every element is defined as an ordered array of fallback strategies, never a single inline selector:

```ts
{ kind: 'role'; role: AriaRole; name: string | RegExp }
{ kind: 'label'; text: string | RegExp }
{ kind: 'placeholder'; text: string | RegExp }
{ kind: 'text'; text: string | RegExp }
{ kind: 'testId'; testId: string }
{ kind: 'css'; selector: string }
{ kind: 'xpath'; selector: string }
```

- **Fallback order**: role → label/placeholder/text → testId → css → xpath (most robust/semantic first, most brittle last).
- `BasePage.findElement`/`findElements` walk the list in this order and return the first strategy that actually resolves within the timeout. This is the framework's auto-healing behavior: when a site's markup changes and breaks the primary (usually role- or text-based) strategy, a Page Object keeps working off a later fallback instead of failing outright — no test author intervention, and no runtime AI/ML involved.
- Strategies live in `locators/locatorConstants.ts`, grouped by page/module (e.g. `locatorConstants.login.usernameInput`).
- Parameterized locators are functions returning a `LocatorStrategyList` (e.g. `productCard(name)`, `navLink(label)`), not string templates inline in a Page Object.
- Never add a raw CSS/XPath selector directly inside a Page Object method — it belongs in `locatorConstants.ts` as a `LocatorStrategy` entry.
- Design each strategy list defensively: include at least one selector-based fallback (`css`/`xpath`/`testId`) below the semantic ones so healing has something concrete to fall back to, and order css before role/text only when a semantic match would be ambiguous on that specific page (document why in a comment when you do this).

## Page Object pattern

- Every Page Object extends `BasePage` (`pages/BasePage.ts`) and uses its protected primitives instead of touching `page` directly:
  - `click(strategies, options?)`, `fill(strategies, value, options?)`, `selectOption`, `check`, `uncheck`, `hover`, `waitForElement`, `scrollIntoView`, `takeScreenshot`
  - Assertion helpers: `expectVisible`, `expectHidden`, `expectText`, `expectImageLoaded`, `assertCurrentUrl`, `assertTitle` (see `utils/assertionHelpers.ts` and `pages/BasePage.ts` for usage)
  - `findElement` walks the strategy list in order and returns the first one that resolves within `timeoutMs` (default 5000ms), retried via `retryAsync` (`utils/retryHelper.ts`).
- All UI actions log through `logger.*` (e.g. `logger.ui.click`, `logger.ui.fill`) — never `console.log`.
- New/changed Page Object methods go in `pages/{module}/*.ts` per the module convention. A project with pre-existing flat Page Object files (e.g. `pages/LoginPage.ts` at the root of `pages/`) is not retroactively migrated unless a migration is explicitly requested.

## Spec pattern

- Specs use the project's `fixtures/testFixture.ts` for typed fixture injection and call `registerHooks(test, '<suite name>')` (see `tests/hooks.ts` once it exists in this project, following the same shape).
- Group tests under a tagged `test.describe('@tag', ...)` consistent with the project's Automation Strategy tags (e.g. `@smoke`, `@regression`).
- New spec files: `tests/{epic}/{ticketNo}.spec.ts`.

## Reuse classification (Stage 4)

When checking whether a normalized test case is already covered:

| Classification | Criteria | Required evidence |
|---|---|---|
| Full Reuse | Existing method + existing locator(s) + (optional) existing spec assertion fully satisfy the case | Cite exact file, class, method/line |
| Partial Reuse | Existing method/locator covers ≥50% of behavior but needs extension | Cite existing asset **and** the specific gap |
| Net New | No existing method/locator addresses the behavior | State explicitly — never force a match |
| Unverifiable | Codebase not inspectable for this case | Mark `TBD` — never guess |

Match on: method/responsibility name overlap (e.g. `openItem`, `addToCart`, `verifyLoggedIn`), locator overlap in `locatorConstants.ts`, scenario overlap at the `test()` level even under a different title, and fixture/dependency overlap in `testFixture.ts`.

## Implementation rules (Stage 5)

- Implement only what Stage 4 marked Net New / Partial Reuse; Full Reuse assets are not touched, not even a "harmless" rename or formatting pass.
- New locators always go into `locatorConstants.ts` as a `LocatorStrategyList`, never inline.
- Test data must match the Normalized Test Case's `testData` field exactly; if `TBD`, surface that rather than inventing a value.
- No drive-by refactors — the smallest edit that satisfies the documented gap.
- Typecheck and/or run the affected spec(s) before declaring the stage complete (both `chromium` and `mobile-chrome` for `Platform: Mobile`/`Both` cases); if that isn't possible, say so explicitly rather than implying a pass.

## Mobile web testing (`Platform: Mobile` / `Both` cases)

Mobile coverage is Playwright device emulation — `mobile-chrome` project → `devices['Pixel 5']` in [playwright.config.ts](../../playwright.config.ts) — not a separate framework or native app tooling. The same Page Object/locator/spec code drives both `chromium` and `mobile-chrome`; never fork a mobile-only copy. Common pitfalls to watch for when the same locators/assertions run against both viewport sizes:

- **Don't `force: true` a click to dodge an actionability failure.** It skips Playwright's "wait until stable" check, so it can fire mid-CSS-transition (e.g. a modal still animating in) and throw "Element is outside of the viewport" — more exposed on the narrower mobile viewport than on desktop. A plain `click()` waits for visible + stable and resolves the same race within its default timeout. Reserve `force: true` for a documented, verified pointer-interception case, never as a default fix for a flaky click.
- **Don't hardcode desktop-only DOM/tab-order assumptions.** Responsive layouts often add elements (e.g. a nav hamburger toggle) that only exist/are focusable below a breakpoint. Derive expected order dynamically and filter by actual visibility (`el.offsetParent !== null`), not a fixed desktop-only sequence.
- **A confirmed live-site mobile-only defect gets skipped, not masked.** If a scenario is verified (e.g. via `getBoundingClientRect()`/computed-style inspection against the live site at both viewport sizes) to be genuinely broken on the target site only below some breakpoint, guard just the affected assertion with `test.info().project.name === 'mobile-chrome'`, citing the specific confirmed defect in a comment — never loosen the assertion to hide it. Same principle as not loosening an API assertion to tolerate a live 500 (see [[guardrails]]).
- If `tests/hooks.ts`'s `beforeEach` forces a fixed desktop viewport, make sure that only happens when `testInfo.project.use.isMobile` is falsy — don't add a new unconditional `page.setViewportSize(...)` elsewhere that would clobber the Pixel 5 emulated viewport.
