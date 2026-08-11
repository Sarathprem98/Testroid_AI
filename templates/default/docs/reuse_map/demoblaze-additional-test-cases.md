# Reuse Mapping Report — Demoblaze Additional Test Cases

> Pipeline stage: 4 — Reuse Matcher (read-only) | Ticket: **demoblaze-additional-test-cases** | Req ID: TBD (all cases)
> Source: [`docs/normalizer/demoblaze-additional-test-cases.md`](../normalizer/demoblaze-additional-test-cases.md) (Stage 3 output, 2026-07-15)
> Codebase inspected: `pages/*.ts` (`BasePage`, `HomePage`, `ProductPage`, `SignUpPage`, `LoginPage`, `CartPage`, `CheckoutPage`), `locators/locatorConstants.ts`, `tests/*.spec.ts`, `tests/hooks.ts`, `fixtures/testFixture.ts`, `utils/*.ts` — as of 2026-07-15. No files were modified.
> Generated: 2026-07-15

---

## Change Log

**2026-07-15:** TC-07–TC-10 were re-scoped from footer social-icon cases (blocked — feature absent from the AUT) to Account & Cart Coverage cases, per user request after the original Blocked verdicts were reported. Reclassified below against the current codebase; the original footer-related reuse findings are superseded, not merged with the new ones.

---

## 2. Reuse Summary

| Classification | Count |
|---|---|
| Full Reuse | 2 (TC-19, TC-07) |
| Partial Reuse | 3 (TC-01, TC-03, TC-20) |
| Net New | 20 (TC-02, TC-04–TC-06, TC-08–TC-18, TC-21–TC-25) |
| Unverifiable | 0 |
| **Total** | **25** |

(TC-07–TC-10 reflect the 2026-07-15 replacement scope — see Change Log.)

The existing codebase has solid coverage for product-grid navigation (`HomePage.openProduct`, `ProductPage.verifyProductDetails`) but **zero** existing coverage for: the carousel, the footer/social icons, the Contact modal, the About Us modal, product-image integrity, browser back-navigation, invalid-product-id error handling, and responsive/mobile-viewport layout. Those gaps drive the high Net New count.

---

## 3. Reuse Mapping Table

### Module: Home Page UI

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence | Notes |
|---|---|---|---|---|---|
| TC-01 | TBD | Partial Reuse | `pages/HomePage.ts:11-19` (`open()` + `verifyHomePage()` — asserts title `/STORE/` and `homeLocators.brand` visible); locator `locatorConstants.home.productGridItems` (`locators/locatorConstants.ts:64-66`); `BasePage.expectVisible()` (`pages/BasePage.ts:223-227`) | High | `verifyHomePage()` covers title + brand but never asserts the product grid is visible — the gap is one `expectVisible(homeLocators.productGridItems)` call, using a locator and assertion helper that both already exist. |
| TC-02 | TBD | Net New | Sub-assets only: `locatorConstants.home.signUpLink`/`loginLink`/`cartLink` (`locators/locatorConstants.ts:22-41`) already exist and cover 3 of 6 required navbar items | Medium (sub-assets); none for Home/Contact/About us links | No locator exists for the "Home", "Contact", or "About us" navbar links — new `LocatorStrategyList` entries required for each. |
| TC-03 | TBD | Partial Reuse | `locatorConstants.home.brand` (`locators/locatorConstants.ts:18-21`); `BasePage.click()` (`pages/BasePage.ts:86-97`); `BasePage.assertCurrentUrl()` (`pages/BasePage.ts:286-288`) | High | Locator and both primitives already exist and fully satisfy the behavior — only a one-line `HomePage` method wiring them together (e.g. `clickBrand()`) is missing. |
| TC-04 | TBD | Net New | None | — | No carousel locator exists anywhere in `locatorConstants.ts`. |
| TC-05 | TBD | Net New | None | — | Same carousel-locator gap as TC-04; also needs new polling/comparison logic (no existing "wait for attribute change" helper in `BasePage.ts`). |
| TC-06 | TBD | Net New | None | — | No carousel arrow-control locators exist. |

### Module: Account & Cart Coverage (replaces Footer / Social Links, see Change Log)

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence | Notes |
|---|---|---|---|---|---|
| TC-07 | TBD | **Full Reuse** | `pages/SignUpPage.ts:9-16` — `register(username, password)` already returns the dialog message via `acceptDialog`; calling it twice with the same username exercises both the success and duplicate-rejection paths with zero new code | High | Verified live: second call's dialog resolves to `"This user already exist."` |
| TC-08 | TBD | Net New | Sub-asset: `BasePage.acceptDialog()` (`pages/BasePage.ts:269-280`), `login.usernameInput`/`passwordInput`/`submitButton` locators (all exist) | High (sub-assets); none for the error path itself | The existing `LoginPage.login()` does not capture/return the failure dialog message — a new method wrapping the same fill+click in `acceptDialog` is required. |
| TC-09 | TBD | Net New | Sub-asset: `HomePage.getDisplayedProductNames()` (`pages/HomePage.ts`, Full Reuse) | Medium | The pre-existing `home.nextButton` locator (`#next2`) cannot be reused as-is for this case: its role-based strategy (`getByRole('button',{name:'Next'})`) was found live to match **two** elements (the pagination button and the carousel's own "Next" arrow) and resolves to the carousel first in DOM order. A dedicated, unambiguously-scoped locator is required rather than reusing `home.nextButton` directly. |
| TC-10 | TBD | Net New | Sub-assets: `cart.rows` locator, `CartPage.verifyProductSummary()` (both exist, reused for the pre-delete assertion) | High (sub-assets); none for delete itself | No delete/remove method or locator exists anywhere in `CartPage.ts` or `locatorConstants.ts` today, despite the live cart row markup already containing a `Delete` link (`<a onclick="deleteItem(...)">Delete</a>`). |

### Module: Contact Us

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence | Notes |
|---|---|---|---|---|---|
| TC-11 | TBD | Net New | Pattern precedent only: `pages/SignUpPage.ts`/`pages/LoginPage.ts` (modal open/close pattern) and `locatorConstants.signUp`/`login` groups show the established shape to follow | Medium (pattern), none (asset) | No `Contact` navbar-link locator, no Contact-modal locators exist. `SignUpPage`/`LoginPage` are the closest structural precedent for a new `ContactPage`. |
| TC-12 | TBD | Net New | Same pattern precedent as TC-11 | Medium (pattern) | Field-presence check has the same shape as verifying `signUp.usernameInput`/`passwordInput` visibility, but no Name/Email/Message locators exist for the Contact modal. |
| TC-13 | TBD | Net New | `BasePage.acceptDialog()` (`pages/BasePage.ts:269-280`) — already used by `ProductPage.addToCart()` (`pages/ProductPage.ts:15-19`) and `SignUpPage.register()` (`pages/SignUpPage.ts:9-16`) for native `alert()` handling | High (for the dialog sub-asset only) | The alert-handling primitive is fully reusable as-is; the Contact-modal fill/submit locators are Net New. |
| TC-14 | TBD | Net New | Same fill/submit locators as TC-13 (once built) | — | Depends on the same new Contact-modal locators; no new logic beyond what TC-13 establishes. |
| TC-15 | TBD | Net New | Pattern precedent: `SignUpPage.close()` / `LoginPage.close()` (`pages/SignUpPage.ts:18-21`, `pages/LoginPage.ts:15-18`) — identical `click(closeButton, {force:true})` + `waitForElement(closeButton,'hidden')` shape | High (pattern), none (asset — no `contact.closeButton` locator exists) | Structurally identical to two existing methods; only the locator key is new. |

### Module: About Us

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence | Notes |
|---|---|---|---|---|---|
| TC-16 | TBD | Net New | Same pattern precedent as TC-11 (`SignUpPage`/`LoginPage` modal-open shape) | Medium (pattern) | No `About us` navbar-link locator, no About-modal locator exist. |
| TC-17 | TBD | Net New | None | — | No video-element locator or play/pause-control assertion exists anywhere in the codebase. |
| TC-18 | TBD | Net New | Same close-button pattern as TC-15 | High (pattern), none (asset) | Same structural precedent as TC-15; new locator key required. |

### Module: Product Detail Page

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence | Notes |
|---|---|---|---|---|---|
| TC-19 | TBD | **Full Reuse** | `pages/HomePage.ts:36-39` — `openProduct(productName)`: clicks `homeLocators.productCard(productName)` then `assertCurrentUrl(/prod\.html\?idp_=/)` | High | Exactly satisfies the case's action and expected result with zero new code — cite directly, no extension needed. |
| TC-20 | TBD | Partial Reuse | `pages/ProductPage.ts:9-13` — `verifyProductDetails(productName)` asserts `productLocators.title`/`price`/`description` are visible | Medium | Covers "name, price, description are displayed" but not "match the home page listing" — the cross-page value comparison against the grid is not implemented anywhere. Gap: capture the grid's displayed name/price before navigating, then compare against the detail page's rendered values. |
| TC-21 | TBD | Net New | None | — | `locatorConstants.product` has no image-element key (`title`/`price`/`addToCartButton`/`description` only); no `naturalWidth`-style broken-image check exists in `BasePage.ts`. |
| TC-22 | TBD | Net New | Sub-asset: `HomePage.verifyHomePage()` (`pages/HomePage.ts:16-19`) is reusable as the "landed back on a valid home state" assertion | Medium (sub-asset); none for the back-navigation action itself | No existing method calls `page.goBack()` anywhere in the codebase. |

### Module: Navigation / Error Handling

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence | Notes |
|---|---|---|---|---|---|
| TC-23 | TBD | Net New | Sub-asset: `utils/consoleHelper.ts` (`ConsoleLogger.handlePageError`) already listens for `pageerror` events, but only inside `fixtures/testFixture.ts:77`'s `registerHooks` — **not** the `tests/hooks.ts` `registerHooks` that existing specs actually import (see Risk Flag below) | Medium (sub-asset, with a caveat) | Direct URL navigation to an invalid `idp_=` value and an explicit uncaught-exception assertion are not implemented in any existing spec. |

### Module: Responsive Layout

| Test Case ID | Req ID | Classification | Matched Asset(s) | Confidence | Notes |
|---|---|---|---|---|---|
| TC-24 | TBD | Net New | None | — | `tests/hooks.ts:16` hard-codes `page.setViewportSize({ width: 1440, height: 900 })` in `beforeEach` for every spec; no override mechanism or horizontal-overflow check exists today. |
| TC-25 | TBD | Net New | Partial sub-asset: `locatorConstants.home.productGridItems` (`locators/locatorConstants.ts:64-66`) selects the grid's `<a class="hrefch">` anchors, not `<img>` elements | Low (sub-asset only covers the anchor, not the image) | A new locator scoped to the thumbnail `<img>` elements inside the grid, plus a `naturalWidth`-style check (same primitive gap as TC-21), is required. |

---

## 4. Recommended New Automation Assets

Signatures/stubs only — no full implementation, per this stage's scope.

**`locators/locatorConstants.ts`** — add under `home`:

```ts
homeNavLink: [
  { kind: 'role', role: 'link', name: 'Home' },
  { kind: 'text', text: 'Home' },
] as const,
contactLink: [
  { kind: 'role', role: 'link', name: 'Contact' },
  { kind: 'text', text: 'Contact' },
] as const,
aboutUsLink: [
  { kind: 'role', role: 'link', name: 'About us' },
  { kind: 'text', text: 'About us' },
] as const,
carouselSlideActive: [
  { kind: 'css', selector: /* TBD — active carousel slide selector, not yet verified against live DOM by this stage */ '' },
] as const,
carouselNextControl: [
  { kind: 'role', role: 'button', name: /next/i },
  { kind: 'css', selector: /* TBD — verify against live DOM */ '' },
] as const,
carouselPrevControl: [
  { kind: 'role', role: 'button', name: /previous|prev/i },
  { kind: 'css', selector: /* TBD — verify against live DOM */ '' },
] as const,
productGridImages: [
  { kind: 'css', selector: '#tbodyid a.hrefch img' },
] as const,
// TC-09 replacement: dedicated pagination locator, css-led — the
// pre-existing home.nextButton's role strategy collides with the
// carousel's own "Next" control (see Module table above)
productGridNextButton: [
  { kind: 'css', selector: '#next2' },
  { kind: 'role', role: 'button', name: 'Next' },
] as const,
```

> **Superseded (2026-07-15):** the `footerFacebookIcon`/`footerTwitterIcon`/`footerYoutubeIcon` stubs originally recommended here are removed — Stage 5 verified the live footer contains no such elements. See Change Log.

add under `cart`:

```ts
// TC-10 replacement: scoped to the row containing the given product name
deleteButtonFor: (productName: string): LocatorStrategyList => [
  { kind: 'css', selector: `#tbodyid tr:has-text("${productName}") a:has-text("Delete")` },
] as const,
```

add new top-level group `contact`:

```ts
contact: {
  navLink: [ /* see home.contactLink above, or reuse the same key */ ] as const,
  nameInput: [ { kind: 'label', text: 'Name' }, { kind: 'css', selector: '#recipient-name' } ] as const,
  emailInput: [ { kind: 'label', text: 'Email' }, { kind: 'css', selector: '#recipient-email' } ] as const,
  messageInput: [ { kind: 'label', text: 'Message' }, { kind: 'css', selector: '#message-text' } ] as const,
  sendButton: [ { kind: 'role', role: 'button', name: 'Send message' }, { kind: 'text', text: 'Send message' } ] as const,
  closeButton: [ { kind: 'role', role: 'button', name: 'Close' }, { kind: 'css', selector: '#exampleModal .btn-secondary' } ] as const,
} as const,
```

add new top-level group `about`:

```ts
about: {
  navLink: [ /* see home.aboutUsLink above, or reuse the same key */ ] as const,
  modalTitle: [ { kind: 'text', text: 'About us' } ] as const,
  video: [ { kind: 'css', selector: /* TBD — verify against live DOM */ '' } ] as const,
  closeButton: [ { kind: 'role', role: 'button', name: 'Close' }, { kind: 'css', selector: '#videoModal .btn-secondary' } ] as const,
} as const,
```

> Per this stage's guardrails, `css`/`xpath` selector values marked TBD are not fabricated — Stage 5 must verify them against the live DOM before implementing, following the existing role → text → css fallback pattern already used by `home.productCard`/`home.categoryLink`.

**`pages/HomePage.ts`** — new method signatures:

```ts
async clickBrand(): Promise<void>;                          // Partial Reuse (TC-03) — wires existing brand locator + click + assertCurrentUrl
async verifyProductGridVisible(): Promise<void>;             // Partial Reuse (TC-01) — delegates to existing expectVisible(productGridItems)
async verifyNavbarLinks(): Promise<void>;                    // Net New (TC-02)
async verifyCarouselVisible(): Promise<void>;                 // Net New (TC-04)
async getActiveCarouselSlideId(): Promise<string>;            // Net New (TC-05)
async clickCarouselNext(): Promise<void>;                     // Net New (TC-06)
async clickCarouselPrev(): Promise<void>;                     // Net New (TC-06)
async openContactModal(): Promise<void>;                      // Net New (TC-11)
async openAboutModal(): Promise<void>;                        // Net New (TC-16)
async verifyAllProductThumbnailsLoaded(): Promise<void>;      // Net New (TC-25)
async goToNextProductPage(): Promise<void>;                   // Net New (TC-09 replacement)
```

**`pages/ProductPage.ts`** — new method signature:

```ts
async verifyImageLoaded(): Promise<void>;                     // Net New (TC-21) — needs new `product.image` locator + naturalWidth check
async goBackToHome(): Promise<void>;                          // Net New (TC-22) — page.goBack(), reuses HomePage.verifyHomePage() as post-condition
```

**`pages/LoginPage.ts`** — new method signature:

```ts
async loginExpectingError(username: string, password: string): Promise<string>; // Net New (TC-08 replacement) — wraps existing fill/click in acceptDialog, mirrors SignUpPage.register()
```

**`pages/CartPage.ts`** — new method signatures:

```ts
async deleteItem(productName: string): Promise<void>;         // Net New (TC-10 replacement)
async verifyItemNotInCart(productName: string): Promise<void>; // Net New (TC-10 replacement) — delegates to existing expectHidden
```

**`pages/BasePage.ts`** — new protected method signature (needed by TC-21/TC-25, no existing broken-image check anywhere):

```ts
protected async expectImageLoaded(strategies: LocatorStrategyList): Promise<void>; // asserts element.naturalWidth > 0 via page.evaluate/locator.evaluate
```

**New Page Objects** (following the `SignUpPage.ts`/`LoginPage.ts` flat-file precedent, not the `pages/{module}/*.ts` convention — see Reuse note on TC-11):

```ts
// pages/ContactPage.ts
export class ContactPage extends BasePage {
  async verifyFieldsPresent(): Promise<void>;
  async submit(name: string, email: string, message: string): Promise<string>; // returns alert message via acceptDialog (Full Reuse)
  async close(): Promise<void>;
}

// pages/AboutPage.ts
export class AboutPage extends BasePage {
  async verifyVideoPresent(): Promise<void>;
  async close(): Promise<void>;
}
```

**`tests/additional-test-cases.003.spec.ts`** — Net New spec file (flat convention, matching `tests/purchase.001.spec.ts`/`tests/category-navigation.002.spec.ts`), covering all 25 cases grouped by module.

---

## 5. Risk & Collision Flags

| Flag | Detail |
|---|---|
| **Naming collision — `registerHooks` (carried over from the category-navigation ticket, still unresolved)** | `tests/hooks.ts:5` (viewport + failure-screenshot capture — what `purchase.001.spec.ts` and `category-navigation.002.spec.ts` actually import) and `fixtures/testFixture.ts:56` (a different implementation adding network/console-error/`pageerror` logging) share the same export name. TC-23 (invalid product ID / uncaught JS errors) is the case most affected: if Stage 5 imports `registerHooks` from `../fixtures/testFixture` to get the `pageerror` listener, the new spec's hook behavior will silently diverge from every other spec in `tests/`. Recommend importing from `./hooks` per established convention and wiring a dedicated `page.on('pageerror', ...)` listener locally inside the TC-23 test instead of switching the whole suite's hook source. |
| **No locator drift risk found** | All proposed new keys (`homeNavLink`, `contactLink`, `aboutUsLink`, `carouselSlideActive`, `carouselNextControl`, `carouselPrevControl`, `footerFacebookIcon`, `footerTwitterIcon`, `footerYoutubeIcon`, `productGridImages`, and the new `contact`/`about` groups) do not collide with any existing key in `locatorConstants.ts`. |
| **`home.nextButton` naming ambiguity** | An existing `home.nextButton` (`locators/locatorConstants.ts:52-56`) is the product-grid pagination "Next" button (`#next2`), unrelated to the carousel's next arrow needed for TC-06. Stage 5 must not reuse `home.nextButton` for the carousel — a distinct `carouselNextControl` key is required (already reflected above) to avoid a false Full Reuse claim. |
| **Popup/new-tab handling has no precedent** | TC-08/09/10 (social icons) and any modal-triggered new tab require `page.waitForEvent('popup')`; no existing Page Object or util wraps this pattern, so Stage 5 is introducing genuinely new capability, not just a new locator. |
| **Fixed viewport in shared hooks conflicts with TC-24** | `tests/hooks.ts:16` sets `page.setViewportSize({ width: 1440, height: 900 })` unconditionally in `beforeEach`. TC-24 needs a 375px-wide viewport. Stage 5 must use `test.use({ viewport: { width: 375, height: 812 } })` at the `describe`/file level for that case (Playwright applies `test.use` after the fixture-level `beforeEach` viewport set, so a per-test/per-describe override is required — verify ordering during implementation) rather than editing the shared hook. |
| **Live-DOM verification outstanding** | This stage did not fetch/inspect the live Demoblaze DOM to confirm exact `css` selectors for the carousel controls, footer social icons, Contact/About modal fields, or the About video element — all marked `TBD` in Section 4 and must be verified during Stage 5, not assumed. |

---

## 6. Traceability Cross-Check

| Normalized Test Case | Reuse Classification Assigned | Status |
|---|---|---|
| TC-01 | Partial Reuse | ✅ Classified |
| TC-02 | Net New | ✅ Classified |
| TC-03 | Partial Reuse | ✅ Classified |
| TC-04 | Net New | ✅ Classified |
| TC-05 | Net New | ✅ Classified |
| TC-06 | Net New | ✅ Classified |
| TC-07 | Full Reuse | ✅ Classified (replacement scope, 2026-07-15) |
| TC-08 | Net New | ✅ Classified (replacement scope, 2026-07-15) |
| TC-09 | Net New | ✅ Classified (replacement scope, 2026-07-15) |
| TC-10 | Net New | ✅ Classified (replacement scope, 2026-07-15) |
| TC-11 | Net New | ✅ Classified |
| TC-12 | Net New | ✅ Classified |
| TC-13 | Net New | ✅ Classified |
| TC-14 | Net New | ✅ Classified |
| TC-15 | Net New | ✅ Classified |
| TC-16 | Net New | ✅ Classified |
| TC-17 | Net New | ✅ Classified |
| TC-18 | Net New | ✅ Classified |
| TC-19 | Full Reuse | ✅ Classified |
| TC-20 | Partial Reuse | ✅ Classified |
| TC-21 | Net New | ✅ Classified |
| TC-22 | Net New | ✅ Classified |
| TC-23 | Net New | ✅ Classified |
| TC-24 | Net New | ✅ Classified |
| TC-25 | Net New | ✅ Classified |

All 25 normalized test cases received a classification. No gaps.
