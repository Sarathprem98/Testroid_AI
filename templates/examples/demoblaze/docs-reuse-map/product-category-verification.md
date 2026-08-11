# Reuse Mapping Report — Product Category Verification

> Pipeline stage: 4 — Reuse Matcher (read-only) | Ticket: **TBD** (working slug: `product-category-verification`) | Epic: TBD
> Source: [`docs/normalizer/product-category-verification.md`](../normalizer/product-category-verification.md) (Stage 3 output, 2026-07-14)
> Codebase inspected: `pages/*.ts`, `locators/locatorConstants.ts`, `tests/*.spec.ts`, `tests/hooks.ts`, `fixtures/testFixture.ts` — as of 2026-07-14. No files were modified.
> Generated: 2026-07-14

---

## 2. Reuse Summary

| Classification | Count |
|---|---|
| Full Reuse | 0 (case-level); 2 supporting assets (fixture + hooks — see below) |
| Partial Reuse | 0 |
| Net New | 5 (TC-01, TC-02, TC-03, TC-04, TC-05) |
| Unverifiable | 0 |
| **Total** | **5** |

Every normalized test case's *primary* action — selecting a category via the sidebar — has zero existing coverage in `pages/HomePage.ts` or `locators/locatorConstants.ts` today. Because that action blocks every downstream assertion in all 5 cases, each case is classified **Net New** at the case level. However, real reusable sub-assets exist and are cited per case below so Stage 5 doesn't re-invent them.

---

## 3. Reuse Mapping Table

### Module: Home Page — Category Sidebar & Product Grid

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence | Notes |
|---|---|---|---|---|---|
| TC-01 | RQ-01 | Net New | Partial sub-asset: `locatorConstants.ts` → `locatorConstants.home.productCard(productName)` (lines 46–51); `pages/BasePage.ts` → `expectVisible()` (lines 223–227) | High (for the cited sub-assets); category-click action has no existing asset | Sub-assets fully cover "assert product X visible" with zero new code — call `this.expectVisible(this.homeLocators.productCard('<phone product name>'))` from the new method. Category-click has no locator today. |
| TC-02 | RQ-02 | Net New | Same sub-assets as TC-01 | High (sub-assets); none for category-click | Sequential continuation of TC-01 in the same test — no additional reusable assets beyond what TC-01 already cites. |
| TC-03 | RQ-03 | Net New | Same sub-assets as TC-01 | High (sub-assets); none for category-click | Same pattern as TC-01/TC-02. |
| TC-04 | RQ-04 | Net New | `productCard('Samsung galaxy s6')` + `expectVisible()` cover the presence half exactly as in TC-01; the absence half ("does not contain") has **no existing BasePage method** — `expectVisible`/`findElement` (`pages/BasePage.ts:46–65, 223–227`) only assert presence, there is no `expectHidden`/count-based absence helper today | Medium — presence half is Full-Reuse-eligible; absence half is genuinely Net New | This is the case most dependent on new capability: a `toHaveCount(0)`-style absence assertion does not exist anywhere in `BasePage.ts` currently. |
| TC-05 | RQ-05 | Net New | Same sub-assets as TC-01 (per-row) | High (sub-assets); none for category-click | Data-driven variant of the same underlying capability as TC-01–03; shares the same Net New category-selection dependency, so implementing it once serves all 4 cases. |

**Supporting infrastructure (Full Reuse, not case-specific):**

| Asset | Status | Evidence |
|---|---|---|
| `homePage` fixture | Full Reuse | Already wired in `fixtures/testFixture.ts:25–27` (`homePage: async ({ page }, use) => { await use(new HomePage(page)); }`) — no fixture changes needed for a category spec. |
| `registerHooks` (suite lifecycle) | Full Reuse — **with a naming collision caveat, see Section 5** | `tests/hooks.ts:5–26` is the implementation actually used by `tests/purchase.001.spec.ts:5,7` (`import { registerHooks } from './hooks'`). Reusable as-is for a new spec. |
| `homePage.open()` | Full Reuse | `pages/HomePage.ts:9–12` — already used by `tests/purchase.001.spec.ts:15`; directly reusable as the precondition step ("Navigate to the Demoblaze homepage") for every case. |

---

## 4. Recommended New Automation Assets

Signatures only — no implementation, per this stage's scope.

**`locators/locatorConstants.ts`** — add under `home`:

```ts
categoryLink: (category: 'Phones' | 'Laptops' | 'Monitors'): LocatorStrategyList => [
  { kind: 'role', role: 'link', name: category },
  { kind: 'text', text: category },
  { kind: 'css', selector: /* TBD — sidebar link selector, not yet verified against live DOM by this stage */ '' },
] as const,

productGridItems: [
  { kind: 'css', selector: /* TBD — product grid item selector, not yet verified against live DOM by this stage */ '' },
] as const,
```

> Per this stage's guardrails, exact `css`/`xpath` selector values are not fabricated here — Stage 5 must verify them against the live DOM before implementing, following the existing fallback pattern (role → text → css) already used by `home.productCard`.

**`pages/HomePage.ts`** — new method signatures:

```ts
async selectCategory(category: 'Phones' | 'Laptops' | 'Monitors'): Promise<void>;
async getDisplayedProductNames(): Promise<string[]>;
async expectProductVisible(productName: string): Promise<void>;   // can delegate directly to existing expectVisible(homeLocators.productCard(productName))
async expectProductNotVisible(productName: string): Promise<void>; // needs new BasePage support, see below
```

**`pages/BasePage.ts`** — new protected method signatures (needed to support `getDisplayedProductNames` and `expectProductNotVisible`, since no existing method reads multiple elements or asserts absence):

```ts
protected async findElements(strategies: LocatorStrategyList, options?: OptionalWaitOptions): Promise<Locator>; // plural variant of existing findElement, for locators matching multiple elements
protected async getAllTexts(strategies: LocatorStrategyList, options?: OptionalWaitOptions): Promise<string[]>;
protected async expectHidden(strategies: LocatorStrategyList): Promise<void>; // toHaveCount(0)-style absence assertion — does not exist today
```

**`tests/category-navigation.002.spec.ts`** (or per the epic-folder convention, `tests/category-navigation/{ticketNo}.spec.ts` once `{ticketNo}` is known) — Net New spec file, following the structure of `tests/purchase.001.spec.ts` (import `test`/`expect` from `../fixtures/testFixture`, `registerHooks` from `./hooks`, tag `@regression`).

---

## 5. Risk & Collision Flags

| Flag | Detail |
|---|---|
| **Naming collision — `registerHooks`** | Two different functions share the name `registerHooks`: `tests/hooks.ts:5` (viewport + failure-screenshot capture — what `purchase.001.spec.ts` actually imports and uses) and `fixtures/testFixture.ts:56` (a different implementation adding network/console-error logging hooks, exported but not imported by any existing spec found in `tests/`). Stage 5 must import from `./hooks` to match the established convention, **not** from `../fixtures/testFixture`, or the new spec will silently behave differently from `purchase.001.spec.ts`. This is a pre-existing codebase inconsistency, not something introduced by this pipeline run — flagged for visibility, not something this read-only stage can fix. |
| **No locator drift risk found** | Proposed new locator keys `categoryLink` and `productGridItems` do not collide with any existing key in `locatorConstants.home` (`brand`, `signUpLink`, `loginLink`, `logoutLink`, `cartLink`, `welcomeLabel`, `productCard`, `nextButton`). |
| **No spec duplication risk found** | Only two files exist under `tests/`: `purchase.001.spec.ts` (cart/checkout flow, no category interaction) and `hooks.ts` (not a spec). No existing test already exercises category selection or the product grid outside of `openProduct()`'s single-product navigation. |
| **Live-DOM verification outstanding** | This stage did not fetch/inspect the live Demoblaze DOM to confirm exact `css` selectors for the category sidebar links or the product grid container — those are marked TBD in Section 4 and must be verified during Stage 5, not assumed. |

---

## 6. Traceability Cross-Check

| Normalized Test Case | Reuse Classification Assigned | Status |
|---|---|---|
| TC-01 (RQ-01) | Net New | ✅ Classified |
| TC-02 (RQ-02) | Net New | ✅ Classified |
| TC-03 (RQ-03) | Net New | ✅ Classified |
| TC-04 (RQ-04) | Net New | ✅ Classified |
| TC-05 (RQ-05) | Net New | ✅ Classified |

All 5 normalized test cases received a classification. No gaps.
