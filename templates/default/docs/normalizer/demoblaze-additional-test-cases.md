# Normalized Test Cases — Demoblaze Additional Test Cases

> Pipeline stage: 3 — Test Case Normalizer | Ticket: **demoblaze-additional-test-cases** | Req ID: **TBD** (all 25 cases — manual entry, no upstream RTM)
> Source: manually authored `demoblaze_test_cases.md` (25 cases, entered directly — Stages 1–2 skipped per the [Alternate Entry Point](../agents/README.md#alternate-entry-point-manual-test-cases))
> ⏸ HITL Gate A′: `{ticketNo}` = `demoblaze-additional-test-cases` confirmed by requester; `Req ID` confirmed **TBD** for all 25 cases (no Req ID was supplied in the source document).
> Generated: 2026-07-15

---

## Change Log

**2026-07-15 (post-implementation, user-requested):** TC-07–TC-10 originally normalized the source document's footer social-icon cases (`TC_FOOTER_007`–`TC_FOOTER_010`). Stage 5 verified against the live DOM that Demoblaze's footer contains no such icons (see `docs/implementation/demoblaze-additional-test-cases.md`), so those 4 were implemented as Blocked/skipped. The requester then asked to replace the 4 skipped tests with 4 different, working scenarios on the real site, reusing the same `TC-07`–`TC-10` slots. The original footer-icon content and `Source ID`s are preserved below for audit purposes (§3a); the replacement content that now actually drives the implementation is in §3b.

---

## 2. Normalization Summary

| Metric | Count |
|---|---|
| Cases in (source document) | 25 |
| Cases out (normalized) | 25 |
| Duplicates merged | 0 |
| Schema violations found | 0 (source document was well-formed; no fields were malformed) |
| TBDs remaining | `reqId` = TBD ×25; `testData` = TBD on 6 cases (TC-11 through TC-14, no concrete data values supplied); `automationMapping` = TBD on all 25 (Stage 4 responsibility) |

No source case was rejected or merged — each of the 25 source IDs maps 1:1 to one normalized case. `Source ID` (the original `TC_<MODULE>_0NN` identifier from the manual document) is preserved as a traceability field since no `Req ID` exists to anchor the chain.

---

## 3. Normalized Test Case Table

### Module: Home Page UI

| Test Case ID | Source ID | Req ID | Title | Type | Priority | Automation Candidate |
|---|---|---|---|---|---|---|
| TC-01 | TC_HOME_001 | TBD | Home page loads successfully | Positive | P1 | Yes |
| TC-02 | TC_HOME_002 | TBD | Navbar displays all expected menu items | UI | P2 | Yes |
| TC-03 | TC_HOME_003 | TBD | Brand logo navigates to home page | Positive | P2 | Yes |
| TC-04 | TC_HOME_004 | TBD | Carousel displays promotional banners | UI | P2 | Yes |
| TC-05 | TC_HOME_005 | TBD | Carousel auto-rotates | UI | P3 | Yes |
| TC-06 | TC_HOME_006 | TBD | Carousel manual navigation controls | Positive | P2 | Yes |

### Module: Footer / Social Links — §3a, superseded, kept for audit only (see Change Log)

| Test Case ID | Source ID | Req ID | Title | Type | Priority | Automation Candidate |
|---|---|---|---|---|---|---|
| ~~TC-07~~ | TC_FOOTER_007 | TBD | ~~Footer displays social media icons~~ | UI | P3 | No — feature absent from AUT |
| ~~TC-08~~ | TC_FOOTER_008 | TBD | ~~Facebook icon opens correct link~~ | Positive | P3 | No — feature absent from AUT |
| ~~TC-09~~ | TC_FOOTER_009 | TBD | ~~Twitter icon opens correct link~~ | Positive | P3 | No — feature absent from AUT |
| ~~TC-10~~ | TC_FOOTER_010 | TBD | ~~YouTube icon opens correct link~~ | Positive | P3 | No — feature absent from AUT |

### Module: Account & Cart Coverage — §3b, replaces §3a in the `TC-07`–`TC-10` slots (see Change Log)

| Test Case ID | Source ID | Req ID | Title | Type | Priority | Automation Candidate |
|---|---|---|---|---|---|---|
| TC-07 | REPLACEMENT (user-requested 2026-07-15) | TBD | Sign up with an already-registered username is rejected | Negative | P2 | Yes |
| TC-08 | REPLACEMENT (user-requested 2026-07-15) | TBD | Log in with invalid credentials shows an error | Negative | P2 | Yes |
| TC-09 | REPLACEMENT (user-requested 2026-07-15) | TBD | Product grid pagination — Next button loads additional products | Positive | P2 | Yes |
| TC-10 | REPLACEMENT (user-requested 2026-07-15) | TBD | Removing an item from the cart updates the cart table | Positive | P2 | Yes |

### Module: Contact Us

| Test Case ID | Source ID | Req ID | Title | Type | Priority | Automation Candidate |
|---|---|---|---|---|---|---|
| TC-11 | TC_CONTACT_011 | TBD | Contact modal opens | Positive | P2 | Yes |
| TC-12 | TC_CONTACT_012 | TBD | Contact modal field presence | UI | P2 | Yes |
| TC-13 | TC_CONTACT_013 | TBD | Submit Contact form with valid data | Positive | P1 | Yes |
| TC-14 | TC_CONTACT_014 | TBD | Submit Contact form with empty fields | Negative | P2 | Yes |
| TC-15 | TC_CONTACT_015 | TBD | Close Contact modal | Positive | P3 | Yes |

### Module: About Us

| Test Case ID | Source ID | Req ID | Title | Type | Priority | Automation Candidate |
|---|---|---|---|---|---|---|
| TC-16 | TC_ABOUT_016 | TBD | About Us modal opens | Positive | P2 | Yes |
| TC-17 | TC_ABOUT_017 | TBD | About Us modal displays video | UI | P3 | Yes |
| TC-18 | TC_ABOUT_018 | TBD | Close About Us modal | Positive | P3 | Yes |

### Module: Product Detail Page

| Test Case ID | Source ID | Req ID | Title | Type | Priority | Automation Candidate |
|---|---|---|---|---|---|---|
| TC-19 | TC_PRODUCT_019 | TBD | Navigate to product detail page | Positive | P1 | Yes |
| TC-20 | TC_PRODUCT_020 | TBD | Product detail page content | Positive | P1 | Yes |
| TC-21 | TC_PRODUCT_021 | TBD | Product detail image loads | UI | P2 | Yes |
| TC-22 | TC_PRODUCT_022 | TBD | Back navigation from product detail page | Positive | P2 | Yes |

### Module: Navigation / Error Handling

| Test Case ID | Source ID | Req ID | Title | Type | Priority | Automation Candidate |
|---|---|---|---|---|---|---|
| TC-23 | TC_NAV_023 | TBD | Invalid product ID handled gracefully | Negative | P1 | Yes |

### Module: Responsive Layout

| Test Case ID | Source ID | Req ID | Title | Type | Priority | Automation Candidate |
|---|---|---|---|---|---|---|
| TC-24 | TC_RESPONSIVE_024 | TBD | Home page layout on mobile viewport | Compatibility | P2 | Yes |
| TC-25 | TC_IMG_025 | TBD | All home page product images load correctly | UI | P2 | Yes |

---

## 4. Structured Export

```json
[
  {
    "testCaseId": "TC-01",
    "sourceId": "TC_HOME_001",
    "reqId": "TBD",
    "title": "Home page loads successfully",
    "module": "Home Page UI",
    "type": "Positive",
    "priority": "P1",
    "preconditions": ["Browser open"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Navigate to https://www.demoblaze.com", "expectedResult": "Page loads with title \"STORE\" and product grid is visible" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@smoke", "@home"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-02",
    "sourceId": "TC_HOME_002",
    "reqId": "TBD",
    "title": "Navbar displays all expected menu items",
    "module": "Home Page UI",
    "type": "UI",
    "priority": "P2",
    "preconditions": ["Home page loaded"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Inspect the top navigation bar", "expectedResult": "Home, Contact, About us, Cart, Log in, and Sign up links are all visible" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@home"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-03",
    "sourceId": "TC_HOME_003",
    "reqId": "TBD",
    "title": "Brand logo navigates to home page",
    "module": "Home Page UI",
    "type": "Positive",
    "priority": "P2",
    "preconditions": ["User is on a product detail page"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "From a product detail page, click the \"PRODUCT STORE\" brand link", "expectedResult": "User is returned to the home page" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@home"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-04",
    "sourceId": "TC_HOME_004",
    "reqId": "TBD",
    "title": "Carousel displays promotional banners",
    "module": "Home Page UI",
    "type": "UI",
    "priority": "P2",
    "preconditions": ["Home page loaded"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Observe the carousel on page load", "expectedResult": "At least one promotional slide/banner is visible with image and caption text" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@home"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-05",
    "sourceId": "TC_HOME_005",
    "reqId": "TBD",
    "title": "Carousel auto-rotates",
    "module": "Home Page UI",
    "type": "UI",
    "priority": "P3",
    "preconditions": ["Home page loaded"],
    "testData": ["Wait window: ~5–10 seconds"],
    "steps": [
      { "step": 1, "action": "Record the active carousel slide identifier/caption", "expectedResult": "An initial active slide is captured" },
      { "step": 2, "action": "Wait 5–10 seconds without interacting with the carousel", "expectedResult": "The carousel automatically transitions to the next slide (active slide identifier/caption changes)" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@home"],
    "notes": "Timing-dependent assertion — flakiness risk flagged for Stage 5/6 (avoid a hard sleep-then-assert without a bounded polling wait)."
  },
  {
    "testCaseId": "TC-06",
    "sourceId": "TC_HOME_006",
    "reqId": "TBD",
    "title": "Carousel manual navigation controls",
    "module": "Home Page UI",
    "type": "Positive",
    "priority": "P2",
    "preconditions": ["Home page loaded"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Click the right carousel arrow control", "expectedResult": "Carousel moves to the next slide" },
      { "step": 2, "action": "Click the left carousel arrow control", "expectedResult": "Carousel moves to the previous slide" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@home"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-07",
    "sourceId": "REPLACEMENT (user-requested 2026-07-15, was TC_FOOTER_007 — see Change Log)",
    "reqId": "TBD",
    "title": "Sign up with an already-registered username is rejected",
    "module": "Account & Cart Coverage",
    "type": "Negative",
    "priority": "P2",
    "preconditions": ["A username has already been registered once this session"],
    "testData": ["username: generated via utils/randomData.ts generateUsername()", "password: CONSTANTS.basePassword"],
    "steps": [
      { "step": 1, "action": "Sign up successfully with a freshly generated username", "expectedResult": "\"Sign up successful.\" alert shown" },
      { "step": 2, "action": "Attempt to sign up again with the same username", "expectedResult": "\"This user already exist.\" alert shown, verified live against demoblaze.com 2026-07-15" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "SignUpPage.register() — Full Reuse, called twice",
    "tags": ["@regression", "@account"],
    "notes": "Replaces the original footer-icon TC-07, which targeted a feature absent from the live AUT (see Change Log)."
  },
  {
    "testCaseId": "TC-08",
    "sourceId": "REPLACEMENT (user-requested 2026-07-15, was TC_FOOTER_008 — see Change Log)",
    "reqId": "TBD",
    "title": "Log in with invalid credentials shows an error",
    "module": "Account & Cart Coverage",
    "type": "Negative",
    "priority": "P2",
    "preconditions": ["Home page loaded"],
    "testData": ["username: generated, guaranteed non-existent", "password: arbitrary wrong value"],
    "steps": [
      { "step": 1, "action": "Open the Log in modal and submit a non-existent username/password", "expectedResult": "\"User does not exist.\" alert shown, verified live against demoblaze.com 2026-07-15" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "LoginPage.loginExpectingError() — Net New",
    "tags": ["@regression", "@account"],
    "notes": "Replaces the original footer-icon TC-08 (see Change Log)."
  },
  {
    "testCaseId": "TC-09",
    "sourceId": "REPLACEMENT (user-requested 2026-07-15, was TC_FOOTER_009 — see Change Log)",
    "reqId": "TBD",
    "title": "Product grid pagination — Next button loads additional products",
    "module": "Account & Cart Coverage",
    "type": "Positive",
    "priority": "P2",
    "preconditions": ["Home page loaded, first page of products displayed"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Capture the displayed product names, then click the grid's \"Next\" pagination control (#next2)", "expectedResult": "A different, non-empty set of product names is displayed" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "HomePage.goToNextProductPage() — Net New (dedicated locator; the pre-existing home.nextButton role-based strategy was found to collide with the carousel's own \"Next\" control)",
    "tags": ["@regression", "@home"],
    "notes": "Replaces the original footer-icon TC-09 (see Change Log)."
  },
  {
    "testCaseId": "TC-10",
    "sourceId": "REPLACEMENT (user-requested 2026-07-15, was TC_FOOTER_010 — see Change Log)",
    "reqId": "TBD",
    "title": "Removing an item from the cart updates the cart table",
    "module": "Account & Cart Coverage",
    "type": "Positive",
    "priority": "P2",
    "preconditions": ["A product has been added to the cart"],
    "testData": ["productName: 'Samsung galaxy s6', price: '360' (existing CONSTANTS.defaultProductNames value)"],
    "steps": [
      { "step": 1, "action": "Add a product to the cart and open the cart page", "expectedResult": "The product row is present" },
      { "step": 2, "action": "Click \"Delete\" on that row", "expectedResult": "The row is removed from the cart table" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "CartPage.deleteItem() / verifyItemNotInCart() — Net New",
    "tags": ["@regression", "@cart"],
    "notes": "Replaces the original footer-icon TC-10 (see Change Log)."
  },
  {
    "testCaseId": "TC-11",
    "sourceId": "TC_CONTACT_011",
    "reqId": "TBD",
    "title": "Contact modal opens",
    "module": "Contact Us",
    "type": "Positive",
    "priority": "P2",
    "preconditions": ["Home page loaded"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Click \"Contact\" in the navbar", "expectedResult": "A modal titled \"New message\" opens with Name, Email, and Message fields" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@contact"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-12",
    "sourceId": "TC_CONTACT_012",
    "reqId": "TBD",
    "title": "Contact modal field presence",
    "module": "Contact Us",
    "type": "UI",
    "priority": "P2",
    "preconditions": ["Contact modal is open"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Inspect the open Contact modal", "expectedResult": "Name, Email, and Message input fields are all present and editable" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@contact"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-13",
    "sourceId": "TC_CONTACT_013",
    "reqId": "TBD",
    "title": "Submit Contact form with valid data",
    "module": "Contact Us",
    "type": "Positive",
    "priority": "P1",
    "preconditions": ["Contact modal is open"],
    "testData": "TBD — source document does not supply concrete Name/Email/Message values; project convention (utils/randomData.ts + @faker-js/faker) generates these at implementation time",
    "steps": [
      { "step": 1, "action": "Fill the Name field", "expectedResult": "Field accepts input" },
      { "step": 2, "action": "Fill the Email field", "expectedResult": "Field accepts input" },
      { "step": 3, "action": "Fill the Message field", "expectedResult": "Field accepts input" },
      { "step": 4, "action": "Click \"Send message\"", "expectedResult": "A confirmation alert \"Thanks for the message!!\" is displayed" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@smoke", "@contact"],
    "notes": "Demoblaze's Contact form dispatches a native JS `alert()` — implementation must handle it via a dialog listener (see BasePage.acceptDialog, already used by ProductPage.addToCart)."
  },
  {
    "testCaseId": "TC-14",
    "sourceId": "TC_CONTACT_014",
    "reqId": "TBD",
    "title": "Submit Contact form with empty fields",
    "module": "Contact Us",
    "type": "Negative",
    "priority": "P2",
    "preconditions": ["Contact modal is open, all fields blank"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Leave Name, Email, and Message fields blank", "expectedResult": "Fields remain empty" },
      { "step": 2, "action": "Click \"Send message\"", "expectedResult": "Form submits without client-side validation errors (documents actual site behavior for regression tracking)" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@contact"],
    "notes": "Source case intentionally documents the AUT's actual (permissive) behavior rather than an ideal one — preserved as-is per the anti-fabrication rule; do not \"fix\" the expected result to what validation should do."
  },
  {
    "testCaseId": "TC-15",
    "sourceId": "TC_CONTACT_015",
    "reqId": "TBD",
    "title": "Close Contact modal",
    "module": "Contact Us",
    "type": "Positive",
    "priority": "P3",
    "preconditions": ["Contact modal is open"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Click \"Close\"", "expectedResult": "Modal closes and home page is fully interactive again" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@contact"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-16",
    "sourceId": "TC_ABOUT_016",
    "reqId": "TBD",
    "title": "About Us modal opens",
    "module": "About Us",
    "type": "Positive",
    "priority": "P2",
    "preconditions": ["Home page loaded"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Click \"About us\" in the navbar", "expectedResult": "A modal titled \"About us\" opens" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@about"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-17",
    "sourceId": "TC_ABOUT_017",
    "reqId": "TBD",
    "title": "About Us modal displays video",
    "module": "About Us",
    "type": "UI",
    "priority": "P3",
    "preconditions": ["About Us modal is open"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Inspect the open About Us modal", "expectedResult": "An embedded video player is present and controllable (play/pause)" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@about"],
    "notes": "\"Controllable (play/pause)\" is asserted at the level of the control being present/clickable; the source document does not specify a deeper media-playback assertion (e.g. currentTime advancing), so none is fabricated."
  },
  {
    "testCaseId": "TC-18",
    "sourceId": "TC_ABOUT_018",
    "reqId": "TBD",
    "title": "Close About Us modal",
    "module": "About Us",
    "type": "Positive",
    "priority": "P3",
    "preconditions": ["About Us modal is open"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Click \"Close\"", "expectedResult": "Modal closes and home page is fully interactive again" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@about"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-19",
    "sourceId": "TC_PRODUCT_019",
    "reqId": "TBD",
    "title": "Navigate to product detail page",
    "module": "Product Detail Page",
    "type": "Positive",
    "priority": "P1",
    "preconditions": ["Home page loaded"],
    "testData": ["Product name: one of the home page grid products (e.g. \"Samsung galaxy s6\")"],
    "steps": [
      { "step": 1, "action": "Click a product name/image from the home page grid", "expectedResult": "User is navigated to that product's detail page; URL contains the product id (matches /prod\\.html\\?idp_=/)" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@smoke", "@product"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-20",
    "sourceId": "TC_PRODUCT_020",
    "reqId": "TBD",
    "title": "Product detail page content",
    "module": "Product Detail Page",
    "type": "Positive",
    "priority": "P1",
    "preconditions": ["A product detail page is open"],
    "testData": ["Product name: same product opened from the home page grid"],
    "steps": [
      { "step": 1, "action": "Open any product detail page", "expectedResult": "Product name, price, and description are all displayed correctly and match the home page listing" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@smoke", "@product"],
    "notes": "\"Match the home page listing\" implies cross-page comparison (grid name/price vs. detail page name/price) — preserved from source; Stage 5 must implement the comparison, not just presence, or flag the gap."
  },
  {
    "testCaseId": "TC-21",
    "sourceId": "TC_PRODUCT_021",
    "reqId": "TBD",
    "title": "Product detail image loads",
    "module": "Product Detail Page",
    "type": "UI",
    "priority": "P2",
    "preconditions": ["A product detail page is open"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Open any product detail page", "expectedResult": "Product image renders without a broken-image icon (naturalWidth > 0)" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@product"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-22",
    "sourceId": "TC_PRODUCT_022",
    "reqId": "TBD",
    "title": "Back navigation from product detail page",
    "module": "Product Detail Page",
    "type": "Positive",
    "priority": "P2",
    "preconditions": ["A product detail page is open"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Click the browser Back button", "expectedResult": "User returns to the home page in a valid, usable state" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@product"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-23",
    "sourceId": "TC_NAV_023",
    "reqId": "TBD",
    "title": "Invalid product ID handled gracefully",
    "module": "Navigation / Error Handling",
    "type": "Negative",
    "priority": "P1",
    "preconditions": ["Browser open"],
    "testData": ["URL: prod.html?idp_=99999 (non-existent product id)"],
    "steps": [
      { "step": 1, "action": "Navigate directly to a product detail URL with a non-existent id (e.g. prod.html?idp_=99999)", "expectedResult": "Page does not crash or throw unhandled JS errors; displays empty/blank state gracefully" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@smoke", "@nav"],
    "notes": "Automation must monitor `pageerror`/uncaught-exception events (the project already has `utils/consoleHelper.ts` / `ConsoleLogger.handlePageError`) rather than only asserting DOM state."
  },
  {
    "testCaseId": "TC-24",
    "sourceId": "TC_RESPONSIVE_024",
    "reqId": "TBD",
    "title": "Home page layout on mobile viewport",
    "module": "Responsive Layout",
    "type": "Compatibility",
    "priority": "P2",
    "preconditions": ["Browser open"],
    "testData": ["Viewport width: 375px (source-specified example mobile width)"],
    "steps": [
      { "step": 1, "action": "Resize/emulate viewport to mobile width (375px)", "expectedResult": "Layout reflows correctly — navbar, carousel, and product grid remain usable" },
      { "step": 2, "action": "Inspect page horizontal scroll extent", "expectedResult": "No horizontal overflow (document scrollWidth does not exceed viewport width)" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@responsive"],
    "notes": "TBD"
  },
  {
    "testCaseId": "TC-25",
    "sourceId": "TC_IMG_025",
    "reqId": "TBD",
    "title": "All home page product images load correctly",
    "module": "Product Images",
    "type": "UI",
    "priority": "P2",
    "preconditions": ["Home page loaded"],
    "testData": [],
    "steps": [
      { "step": 1, "action": "Load home page", "expectedResult": "Product grid renders" },
      { "step": 2, "action": "Inspect every product thumbnail in the grid", "expectedResult": "No broken or missing image icons appear for any listed product (every thumbnail's naturalWidth > 0)" }
    ],
    "postconditions": "TBD",
    "automationCandidate": true,
    "automationMapping": "TBD",
    "tags": ["@regression", "@home"],
    "notes": "Distinct from TC-21 (single product detail image) — this case covers all grid thumbnails on the home page."
  }
]
```

---

## 5. Traceability Integrity Report

- No Stage 1 Test Plan or Stage 2 detailed test case document exists for this ticket — entry is via the **Alternate Entry Point (manual path)**, so there is no upstream RTM to check `Req ID`/`Test Case ID` assignment against.
- `Req ID` is **TBD** for all 25 cases, confirmed at **⏸ HITL Gate A′** by the requester (no `Req ID` was supplied or claimed in the source document).
- `Test Case ID` (`TC-01`–`TC-25`) is newly assigned by this stage in source-document order; `Source ID` (the original `TC_<MODULE>_0NN` label) is preserved on every case as the traceability anchor back to the manual source document, since no `Req ID` chain exists to anchor to instead.
- No breaks: every one of the 25 source cases has exactly one corresponding normalized case; none were merged or dropped.

---

## 6. Rejected / Open Items Log

| Item | Reason | Disposition |
|---|---|---|
| None | All 25 source cases were well-formed (Precondition/Steps/Expected present) and normalized without rejection. | — |

**Open TBDs carried forward to Stage 4 / Stage 5:**

| Field | Cases | What's needed |
|---|---|---|
| `reqId` | TC-01–TC-25 | Human-supplied Req ID mapping, if/when this ticket is linked to a formal requirement — not required to proceed automation-wise, per Gate A′. |
| `testData` (Name/Email/Message values) | TC-13, TC-14 | Stage 5 must use the project's existing `utils/randomData.ts` / `@faker-js/faker` generation convention rather than inventing literal values. |
| `automationMapping` | TC-01–TC-25 | Populated by Stage 4 (Reuse Matcher), next in the pipeline. |
