import { test as base } from '@playwright/test';
import { logger } from '../../utils/logger';

// Mirrors api/fixtures/apiHooks.ts's registerApiHooks: logging only, never touches
// `page` (referencing it would force a browser launch this Appium-driven project
// doesn't need) and never touches `mobileDriver` (session lifecycle is owned by
// mobileFixture.ts, not the hooks).
export const registerMobileHooks = (test: typeof base, suiteName: string): void => {
  test.beforeAll(async () => {
    logger.application.startup(`Starting Mobile suite: ${suiteName}`);
  });

  test.afterAll(async () => {
    logger.application.startup(`Finished Mobile suite: ${suiteName}`);
  });

  test.beforeEach(async ({}, testInfo) => {
    logger.execution.testStart(testInfo.title);
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      logger.error.assertion(`Mobile test ${testInfo.title} failed`);
    }
    logger.execution.testEnd(`${testInfo.title} [${testInfo.status}]`);
  });
};
