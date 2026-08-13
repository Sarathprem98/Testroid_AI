# Testroid Pipeline

Testroid is a six-stage agent pipeline (eight agents, since Stage 5 splits into a UI path, an API path, and a native mobile app path) that turns an Epic + SPEC file into working, validated, merge-ready automation — UI (Page Object Model) and API via Playwright, and native/hybrid mobile apps via Appium. Every artifact is keyed to a `{ticketNo}` and written to a fixed path so any stage — or a human — can locate any other stage's output without guessing. Manual test cases may also enter the pipeline directly at Stage 3, bypassing the Generator.

Three Claude Code Skills operationalize the rules documented here so each stage doesn't have to re-derive them:

| Skill | Applies To | Covers |
|---|---|---|
| [`guardrails`](../../skills/guardrails/SKILL.md) | All eight stages + the Orchestrator | The [Traceability Contract](#traceability-contract) and [Guardrails](#guardrails) sections below — HITL gates, anti-fabrication rule, safety rules |
| [`testroid-locator-conventions`](../../skills/testroid-locator-conventions/SKILL.md) | Stage 4 (Reuse Matcher, UI-typed cases) and Stage 5 (Implement Agent) | `LocatorStrategyList` fallback pattern, `BasePage` primitives, Page Object/spec conventions used when scanning or writing `pages/**`, `locators/locatorConstants.ts`, `tests/**` |
| [`testroid-api-conventions`](../../skills/testroid-api-conventions/SKILL.md) | Stage 4 (Reuse Matcher, API-typed cases) and Stage 5b (API Automator Agent) | `BaseApiClient` pattern, `ApiResponse` shape, API client/fixture/spec conventions used when scanning or writing `api/**`, `tests/api/**` |
| [`testroid-mobile-conventions`](../../skills/testroid-mobile-conventions/SKILL.md) | Stage 4 (Reuse Matcher, `Type: MobileApp` cases) and Stage 5c (Mobile Automator Agent) | `BaseMobileClient` pattern, `MobileLocatorStrategyList` fallback, Appium/WebdriverIO environment setup (Android/iOS, local/cloud), Screen Object/spec conventions used when scanning or writing `mobile/**`, `tests/mobile/**` |

## How to Run the Pipeline

Don't invoke the stage agents by hand one at a time. Give any starting input (an `EpicNo` + SPEC file, a feature description, a raw requirement, an already-approved Test Plan, or existing manual test cases) to the **[Pipeline Orchestrator](./PipelineOrchestratorAgent.md)**. It runs Stage 1 through Stage 6 as one continuous flow — automatically splitting Stage 5 across [Implement Agent](./ImplementAgent.md) (UI-typed cases) and [API Automator Agent](./ApiAutomatorAgent.md) (API-typed cases) whenever a ticket has both — automatically handing each stage's output to the next, and stops **only** at the four HITL gates below for human verification or changes — never after a single stage "just because it finished." Once a gate is cleared, it resumes automatically from that exact point through to the end.

```
Human: EpicNo + SPEC file (or requirement, or approved
       Test Plan, or manual test cases)
        │
        ▼
┌───────────────────────────────┐
│   Pipeline Orchestrator         │  ← the only agent a human invokes directly;
│   (drives Stages 1–6 as one     │    picks the correct entry point below and
│    continuous run)              │    auto-chains every non-gated transition
└───────────────────────────────┘
   ══════════════════════════════════════════════════════════════════
   skill: guardrails — active across every box below (Stages 1–6,
   incl. 5b, + Orchestrator); enforces traceability, anti-fabrication,
   HITL gates
   ══════════════════════════════════════════════════════════════════
        │
        ▼
┌───────────────────────────────┐
│ 1. Test Plan Generator Agent   │
│    in:  EpicNo, SPEC file      │
│    out: docs/Test Plans/{ticketNo}_test_plan.md
└───────────────────────────────┘
        │
        ▼
   ⏸ HITL GATE A — QA Lead reviews/approves the Test Plan
   (Reviewed By / Approved By filled in) before it drives
   any downstream generation
        │
        ▼
┌───────────────────────────────┐
│ 2. Test Case Generator Agent   │
│    in:  Story/Task/Test Plan,  │
│         Test Module(s)/Scenarios,
│         Generic Detail Prompt  │
│    out: docs/test_cases/{ticketNo}.md
└───────────────────────────────┘
        │
        ├─────────────────────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────────────────────┐   (Existing manual test cases
│ 3. Test Case Normalizer Agent  │    also enter HERE directly,
│    in:  docs/test_cases/{ticketNo}.md   bypassing the Generator —
│    out: docs/normalizer/{ticketNo}.md   ⏸ HITL: confirm {ticketNo}
└───────────────────────────────┘         and traceability linkage)
        │
        ▼
┌───────────────────────────────┐
│ 4. Reuse Matcher Agent          │   (read-only — never writes to
│    in:  docs/normalizer/{ticketNo}.md  pages/**, locators/**, api/**, mobile/**, tests/**)
│    out: docs/reuse_map/{ticketNo}.md
│         (checks pages/**, api/**, mobile/** for existing assets, flags reuse)
│    skills: testroid-locator-conventions, testroid-api-conventions,
│            testroid-mobile-conventions
└───────────────────────────────┘
        │
        ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ 5. Implement      ◄──┼┐ │ 5b. API Automator ◄──┼┐ │ 5c. Mobile        ◄──┼┐
│    Agent             ││ │     Agent            ││ │     Automator Agent  ││
│    in:  UI-typed      ││ │    in:  API-typed     ││ │    in:  MobileApp-    ││
│         cases +       ││ │         cases +       ││ │         typed cases + ││
│         Reuse Matcher ││ │         Reuse Matcher ││ │         Reuse Matcher ││
│         output        ││ │         output        ││ │         output        ││
│    out: pages/**,      ││ │    out: api/**,        ││ │    out: mobile/**,     ││
│         tests/{epic}/  ││ │         tests/api/     ││ │         tests/mobile/  ││
│         {ticketNo}.    ││ │         {epic}/        ││ │         {epic}/        ││
│         spec.ts        ││ │         {ticketNo}.    ││ │         {ticketNo}.    ││
│                        ││ │         spec.ts        ││ │         spec.ts        ││
│    ⚠ allowlisted paths ││ │    ⚠ allowlisted paths ││ │    ⚠ allowlisted paths ││
│    only; no commit/    ││ │    only; no commit/    ││ │    only; no commit/    ││
│    push/merge          ││ │    push/merge          ││ │    push/merge          ││
│    skill: testroid-     ││ │    skill: testroid-api- ││ │    skill: testroid-     ││
│    locator-conventions ││ │    conventions         ││ │    mobile-conventions  ││
└─────────────────────┘│ └─────────────────────┘│ └─────────────────────┘│
        │              │         │              │         │              │
        └──────────────┴─────────┴──────────────┴─────────┘              │
                      │                                                   │
                      │  Fail: defect list, routed to whichever            │
                      ▼  stage owns the root cause (Stage 1, 2, 3, 4,      │
┌───────────────────────────────┐ 5, 5b, or 5c) — capped at N retries,     │
│ 6. Quality Check / Validator   │ then ⏸ HITL escalation ──────────────────┘
│    Agent                       │
│    in:  All prior outputs      │
│         (test plan, test cases,│
│         normalized cases, reuse│
│         map, code — UI, API,   │
│         and mobile app)        │
│    out: docs/validation/{ticketNo}.md
│         pass/fail report + feedback loop
└───────────────────────────────┘
        │ Pass = "recommended for merge"
        ▼
   ⏸ HITL GATE B — a human reviews the diff + Validation Report
   and performs the actual git commit / push / merge.
   No agent in this pipeline merges code autonomously.
        │
        ▼
Merged — npx playwright test green
```

---

## Naming Conventions

| Placeholder | Meaning | Example |
|---|---|---|
| `{epicNo}` | Jira/Azure DevOps Epic identifier — groups related tickets/features | `EPIC-123` |
| `{ticketNo}` | Individual Story/Task/ticket identifier — every pipeline artifact for one feature is keyed to this ID | `EPIC-123-45` |
| `{module}` | Functional area of the AUT a Page Object or API client belongs to — used to organize `pages/{module}/*.ts` (UI) or `api/clients/{module}ApiClient.ts` (API) | `category`, `cart`, `checkout` |
| `{epic}` | Lowercase epic folder name grouping spec files — used in `tests/{epic}/{ticketNo}.spec.ts` (UI) or `tests/api/{epic}/{ticketNo}.spec.ts` (API) | `category-navigation` |

`{ticketNo}` is the thread that ties every stage's output together. Given a ticket number, every artifact in the pipeline — test plan, test cases, normalized cases, reuse map, code, validation report — is discoverable by path alone.

---

## Stages

| Stage | Agent | Input | Output | Doc |
|---|---|---|---|---|
| — | **Pipeline Orchestrator** (entry point — invoke this, not the individual stages) | Any of: `EpicNo`+SPEC file, requirement, approved Test Plan, or manual test cases | Drives Stages 1–6 to completion, pausing only at HITL gates | [PipelineOrchestratorAgent.md](./PipelineOrchestratorAgent.md) |
| 1 | Test Plan Generator Agent | `EpicNo`, SPEC file | `docs/Test Plans/{ticketNo}_test_plan.md` | [TestPlanGeneratorAgent.md](./TestPlanGeneratorAgent.md) |
| 2 | Test Case Generator Agent | Story/Task/Test Plan, Test Module(s)/Scenarios, Generic Detail Prompt | `docs/test_cases/{ticketNo}.md` | [TestCaseGeneratorAgent.md](./TestCaseGeneratorAgent.md) |
| 3 | Test Case Normalizer Agent | `docs/test_cases/{ticketNo}.md` **or** existing manual test cases entered directly | `docs/normalizer/{ticketNo}.md` | [TestCaseNormalizerAgent.md](./TestCaseNormalizerAgent.md) |
| 4 | Reuse Matcher Agent | `docs/normalizer/{ticketNo}.md` | `docs/reuse_map/{ticketNo}.md` — scans `pages/**` (UI-typed cases), `api/**` (API-typed cases), and `mobile/**` (`Type: MobileApp` cases) for existing methods, flags reuse | [ReuseMatcherAgent.md](./ReuseMatcherAgent.md) · skills: [`testroid-locator-conventions`](../../skills/testroid-locator-conventions/SKILL.md), [`testroid-api-conventions`](../../skills/testroid-api-conventions/SKILL.md), [`testroid-mobile-conventions`](../../skills/testroid-mobile-conventions/SKILL.md) |
| 5 | Implement Agent | Normalized **UI-typed** test cases (`docs/normalizer/{ticketNo}.md`) + Reuse Matcher output (`docs/reuse_map/{ticketNo}.md`) | `pages/{module}/*.ts`, `tests/{epic}/{ticketNo}.spec.ts` | [ImplementAgent.md](./ImplementAgent.md) · skill: [`testroid-locator-conventions`](../../skills/testroid-locator-conventions/SKILL.md) |
| 5b | API Automator Agent | Normalized **API-typed** test cases (`docs/normalizer/{ticketNo}.md`) + Reuse Matcher output (`docs/reuse_map/{ticketNo}.md`) | `api/clients/{module}ApiClient.ts`, `api/types/{module}ApiTypes.ts`, `tests/api/{epic}/{ticketNo}.spec.ts` | [ApiAutomatorAgent.md](./ApiAutomatorAgent.md) · skill: [`testroid-api-conventions`](../../skills/testroid-api-conventions/SKILL.md) |
| 5c | Mobile Automator Agent | Normalized **`Type: MobileApp`** test cases (`docs/normalizer/{ticketNo}.md`) + Reuse Matcher output (`docs/reuse_map/{ticketNo}.md`) | `mobile/screens/{module}/*.ts`, `mobile/locators/mobileLocatorConstants.ts`, `tests/mobile/{epic}/{ticketNo}.spec.ts` | [MobileAutomatorAgent.md](./MobileAutomatorAgent.md) · skill: [`testroid-mobile-conventions`](../../skills/testroid-mobile-conventions/SKILL.md) |
| 6 | Quality Check / Validator Agent | All prior outputs (test plan, test cases, normalized cases, reuse map, code — UI, API, and mobile app) | `docs/validation/{ticketNo}.md` — pass/fail report + feedback loop | [ValidatorAgent.md](./ValidatorAgent.md) |

---

## Alternate Entry Point: Manual Test Cases

Stage 3 (Test Case Normalizer Agent) accepts two kinds of input:

1. **Pipeline-generated** — `docs/test_cases/{ticketNo}.md` from Stage 2, the default path.
2. **Manually authored** — existing hand-written test cases (Markdown, Excel, CSV, or legacy documents) supplied directly, bypassing Stage 1 and Stage 2 entirely.

Both paths converge on the same normalized output (`docs/normalizer/{ticketNo}.md`) and the same schema, so Stage 4 onward never needs to know which path a given ticket took. When test cases enter manually, traceability to a `Req ID` may not exist — the Normalizer must flag this as **TBD** rather than fabricate one (see [TestCaseNormalizerAgent.md](./TestCaseNormalizerAgent.md)).

---

## Platform Coverage (UI Test Cases)

UI-typed test cases carry a second dimension alongside `Type`: **`Platform`** — `Desktop`, `Mobile`, or `Both` — set in Stage 2, preserved through Stage 3, and consumed by Stage 4/5/6. Unlike `Type: API`, `Platform` never forks the pipeline into a separate stage: mobile coverage in this project is Playwright device emulation (`mobile-chrome` project, `devices['Pixel 5']`), so the exact same Page Object/locator/spec code Stage 5 writes for `chromium` also drives `mobile-chrome` — there is no mobile-specific Implement Agent.

- **Stage 2** assigns `Platform` per case (defaulting to the Test Plan's Device Coverage scope for that module, or `TBD` if unstated — never assumed).
- **Stage 4** treats Page Objects/locators as platform-agnostic by default, but flags a scenario as *not actually covered on mobile* if the matched spec already carries a `mobile-chrome`-only skip/guard.
- **Stage 5** implements one spec for both projects; mobile-only behavior differences are isolated to a guarded assertion (never a forked implementation), and a confirmed live-site mobile-only defect is skipped with cited evidence rather than masked by a loosened assertion — see [ImplementAgent.md's Mobile Web Testing section](./ImplementAgent.md#mobile-web-testing) and the [`testroid-locator-conventions`](../../skills/testroid-locator-conventions/SKILL.md) skill for the concrete conventions (no `force: true` to dodge animation races, no hardcoded desktop-only DOM order, respect `tests/hooks.ts`'s `isMobile`-aware viewport guard).
- **Stage 6** runs `npx playwright test --project=mobile-chrome` for any `Platform: Mobile`/`Both` case in addition to `chromium`, and verifies any mobile-only skip cites a real, verified defect rather than an unjustified bypass.

**Do not confuse `Platform: Mobile` with `Type: MobileApp`.** `Platform: Mobile` is a UI-typed case that also runs the target site's *website* under Playwright's mobile web emulation — still Stage 5. `Type: MobileApp` is a case against a genuine native/hybrid *app*, which Playwright cannot drive at all — that's [Stage 5c (Mobile Automator Agent)](./MobileAutomatorAgent.md), using Appium instead. See [MobileAutomatorAgent.md](./MobileAutomatorAgent.md) for the full distinction.

---

## Traceability Contract

A single `Req ID` / `Test Case ID` pair is assigned in Stage 1 (or is absent/TBD for manually entered cases) and must survive unchanged through Stage 6. Every agent's "Traceability" checks exist to catch breaks in this chain early:

- Stage 1 assigns `RQ-##` and `TC-##` in the Requirement Traceability Matrix.
- Stage 2 must not alter these IDs when expanding a row into a full test case.
- Stage 3 must not alter these IDs when normalizing format; it may only merge true duplicates (recording the merge) or reject cases missing a `Req ID` (recording the rejection, or marking it `TBD` for manually entered cases) — never drop silently.
- Stage 4 must not alter these IDs when classifying reuse; every normalized test case must receive exactly one classification (Full Reuse / Partial Reuse / Net New / Unverifiable), cited against real codebase evidence — never a guessed match.
- Stage 5 (UI), Stage 5b (API), and Stage 5c (Mobile App) must each implement only what Stage 4 classified as Net New / Partial Reuse **within their own type** (UI vs. API vs. `MobileApp`), leave Full Reuse assets untouched, and keep every new `test()` traceable back to its `Test Case ID`.
- Stage 6 must independently verify — never assume — that the chain is intact for the UI, API, and mobile app implementations (whichever apply), and issue a Pass/Fail/Blocked verdict per `Test Case ID` backed by cited evidence.

---

## Feedback Loop

Stage 6 is the only stage that can send work backward, and it routes to **whichever stage actually owns the root cause** — not always Stage 5:

| Root Cause | Routed Back To |
|---|---|
| Requirement/scope was misread or incomplete | Stage 1 — Test Plan Generator Agent |
| Test case steps/data don't match the requirement | Stage 2 — Test Case Generator Agent |
| Schema violation, duplicate not merged, inconsistent terminology | Stage 3 — Test Case Normalizer Agent |
| Reuse misclassified (e.g. claimed Full Reuse but asset doesn't exist) — `pages/**`, `api/**`, or `mobile/**` | Stage 4 — Reuse Matcher Agent |
| UI code doesn't implement the spec correctly, convention violation, regression | Stage 5 — Implement Agent |
| API code doesn't implement the spec correctly, convention violation, regression | Stage 5b — API Automator Agent |
| Mobile app code doesn't implement the spec correctly, convention violation, regression, fabricated app locator, or a missing-environment case reported as Pass instead of Blocked | Stage 5c — Mobile Automator Agent |

Each Fail verdict produces an itemized, file/line-referenced (or section-referenced, for upstream Markdown stages) defect list addressed to the specific agent responsible. That agent fixes only the cited defects and resubmits for validation. A **Pass** verdict closes the pipeline; the change is merge-ready.

**Loop cap:** the Stage 5/5b/5c ↔ Stage 6 (or Stage N ↔ Stage 6) cycle for a single `{ticketNo}` is capped at **2 automatic retries (3 total validation attempts)**, tracked independently for Stage 5, Stage 5b, and Stage 5c when a ticket has more than one. If the same root cause is still failing after that, Stage 6 stops looping and escalates to **HITL Gate C** (see Guardrails below) with a summary of every attempt instead of retrying indefinitely.

---

## Guardrails

Testroid writes code and drives test execution, so autonomy is bounded deliberately. These guardrails apply to **every agent in the pipeline**, in addition to each agent's own doc-specific constraints. They're operationalized as the [`guardrails`](../../skills/guardrails/SKILL.md) Claude Code Skill, which loads automatically whenever any stage is active.

### Human-in-the-Loop (HITL) Gates

| Gate | After Stage | Trigger | Who / What Unblocks It |
|---|---|---|---|
| **A — Plan Approval** | 1 | A Test Plan cannot drive Stage 2 generation until `Reviewed By` and `Approved By` (Section 1 of the Test Plan) are filled in by a human. An unapproved plan may still be drafted and iterated on, just not consumed downstream. | QA Lead / Product Owner sign-off |
| **A′ — Manual Entry Confirmation** | 3 (alternate entry) | Test cases entered manually (bypassing Stages 1–2) have no `Req ID` by default. Before Stage 4 proceeds, a human confirms the `{ticketNo}` and, if one exists, the correct `Req ID` linkage. | Whoever supplied the manual test cases |
| **B — Merge Approval** | 6 | A Stage 6 **Pass** verdict is a recommendation, never an auto-merge trigger. A human reviews the actual diff and the Validation Report before any `git commit` / `push` / `merge` happens. | Code reviewer / repo owner |
| **C — Loop Escalation** | 6 → 5/5b/5c/4/3/2/1 | After 2 automatic Fail→fix retries for the same `{ticketNo}` and root cause, the feedback loop halts and a human is looped in with the full attempt history rather than letting agents retry indefinitely. | QA Lead / SDET |

### Pipeline-Wide Safety Rules

- **No autonomous git operations.** No agent in this pipeline may run `git commit`, `git push`, `git merge`, `git rebase`, or any force/destructive git command. Stage 5/5b/5c edit files; a human commits them.
- **No autonomous deploys or publishes.** No agent may run deploy, release, or `npm publish`-style commands.
- **File scope allowlisting.** Stage 5, Stage 5b, and Stage 5c (the only stages that write framework code) each have their own, non-overlapping allowlist: Stage 5 (Implement Agent) may only touch `pages/**`, `locators/locatorConstants.ts`, and `tests/**` excluding `tests/api/**`/`tests/mobile/**`; Stage 5b (API Automator Agent) may only touch `api/**` and `tests/api/**`; Stage 5c (Mobile Automator Agent) may only touch `mobile/**` and `tests/mobile/**`. None may modify `playwright.config.ts`, `global-setup.ts`, `global-teardown.ts`, `.env`, `package.json`, CI/CD pipeline files, or anything under `docs/agents/` (the pipeline's own prompts) without an explicit, separate human instruction.
- **No deletion of existing passing tests or methods.** Agents add or make the minimal documented edit; they do not remove working code, and Full Reuse assets (per the Reuse Mapping Report) are strictly read-only in Stage 5/5b/5c.
- **Anti-fabrication guardrail.** Every stage marks unknowns as **TBD** rather than inventing business data, credentials, locators, expected results, or test outcomes. This is the single most important rule in the pipeline — a fabricated "Pass," a fabricated Page Object method, or a fabricated native-app element identifier is worse than an honest gap.
- **No real credentials, PII, or secrets.** Test data must come from the project's `randomData`/fixture generation, never real user data. If a SPEC file, requirement, or manually entered test case appears to contain a real secret or PII, the receiving agent halts and flags it instead of propagating it downstream. This includes cloud device-farm credentials for Stage 5c, which are read from environment variables only.
- **Shared-environment caution.** Treat the AUT (whatever `BASE_URL`/`API_BASE_URL` currently point at) as a shared, non-isolated environment unless it's verifiably private/disposable. No agent may design or execute a test that causes irreversible, costly, or disruptive side effects on shared state beyond what the project's existing example specs already establish as acceptable. Anything resembling load generation, destructive admin actions, or spam account creation is out of scope — this applies equally to API calls (e.g. repeated signup or other mutating calls) and to UI actions. For Stage 5c, this extends to real device/emulator/cloud resources — no excessive app installs/reinstalls or unnecessary concurrent cloud sessions.
- **Verification before claiming success.** No agent may report a check, test, or verdict as passing without having actually run it (or explicitly stating it could not be run and marking the result Blocked/TBD instead of Pass) — for Stage 5c specifically, this includes being honest when no Appium server, device/emulator, or cloud access is available in the current environment.
- **Audit trail.** Every stage's output file carries a header with `{ticketNo}`, date, and pipeline stage, so the full chain from requirement to merged code remains reconstructable after the fact.

---

## Output Location Convention

| Artifact | Path |
|---|---|
| Test Plan | `docs/Test Plans/{ticketNo}_test_plan.md` |
| Detailed Test Cases | `docs/test_cases/{ticketNo}.md` |
| Normalized Test Cases (Markdown + JSON) | `docs/normalizer/{ticketNo}.md` |
| Reuse Mapping Report | `docs/reuse_map/{ticketNo}.md` |
| Implementation code (UI) | `pages/{module}/*.ts`, `tests/{epic}/{ticketNo}.spec.ts` |
| Implementation code (API) | `api/clients/{module}ApiClient.ts`, `api/types/{module}ApiTypes.ts`, `tests/api/{epic}/{ticketNo}.spec.ts` |
| Implementation code (Mobile App) | `mobile/screens/{module}/*.ts`, `mobile/locators/mobileLocatorConstants.ts`, `tests/mobile/{epic}/{ticketNo}.spec.ts` |
| Implementation Summary | `docs/implementation/{ticketNo}.md` — shared by Stage 5, Stage 5b, and Stage 5c via separate, clearly labeled sections when a ticket has more than one type |
| Validation Report | `docs/validation/{ticketNo}.md` |

> Note: `pages/{module}/*.ts` and `tests/{epic}/{ticketNo}.spec.ts` describe the **target** convention for pipeline-generated UI output. If a project has pre-existing flat UI files that predate this convention (e.g. a `pages/LoginPage.ts` sitting directly under `pages/`), they are not retroactively moved unless a migration is explicitly requested. `mobile/**` and `tests/mobile/**` are structured as `{module}`/`{epic}` from the start, and — since this project has no real native app yet — `mobile/screens/SampleLoginScreen.ts` and `tests/mobile/sample-app.appium.spec.ts` are explicitly illustrative placeholders, not a real hand-authored starting point.
