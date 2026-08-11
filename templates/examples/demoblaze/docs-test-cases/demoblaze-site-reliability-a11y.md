<!-- Generated-by: TestCaseGeneratorAgent · demoblaze-site-reliability-a11y · 2026-07-20 · AI-generated, human review required -->

# Test Cases — demoblaze-site-reliability-a11y

> Source Test Plan: [`docs/Test Plans/demoblaze-site-reliability-a11y_test_plan.md`](../Test%20Plans/demoblaze-site-reliability-a11y_test_plan.md) — **note: source plan was proceeded as draft (Gate A cleared without formal Reviewed By/Approved By sign-off, per explicit human instruction on 2026-07-20)**, Requirement Traceability Matrix (Section 31).
> Version: 1.0 · Date: 2026-07-20

## 1. Test Case Summary Table

| Test Case ID | Title | Type | Priority | Automation Candidate |
|---|---|---|---|---|
| TC-01 | Pagination Next link loads more products | Positive | P3 | Yes |
| TC-02 | Page reload behaves cleanly | Positive | P2 | Yes |
| TC-03 | Site loads over valid HTTPS | Security | P1 | Yes |
| TC-04 | Keyboard Tab navigation through navbar | Accessibility | P2 | Yes |
| TC-05 | Favicon displays correctly | UI | P3 | Yes |

---

## 2. Detailed Test Cases

### Module: Pagination

## TC-01 — Pagination Next link loads more products

| Field | Value |
|---|---|
| Priority | P3 |
| Req ID | RQ-01 |
| Module | Pagination |
| Type | Positive |
| Preconditions | On the Demoblaze home page, page fully loaded |

**Test Data:**

| Data Field | Value / Boundary type |
|---|---|
| N/A | No test data required for this scenario |

**Test Steps:**

1. Navigate to the Demoblaze home page.
2. Capture the set of product names/titles currently displayed in the product grid.
3. Scroll to the bottom of the home page.
4. Click the "»" (Next) pagination link.
5. Capture the set of product names/titles displayed after the click.

**Expected Result:**

1. Home page loads with the default product grid and pagination controls visible.
2. The initial product name set is captured as the baseline for comparison.
3. Pagination controls ("«", page numbers, "»") are visible at the bottom of the page.
4. The product grid updates in response to the click (no unhandled navigation error).
5. The product name set captured in step 5 differs from the baseline captured in step 2 — at least one product differs.

**Postconditions:** None — no persistent state change.

**Automation Candidate:** Yes — extend `HomePage` with a method to read displayed product names (e.g. `getDisplayedProductNames()`) and a method/locator for the "»" pagination control (new entry in `locators/locatorConstants.ts`).

**Notes:** Demoblaze's catalog is a shared public dataset — assert that the product set changed, not specific product names, per Test Plan Risk (Section 17).

---

### Module: Page Lifecycle

## TC-02 — Page reload behaves cleanly

| Field | Value |
|---|---|
| Priority | P2 |
| Req ID | RQ-02 |
| Module | Page Lifecycle |
| Type | Positive |
| Preconditions | On the Demoblaze home page; console/page-error listener attached before reload |

**Test Data:**

| Data Field | Value / Boundary type |
|---|---|
| N/A | No test data required for this scenario |

**Test Steps:**

1. Navigate to the Demoblaze home page and attach a console-message/page-error listener.
2. Confirm the carousel and product grid are visible at the top of the page.
3. Refresh (reload) the browser.
4. Wait for the page to reach a stable loaded state after reload.
5. Inspect the console/page-error messages captured since step 1.
6. Confirm the carousel and product grid are visible at the top of the page after reload.

**Expected Result:**

1. Home page loads and the listener begins capturing with zero messages recorded initially.
2. Carousel and product grid are both visible before reload.
3. The browser reload completes without a hung or failed navigation.
4. The page reaches a stable loaded state (e.g., DOM content loaded / network idle) after reload.
5. No `error`-level console messages or unhandled page errors were captured — **TBD**: exact severity threshold (error vs. warning) not specified in the SPEC, pending clarification.
6. Carousel and product grid render at the top of the page, matching their pre-reload state.

**Postconditions:** None.

**Automation Candidate:** Yes — requires a `page.on('console', ...)` / `page.on('pageerror', ...)` listener. Per `CLAUDE.md`, `consoleHelper.ts` exists but is only wired into the dead `registerHooks` export in `fixtures/testFixture.ts` — this spec cannot rely on it being active and should attach its own listener rather than assume suite-wide wiring.

**Notes:** Console-error capture mechanism is a Test Plan-level open risk (Section 17/19). If not resolved by Gate A follow-up, Stage 5 should implement a local listener scoped to this spec rather than modify `fixtures/testFixture.ts`'s dead code path (out of Stage 5's minimal-edit mandate).

---

### Module: Security/Transport

## TC-03 — Site loads over valid HTTPS

| Field | Value |
|---|---|
| Priority | P1 |
| Req ID | RQ-03 |
| Module | Security/Transport |
| Type | Security |
| Preconditions | Fresh navigation to the Demoblaze home page |

**Test Data:**

| Data Field | Value / Boundary type |
|---|---|
| N/A | No test data required for this scenario |

**Test Steps:**

1. Navigate to the Demoblaze home page via the configured base URL.
2. Inspect the resulting page URL protocol.
3. Inspect the navigation response for certificate-error indicators.
4. Monitor console messages emitted during page load for mixed-content warnings.

**Expected Result:**

1. Page loads successfully with no browser security interstitial shown.
2. `page.url()` begins with `https://`.
3. No certificate-error navigation occurred (no `net::ERR_CERT_*` failure or equivalent "Not Secure" interstitial state).
4. No console messages matching mixed-content patterns (e.g. "Mixed Content", "was loaded over HTTPS, but requested an insecure resource") are present.

**Postconditions:** None.

**Automation Candidate:** Yes — spec-level or new `HomePage` helper using `page.url()` and console-message monitoring.

**Notes:** "Valid and not expired" certificate status has no direct Playwright Page API — per the Test Plan's anti-fabrication guardrail, the "not expired" claim specifically should be marked **Blocked/TBD** at implementation/validation time unless a reliable in-browser signal is identified, rather than asserted without real evidence (see Test Plan Risk 17 / Mitigation 18).

---

### Module: Accessibility

## TC-04 — Keyboard Tab navigation through navbar

| Field | Value |
|---|---|
| Priority | P2 |
| Req ID | RQ-04 |
| Module | Accessibility |
| Type | Accessibility |
| Preconditions | On the Demoblaze home page; no element focused prior to first Tab press |

**Test Data:**

| Data Field | Value / Boundary type |
|---|---|
| Expected navbar link order | TBD — must be derived from actual DOM order at implementation time, not assumed |

**Test Steps:**

1. Navigate to the Demoblaze home page.
2. Ensure no element is pre-focused (e.g., click on a neutral page area, not an interactive element).
3. Press Tab repeatedly, recording which element receives focus at each press.
4. For each navbar link reached, capture its computed focus-indicator style (e.g., outline, box-shadow).
5. Compare the recorded focus order against the navbar's DOM/visual (left-to-right) order.

**Expected Result:**

1. Home page loads with the navbar visible.
2. No element holds focus before the first Tab press (baseline).
3. Each Tab press advances focus to the next focusable navbar element in sequence, until all navbar links have received focus.
4. Each focused navbar link exhibits a visible focus indicator (non-`none` outline, visible box-shadow, or equivalent) — **TBD**: exact CSS property/value to assert, to be confirmed against actual rendered styles at implementation time.
5. The recorded focus order matches the navbar's DOM/visual order with no skipped or out-of-order links.

**Postconditions:** None.

**Automation Candidate:** Yes — new `HomePage` method(s) for keyboard-driven focus traversal (`page.keyboard.press('Tab')` loop) and a focus-indicator assertion helper; may require new locators per navbar link if not already defined in `locators/locatorConstants.ts`.

**Notes:** "Visible focus indicator" is a visual property — automate via computed-style assertion, not a screenshot diff, per Test Plan Mitigation (Section 18).

---

### Module: Branding

## TC-05 — Favicon displays correctly

| Field | Value |
|---|---|
| Priority | P3 |
| Req ID | RQ-05 |
| Module | Branding |
| Type | UI |
| Preconditions | On the Demoblaze home page |

**Test Data:**

| Data Field | Value / Boundary type |
|---|---|
| Expected favicon href | TBD — must be confirmed from the actual page `<link rel="icon">` at implementation time, not assumed |

**Test Steps:**

1. Navigate to the Demoblaze home page.
2. Inspect the document `<head>` for a `<link rel="icon">` (or equivalent) element.
3. Verify the favicon resource returns a successful HTTP response.

**Expected Result:**

1. Home page loads successfully.
2. A favicon `<link>` element is present with a non-empty `href` attribute.
3. The favicon resource returns a successful (2xx) response and is a valid image — **TBD**: exact expected filename/hash not specified in the SPEC.

**Postconditions:** None.

**Automation Candidate:** Yes — spec-level or new `HomePage` helper using `page.locator('link[rel*="icon"]')` plus a network response assertion for the favicon request.

**Notes:** Visual rendering of the favicon inside the actual browser tab UI is outside Playwright's inspectable page surface (browser chrome, not page DOM). Automate the proxy signal only (favicon link present + resource loads); the literal "displays in the tab" claim should be marked **Blocked/TBD** for manual spot-check rather than asserted as automatically verified, per the anti-fabrication guardrail.

---

## 3. Traceability Cross-Check

| Req ID (Test Plan RTM) | Test Case ID | Covered? |
|---|---|---|
| RQ-01 | TC-01 | Yes |
| RQ-02 | TC-02 | Yes |
| RQ-03 | TC-03 | Yes |
| RQ-04 | TC-04 | Yes |
| RQ-05 | TC-05 | Yes |

All five Requirement Traceability Matrix rows from the source Test Plan (Section 31) have a corresponding detailed test case. No gaps identified.

## 4. Open Items / TBD Log

| Item | Related Case(s) | Description |
|---|---|---|
| Console-error capture wiring | TC-02 | `consoleHelper.ts` is not actively wired into any current spec; this case must attach its own listener rather than assume suite-wide capture. |
| Console-error severity threshold | TC-02 | SPEC says "unhandled console errors" — exact severity level (error vs. warning) to assert is not specified. |
| Certificate expiry verification method | TC-03 | No direct Playwright API for certificate expiry; implementation may need to mark this specific assertion Blocked/TBD. |
| Focus-indicator CSS property | TC-04 | Exact computed-style property/value to assert for "visible focus indicator" not specified; must be derived from actual rendered navbar styles. |
| Navbar link DOM order | TC-04 | "Logical order" assumed to mean DOM/visual left-to-right order per Test Plan Assumption (Section 16); not explicitly defined in SPEC. |
| Favicon expected value | TC-05 | Exact expected favicon filename/hash not specified in SPEC; and the literal in-tab visual rendering is outside Playwright's inspectable surface. |
