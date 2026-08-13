import { test as base } from '@playwright/test';
import { logger } from '../utils/logger';
import { NetworkLogger } from '../utils/networkHelper';
import { ConsoleLogger } from '../utils/consoleHelper';

/**
 * Register one fixture per Page Object here as you add them under `pages/`, e.g.:
 *
 * ```ts
 * import { LoginPage } from '../pages/LoginPage';
 *
 * type FixtureSet = { loginPage: LoginPage };
 *
 * export const test = base.extend<FixtureSet>({
 *   loginPage: async ({ page }, use) => {
 *     await use(new LoginPage(page));
 *   },
 * });
 * ```
 */
export const test = base;

export { expect } from '@playwright/test';

export function registerHooks(t: typeof base, suiteName: string): void {
  t.beforeAll(async () => {
    logger.application.startup(`Starting suite: ${suiteName}`);
  });

  t.afterAll(async () => {
    logger.application.startup(`Finished suite: ${suiteName}`);
  });

  t.beforeEach(async ({ page }, testInfo) => {
    logger.execution.testStart(testInfo.title);
    await page.setViewportSize({ width: 1440, height: 900 });

    page.on('request', NetworkLogger.onRequest);
    page.on('response', (response) => {
      NetworkLogger.onResponse(response);
      if (!response.ok()) {
        NetworkLogger.onFailedResponse(response);
      }
    });
    page.on('console', ConsoleLogger.handleMessage);
    page.on('pageerror', ConsoleLogger.handlePageError);
  });

  t.afterEach(async ({ page }, testInfo) => {
    const status = testInfo.status;
    const passed = status === testInfo.expectedStatus;

    if (!passed) {
      logger.error.assertion(`Test ${testInfo.title} failed with status ${status}`);
    }

    logger.execution.testEnd(`${testInfo.title} - Status: ${status}`);
    logger.application.testExecution(`Test ${testInfo.title} completed with status ${status}`);
  });
}
