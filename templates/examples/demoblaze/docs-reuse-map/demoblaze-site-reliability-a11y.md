<!-- Generated-by: ReuseMatcherAgent · demoblaze-site-reliability-a11y · 2026-07-20 · AI-generated, human review required -->

# Reuse Mapping Report — demoblaze-site-reliability-a11y

> Source: [`docs/normalizer/demoblaze-site-reliability-a11y.md`](../normalizer/demoblaze-site-reliability-a11y.md) (Stage 3)
> Pipeline Stage: 4 (Reuse Matcher, read-only) · Version: 1.0 · Date: 2026-07-20
> Codebase scanned: `pages/HomePage.ts`, `pages/BasePage.ts`, `locators/locatorConstants.ts`, `fixtures/testFixture.ts`, `utils/consoleHelper.ts`, `tests/additional-test-cases.003.spec.ts`, `tests/category-navigation.002.spec.ts`, `tests/purchase.001.spec.ts`

## 1. Reuse Summary

| Classification | Count |
|---|---|
| Full Reuse | 1 (TC-01) |
| Partial Reuse | 2 (TC-02, TC-04) |
| Net New | 2 (TC-03, TC-05) |
| Unverifiable | 0 |
| **Total** | **5** |

**Headline finding:** TC-01 (pagination) is not just Full Reuse of Page Object assets — it is a near-exact duplicate of an already-passing test, `tests/additional-test-cases.003.spec.ts:101-113` (`TC-09 (Req TBD): Product grid pagination — Next button loads additional products`). This is almost certainly the same "25 scenarios" the SPEC referenced when it said this feature file "extends demoblaze.feature — no overlap with the original 25 scenarios" — `additional-test-cases.003.spec.ts` contains exactly 25 numbered test cases (TC-01–TC-25). See Risk & Collision Flags (Section 6).

## 2. Reuse Mapping Table

### Module: Pagination

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-01 | RQ-01 | **Full Reuse** | `HomePage.getDisplayedProductNames()` ([pages/HomePage.ts:56-58](../../pages/HomePage.ts)); `HomePage.goToNextProductPage()` ([pages/HomePage.ts:125-128](../../pages/HomePage.ts)); locator `home.productGridNextButton` ([locators/locatorConstants.ts:108-111](../../locators/locatorConstants.ts)); existing spec `tests/additional-test-cases.003.spec.ts:101-113` (TC-09) | 1.0 | Existing TC-09 test already exercises this exact scenario end-to-end and is passing. No new automation warranted. |

### Module: Page Lifecycle

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-02 | RQ-02 | **Partial Reuse** | `HomePage.verifyCarouselVisible()` ([pages/HomePage.ts:86-88](../../pages/HomePage.ts)); `HomePage.verifyProductGridVisible()` ([pages/HomePage.ts:68-70](../../pages/HomePage.ts)); `ConsoleLogger.handleMessage()` / `handlePageError()` ([utils/consoleHelper.ts:4-25](../../utils/consoleHelper.ts)); `homePage` fixture ([fixtures/testFixture.ts:15,25-27](../../fixtures/testFixture.ts)) | 0.5 | Post-reload UI-intact assertions are fully covered by existing methods. Gap: no `reload()` primitive in `BasePage`; `ConsoleLogger` only logs (via Winston), it does not collect/count messages for a test assertion — a new capture mechanism is needed. |

### Module: Security/Transport

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-03 | RQ-03 | **Net New** | — | 0.0 | No existing method, locator, or utility addresses URL-protocol checking, certificate-error detection, or mixed-content console monitoring. |

### Module: Accessibility

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-04 | RQ-04 | **Partial Reuse** | `HomePage.verifyNavbarLinks()` ([pages/HomePage.ts:77-84](../../pages/HomePage.ts)); locators `home.homeNavLink`, `home.contactLink`, `home.aboutUsLink`, `home.cartLink`, `home.loginLink`, `home.signUpLink`, `home.brand` (all in [locators/locatorConstants.ts:18-78](../../locators/locatorConstants.ts)); existing spec `tests/additional-test-cases.003.spec.ts:30-33` (TC-02, presence-only) | 0.6 | All navbar elements already have locator entries and a presence-verification method, but nothing tests keyboard Tab order or focus-indicator visibility — that behavior is entirely new. |

### Module: Branding

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence Score | Notes |
|---|---|---|---|---|---|
| TC-05 | RQ-05 | **Net New** | — | 0.0 | No favicon-related locator, Page Object method, or spec assertion exists anywhere in the codebase. |

## 3. Structured Export (JSON)

```json
[
  {
    "testCaseId": "TC-01",
    "reqId": "RQ-01",
    "module": "Pagination",
    "classification": "Full Reuse",
    "confidenceScore": 1.0,
    "matchedAssets": [
      { "type": "method", "file": "pages/HomePage.ts", "reference": "HomePage.getDisplayedProductNames():56-58" },
      { "type": "method", "file": "pages/HomePage.ts", "reference": "HomePage.goToNextProductPage():125-128" },
      { "type": "locator", "file": "locators/locatorConstants.ts", "reference": "home.productGridNextButton:108-111" },
      { "type": "spec", "file": "tests/additional-test-cases.003.spec.ts", "reference": "TC-09:101-113" }
    ],
    "gap": null,
    "recommendedNewAssets": [],
    "riskFlags": ["exact-duplicate-of-existing-spec-test"],
    "notes": "Do not implement a new test for this case; existing TC-09 already covers RQ-01's behavior."
  },
  {
    "testCaseId": "TC-02",
    "reqId": "RQ-02",
    "module": "Page Lifecycle",
    "classification": "Partial Reuse",
    "confidenceScore": 0.5,
    "matchedAssets": [
      { "type": "method", "file": "pages/HomePage.ts", "reference": "HomePage.verifyCarouselVisible():86-88" },
      { "type": "method", "file": "pages/HomePage.ts", "reference": "HomePage.verifyProductGridVisible():68-70" },
      { "type": "method", "file": "utils/consoleHelper.ts", "reference": "ConsoleLogger.handleMessage()/handlePageError():4-25" },
      { "type": "fixture", "file": "fixtures/testFixture.ts", "reference": "homePage:15,25-27" }
    ],
    "gap": "No reload() primitive in BasePage; ConsoleLogger logs via Winston but does not collect/count console errors for a test assertion, and it is not currently wired into this spec's execution path.",
    "recommendedNewAssets": [
      { "type": "method", "target": "BasePage", "signature": "protected async reload(): Promise<void>" },
      { "type": "method", "target": "HomePage or spec-local helper", "signature": "attach/collect console error + page-error messages during reload, exposing a count/array for assertion" }
    ],
    "riskFlags": [],
    "notes": "Consider extending ConsoleLogger with an in-memory collector rather than duplicating its logging logic."
  },
  {
    "testCaseId": "TC-03",
    "reqId": "RQ-03",
    "module": "Security/Transport",
    "classification": "Net New",
    "confidenceScore": 0.0,
    "matchedAssets": [],
    "gap": null,
    "recommendedNewAssets": [
      { "type": "method", "target": "HomePage", "signature": "async verifySecureConnection(): Promise<void>" },
      { "type": "method", "target": "HomePage", "signature": "async verifyNoMixedContentWarnings(): Promise<void>" }
    ],
    "riskFlags": [],
    "notes": "Certificate-expiry verification has no direct Playwright Page API; scope to page.url() protocol + absence of certificate-error navigation + console-based mixed-content detection, per Test Plan Risk 17."
  },
  {
    "testCaseId": "TC-04",
    "reqId": "RQ-04",
    "module": "Accessibility",
    "classification": "Partial Reuse",
    "confidenceScore": 0.6,
    "matchedAssets": [
      { "type": "method", "file": "pages/HomePage.ts", "reference": "HomePage.verifyNavbarLinks():77-84" },
      { "type": "locator", "file": "locators/locatorConstants.ts", "reference": "home.homeNavLink, home.contactLink, home.aboutUsLink, home.cartLink, home.loginLink, home.signUpLink, home.brand:18-78" },
      { "type": "spec", "file": "tests/additional-test-cases.003.spec.ts", "reference": "TC-02:30-33 (presence-only, not keyboard/focus)" }
    ],
    "gap": "No keyboard Tab-traversal method and no focus-indicator (computed-style) assertion helper exist anywhere in the codebase.",
    "recommendedNewAssets": [
      { "type": "method", "target": "HomePage", "signature": "async tabThroughNavbar(): Promise<string[]>" },
      { "type": "method", "target": "HomePage", "signature": "async verifyFocusIndicatorVisible(elementDescriptor: string): Promise<void>" }
    ],
    "riskFlags": [],
    "notes": "Existing locators are reusable as-is for identifying each navbar link once focused; only the traversal/assertion logic is new."
  },
  {
    "testCaseId": "TC-05",
    "reqId": "RQ-05",
    "module": "Branding",
    "classification": "Net New",
    "confidenceScore": 0.0,
    "matchedAssets": [],
    "gap": null,
    "recommendedNewAssets": [
      { "type": "locator", "target": "locatorConstants.home", "signature": "faviconLink: LocatorStrategyList" },
      { "type": "method", "target": "HomePage", "signature": "async verifyFaviconLoaded(): Promise<void>" }
    ],
    "riskFlags": [],
    "notes": "In-tab visual rendering is outside Playwright's inspectable surface; automate the DOM/network proxy signal only, per Test Plan Mitigation 18."
  }
]
```

## 4. Recommended New Automation Assets

**`pages/BasePage.ts`** (candidate new primitive, needed only for TC-02):

```ts
protected async reload(): Promise<void>
```

**`pages/HomePage.ts`** (new methods):

```ts
async verifySecureConnection(): Promise<void>            // TC-03
async verifyNoMixedContentWarnings(): Promise<void>       // TC-03
async tabThroughNavbar(): Promise<string[]>                // TC-04
async verifyFocusIndicatorVisible(elementDescriptor: string): Promise<void>  // TC-04
async verifyFaviconLoaded(): Promise<void>                 // TC-05
```

Console-error capture for TC-02 needs a design decision (extend `ConsoleLogger` with an in-memory collector vs. a spec-local listener) — left to Stage 5/Implement, flagged here rather than prescribed.

**`locators/locatorConstants.ts`** (new entry, `home` group):

```ts
faviconLink: [
  { kind: 'css', selector: 'link[rel*="icon"]' },
] as const,
```

No new locators are required for TC-01, TC-02, TC-03, or TC-04 — all element references needed already exist.

## 5. Risk & Collision Flags

| Flag | Detail |
|---|---|
| **Exact spec-level duplication (TC-01)** | `tests/additional-test-cases.003.spec.ts:101-113` (TC-09) already automates this exact scenario. Implementing a new test for RQ-01 would be pure re-automation of already-covered, already-passing behavior — Stage 5 should not write a new test for TC-01. |
| **Pre-existing locator duplication (not this ticket's to fix)** | `home.nextButton` ([locators/locatorConstants.ts:52-56](../../locators/locatorConstants.ts)) and `home.productGridNextButton` ([:108-111](../../locators/locatorConstants.ts)) both resolve to `#next2`. This predates this ticket and both are Full Reuse assets — leave untouched; Stage 5 should use `productGridNextButton` (the one already proven by TC-09) if it needs to reference this element at all. |
| **Dormant console/network logging path** | `utils/consoleHelper.ts` and `utils/networkHelper.ts` are only wired into the unused `registerHooks` export in `fixtures/testFixture.ts` (per `CLAUDE.md`, dead code — the suite actually uses `tests/hooks.ts`'s `registerHooks`). Any new console-capture code for TC-02 must not assume this wiring is active. |

## 6. Traceability Cross-Check

| Req ID | Test Case ID | Reuse Classification Assigned? |
|---|---|---|
| RQ-01 | TC-01 | Yes |
| RQ-02 | TC-02 | Yes |
| RQ-03 | TC-03 | Yes |
| RQ-04 | TC-04 | Yes |
| RQ-05 | TC-05 | Yes |

All five normalized test cases received exactly one classification. No gaps.
