import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { logger } from './logger';

interface OrtoniAutoOpenOptions {
  folderPath?: string;
  filename?: string;
}

/**
 * Opens the Ortoni report after every local run without blocking process exit.
 *
 * ortoni-report's own `open: 'always'`/`'on-failure'` option starts an Express server in
 * onExit() and awaits a promise that never resolves (by design, so the server stays up for
 * browsing) — that would hang `npm test` until someone manually hits Ctrl+C, exactly the
 * blocking popup this project's html reporter already avoids via `open: 'never'`. This
 * reporter runs after ortoni-report in the array (so the static file already exists) and
 * pops it open with a detached, unref'd OS command instead, mirroring the old Allure
 * auto-open reporter's approach.
 */
export default class OrtoniAutoOpenReporter implements Reporter {
  constructor(private options: OrtoniAutoOpenOptions = {}) {}

  // Tests that actually ran (i.e. not skipped) — the same signal Ortoni itself effectively
  // uses to decide whether there's anything worth reporting. Zero of these is exactly the
  // "0 tests found or all tests were skipped" case ortoni-report itself calls out via its own
  // "Report generation skipped due to error in Playwright worker!" console line, and the
  // reason index.html never gets written. Left at 0 (its safe default) if onTestEnd never
  // fires at all — e.g. Playwright bails out before running anything — which correctly falls
  // into the same "nothing to report" branch below rather than a false failure alarm.
  private ranCount = 0;

  onTestEnd(_test: TestCase, result: TestResult): void {
    if (result.status !== 'skipped') this.ranCount++;
  }

  async onExit(): Promise<void> {
    if (process.env.CI) return;

    // ortoni-report itself resolves folderPath/filename against process.cwd() when it writes
    // the file (not against this file's own location) — resolving via __dirname here instead
    // diverges the moment Playwright runs with a cwd other than the project root (e.g. invoked
    // with --config from a parent/monorepo directory), silently opening a stale or nonexistent
    // report from a previous run instead of the one this run just generated.
    const folderPath = this.options.folderPath ?? 'ortoni-report';
    const filename = this.options.filename ?? 'index.html';
    const reportPath = path.resolve(process.cwd(), folderPath, filename);

    if (!fs.existsSync(reportPath)) {
      if (this.ranCount === 0) {
        // Expected, normal state — e.g. a fresh scaffold with no specs written yet. Not an
        // error, so plain console output rather than the logger's warning-shaped format.
        console.log('ℹ️  No Ortoni report to open — no tests ran (0 tests found or all tests were skipped).');
      } else {
        // Tests genuinely ran, so a missing report is a real anomaly, not an empty-run
        // no-op — surface it distinctly rather than silently swallowing it like the case above.
        logger.application.testExecution(
          `Ortoni report file wasn't found even though ${this.ranCount} test(s) ran — check the console output above for why report generation may have failed.`
        );
      }
      return;
    }

    try {
      if (process.platform === 'win32') {
        spawn('cmd', ['/c', 'start', '""', reportPath], { stdio: 'ignore', detached: true }).unref();
      } else if (process.platform === 'darwin') {
        spawn('open', [reportPath], { stdio: 'ignore', detached: true }).unref();
      } else {
        spawn('xdg-open', [reportPath], { stdio: 'ignore', detached: true }).unref();
      }
    } catch (error) {
      logger.application.testExecution(`Failed to open Ortoni report: ${(error as Error).message}`);
    }
  }
}
