import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import os from "os";
import chalk from "chalk";
import ora from "ora";
import { getExecaErrorDetail } from "./execaError";

export async function runNpmInstall(targetDir: string) {
  const nodeModulesPath = path.join(targetDir, "node_modules");
  const pkgLockPath = path.join(targetDir, "package-lock.json");

  const nodeModulesExists = await fs.pathExists(nodeModulesPath);

  if (nodeModulesExists) {
    console.log(chalk.dim("⏭️  node_modules already present — skipping npm install"));
    console.log(chalk.dim("   (run 'npm install' manually if you added new dependencies)"));
    return;
  }

  // No `stdio: 'inherit'` — the child's raw output would tear through the spinner's
  // animation frame. execa captures it instead, surfaced via getExecaErrorDetail() on failure.
  //
  // stdin: 'ignore' is deliberate, not an oversight: execa's own default stdin is 'pipe'
  // (see its docs — `'inherit'` only applies to the `$` tagged-template form, not this plain
  // call form), which opens a pipe that's never written to or closed. If npm (e.g. its
  // one-time telemetry/onboarding prompt on a fresh machine) or any dependency's
  // install/postinstall script ever tries to read a line from stdin, that read blocks
  // forever on the dead pipe — invisible since output is captured for the spinner, and
  // recoverable only by Ctrl+C. `stdin: 'ignore'` makes any such read see immediate EOF
  // instead. `--no-audit --no-fund` additionally skips npm's own known post-install
  // network/notice steps rather than relying on the EOF fallback for those specifically.
  const spinner = ora("Installing npm dependencies...").start();
  try {
    await execa("npm", ["install", "--no-audit", "--no-fund"], { cwd: targetDir, stdin: "ignore" });
    spinner.succeed(chalk.green("npm install complete"));
  } catch (err) {
    spinner.fail(chalk.red("npm install failed — please run it manually."));
    const detail = getExecaErrorDetail(err);
    if (detail) console.error(chalk.dim(detail));
    throw err;
  }

  void pkgLockPath; // reserved for future lock-diff checks
}

export async function runPlaywrightInstall(targetDir: string) {
  // Check if Playwright browsers are already cached
  const isInstalled = await checkPlaywrightBrowsersInstalled();

  if (isInstalled) {
    console.log(chalk.dim("⏭️  Playwright browsers already installed — skipping"));
    return;
  }

  // stdin: 'ignore' — same reasoning as runNpmInstall above: without it, a dead stdin pipe
  // can hang this indefinitely if anything in the process tree ever tries to read from it.
  const spinner = ora("Installing Playwright browsers (this may take a minute)...").start();
  try {
    await execa("npx", ["playwright", "install", "--with-deps"], { cwd: targetDir, stdin: "ignore" });
    spinner.succeed(chalk.green("Playwright browsers installed"));
  } catch (err) {
    spinner.fail(chalk.red("Playwright browser install failed — please run it manually:"));
    console.error(chalk.dim("   npx playwright install --with-deps"));
    const detail = getExecaErrorDetail(err);
    if (detail) console.error(chalk.dim(detail));
    throw err;
  }
}

async function checkPlaywrightBrowsersInstalled(): Promise<boolean> {
  const cacheDir =
    process.platform === "win32"
      ? path.join(os.homedir(), "AppData", "Local", "ms-playwright")
      : process.platform === "darwin"
      ? path.join(os.homedir(), "Library", "Caches", "ms-playwright")
      : path.join(os.homedir(), ".cache", "ms-playwright");

  const exists = await fs.pathExists(cacheDir);
  if (!exists) return false;

  const entries = await fs.readdir(cacheDir).catch(() => []);
  // Look for at least one of the core browser folders
  const hasBrowsers = entries.some(
    (e) => e.startsWith("chromium") || e.startsWith("firefox") || e.startsWith("webkit")
  );

  return hasBrowsers;
}
