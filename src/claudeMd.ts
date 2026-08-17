import fs from "fs-extra";
import path from "path";

export type AssistantGuideAnswers = {
  projectName?: string;
  baseUrl?: string;
  suiteType?: string;
  environment?: string;
  reportChoice?: "allure" | "ortoni";
};

export type ProjectProfile = {
  /** package.json's own `name` field, falling back to the target folder's basename. */
  name: string;
  language: "TypeScript" | "JavaScript";
  /** Testing frameworks detected in dependencies/devDependencies, e.g. ["Playwright", "Cucumber"]. */
  testRunners: string[];
  /** Other notable libraries detected (not already covered by testRunners). */
  otherLibraries: string[];
  packageManager: "npm" | "yarn" | "pnpm" | "unknown";
  /** Top-level folders already present in the target project before Testroid touched it. */
  existingFolders: string[];
  /** Config files already present, e.g. "playwright.config.ts", "tsconfig.json". */
  configFiles: string[];
  hasCI: boolean;
  /** First heading/line pulled from an existing README, if any. */
  readmeSummary?: string;
  /** package.json scripts as they existed before Testroid's sync merge. */
  scripts: Record<string, string>;
};

const FOLDERS_OF_INTEREST = [
  "tests",
  "test",
  "e2e",
  "specs",
  "features",
  "__tests__",
  "pages",
  "page-objects",
  "locators",
  "fixtures",
  "utils",
  "helpers",
  "src",
  "api",
  "mobile",
  "cypress",
  "docs",
];

const CONFIG_FILES_OF_INTEREST = [
  "playwright.config.ts",
  "playwright.config.js",
  "playwright.config.mjs",
  "tsconfig.json",
  "jest.config.js",
  "jest.config.ts",
  "cucumber.js",
  "cypress.config.ts",
  "cypress.config.js",
  ".eslintrc.js",
  ".eslintrc.json",
  ".prettierrc",
];

/** Maps a dependency name to a human-readable label. Order matters: checked as testRunners first. */
const TEST_RUNNER_DEPS: Array<[dep: string, label: string]> = [
  ["@playwright/test", "Playwright"],
  ["playwright", "Playwright"],
  ["@cucumber/cucumber", "Cucumber"],
  ["playwright-bdd", "playwright-bdd"],
  ["cypress", "Cypress"],
  ["jest", "Jest"],
  ["mocha", "Mocha"],
  ["vitest", "Vitest"],
  ["webdriverio", "WebdriverIO"],
  ["appium", "Appium"],
];

const OTHER_LIBRARY_DEPS: Array<[dep: string, label: string]> = [
  // "typescript" is deliberately not listed here — it's already reflected via `language`.
  ["eslint", "ESLint"],
  ["prettier", "Prettier"],
  ["@faker-js/faker", "Faker"],
  ["faker", "Faker"],
  ["winston", "Winston"],
  ["axios", "Axios"],
  ["dotenv", "dotenv"],
  ["allure-playwright", "Allure"],
  ["allure-commandline", "Allure"],
  ["@axe-core/playwright", "axe-core"],
  ["chai", "Chai"],
  ["supertest", "Supertest"],
];

async function detectPackageManager(targetDir: string): Promise<ProjectProfile["packageManager"]> {
  if (await fs.pathExists(path.join(targetDir, "pnpm-lock.yaml"))) return "pnpm";
  if (await fs.pathExists(path.join(targetDir, "yarn.lock"))) return "yarn";
  if (await fs.pathExists(path.join(targetDir, "package-lock.json"))) return "npm";
  return "unknown";
}

async function detectReadmeSummary(targetDir: string): Promise<string | undefined> {
  const readmePath = path.join(targetDir, "README.md");
  if (!(await fs.pathExists(readmePath))) return undefined;

  const content = await fs.readFile(readmePath, "utf8").catch(() => "");
  const lines = content.split("\n").map((line) => line.trim());

  const heading = lines.find((line) => line.startsWith("# "));
  const firstProse = lines.find((line) => line.length > 0 && !line.startsWith("#"));

  const summary = [heading?.replace(/^#\s+/, ""), firstProse].filter(Boolean).join(" — ");
  return summary || undefined;
}

/**
 * Reads the target directory's actual state (package.json, folders, config files, README,
 * CI) so `generateAssistantGuide`'s "sync" mode can describe the real project instead of a
 * generic template. Call this BEFORE any sync/copy step mutates the target directory.
 */
export async function scanExistingProject(targetDir: string): Promise<ProjectProfile> {
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = (await fs.pathExists(pkgPath)) ? await fs.readJson(pkgPath).catch(() => ({})) : {};
  const deps: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };

  const testRunners = TEST_RUNNER_DEPS.filter(([dep]) => dep in deps).map(([, label]) => label);
  const otherLibraries = OTHER_LIBRARY_DEPS.filter(([dep]) => dep in deps).map(([, label]) => label);

  const hasTypeScript =
    "typescript" in deps || (await fs.pathExists(path.join(targetDir, "tsconfig.json")));

  const entries = await fs.readdir(targetDir).catch(() => []);
  const existingFolders: string[] = [];
  for (const entry of entries) {
    if (!FOLDERS_OF_INTEREST.includes(entry)) continue;
    const stat = await fs.stat(path.join(targetDir, entry)).catch(() => undefined);
    if (stat?.isDirectory()) existingFolders.push(entry);
  }

  const configFiles: string[] = [];
  for (const file of CONFIG_FILES_OF_INTEREST) {
    if (await fs.pathExists(path.join(targetDir, file))) configFiles.push(file);
  }

  const hasCI = await fs.pathExists(path.join(targetDir, ".github", "workflows"));

  return {
    name: pkg.name || path.basename(targetDir),
    language: hasTypeScript ? "TypeScript" : "JavaScript",
    testRunners: [...new Set(testRunners)],
    otherLibraries: [...new Set(otherLibraries)],
    packageManager: await detectPackageManager(targetDir),
    existingFolders,
    configFiles,
    hasCI,
    readmeSummary: await detectReadmeSummary(targetDir),
    scripts: pkg.scripts || {},
  };
}

/** Shared prose describing Testroid's agent pipeline — identical regardless of target project. */
const PIPELINE_SECTION = `## Testroid's agent pipeline

Beyond the Playwright automation layer, Testroid ships a Claude agent pipeline (Test Plan Generator → Test Case Generator → Normalizer → Reuse Matcher → Implement / API Automator / Mobile Automator → Validator) that turns an Epic + SPEC file, or manually authored test cases, into validated, merge-ready specs. Stage 5 splits into three independent tracks — **Implement Agent** (UI), **API Automator Agent** (\`Type: API\`), **Mobile Automator Agent** (\`Type: MobileApp\`) — a ticket with more than one type runs all that apply.

Before touching anything under \`docs/agents/\`, \`pages/**\`, \`locators/locatorConstants.ts\`, \`api/**\`, \`mobile/**\`, or \`tests/**\` as part of pipeline work, read \`docs/agents/README.md\` and load the \`guardrails\` Claude Code Skill (all stages), plus \`testroid-locator-conventions\`, \`testroid-api-conventions\`, and \`testroid-mobile-conventions\` as relevant to the case type — all under \`skills/\`. Key rules worth internalizing up front:

- No agent commits, pushes, merges, deploys, or publishes. A Stage 6 Pass is a recommendation, never an auto-merge trigger — a human always reviews the diff.
- Stage 5 (Implement) may only write to \`pages/**\`, \`locators/locatorConstants.ts\`, and \`tests/**\` excluding \`tests/api/**\`/\`tests/mobile/**\`; Stage 5b (API Automator) only to \`api/**\`/\`tests/api/**\`; Stage 5c (Mobile Automator) only to \`mobile/**\`/\`tests/mobile/**\` — never \`playwright.config.ts\`, \`.env\`, \`package.json\`, or CI files without explicit separate instruction.
- Unknowns are marked \`TBD\`, never fabricated (business data, credentials, locators, endpoint contracts, native-app element identifiers, expected results, or verdicts).
- Treat the configured AUT (UI and API) as a shared, non-isolated environment unless it's verifiably private/disposable.

Full details, per-stage docs, naming conventions, the traceability contract, HITL gates, and the feedback-loop routing table live in \`docs/agents/README.md\`. Output locations:

| Artifact | Path |
|---|---|
| Test Plan | \`docs/Test Plans/{ticketNo}_test_plan.md\` |
| Detailed Test Cases | \`docs/test_cases/{ticketNo}.md\` |
| Normalized Test Cases | \`docs/normalizer/{ticketNo}.md\` |
| Reuse Mapping Report | \`docs/reuse_map/{ticketNo}.md\` |
| Implementation code + summary (UI) | \`pages/{module}/*.ts\`, \`tests/{epic}/{ticketNo}.spec.ts\`, \`docs/implementation/{ticketNo}.md\` |
| Implementation code + summary (API) | \`api/clients/{module}ApiClient.ts\`, \`api/types/{module}ApiTypes.ts\`, \`tests/api/{epic}/{ticketNo}.spec.ts\`, \`docs/implementation/{ticketNo}.md\` |
| Implementation code + summary (Mobile App) | \`mobile/screens/{module}/*.ts\`, \`mobile/locators/mobileLocatorConstants.ts\`, \`tests/mobile/{epic}/{ticketNo}.spec.ts\`, \`docs/implementation/{ticketNo}.md\` |
| Validation Report | \`docs/validation/{ticketNo}.md\` |

Invoke the **Pipeline Orchestrator** (\`docs/agents/PipelineOrchestratorAgent.md\`) for end-to-end runs rather than the stage agents one at a time by hand.`;

/**
 * Shared prose telling Claude Code how to react when a user pastes pipeline-shaped
 * input into chat (a scenario, an epic/ticket reference, manual test cases, ...) —
 * confirm before running any stage, rather than generating tests ad hoc. Identical
 * regardless of target project; stage names/order match `docs/agents/README.md` exactly.
 */
const WORKING_WITH_TEST_INPUT_SECTION = `## Working with test input

If a user's message contains a test scenario description, an epic reference (e.g. \`EPIC-123\`), a Jira ticket ID or link, a SPEC file, or a manually-written description — no matter how complete or detailed it looks, including a fully-written scenario or a set of hand-written test cases — treat it as likely input to the Testroid agent pipeline described above, not something to turn into ad hoc tests or code immediately.

- **Confirm before starting, and default to the full pipeline.** Ask something like: "This looks related to the Testroid pipeline — should I run the full pipeline starting from Test Plan Generation through Validation?" Don't start drafting a test plan, test cases, or code before the user answers.
- **Never infer a later starting stage from how the input looks.** A scenario that already reads like a finished test plan, or a document that already reads like normalized test cases, is not by itself a reason to start anywhere but Stage 1. Detail or completeness in the input is not a signal to skip stages.
- **Only proceed on explicit confirmation.** Invoke the Pipeline Orchestrator (\`docs/agents/PipelineOrchestratorAgent.md\`) — which drives Stage 1 through Stage 6, pausing at the HITL gates in \`docs/agents/README.md\` — only once the user has explicitly confirmed running the full pipeline.
- **Before Implementation starts writing locators, check for Playwright MCP.** Once Stage 4 (Reuse Matcher) hands off and Stage 5 / 5b / 5c (Implement / API Automator / Mobile Automator Agent) is about to begin, check whether \`.mcp.json\` at the project root registers a \`playwright\` MCP server (the file \`testroid init\`'s MCP setup writes). If it does, ask: "Playwright MCP is available for this project. Would you like me to use it to interactively inspect the live page and build locators from what's actually on the page, or use the framework's semantic auto-healing locator strategy without live inspection?" If \`.mcp.json\` has no \`playwright\` entry, skip this question and proceed directly with the semantic auto-healing strategy (\`skills/testroid-locator-conventions/SKILL.md\`), same as before.
- **This choice only affects how locators get built.** Whichever option is picked — or the automatic non-MCP path — the remaining stages continue normally; it doesn't change whether the rest of the pipeline runs.
- **Only start later or run a single stage if the user explicitly says so, in their own words.** For example, "just generate the test plan," "just normalize these," "check what's already covered," or "skip straight to implementation using this existing test case." In that case run only the stage(s) requested via the relevant doc(s) in \`docs/agents/\` (\`TestPlanGeneratorAgent.md\`, \`TestCaseGeneratorAgent.md\`, \`TestCaseNormalizerAgent.md\`, \`ReuseMatcherAgent.md\`, \`ImplementAgent.md\`/\`ApiAutomatorAgent.md\`/\`MobileAutomatorAgent.md\`, or \`ValidatorAgent.md\`), and don't silently continue into the next stage afterward without asking again. Never infer this shortcut on your own — it only applies when the user states it explicitly.
- **This only governs the decision to start.** Once the user confirms, the pipeline's own guardrails (\`skills/guardrails/SKILL.md\`) — traceability, anti-fabrication, HITL Gate A after the Test Plan, HITL Gate B before any merge — govern the run itself.`;

/**
 * Documents whichever reporter was picked at `testroid init` (`src/reporting.ts`'s
 * `configureReporting`), plus how to view results for both options regardless — a project
 * can always switch later. Identical structure in both modes; only the active label differs.
 */
function buildReportingSection(reportChoice?: "allure" | "ortoni"): string {
  const activeLabel =
    reportChoice === "allure" ? "Allure Report" :
    reportChoice === "ortoni" ? "Ortoni Report" :
    "not recorded — check playwright.config.ts's reporter array";

  return `## Reporting

Active reporter (chosen at \`testroid init\`): **${activeLabel}**. It's wired into \`playwright.config.ts\`'s \`reporter: [...]\` array alongside the always-on \`list\`/\`html\`/\`junit\`/\`json\` reporters.

- **Ortoni Report** — \`utils/ortoniAutoOpenReporter.ts\` opens \`ortoni-report/index.html\` automatically after any local run (skipped in CI via \`process.env.CI\`). No extra command needed.
- **Allure Report** — \`utils/allureReportGenerator.ts\` regenerates the static report into \`allure-report/\` after every run, but Allure's own viewer can't auto-open the way Ortoni does (it needs a local server) — run \`npm run report:allure\` after tests to generate + open it.

To switch, re-run \`testroid init\` and pick the other option, or edit \`playwright.config.ts\`'s \`reporter: [...]\` array directly.`;
}

function projectCallout(answers: AssistantGuideAnswers): string {
  const parts = [
    answers.projectName && `**Project:** ${answers.projectName}`,
    answers.baseUrl && `**Target:** ${answers.baseUrl}`,
    answers.suiteType && `**Suite:** ${answers.suiteType}`,
    answers.environment && `**Environment:** ${answers.environment}`,
  ].filter(Boolean);

  return parts.length ? `> ${parts.join(" · ")}\n\n` : "";
}

async function readReferenceTemplate(): Promise<string> {
  const referencePath = path.join(__dirname, "..", "templates", "default", "CLAUDE.md");
  return fs.readFile(referencePath, "utf8");
}

/**
 * Fresh-scaffold mode: the target folder was empty, so there's no existing project to
 * reflect. Pulls Testroid's own generic reference (`templates/default/CLAUDE.md`) and
 * inserts a short project-config callout — the body stays generic, not tied to any site.
 */
function insertBeforeReports(content: string, section: string): string {
  const reportsHeading = "\n## Reports";
  const at = content.indexOf(reportsHeading);
  if (at === -1) return `${content.trimEnd()}\n\n${section}\n`;

  return `${content.slice(0, at)}\n${section}\n${content.slice(at)}`;
}

async function buildFreshAssistantGuide(answers: AssistantGuideAnswers): Promise<string> {
  const reference = await readReferenceTemplate();
  const withTestInput = insertBeforeReports(reference, WORKING_WITH_TEST_INPUT_SECTION);
  const withSection = insertBeforeReports(withTestInput, buildReportingSection(answers.reportChoice));

  const callout = projectCallout(answers);
  if (!callout) return withSection;

  // Insert the callout right after the first paragraph (the "guidance to Claude Code" line).
  const marker = "\n\n";
  const splitAt = withSection.indexOf(marker, withSection.indexOf(marker) + marker.length);
  if (splitAt === -1) return callout + withSection;

  return withSection.slice(0, splitAt + marker.length) + callout + withSection.slice(splitAt + marker.length);
}

function describeFolder(folder: string): string {
  const knownDescriptions: Record<string, string> = {
    tests: "existing spec files",
    test: "existing spec files",
    e2e: "existing end-to-end spec files",
    specs: "existing spec files",
    features: "existing Cucumber/Gherkin feature files",
    __tests__: "existing spec files",
    pages: "possibly existing Page Objects — check before assuming Testroid's `pages/BasePage.ts` convention applies",
    "page-objects": "possibly existing Page Objects — check before assuming Testroid's `pages/BasePage.ts` convention applies",
    locators: "possibly existing locator definitions — check before assuming Testroid's `LocatorStrategyList` convention applies",
    fixtures: "possibly existing Playwright fixtures — check before assuming Testroid's `fixtures/testFixture.ts` convention applies",
    utils: "existing helper/utility modules",
    helpers: "existing helper/utility modules",
    src: "existing application/source code",
    api: "existing API testing layer",
    mobile: "existing mobile testing layer",
    cypress: "existing Cypress suite (separate from Playwright)",
    docs: "existing documentation",
  };
  return knownDescriptions[folder] ?? "existing project files";
}

/**
 * Sync mode: the target folder already had a Playwright project. Builds guidance content that
 * describes the actual detected stack/structure, what Testroid added on top (from `added`/
 * `skipped`, captured by `syncIntoExistingProject` at merge time), and how the pipeline fits.
 */
function buildSyncAssistantGuide(
  profile: ProjectProfile,
  answers: AssistantGuideAnswers,
  added: string[],
  skipped: string[]
): string {
  const stackLine = [
    profile.language,
    ...profile.testRunners,
    ...profile.otherLibraries,
  ].join(", ");

  const existingFoldersList = profile.existingFolders.length
    ? profile.existingFolders.map((f) => `- \`${f}/\` — ${describeFolder(f)}`).join("\n")
    : "- (no folders from Testroid's checklist were detected — this looks like a minimal project)";

  const configFilesList = profile.configFiles.length
    ? profile.configFiles.map((f) => `\`${f}\``).join(", ")
    : "none detected";

  const scriptEntries = Object.entries(profile.scripts);
  const scriptsList = scriptEntries.length
    ? scriptEntries.map(([name, cmd]) => `- \`npm run ${name}\` — \`${cmd}\``).join("\n")
    : "- (no scripts detected in the existing `package.json`)";

  const addedList = added.length
    ? added.map((f) => `- \`${f}\``).join("\n")
    : "- (nothing — every top-level Testroid path already existed and was left untouched)";

  const skippedList = skipped.length
    ? skipped.map((f) => `- \`${f}\``).join("\n")
    : "- (nothing skipped — this was effectively a fresh merge)";

  return `# Testroid Project Guide

This file provides guidance to your AI coding assistant (Claude Code, GitHub Copilot, Cursor, or similar) when working with code in this repository.

${projectCallout(answers)}## What this repo is

An existing ${profile.language} project (\`${profile.name}\`)${profile.testRunners.length ? ` already using ${profile.testRunners.join(" + ")} for testing` : ""} before Testroid was added via \`testroid init\`. Testroid merges its AI agent pipeline and Page Object/API/Mobile automation framework into projects like this **without overwriting anything that already existed** — see "What Testroid added" below for exactly what changed.

- **Detected stack:** ${stackLine || "no notable testing libraries detected"}
- **Package manager:** ${profile.packageManager}
- **Config files detected:** ${configFilesList}
- **CI:** ${profile.hasCI ? "GitHub Actions workflow(s) detected under `.github/workflows/`" : "none detected"}
${profile.readmeSummary ? `- **Existing README says:** ${profile.readmeSummary}\n` : ""}
## Existing project structure

Folders already present before Testroid was added:

${existingFoldersList}

**Before extending any of the above, check whether it predates Testroid's own conventions** — an existing \`pages/\`, \`tests/\`, or \`fixtures/\` folder may follow different patterns than Testroid's \`pages/BasePage.ts\` (auto-healing \`LocatorStrategyList\` locators), \`locators/locatorConstants.ts\`, or \`fixtures/testFixture.ts\`. Don't assume they're interchangeable — read the existing files first, and don't retrofit them to Testroid's conventions unless asked.

Scripts already defined in \`package.json\` before the merge (Testroid's sync never overrides an existing script of the same name):

${scriptsList}

## What Testroid added

Testroid's sync (\`testroid init\`) copies its own top-level files/folders into this project, skipping anything that already existed:

**Added:**
${addedList}

**Skipped (already existed — left untouched):**
${skippedList}

\`package.json\` \`dependencies\`/\`devDependencies\` were merged (Testroid's added only where a package of the same name wasn't already present); existing versions always win on conflict. \`.env\` was created or had missing keys appended, never overwritten.

${PIPELINE_SECTION}

${WORKING_WITH_TEST_INPUT_SECTION}

${buildReportingSection(answers.reportChoice)}

## Reports

- HTML report: \`playwright-report/\` (open via \`npm run test:report\`, if added)
- JUnit: \`test-results/junit.xml\`
- JSON: \`test-results/results.json\`
- Screenshots/traces/videos on failure: \`test-results/artifacts/\`
`;
}

export type GenerateAssistantGuideInput =
  | { mode: "fresh"; answers: AssistantGuideAnswers }
  | {
      mode: "sync";
      profile: ProjectProfile;
      answers: AssistantGuideAnswers;
      added: string[];
      skipped: string[];
    };

/**
 * Generates the markdown body of Testroid's AI-assistant guidance file. Tool-agnostic by
 * design — the returned string is identical regardless of which file it ends up written to
 * (CLAUDE.md, .github/copilot-instructions.md, .cursor/rules/testroid.mdc, AGENTS.md, ...);
 * `src/aiConfig.ts`'s `writeAiAssistantConfig` owns picking the destination and writing it.
 */
export async function generateAssistantGuide(input: GenerateAssistantGuideInput): Promise<string> {
  if (input.mode === "fresh") {
    return buildFreshAssistantGuide(input.answers);
  }
  return buildSyncAssistantGuide(input.profile, input.answers, input.added, input.skipped);
}
