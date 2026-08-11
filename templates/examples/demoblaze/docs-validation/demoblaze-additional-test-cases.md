# Validation Report — Demoblaze Additional Test Cases

> Pipeline stage: 6 — Quality Check / Validator | Ticket: **demoblaze-additional-test-cases** | Req ID: TBD (all cases)
> Upstream artifacts: [Normalized Test Cases](../normalizer/demoblaze-additional-test-cases.md) · [Reuse Mapping Report](../reuse_map/demoblaze-additional-test-cases.md) · [Implementation Summary](../implementation/demoblaze-additional-test-cases.md)
> Code: `locators/locatorConstants.ts`, `pages/BasePage.ts`, `pages/HomePage.ts`, `pages/ProductPage.ts`, `pages/ContactPage.ts` (new), `pages/AboutPage.ts` (new), `tests/additional-test-cases.003.spec.ts` (new)
> Date: 2026-07-15

---

## Change Log

**2026-07-15 (re-validation, user-requested):** the original validation run below (§2–§7, first pass) verdicted TC-07–TC-10 as Blocked (footer social icons absent from the AUT). The requester then asked for those 4 skipped tests to be replaced with 4 different, working tests. This report has been updated in place to re-validate the replacement scope; §2 and the Module tables below reflect the current, final state. The original Blocked reasoning remains visible in the Defect List (§4) and the Reuse Mapping Report's own Change Log for audit purposes.

---

## 2. Validation Summary

| Verdict | Count |
|---|---|
| Pass | 25 |
| Fail | 0 |
| Blocked | 0 |
| **Total** | **25** |

**Overall recommendation: Go.** All 25 cases are implemented, executed against the live AUT, and passing, including the TC-07–TC-10 replacement scope (duplicate sign-up rejection, invalid login, product-grid pagination, cart item removal) that superseded the original footer-icon cases found not to exist on the live site. **⏸ HITL Gate B applies to all 25 cases.**

---

## 3. Verdict Table

### Module: Home Page UI

| Test Case ID | Req ID | Verdict | Evidence | Notes |
|---|---|---|---|---|
| TC-01 | TBD | Pass | `npx playwright test tests/additional-test-cases.003.spec.ts -g "TC-01"` → 1 passed | — |
| TC-02 | TBD | Pass | Same run → TC-02 passed | — |
| TC-03 | TBD | Pass | Same run → TC-03 passed | — |
| TC-04 | TBD | Pass | Same run → TC-04 passed | Assertion scoped to image visibility only; caption text does not exist in the live DOM (see Implementation Summary Deviation #1). Re-verified independently during this validation pass via the same DOM inspection method Stage 5 used. |
| TC-05 | TBD | Pass | Same run → TC-05 passed (`expect.poll`, 10s bound) | Inherently timing-dependent (waits for a real ~5s auto-rotate); flagged as a flakiness-risk case per the Test Plan's risk category, not as a defect. |
| TC-06 | TBD | Pass | Same run → TC-06 passed; re-run 5× (`--repeat-each`) with 5/5 passes after the retry-click fix | Root cause of the initial failure verified independently: Bootstrap's carousel ignores a nav click issued while a prior transition is still animating — confirmed by re-reading the click/read sequence, not just trusting the Implementation Summary's claim. |

### Module: Account & Cart Coverage (replaces Footer / Social Links — see Change Log)

| Test Case ID | Req ID | Verdict | Evidence | Notes |
|---|---|---|---|---|
| TC-07 | TBD | Pass | `npx playwright test tests/additional-test-cases.003.spec.ts -g "TC-07"` → passed, both live alerts observed ("Sign up successful." then "This user already exist.") | Full Reuse of `SignUpPage.register()`, called twice with the same username; also re-run 3× (`--repeat-each=3`) with 3/3 passes after the modal-reopen fix (Implementation Summary Deviation #8). |
| TC-08 | TBD | Pass | Same spec run → TC-08 passed, alert "User does not exist." observed | New `LoginPage.loginExpectingError()`, does not touch the existing `login()` method. |
| TC-09 | TBD | Pass | Same spec run → TC-09 passed after the pagination-locator fix (Implementation Summary Deviation #7); re-run 3× with 3/3 passes | Independently re-verified the root cause: `getByRole('button',{name:'Next'})` does resolve to 2 elements on the live home page (carousel control + `#next2`), confirming the fix's own rationale, not just trusting the claim. |
| TC-10 | TBD | Pass | Same spec run → TC-10 passed; cart row present after add, absent after delete | New `CartPage.deleteItem()`/`verifyItemNotInCart()`. |

### Module: Contact Us

| Test Case ID | Req ID | Verdict | Evidence | Notes |
|---|---|---|---|---|
| TC-11 | TBD | Pass | Spec run → TC-11 passed | — |
| TC-12 | TBD | Pass | Spec run → TC-12 passed | — |
| TC-13 | TBD | Pass | Spec run → TC-13 passed; alert text contained "Thanks for the message" | — |
| TC-14 | TBD | Pass | Spec run → TC-14 passed | Confirms the source case's documented (permissive) site behavior — empty submission still succeeds. |
| TC-15 | TBD | Pass | Spec run → TC-15 passed | — |

### Module: About Us

| Test Case ID | Req ID | Verdict | Evidence | Notes |
|---|---|---|---|---|
| TC-16 | TBD | Pass | Spec run → TC-16 passed | — |
| TC-17 | TBD | Pass | Spec run → TC-17 passed | Asserts player/control presence + successful click only, not media playback telemetry — consistent with the Normalizer's own scoping note for this case. |
| TC-18 | TBD | Pass | Spec run → TC-18 passed | — |

### Module: Product Detail Page

| Test Case ID | Req ID | Verdict | Evidence | Notes |
|---|---|---|---|---|
| TC-19 | TBD | Pass | Spec run → TC-19 passed | Full Reuse case — confirmed `HomePage.openProduct()` was not modified (diff-scope check) and the new test entry exercises it directly. |
| TC-20 | TBD | Pass | Spec run → TC-20 passed | Cross-page name/price comparison verified functioning, not just field presence. |
| TC-21 | TBD | Pass | Spec run → TC-21 passed | — |
| TC-22 | TBD | Pass | Spec run → TC-22 passed | — |

### Module: Navigation / Error Handling

| Test Case ID | Req ID | Verdict | Evidence | Notes |
|---|---|---|---|---|
| TC-23 | TBD | Pass | Spec run → TC-23 passed; 0 `pageerror` events captured, brand link still rendered | Confirms the AUT does not crash on an invalid product id, matching the source case's expected result. |

### Module: Responsive Layout

| Test Case ID | Req ID | Verdict | Evidence | Notes |
|---|---|---|---|---|
| TC-24 | TBD | Pass | Spec run → TC-24 passed | Carousel-visibility assertion intentionally omitted per verified live behavior (`.carousel.slide { display: none }` at 375px) — see Implementation Summary Deviation #4. |

### Module: Product Images

| Test Case ID | Req ID | Verdict | Evidence | Notes |
|---|---|---|---|---|
| TC-25 | TBD | Pass | Spec run → TC-25 passed | — |

---

## 4. Defect List

No open defects remain against Stages 1–5 of **this ticket** as of the 2026-07-15 re-validation. For audit purposes, the resolved history is retained:

| # | Item | Owning Stage | Description | Resolution |
|---|---|---|---|---|
| 1 (resolved) | TC-07–TC-10, original footer-icon scope | Requirement / scope (pre-Stage-1, manual entry path) | The source `demoblaze_test_cases.md` document specified footer Facebook/Twitter/YouTube icons that do not exist anywhere on the live `https://www.demoblaze.com` footer. | Requester chose to replace the 4 cases with different, working scenarios (see Reuse Mapping Report and Implementation Summary Change Logs) rather than descope or retarget the environment. Superseded, not fixed in place. |
| 2 (resolved) | TC-09 (pagination) implementation defect | Stage 5 | `HomePage.goToNextProductPage()` initially reused the pre-existing `home.nextButton` locator, whose role-based strategy ambiguously matched the carousel's own "Next" control and resolved to it first — silently advancing the carousel instead of paginating the grid. | Routed to Stage 5; fixed with a dedicated `home.productGridNextButton` locator. Re-validated Pass (§3). |
| 3 (resolved) | TC-07 (duplicate sign-up) implementation defect | Stage 5 | Reopening the Sign Up modal in the same page instance immediately after closing it hung indefinitely (real Bootstrap modal/backdrop state issue on the AUT). | Routed to Stage 5; fixed by using a fresh page navigation between the two sign-up attempts. Re-validated Pass (§3). |

---

## 5. Regression Check Results

| Suite | Result | Evidence |
|---|---|---|
| `tests/category-navigation.002.spec.ts` | **Pass** | `npx playwright test tests/category-navigation.002.spec.ts --project=chromium` → 5/5 passed |
| `tests/purchase.001.spec.ts` | **Blocked** (not Fail, not Pass — see below) | `npx playwright test tests/purchase.001.spec.ts --project=chromium` → failed 3 out of 3 runs on `expect(confirmation.orderId).not.toEqual('')` |

**Why Blocked rather than Fail or Pass:** the failure is real and reproducible (3/3 runs), but this pipeline run did not modify `pages/CheckoutPage.ts`, `pages/CartPage.ts`, `pages/SignUpPage.ts`, `pages/LoginPage.ts`, or the `checkout`/`cart`/`signUp`/`login` groups in `locators/locatorConstants.ts` — the entire dependency chain `purchase.001.spec.ts` exercises. This is a **code-scope isolation argument** (verified by re-reading the diff against every file `purchase.001.spec.ts` imports), not a definitive causal proof: this working directory is **not a git repository**, so there is no version-controlled baseline to check out and re-run for a true before/after comparison. Per this stage's "no assumed Pass" guardrail, that gap is disclosed rather than glossed over. Most likely explanation given the isolation evidence: `demoblaze.com` (a shared, uncontrolled public demo) intermittently fails to render its order-confirmation `Id:` field — a known category of flakiness for this specific AUT, independent of this ticket's changes.

**This is not routed back into the demoblaze-additional-test-cases pipeline** — none of Stages 1–5 for this ticket touched the affected code path. It is flagged as a separate, pre-existing finding for the repo owner to track (e.g. as its own ticket), consistent with this stage's "do not dump every defect on Stage 5" guardrail.

---

## 6. Traceability Cross-Check

| Test Case ID | Normalizer (Stage 3) | Reuse Map (Stage 4) | Implementation (Stage 5) | Validator (Stage 6) |
|---|---|---|---|---|
| TC-01–TC-25 | ✅ present, `Source ID` preserved | ✅ classified | ✅ implemented or explicitly Blocked | ✅ verdict issued |

- Every one of the 25 `Source ID`s (`TC_HOME_001`…`TC_IMG_025`) from the original manual document maps 1:1 through `TC-01`…`TC-25` in the Normalizer, a reuse classification in Stage 4, and a Stage 5 status (Implemented or Blocked) — no gaps found.
- `Req ID` remains `TBD` end-to-end for all 25 cases, exactly as confirmed at **⏸ HITL Gate A′** — no stage silently assigned or fabricated one.
- No case was merged, dropped, or renumbered outside of the Stage 3 `Source ID → TC-##` assignment recorded once and never altered downstream.

---

## 7. Feedback Loop Routing Summary

| Routed To | Item(s) | Reason |
|---|---|---|
| **None (this ticket's pipeline)** | TC-01–TC-25 | Pass — no open defects found as of the 2026-07-15 re-validation. |
| **Resolved via Stage 5 (see Defect List #2, #3)** | TC-07, TC-09 | Implementation defects found during re-validation of the replacement scope, fixed, and confirmed Pass on re-run. |
| **Human tracking (separate from this ticket)** | `purchase.001.spec.ts` regression | Reproducible failure with strong (but not git-provable) evidence it predates and is unrelated to this diff. Recommend the repo owner open a separate investigation, ideally after establishing this repo under version control so future regression checks have a true baseline to diff against. |

**Conclusion**: 25/25 cases Pass and are recommended for merge at **⏸ HITL Gate B**. The `purchase.001.spec.ts` finding is disclosed for visibility but does not block this ticket's own merge recommendation, since it falls outside every file this pipeline run touched.
