import type { Reporter } from '@playwright/test/reporter';
import { spawnSync } from 'child_process';
import path from 'path';
import { logger } from './logger';

const isWindows = process.platform === 'win32';
const allureBin = path.resolve(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  isWindows ? 'allure.cmd' : 'allure'
);

const quote = (value: string): string => `"${value}"`;

/**
 * Regenerates the static Allure report from allure-results after every run
 * (pass or fail), without opening it — the Ortoni report is the one that
 * pops up post-run (see ortoniReportConfig.open in playwright.config.ts).
 *
 * Command is built as a single pre-quoted string (rather than an args array)
 * because spawn's shell:true concatenates array args without escaping, which
 * breaks on this repo's path containing spaces ("Playwright AI Framework").
 */
export default class AllureReportGenerator implements Reporter {
  onEnd(): void {
    const resultsDir = path.resolve(__dirname, '..', 'allure-results');
    const reportDir = path.resolve(__dirname, '..', 'allure-report');

    const generateCmd = [
      quote(allureBin),
      'generate',
      '--clean',
      '-o',
      quote(reportDir),
      quote(resultsDir),
    ].join(' ');

    const generate = spawnSync(generateCmd, { stdio: 'ignore', shell: true });

    if (generate.status !== 0) {
      logger.application.testExecution('Allure report generation failed');
    }
  }
}
