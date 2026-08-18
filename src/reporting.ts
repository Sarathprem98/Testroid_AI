import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import chalk from "chalk";
import ora from "ora";
import { getExecaErrorDetail } from "./execaError";

export type ReportChoice = "allure" | "ortoni";

const PACKAGES_BY_CHOICE: Record<ReportChoice, string[]> = {
  allure: ["allure-playwright", "allure-commandline"],
  ortoni: ["ortoni-report"],
};

// Exact pins (no ^ or @latest) for packages installed dynamically at CLI runtime —
// keep these in sync with templates/default/package.json's own caret-pinned versions.
// Pinned to avoid breaking changes — review periodically.
const PACKAGE_VERSIONS: Record<string, string> = {
  "allure-playwright": "3.10.2",
  "allure-commandline": "2.43.0",
  "ortoni-report": "4.10.0",
};

export function getReportingManualInstallCommand(choice: ReportChoice): string {
  const versionedSpecifiers = PACKAGES_BY_CHOICE[choice].map((pkg) => `${pkg}@${PACKAGE_VERSIONS[pkg]}`);
  return `npm install -D ${versionedSpecifiers.join(" ")}`;
}

const REPORT_ALLURE_SCRIPT = "allure generate --clean -o allure-report allure-results && allure open allure-report";

const ALLURE_ENTRIES =
`    ['allure-playwright', { outputFolder: 'allure-results', suiteTitle: false, detail: true }],
    ['./utils/allureReportGenerator.ts'],`;

const ORTONI_ENTRIES =
`    ['ortoni-report', {
      // 'never' — ortoni-report's own 'always'/'on-failure' would spin up a blocking
      // Express server; './utils/ortoniAutoOpenReporter.ts' below opens the generated
      // file without holding the process instead.
      open: 'never',
      folderPath: 'ortoni-report',
      filename: 'index.html',
      title: 'Ortoni Test Report',
    }],
    ['./utils/ortoniAutoOpenReporter.ts', { folderPath: 'ortoni-report', filename: 'index.html' }],`;

// Matches a reporter entry `['<name>', ...]` or `['<name>']` non-greedily up to its own
// closing `]` — safe because none of these entries' configs contain array literals, only
// object literals or a bare identifier, so the first `]` encountered is always their own.
const ALLURE_ENTRY_PATTERNS = [
  /\[\s*['"]allure-playwright['"]\s*,[\s\S]*?\]\s*,?\s*\n?/,
  /\[\s*['"]\.\/utils\/allureReportGenerator\.ts['"]\s*\]\s*,?\s*\n?/,
];
const ORTONI_ENTRY_PATTERNS = [
  /\[\s*['"]ortoni-report['"]\s*,[\s\S]*?\]\s*,?\s*\n?/,
  /\[\s*['"]\.\/utils\/ortoniAutoOpenReporter\.ts['"]\s*(,[\s\S]*?)?\]\s*,?\s*\n?/,
];

async function getInstalledDeps(targetDir: string): Promise<Record<string, string>> {
  const pkgPath = path.join(targetDir, "package.json");
  if (!(await fs.pathExists(pkgPath))) return {};

  const pkg = await fs.readJson(pkgPath).catch(() => ({}));
  return { ...pkg.dependencies, ...pkg.devDependencies };
}

async function ensurePackagesInstalled(targetDir: string, choice: ReportChoice): Promise<void> {
  const required = PACKAGES_BY_CHOICE[choice];
  const installed = await getInstalledDeps(targetDir);
  const missing = required.filter((pkg) => !(pkg in installed));

  if (missing.length === 0) {
    console.log(chalk.dim(`⏭️  ${required.join(", ")} already installed — skipping`));
    return;
  }

  const versionedSpecifiers = missing.map((pkg) => `${pkg}@${PACKAGE_VERSIONS[pkg]}`);

  const spinner = ora(`Installing ${versionedSpecifiers.join(", ")}...`).start();
  try {
    // stdin: 'ignore' + --no-audit/--no-fund: without stdio: 'inherit' (dropped so the
    // child's raw output can't tear through the spinner), execa's own default stdin is an
    // open pipe that's never written to or closed — anything in npm's process tree that
    // tries to read a line from it (npm's own one-time prompts, a lifecycle script, ...)
    // blocks forever instead of erroring, invisibly, until Ctrl+C. This guarantees EOF
    // instead, and skips npm's own known post-install steps proactively.
    await execa("npm", ["install", "-D", ...versionedSpecifiers, "--no-audit", "--no-fund"], {
      cwd: targetDir,
      stdin: "ignore"
    });
    spinner.succeed(chalk.green(`${versionedSpecifiers.join(", ")} installed`));
  } catch (err) {
    spinner.fail(chalk.red("Install failed — please run it manually:"));
    console.error(chalk.dim(`   npm install -D ${versionedSpecifiers.join(" ")}`));
    const detail = getExecaErrorDetail(err);
    if (detail) console.error(chalk.dim(detail));
    throw err;
  }
}

async function ensureAllureScript(targetDir: string): Promise<void> {
  const pkgPath = path.join(targetDir, "package.json");
  if (!(await fs.pathExists(pkgPath))) return;

  const pkg = await fs.readJson(pkgPath).catch(() => undefined);
  if (!pkg) return;

  if (pkg.scripts?.["report:allure"]) {
    console.log(chalk.dim('⏭️  "report:allure" script already present — not touched'));
    return;
  }

  pkg.scripts = { ...pkg.scripts, "report:allure": REPORT_ALLURE_SCRIPT };
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  console.log(chalk.green('✅ Added "report:allure" script to package.json (run after tests to view the Allure report)'));
}

/**
 * Finds the full `[ ... ]` span of the `reporter:` array in a playwright.config.ts source
 * string via bracket-depth counting (string-literal aware), so a reporter entry containing
 * a `/` in a path, etc. can't prematurely close the scan. Returns null if no `reporter:`
 * array is found.
 */
function findReporterArrayRange(source: string): { start: number; end: number } | null {
  const keyMatch = /reporter\s*:\s*\[/.exec(source);
  if (!keyMatch) return null;

  const start = keyMatch.index + keyMatch[0].length - 1; // index of the opening '['
  let depth = 0;
  let inString: string | null = null;

  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    const prev = source[i - 1];

    if (inString) {
      if (ch === inString && prev !== "\\") inString = null;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }

    if (ch === "[") {
      depth++;
    } else if (ch === "]") {
      depth--;
      if (depth === 0) return { start, end: i };
    }
  }

  return null;
}

/**
 * Rewrites only the contents of the `reporter: [...]` array: removes any existing
 * allure/ortoni entries (so switching choices is idempotent) and appends the chosen
 * tool's entries. Every other reporter entry (list/html/junit/json, or anything a synced
 * project already had) is left exactly as-is — nothing outside the array is touched.
 */
function upsertReporterEntries(source: string, choice: ReportChoice): string | null {
  const range = findReporterArrayRange(source);
  if (!range) return null;

  let body = source.slice(range.start + 1, range.end);

  for (const pattern of [...ALLURE_ENTRY_PATTERNS, ...ORTONI_ENTRY_PATTERNS]) {
    body = body.replace(pattern, "");
  }
  body = body.replace(/\n[ \t]*\n+/g, "\n"); // collapse blank lines left behind by removals

  body = body.replace(/\s+$/, "");
  if (body.trim().length > 0 && !body.trimEnd().endsWith(",")) {
    body += ",";
  }

  const entries = choice === "allure" ? ALLURE_ENTRIES : ORTONI_ENTRIES;
  body = `${body}\n${entries}\n  `;

  return source.slice(0, range.start + 1) + body + source.slice(range.end);
}

async function updatePlaywrightConfigReporter(targetDir: string, choice: ReportChoice): Promise<void> {
  const configPath = path.join(targetDir, "playwright.config.ts");
  if (!(await fs.pathExists(configPath))) {
    console.log(chalk.dim("⏭️  No playwright.config.ts found — skipping reporter wiring"));
    return;
  }

  const source = await fs.readFile(configPath, "utf8");
  const updated = upsertReporterEntries(source, choice);

  if (!updated) {
    console.log(
      chalk.yellow(
        "⚠️  Couldn't find a reporter: [...] array in playwright.config.ts — leaving it untouched. " +
        `Add the ${choice === "allure" ? "allure-playwright" : "ortoni-report"} reporter manually if you want it wired in.`
      )
    );
    return;
  }

  await fs.writeFile(configPath, updated);
  console.log(chalk.green(`✅ Wired ${choice === "allure" ? "Allure Report" : "Ortoni Report"} into playwright.config.ts's reporter array`));
}

export async function configureReporting(targetDir: string, choice: ReportChoice): Promise<void> {
  await ensurePackagesInstalled(targetDir, choice);

  if (choice === "allure") {
    await ensureAllureScript(targetDir);
  }

  await updatePlaywrightConfigReporter(targetDir, choice);

  if (choice === "ortoni") {
    console.log(chalk.dim("ℹ️  Ortoni Report opens automatically after each local test run (skipped in CI)."));
  } else {
    console.log(chalk.dim('ℹ️  Allure Report can\'t auto-open (it needs a local server) — run "npm run report:allure" after tests to generate + view it.'));
  }
}
