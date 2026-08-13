#!/usr/bin/env node

function checkNodeVersion(version: string): void {
  const major = Number(version.replace(/^v/, "").split(".")[0]);
  if (Number.isNaN(major) || major < 18) {
    console.error(
      `Testroid requires Node.js 18 or later. You're running ${version}. Please upgrade: https://nodejs.org`
    );
    process.exit(1);
  }
}

checkNodeVersion(process.version);

// Loaded via require() (not import) so this runs strictly after the version
// check above: `import` statements get hoisted above other top-level code
// by the TS/esbuild CJS output, which would defeat the check's purpose.
const { Command } = require("commander") as typeof import("commander");
const { initCommand } = require("./commands/init") as typeof import("./commands/init");
// chalk ships as pure ESM (no CJS build) — required here via Node's native require(esm)
// interop, the same approach already used for execa across this codebase's CJS build.
// Its default export has to be unwrapped by hand (`.default`) since this file uses
// require() rather than a static `import`, to keep the version check above running first.
const chalk = (require("chalk") as typeof import("chalk")).default;
// semver is a plain CJS package (no interop concerns) but still goes through require()
// rather than a static `import`, purely to preserve this file's version-check-first
// ordering like everything else here.
const semver = require("semver") as typeof import("semver");
// update-notifier (like chalk) ships as pure ESM only from v6 onward — same
// require(esm) interop + manual `.default` unwrap. Its own v7 API isn't covered by
// DefinitelyTyped's `@types/update-notifier` (that package still targets the older
// v6 shape), so rather than fight a mismatched `typeof import(...)` cast, it's typed
// here with a small local interface covering only what this file actually uses.
interface UpdateNotifierUpdate {
  current: string;
  latest: string;
}
interface UpdateNotifierInstance {
  update?: UpdateNotifierUpdate;
}
type UpdateNotifierFn = (options: {
  pkg: { name: string; version: string };
  updateCheckInterval?: number;
}) => UpdateNotifierInstance;
const updateNotifier = (require("update-notifier") as { default: UpdateNotifierFn }).default;

const pkg = require("../package.json") as { name: string; version: string };

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

// Best-effort, non-blocking check for a newer version on npm — relevant to `npm install -g
// testroid` users, since `npx testroid` always fetches latest on its own. update-notifier's
// `check()` (called internally by the factory below) only ever does a synchronous read of a
// local cache file; the actual registry lookup runs in a detached background process that
// this run doesn't wait on, so it can never slow down or block the current command. Any
// failure (offline, registry down, cache unwritable, etc.) is swallowed so it's silent.
function notifyIfUpdateAvailable(): void {
  try {
    const notifier = updateNotifier({
      pkg,
      // update-notifier's own default — set explicitly so the interval is documented here
      // rather than relied on implicitly. Re-checks the registry at most once per day.
      updateCheckInterval: ONE_DAY_MS
    });

    const update = notifier.update;
    if (!update || !semver.gt(update.latest, update.current)) return;

    // Deferred to process exit — same convention update-notifier's own `.notify()` uses —
    // so this appears after the command's own output instead of interrupting the banner.
    process.on("exit", () => {
      const rule = chalk.yellow("─".repeat(52));
      console.log(`\n${rule}`);
      console.log(
        `  ${chalk.bold.yellow("⬆️  Update available:")} ${chalk.dim(update.current)} ${chalk.reset("→")} ${chalk.green.bold(update.latest)}`
      );
      console.log(`  Run ${chalk.cyan(`npm install -g ${pkg.name}@latest`)} to update`);
      console.log(`${rule}\n`);
    });
  } catch {
    // Never let a failed update check affect the CLI itself.
  }
}

notifyIfUpdateAvailable();

function printBanner(): void {
  const rule = chalk.cyan("─".repeat(52));
  console.log(`\n${rule}`);
  console.log(`  ${chalk.bold.cyanBright("🤖  Testroid")}`);
  console.log(`  ${chalk.dim("AI-powered Playwright test automation, scaffolded in seconds")}`);
  console.log(`${rule}\n`);
}

const program = new Command();

program
  .name("testroid")
  .description("Scaffold the Testroid AI test automation framework")
  .version(pkg.version);

program
  .command("init")
  .description("Initialize Testroid in the current folder")
  .option("-y, --yes", "Skip all interactive prompts and use sensible defaults (for CI/scripting)")
  .option("--url <url>", "Base URL of the site under test (required with --yes, unless already set in .env)")
  .action(async (options: { yes?: boolean; url?: string }) => {
    printBanner();
    await initCommand(options);
  });

program.parse();
