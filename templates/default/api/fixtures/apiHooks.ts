import { test as base } from '@playwright/test';
import { logger } from '../../utils/logger';

// Mirrors tests/hooks.ts's registerHooks, but never touches the `page` fixture —
// referencing `page` here would force Playwright to launch a browser per test even
// though API specs only need `request`, defeating the point of a lightweight API project.
export const registerApiHooks = (test: typeof base, suiteName: string): void => {
  test.beforeAll(async () => {
    logger.application.startup(`Starting API suite: ${suiteName}`);
  });

  test.afterAll(async () => {
    logger.application.startup(`Finished API suite: ${suiteName}`);
  });

  test.beforeEach(async ({}, testInfo) => {
    logger.execution.testStart(testInfo.title);
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      logger.error.assertion(`API test ${testInfo.title} failed with status ${testInfo.status}`);
    }
    logger.execution.testEnd(`${testInfo.title} [${testInfo.status}]`);
  });
};
