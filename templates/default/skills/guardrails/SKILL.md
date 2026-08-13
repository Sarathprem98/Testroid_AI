---
name: guardrails
description: Use whenever working on any Testroid pipeline stage (Test Plan Generator, Test Case Generator, Normalizer, Reuse Matcher, Implement, API Automator, Mobile Automator, Validator, or the Pipeline Orchestrator) — generating a test plan, test cases, a reuse map, implementing UI, API, or mobile app automation, or validating pipeline output. Covers the shared traceability contract, anti-fabrication rule, HITL gates, and safety guardrails that apply across all stages so they don't have to be re-derived per stage.
---

# Testroid Pipeline Conventions

Shared rules for every stage of the Testroid pipeline (see [docs/agents/README.md](../../docs/agents/README.md) for the full pipeline and per-stage docs in `docs/agents/`). Apply these regardless of which stage is active.

## Traceability contract

- A single `Req ID` / `Test Case ID` pair is assigned in Stage 1 (or left absent/`TBD` for manually entered cases) and must survive **unchanged** through Stage 6.
- Stage 2 (Test Case Generator) must not alter these IDs when expanding a row into a full test case.
- Stage 3 (Normalizer) must not alter IDs when normalizing format; it may only merge true duplicates (recording the merge) or reject cases missing a `Req ID` (recording the rejection, or marking `TBD` for manual entries) — never drop silently.
- Stage 4 (Reuse Matcher) must not alter IDs when classifying reuse; every normalized case gets exactly one classification (Full Reuse / Partial Reuse / Net New / Unverifiable), cited against real codebase evidence — never a guessed match.
- Stage 5 (Implement), Stage 5b (API Automator), and Stage 5c (Mobile Automator) each implement only what Stage 4 classified as Net New / Partial Reuse **within their own type** (UI / API / `MobileApp`), leave Full Reuse assets untouched, and keep every new `test()` traceable back to its `Test Case ID`.
- Stage 6 (Validator) independently verifies — never assumes — the chain is intact across whichever of Stage 5/5b/5c apply, and issues a Pass/Fail/Blocked verdict per `Test Case ID` backed by cited evidence.

## Anti-fabrication guardrail

The single most important rule in the pipeline: **mark unknowns as `TBD` rather than inventing** business data, credentials, locators, expected results, or test outcomes. A fabricated "Pass" or a fabricated Page Object method is worse than an honest gap.

## HITL gates (never bypass)

| Gate | After Stage | Unblocked by |
|---|---|---|
| A — Plan Approval | 1 | QA Lead / Product Owner fills in `Reviewed By` / `Approved By` before the plan drives Stage 2 |
| A′ — Manual Entry Confirmation | 3 (alternate entry) | Whoever supplied manual test cases confirms `{ticketNo}` and `Req ID` linkage |
| B — Merge Approval | 6 | A human reviews the diff + Validation Report before any `git commit`/`push`/`merge` — a Stage 6 Pass is a recommendation, never an auto-merge trigger |
| C — Loop Escalation | 6 → 5/5b/5c/4/3/2/1 | After 2 automatic Fail→fix retries for the same `{ticketNo}` + root cause, halt and loop in QA Lead/SDET with full attempt history |

## Workspace boundary

- Every stage operates only inside this repository's root. No reads or writes outside it — no other repos, no user home directory contents, no system files — with the sole exception of the OS-provided scratch/temp directory for throwaway intermediates that never get referenced as pipeline output.
- Absolute paths that resolve outside the workspace (whether typed by a human in a ticket or produced by a prior stage) are never followed. Treat that as a halt-and-ask case, not something to resolve unilaterally.
- Reading is bounded the same as writing: don't open files outside the repo root to "just check" something, even read-only.

## Approval fastlane

Not every action needs a human pause — but the two speeds must stay clearly separated:

- **Fastlane (proceed without pausing)** — generating or updating docs-only artifacts in the allowlisted `docs/**` output paths (Stages 1–4 drafts, Stage 6 reports) that touch no code, no config, and no git state. These are recommendations awaiting human review, not changes to the running system, so the pipeline can move through them without stopping at each one.
- **Hard gate (stop and wait for explicit sign-off)** — everything in the HITL gate table above, plus: the first write to `pages/**`, `locators/locatorConstants.ts`, or `tests/**` in Stage 5 (confirm Gate A was actually satisfied first), the first write to `mobile/**`/`tests/mobile/**` in Stage 5c, and any of the pipeline-wide safety rules below.
- **Default when unsure**: treat the action as gated, not fastlane. Misclassifying something as fastlane is the failure mode to avoid — the reverse (asking when it wasn't strictly necessary) just costs a pause.

## AI-generated tags

- Every doc artifact the pipeline produces carries a machine-readable marker identifying it as AI-generated, in addition to the existing `{ticketNo}`/date/stage header: e.g. `<!-- Generated-by: {stage-agent} · {ticketNo} · {date} · AI-generated, human review required -->`.
- Stage 5 code changes aren't committed by any agent (see below), so the marker travels via the Implementation Summary instead — include a suggested commit trailer (`Co-Authored-By: Claude <noreply@anthropic.com>`) for the human who performs the commit to use.
- Never strip, weaken, or omit an AI-generated tag on content that was in fact agent-authored. Presenting automation output as human-authored is a fabrication — the same violation the anti-fabrication guardrail above already forbids, just applied to provenance instead of data.

## Secret scanning

- Before any file is written, scan the content being written — not just source tickets — for secret-shaped strings: API keys, tokens, passwords, private keys, connection strings with embedded credentials, and common provider key patterns (e.g. `AKIA...`, `-----BEGIN...KEY-----` blocks, bearer tokens).
- A hit halts the write. Don't redact-and-continue — flag it to the human and leave the artifact unwritten (or written with a `TBD: possible secret detected, see flag` placeholder) rather than deciding yourself that a redaction is safe.
- This applies to both directions: source material (uploaded tickets, prior-stage output) and generated output (a fixture or Page Object that accidentally echoes a real value). `.env` and credential-shaped files are read-forbidden as well as write-forbidden, consistent with the workspace boundary above.
- This turns the existing "no real credentials, PII, or secrets" rule from a passive expectation into an active pre-write check — the rule doesn't change, the enforcement point does.

## Pipeline-wide safety rules

- **No autonomous git operations** — no agent runs `git commit`, `git push`, `git merge`, `git rebase`, or any force/destructive git command.
- **No autonomous deploys or publishes** — no `npm publish`-style or release/deploy commands.
- **File scope allowlisting** — only Stage 5, Stage 5b, and Stage 5c write framework code, each to its own non-overlapping subtree: Stage 5 (Implement Agent) only under `pages/**`, `locators/locatorConstants.ts`, `tests/**` excluding `tests/api/**`/`tests/mobile/**`; Stage 5b (API Automator Agent) only under `api/**`, `tests/api/**`; Stage 5c (Mobile Automator Agent) only under `mobile/**`, `tests/mobile/**`. None may touch `playwright.config.ts`, `global-setup.ts`, `global-teardown.ts`, `.env`, `package.json`, CI/CD files, or anything under `docs/agents/` without explicit separate instruction. Writes outside the [artifact path allowlist](#artifact-paths) are a hard-gate violation, not a judgment call.
- **No deletion of existing passing tests or methods** — add or make the minimal documented edit; Full Reuse assets are strictly read-only in Stage 5/5b/5c.
- **No real credentials, PII, or secrets** — test data comes from the project's `randomData`/fixture generation. If a source document appears to contain a real secret or PII, halt and flag it rather than propagating it downstream. This includes cloud device-farm credentials for Stage 5c, which are read from environment variables only. See [secret scanning](#secret-scanning) for the active enforcement of this rule.
- **Shared-environment caution** — treat the AUT (whatever `BASE_URL`/`API_BASE_URL` currently point at) as a shared, non-isolated environment unless it is verifiably a private/disposable one. No test — UI or API — may cause irreversible, costly, or disruptive side effects. No load generation, destructive admin actions, or spam account/API-call creation. For Stage 5c, this extends to real device/emulator/cloud resources — no excessive app installs/reinstalls or unnecessary concurrent cloud sessions.
- **No fabricated native-app element identifiers** — Stage 5c/Stage 4 must never present an accessibility id/resource id/predicate as verified unless it was actually confirmed against a real app; mark it `TBD` otherwise (see `mobile/locators/mobileLocatorConstants.ts`'s existing placeholders for the expected pattern).
- **Reversibility / blast radius** — before any hard-gated action, ask whether a human could undo it in under a minute if it turned out to be wrong. If not (force-push, bulk delete, overwriting a human's uncommitted work), it needs explicit sign-off regardless of which stage triggered it.
- **Verification before claiming success** — never report a check/test/verdict as passing without having actually run it. If it can't be run, say so and mark it Blocked/TBD.
- **Audit trail** — every stage's output file carries a header with `{ticketNo}`, date, and pipeline stage.

## Naming conventions

| Placeholder | Meaning | Example |
|---|---|---|
| `{epicNo}` | Jira/Azure DevOps Epic identifier | `EPIC-123` |
| `{ticketNo}` | Individual Story/Task/ticket identifier — every pipeline artifact for one feature is keyed to this | `EPIC-123-45` |
| `{module}` | Functional area for `pages/{module}/*.ts` (UI), `api/clients/{module}ApiClient.ts` (API), or `mobile/screens/{module}/*.ts` (Mobile App) | `checkout`, `search`, `account` |
| `{epic}` | Lowercase epic folder for `tests/{epic}/{ticketNo}.spec.ts` (UI), `tests/api/{epic}/{ticketNo}.spec.ts` (API), or `tests/mobile/{epic}/{ticketNo}.spec.ts` (Mobile App) | `checkout-flow` |

## Artifact paths

This table is the **write allowlist** for the whole pipeline, not just a reference — no stage writes anywhere outside it (the workspace boundary and file scope rules above depend on this being exhaustive). A stage that believes it needs to write somewhere else halts and asks rather than adding a path unilaterally.

| Artifact | Path |
|---|---|
| Test Plan | `docs/Test Plans/{ticketNo}_test_plan.md` |
| Detailed Test Cases | `docs/test_cases/{ticketNo}.md` |
| Normalized Test Cases | `docs/normalizer/{ticketNo}.md` |
| Reuse Mapping Report | `docs/reuse_map/{ticketNo}.md` |
| Implementation code (UI — Stage 5) | `pages/{module}/*.ts`, `tests/{epic}/{ticketNo}.spec.ts` |
| Implementation code (API — Stage 5b) | `api/clients/{module}ApiClient.ts`, `api/types/{module}ApiTypes.ts`, `tests/api/{epic}/{ticketNo}.spec.ts` |
| Implementation code (Mobile App — Stage 5c) | `mobile/screens/{module}/*.ts`, `mobile/locators/mobileLocatorConstants.ts`, `tests/mobile/{epic}/{ticketNo}.spec.ts` |
| Implementation Summary | `docs/implementation/{ticketNo}.md` — shared file; Stage 5, Stage 5b, and Stage 5c each own a separate section within it |
| Validation Report | `docs/validation/{ticketNo}.md` |

For automation implementation specifics: UI Page Object / locator conventions are in [[testroid-locator-conventions]]; API client/fixture conventions are in [[testroid-api-conventions]]; mobile app Screen Object / Appium conventions are in [[testroid-mobile-conventions]].
