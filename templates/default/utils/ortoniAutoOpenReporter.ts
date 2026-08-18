import type { Reporter } from '@playwright/test/reporter';
import { spawn } from 'child_process';
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
