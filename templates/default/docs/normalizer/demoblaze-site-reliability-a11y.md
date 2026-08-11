<!-- Generated-by: TestCaseNormalizerAgent · demoblaze-site-reliability-a11y · 2026-07-20 · AI-generated, human review required -->

# Normalized Test Cases — demoblaze-site-reliability-a11y

> Source: [`docs/test_cases/demoblaze-site-reliability-a11y.md`](../test_cases/demoblaze-site-reliability-a11y.md) (Stage 2, pipeline path — Test Case Generator Agent)
> Pipeline Stage: 3 (Test Case Normalizer) · Version: 1.0 · Date: 2026-07-20

## 1. Normalization Summary

| Metric | Value |
|---|---|
| Cases in | 5 |
| Cases out | 5 |
| Duplicates merged | 0 |
| Schema violations found | 0 |
| TBDs remaining | 6 (see Section 6) |

No changes to test intent, steps, or expected results were made — only field-format normalization (ID zero-padding already compliant, Type/Priority vocabulary already compliant, step voice already imperative and sequential).

## 2. Normalized Test Case Table

### Module: Pagination

| Field | TC-01 |
|---|---|
| Req ID | RQ-01 |
| Title | Pagination Next link loads more products |
| Type | Positive |
| Priority | P3 |
| Preconditions | On the Demoblaze home page, page fully loaded |
| Test Data | N/A — no test data required |
| Steps (1) | Navigate to the Demoblaze home page → Home page loads with the default product grid and pagination controls visible |
| Steps (2) | Capture the set of product names/titles currently displayed → Initial product name set captured as baseline |
| Steps (3) | Scroll to the bottom of the home page → Pagination controls ("«", page numbers, "»") are visible |
| Steps (4) | Click the "»" (Next) pagination link → Product grid updates without an unhandled navigation error |
| Steps (5) | Capture the set of product names/titles displayed after the click → Product name set differs from the baseline captured in step 2 |
| Postconditions | None |
| Automation Candidate | Yes — `HomePage.getDisplayedProductNames()` (new), `HomePage.clickNextPage()`/new `»` locator (new) |
| Tags | `@regression` |
| Notes | Assert set changed, not specific product names — shared public catalog |

### Module: Page Lifecycle

| Field | TC-02 |
|---|---|
| Req ID | RQ-02 |
| Title | Page reload behaves cleanly |
| Type | Positive |
| Priority | P2 |
| Preconditions | On the Demoblaze home page; console/page-error listener attached before reload |
| Test Data | N/A — no test data required |
| Steps (1) | Navigate to the home page and attach a console-message/page-error listener → Listener active, zero messages captured initially |
| Steps (2) | Confirm carousel and product grid are visible → Both visible before reload |
| Steps (3) | Refresh (reload) the browser → Reload completes without a hung/failed navigation |
| Steps (4) | Wait for a stable loaded state after reload → Page reaches stable loaded state |
| Steps (5) | Inspect captured console/page-error messages → No `error`-level console messages or unhandled page errors captured (TBD: exact severity threshold) |
| Steps (6) | Confirm carousel and product grid are visible post-reload → Both render matching pre-reload state |
| Postconditions | None |
| Automation Candidate | Yes — TBD: requires new `page.on('console'/'pageerror')` listener; `consoleHelper.ts` exists but is not wired into any active spec |
| Tags | `@regression` |
| Notes | Console-error severity threshold TBD; implement listener locally in this spec rather than relying on dormant suite-wide wiring |

### Module: Security/Transport

| Field | TC-03 |
|---|---|
| Req ID | RQ-03 |
| Title | Site loads over valid HTTPS |
| Type | Security |
| Priority | P1 |
| Preconditions | Fresh navigation to the Demoblaze home page |
| Test Data | N/A — no test data required |
| Steps (1) | Navigate to the home page via the configured base URL → Page loads successfully, no security interstitial |
| Steps (2) | Inspect the resulting page URL protocol → `page.url()` begins with `https://` |
| Steps (3) | Inspect the navigation response for certificate-error indicators → No certificate-error navigation occurred |
| Steps (4) | Monitor console messages during load for mixed-content warnings → No mixed-content console messages present |
| Postconditions | None |
| Automation Candidate | Yes — TBD: certificate "not expired" claim has no direct Playwright API; mark that sub-assertion Blocked/TBD unless a reliable signal is found |
| Tags | `@regression`, `@security` |
| Notes | Certificate expiry verification method is an open risk carried from the Test Plan (Section 17) |

### Module: Accessibility

| Field | TC-04 |
|---|---|
| Req ID | RQ-04 |
| Title | Keyboard Tab navigation through navbar |
| Type | Accessibility |
| Priority | P2 |
| Preconditions | On the Demoblaze home page; no element focused prior to first Tab press |
| Test Data | TBD — expected navbar link order must be derived from actual DOM order at implementation time |
| Steps (1) | Navigate to the home page → Home page loads with navbar visible |
| Steps (2) | Ensure no element is pre-focused → No element holds focus before first Tab press |
| Steps (3) | Press Tab repeatedly, recording focus at each press → Each Tab press advances focus to the next focusable navbar element in sequence |
| Steps (4) | Capture computed focus-indicator style per navbar link → Each focused link exhibits a visible focus indicator (TBD: exact CSS property/value) |
| Steps (5) | Compare recorded focus order to navbar DOM/visual order → Recorded order matches DOM/visual order, no skipped/out-of-order links |
| Postconditions | None |
| Automation Candidate | Yes — TBD: new keyboard-traversal helper + focus-indicator assertion; may need new navbar-link locators |
| Tags | `@regression`, `@accessibility` |
| Notes | "Visible focus indicator" automated via computed-style assertion, not screenshot diff |

### Module: Branding

| Field | TC-05 |
|---|---|
| Req ID | RQ-05 |
| Title | Favicon displays correctly |
| Type | UI |
| Priority | P3 |
| Preconditions | On the Demoblaze home page |
| Test Data | TBD — expected favicon href must be confirmed from actual `<link rel="icon">` at implementation time |
| Steps (1) | Navigate to the home page → Page loads successfully |
| Steps (2) | Inspect document `<head>` for `<link rel="icon">` → Favicon `<link>` present with non-empty `href` |
| Steps (3) | Verify favicon resource returns a successful HTTP response → Resource returns 2xx and is a valid image (TBD: exact expected filename/hash) |
| Postconditions | None |
| Automation Candidate | Yes — TBD: `page.locator('link[rel*="icon"]')` + network response assertion |
| Tags | `@regression` |
| Notes | In-tab visual rendering is outside Playwright's inspectable surface — automate the proxy signal only; mark literal "displays in tab" claim Blocked/TBD for manual spot-check |

## 3. Structured Export (JSON)

```json
[
  {
    "testCaseId": "TC-01",
    "reqId": "RQ-01",
    "title": "Pagination Next link loads more products",
    "module": "Pagination",
    "type": "Positive",
    "priority": "P3",
    "preconditions": ["On the Demoblaze home page, page fully loaded"],
    "testData": ["N/A — no test data required"],
    "steps": [
      { "step": 1, "action": "Navigate to the Demoblaze home page", "expectedResult": "Home page loads with the default product grid and pagination controls visible" },
      { "step": 2, "action": "Capture the set of product names/titles currently displayed in the product grid", "expectedResult": "Initial product name set is captured as the baseline for comparison" },
      { "step": 3, "action": "Scroll to the bottom of the home page", "expectedResult": "Pagination controls («, page numbers, ») are visible at the bottom of the page" },
      { "step": 4, "action": "Click the » (Next) pagination link", "expectedResult": "The product grid updates in response to the click (no unhandled navigation error)" },
      { "step": 5, "action": "Capture the set of product names/titles displayed after the click", "expectedResult": "The product name set differs from the baseline captured in step 2 - at least one product differs" }
    ],
    "postconditions": "None",
    "automationCandidate": true,
    "automationMapping": "HomePage.getDisplayedProductNames() (new), HomePage » pagination locator (new in locators/locatorConstants.ts)",
    "tags": ["@regression"],
    "notes": "Assert product set changed, not specific product names, per shared-catalog risk"
  },
  {
    "testCaseId": "TC-02",
    "reqId": "RQ-02",
    "title": "Page reload behaves cleanly",
    "module": "Page Lifecycle",
    "type": "Positive",
    "priority": "P2",
    "preconditions": ["On the Demoblaze home page", "Console/page-error listener attached before reload"],
    "testData": ["N/A — no test data required"],
    "steps": [
      { "step": 1, "action": "Navigate to the Demoblaze home page and attach a console-message/page-error listener", "expectedResult": "Home page loads and the listener begins capturing with zero messages recorded initially" },
      { "step": 2, "action": "Confirm the carousel and product grid are visible at the top of the page", "expectedResult": "Carousel and product grid are both visible before reload" },
      { "step": 3, "action": "Refresh (reload) the browser", "expectedResult": "The browser reload completes without a hung or failed navigation" },
      { "step": 4, "action": "Wait for the page to reach a stable loaded state after reload", "expectedResult": "The page reaches a stable loaded state after reload" },
      { "step": 5, "action": "Inspect the console/page-error messages captured since step 1", "expectedResult": "No error-level console messages or unhandled page errors were captured (TBD: exact severity threshold)" },
      { "step": 6, "action": "Confirm the carousel and product grid are visible at the top of the page after reload", "expectedResult": "Carousel and product grid render at the top of the page, matching their pre-reload state" }
    ],
    "postconditions": "None",
    "automationCandidate": true,
    "automationMapping": "TBD — requires new page.on('console'/'pageerror') listener; consoleHelper.ts exists but is not wired into any active spec",
    "tags": ["@regression"],
    "notes": "Console-error severity threshold TBD; implement listener locally in this spec"
  },
  {
    "testCaseId": "TC-03",
    "reqId": "RQ-03",
    "title": "Site loads over valid HTTPS",
    "module": "Security/Transport",
    "type": "Security",
    "priority": "P1",
    "preconditions": ["Fresh navigation to the Demoblaze home page"],
    "testData": ["N/A — no test data required"],
    "steps": [
      { "step": 1, "action": "Navigate to the Demoblaze home page via the configured base URL", "expectedResult": "Page loads successfully with no browser security interstitial shown" },
      { "step": 2, "action": "Inspect the resulting page URL protocol", "expectedResult": "page.url() begins with https://" },
      { "step": 3, "action": "Inspect the navigation response for certificate-error indicators", "expectedResult": "No certificate-error navigation occurred" },
      { "step": 4, "action": "Monitor console messages emitted during page load for mixed-content warnings", "expectedResult": "No console messages matching mixed-content patterns are present" }
    ],
    "postconditions": "None",
    "automationCandidate": true,
    "automationMapping": "TBD — page.url() + console-message monitoring; certificate-expiry sub-assertion TBD/Blocked pending a reliable signal",
    "tags": ["@regression", "@security"],
    "notes": "Certificate 'not expired' claim has no direct Playwright API; open risk carried from Test Plan Section 17"
  },
  {
    "testCaseId": "TC-04",
    "reqId": "RQ-04",
    "title": "Keyboard Tab navigation through navbar",
    "module": "Accessibility",
    "type": "Accessibility",
    "priority": "P2",
    "preconditions": ["On the Demoblaze home page", "No element focused prior to first Tab press"],
    "testData": ["TBD — expected navbar link order must be derived from actual DOM order at implementation time"],
    "steps": [
      { "step": 1, "action": "Navigate to the Demoblaze home page", "expectedResult": "Home page loads with the navbar visible" },
      { "step": 2, "action": "Ensure no element is pre-focused", "expectedResult": "No element holds focus before the first Tab press" },
      { "step": 3, "action": "Press Tab repeatedly, recording which element receives focus at each press", "expectedResult": "Each Tab press advances focus to the next focusable navbar element in sequence, until all navbar links have received focus" },
      { "step": 4, "action": "For each navbar link reached, capture its computed focus-indicator style", "expectedResult": "Each focused navbar link exhibits a visible focus indicator (TBD: exact CSS property/value)" },
      { "step": 5, "action": "Compare the recorded focus order against the navbar's DOM/visual order", "expectedResult": "Recorded focus order matches the navbar's DOM/visual order with no skipped or out-of-order links" }
    ],
    "postconditions": "None",
    "automationCandidate": true,
    "automationMapping": "TBD — new keyboard-traversal helper + focus-indicator assertion; possible new navbar-link locators",
    "tags": ["@regression", "@accessibility"],
    "notes": "Visible focus indicator automated via computed-style assertion, not screenshot diff"
  },
  {
    "testCaseId": "TC-05",
    "reqId": "RQ-05",
    "title": "Favicon displays correctly",
    "module": "Branding",
    "type": "UI",
    "priority": "P3",
    "preconditions": ["On the Demoblaze home page"],
    "testData": ["TBD — expected favicon href must be confirmed from actual link rel=icon at implementation time"],
    "steps": [
      { "step": 1, "action": "Navigate to the Demoblaze home page", "expectedResult": "Home page loads successfully" },
      { "step": 2, "action": "Inspect the document head for a link rel=icon (or equivalent) element", "expectedResult": "A favicon link element is present with a non-empty href attribute" },
      { "step": 3, "action": "Verify the favicon resource returns a successful HTTP response", "expectedResult": "The favicon resource returns a successful (2xx) response and is a valid image (TBD: exact expected filename/hash)" }
    ],
    "postconditions": "None",
    "automationCandidate": true,
    "automationMapping": "TBD — page.locator('link[rel*=icon]') + network response assertion",
    "tags": ["@regression"],
    "notes": "In-tab visual rendering is outside Playwright's inspectable surface; literal 'displays in tab' claim marked Blocked/TBD for manual spot-check"
  }
]
```

## 4. Traceability Integrity Report

| Req ID | Test Case ID | Chain Intact? |
|---|---|---|
| RQ-01 | TC-01 | Yes — unchanged from Test Plan RTM through Stage 2 |
| RQ-02 | TC-02 | Yes — unchanged from Test Plan RTM through Stage 2 |
| RQ-03 | TC-03 | Yes — unchanged from Test Plan RTM through Stage 2 |
| RQ-04 | TC-04 | Yes — unchanged from Test Plan RTM through Stage 2 |
| RQ-05 | TC-05 | Yes — unchanged from Test Plan RTM through Stage 2 |

No breaks detected. All five `Req ID → Test Case ID` pairs match the source Test Plan RTM (Section 31) exactly.

## 5. Rejected / Open Items Log

No cases rejected — all 5 normalized successfully with no schema violations.

Carried-forward TBDs (unresolved information, not defects):

| # | Test Case ID | TBD |
|---|---|---|
| 1 | TC-02 | Console-error capture mechanism/wiring |
| 2 | TC-02 | Console-error severity threshold (error vs. warning) |
| 3 | TC-03 | Certificate expiry verification method (no direct Playwright API) |
| 4 | TC-04 | Focus-indicator CSS property/value to assert |
| 5 | TC-04 | Navbar link DOM order (assumed left-to-right, not explicit in SPEC) |
| 6 | TC-05 | Expected favicon filename/hash; in-tab visual rendering unverifiable via Playwright |
