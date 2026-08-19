import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { runPrompts, MissingBaseUrlError, type PromptAnswers } from "../prompts";
import { scaffoldProject } from "../scaffold";
import { detectProjectState } from "../detect";
import { syncIntoExistingProject } from "../sync";
import { runNpmInstall, runPlaywrightInstall } from "../install";
import { generateAssistantGuide, scanExistingProject } from "../claudeMd";
import { writeAiAssistantConfig, type AiAssistantChoice } from "../aiConfig";
import { installPlaywrightMcp, MCP_INSTALL_MANUAL_COMMAND, MCP_PACKAGE, type McpInstallResult } from "../mcp";
import { configureReporting, getReportingManualInstallCommand } from "../reporting";
import { writeManifest, resolveTestroidVersion, type TestroidManifest } from "../manifest";

// Mirrors the paths written by src/aiConfig.ts's writeAiAssistantConfig — kept here (rather
// than imported) since that module's switch statement builds each path alongside directory
// creation/write side effects, not as a lookup table; duplicating just the four literal
// strings is simpler than pulling that apart for one display line in the summary below.
const AI_ASSISTANT_CONFIG_FILES: Record<Exclude<AiAssistantChoice, "skip">, string> = {
  "claude-code": "CLAUDE.md",
  copilot: ".github/copilot-instructions.md",
  cursor: ".cursor/rules/testroid.mdc",
  other: "AGENTS.md",
};

/**
 * The npm script that actually runs the Playwright suite in `installDir`. Prefers a
 * "test" script if its command starts with "playwright test" (the case for every path
 * scaffoldProject/syncIntoExistingProject produce), falls back to any other script whose
 * command does the same (covers a synced project that already used a different script
 * name for it), and finally a raw `npx playwright test` if neither is found.
 */
async function resolveTestCommand(installDir: string): Promise<string> {
  const pkgPath = path.join(installDir, "package.json");
  const pkg = (await fs.pathExists(pkgPath)) ? await fs.readJson(pkgPath).catch(() => undefined) : undefined;
  const scripts: Record<string, unknown> = pkg?.scripts ?? {};

  const isPlaywrightTest = (cmd: unknown) => typeof cmd === "string" && cmd.trim().startsWith("playwright test");

  if (isPlaywrightTest(scripts.test)) return "npm test";

  const other = Object.keys(scripts).find((name) => isPlaywrightTest(scripts[name]));
  if (other) return `npm run ${other}`;

  return "npx playwright test";
}

/**
 * True if `installDir/tests` contains no files (recursively, ignoring `.gitkeep`
 * placeholders) — i.e. there's nothing for `playwright test` to actually run yet. Fresh
 * scaffolds/subfolder installs always start this way now that the starter placeholder spec
 * is gone; a synced project that already had real specs under tests/ will not.
 */
async function hasNoTestFiles(installDir: string): Promise<boolean> {
  const testsDir = path.join(installDir, "tests");
  if (!(await fs.pathExists(testsDir))) return true;

  async function containsAFile(dir: string): Promise<boolean> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (await containsAFile(full)) return true;
      } else if (entry.name !== ".gitkeep") {
        return true;
      }
    }
    return false;
  }

  return !(await containsAFile(testsDir));
}

/**
 * Prints a short, run-specific summary of what to do next — only the lines relevant to
 * what was actually configured this run, not a fixed checklist.
 */
function printNextSteps(
  answers: PromptAnswers,
  testCommand: string,
  ranInSubfolder: boolean,
  testsAreEmpty: boolean
): void {
  const cd = ranInSubfolder ? "cd testroid && " : "";

  console.log(chalk.bold.cyan("📋 Next steps:"));

  if (!answers.baseUrl) {
    console.log(
      `  ${chalk.dim("•")} ${chalk.yellow("BASE_URL isn't set yet")} ${chalk.dim("— add it to .env before running tests, or they'll target an empty/invalid URL.")}`
    );
  }

  if (testsAreEmpty) {
    console.log(
      `  ${chalk.dim("•")} ${chalk.dim("Your tests/ folder is empty — write a spec, or give your AI assistant a scenario/ticket to generate one via the pipeline, then run:")} ${chalk.cyan(`${cd}${testCommand}`)}`
    );
  } else {
    console.log(`  ${chalk.dim("•")} ${chalk.dim("Run your tests:")} ${chalk.cyan(`${cd}${testCommand}`)}`);
  }

  if (answers.installPlaywrightMcp) {
    console.log(
      `  ${chalk.dim("•")} ${chalk.dim("Playwright MCP is set up — your AI assistant can drive a real browser automatically, no setup needed.")}`
    );
  }

  if (answers.reportChoice === "allure") {
    console.log(
      `  ${chalk.dim("•")} ${chalk.dim("View the Allure report:")} ${chalk.cyan(`${cd}npm run report:allure`)} ${chalk.dim("(run manually after tests — it doesn't auto-open)")}`
    );
  } else if (answers.reportChoice === "ortoni") {
    console.log(
      `  ${chalk.dim("•")} ${chalk.dim("Ortoni report opens automatically after each local test run — no extra command needed.")}`
    );
  }

  if (answers.aiAssistant !== "skip") {
    const file = AI_ASSISTANT_CONFIG_FILES[answers.aiAssistant];
    console.log(`  ${chalk.dim("•")} ${chalk.dim(`${chalk.bold(file)} was generated — your AI assistant now has project context.`)}`);
  }

  console.log("");
}

interface StepFailure {
  label: string;
  manualCommand: string;
  errorMessage: string;
}

// Runs a post-scaffold step in isolation: a failure is recorded (with the exact
// manual command to recover) rather than thrown, so one step failing — e.g. a
// network drop during the Playwright browser download — doesn't abort the
// remaining independent steps or leave the user with just a raw stack trace.
// Returns the step's own result on success, or undefined on failure — callers that need to
// record what a step actually added to the undo manifest treat "undefined" as "nothing".
async function runTrackedStep<T>(
  failures: StepFailure[],
  label: string,
  manualCommand: string,
  fn: () => Promise<T>
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (err) {
    // Prefer execa's `shortMessage` (e.g. "Command failed with exit code 1: npm install")
    // over `message`, which appends the full captured stderr — the failed step already
    // printed that detail itself via its own spinner.fail(), so repeating it here would
    // flood this summary's one-line-per-failure red bullet list.
    const errorMessage =
      err && typeof err === "object" && "shortMessage" in err
        ? String((err as { shortMessage?: unknown }).shortMessage ?? "")
        : err instanceof Error
          ? err.message
          : String(err);
    failures.push({ label, manualCommand, errorMessage });
  }
}

export interface InitCommandOptions {
  /** Skip all interactive prompts and use sensible defaults (`--yes` / `-y`). */
  yes?: boolean;
  /** Base URL of the site under test, passed via `--url`. Required when `yes` is set. */
  url?: string;
}

export async function initCommand(options: InitCommandOptions = {}) {
  const targetDir = process.cwd();
  const state = await detectProjectState(targetDir);

  console.log(`${chalk.cyan("🔍 Detected project state:")} ${chalk.bold(state)}\n`);

  let answers;
  try {
    answers = await runPrompts(targetDir, { skipPrompts: options.yes, baseUrl: options.url, state });
  } catch (err) {
    if (err instanceof MissingBaseUrlError) {
      console.error(chalk.red(`✖ ${err.message}`));
      console.log(chalk.dim("\n  Example:"));
      console.log(chalk.dim("    testroid init --yes --url https://example.com\n"));
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  let installDir = targetDir;
  let assistantGuideContent = "";
  // Populated per-branch below, then combined with the AI-assistant file, MCP config, and
  // reporting additions after all steps run — assembled into the undo manifest at the end.
  let manifestMode: TestroidManifest["mode"] = "scaffold";
  let added: string[] = [];
  let packageJsonMerged = false;
  let packageJsonAdded = { dependencies: [] as string[], devDependencies: [] as string[], scripts: [] as string[] };

  switch (state) {
    case "empty": {
      const result = await scaffoldProject(targetDir, answers);
      installDir = targetDir;
      manifestMode = "scaffold";
      added = result.added;
      assistantGuideContent = await generateAssistantGuide({ mode: "fresh", answers });
      break;
    }

    case "playwright-only": {
      console.log(chalk.yellow("🔄 Existing Playwright project detected — syncing Testroid into it (no overwrites).\n"));

      // Scan the project's real state BEFORE sync copies anything in, so the generated
      // guide reflects what was actually already there, not the post-merge mix.
      const profile = await scanExistingProject(targetDir);
      const syncResult = await syncIntoExistingProject(targetDir, answers);

      assistantGuideContent = await generateAssistantGuide({
        mode: "sync",
        profile,
        answers,
        added: syncResult.added,
        skipped: syncResult.skipped
      });
      installDir = targetDir;
      manifestMode = "sync";
      added = syncResult.added;
      packageJsonMerged = true;
      packageJsonAdded = syncResult.packageJsonAdded;
      break;
    }

    case "playwright-cucumber": {
      console.log(
        chalk.yellow(
          "⚠️ Cucumber+Playwright detected. Automatic sync for this combination isn't built yet — " +
          "adding Testroid into a separate 'testroid/' subfolder to stay safe."
        )
      );
      const result = await scaffoldProject(`${targetDir}/testroid`, answers);
      installDir = `${targetDir}/testroid`;
      manifestMode = "scaffold";
      added = result.added;
      assistantGuideContent = await generateAssistantGuide({ mode: "fresh", answers });
      break;
    }

    case "unknown":
    default: {
      console.log(
        chalk.yellow(
          "⚠️ Couldn't confidently detect your project type. " +
          "Adding Testroid into a separate 'testroid/' subfolder to avoid overwriting anything."
        )
      );
      const result = await scaffoldProject(`${targetDir}/testroid`, answers);
      installDir = `${targetDir}/testroid`;
      manifestMode = "scaffold";
      added = result.added;
      assistantGuideContent = await generateAssistantGuide({ mode: "fresh", answers });
      break;
    }
  }

  console.log("");
  const aiAssistantFile = await writeAiAssistantConfig(installDir, answers.aiAssistant, assistantGuideContent);
  if (aiAssistantFile) added = [...added, aiAssistantFile];

  const failures: StepFailure[] = [];

  console.log("");
  await runTrackedStep(failures, "npm install", "npm install", () => runNpmInstall(installDir));
  await runTrackedStep(
    failures,
    "Playwright browser install",
    "npx playwright install --with-deps",
    () => runPlaywrightInstall(installDir)
  );

  console.log("");
  const reportingResult = await runTrackedStep(
    failures,
    "reporting setup",
    getReportingManualInstallCommand(answers.reportChoice),
    () => configureReporting(installDir, answers.reportChoice)
  );

  let mcpResult: McpInstallResult | undefined;
  if (answers.installPlaywrightMcp) {
    console.log("");
    mcpResult = await runTrackedStep(
      failures,
      "Playwright MCP setup",
      MCP_INSTALL_MANUAL_COMMAND,
      () => installPlaywrightMcp(installDir)
    );
  }

  if (mcpResult?.config.configCreated) added = [...added, ".mcp.json"];

  await writeManifest(installDir, {
    testroidVersion: resolveTestroidVersion(),
    createdAt: new Date().toISOString(),
    mode: manifestMode,
    added,
    packageJson: {
      merged: packageJsonMerged,
      added: {
        dependencies: packageJsonAdded.dependencies,
        devDependencies: [
          ...packageJsonAdded.devDependencies,
          ...(mcpResult?.packageAdded ? [MCP_PACKAGE] : []),
          ...(reportingResult?.packagesAdded ?? [])
        ],
        scripts: [...packageJsonAdded.scripts, ...(reportingResult?.scriptsAdded ?? [])]
      }
    },
    mcp: answers.installPlaywrightMcp && mcpResult
      ? { configCreated: mcpResult.config.configCreated, configEntryAdded: mcpResult.config.configEntryAdded }
      : null,
    reporting: reportingResult
      ? { choice: answers.reportChoice, configEntriesAdded: reportingResult.configEntriesAdded }
      : null
  });

  if (failures.length === 0) {
    printSuccessBanner();
    const testCommand = await resolveTestCommand(installDir);
    const testsAreEmpty = await hasNoTestFiles(installDir);
    printNextSteps(answers, testCommand, installDir !== targetDir, testsAreEmpty);
    return;
  }

  console.log("\n" + chalk.bold.yellow("⚠️  Scaffolding completed, but the following step(s) need manual attention:") + "\n");
  for (const failure of failures) {
    console.log(chalk.red(`  • ${chalk.bold(failure.label)} failed: ${failure.errorMessage}`));
    console.log(chalk.dim(`    To finish setup manually, run: ${failure.manualCommand}`));
  }
  console.log(
    "\n" +
      chalk.dim(
        "Your project files are in place. Fix the issue above, then either run the manual command(s) " +
        "listed or re-run 'testroid init' (it will skip anything already done)."
      )
  );

  process.exitCode = 1;
}

function printSuccessBanner(): void {
  const rule = chalk.green("─".repeat(52));
  console.log(`\n${rule}`);
  console.log(`  ${chalk.bold.greenBright("✅  Testroid is ready to use!")}`);
  console.log(`  ${chalk.bold.magentaBright("Happy testing! 🤖")}`);
  console.log(`${rule}\n`);
}
