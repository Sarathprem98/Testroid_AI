import { test as base } from '@playwright/test';
import { logger } from '../utils/logger';
import { captureFailureScreenshot } from '../utils/screenshotHelper';
import { scanAccessibility } from '../utils/accessibilityHelper';

export const registerHooks = (test: typeof base, suiteName: string): void => {
  test.beforeAll(async () => {
    logger.application.startup(`Starting suite: ${suiteName}`);
  });

  test.afterAll(async () => {
    logger.application.startup(`Finished suite: ${suiteName}`);
  });

  test.beforeEach(async ({ page }, testInfo) => {
    logger.execution.testStart(testInfo.title);

    if (!testInfo.project.use.isMobile) {
      await page.setViewportSize({ width: 1440, height: 900 });
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await captureFailureScreenshot(page, testInfo, testInfo.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase());
    }

    await scanAccessibility(page, testInfo);

    logger.execution.testEnd(`${testInfo.title} [${testInfo.status}]`);
  });
};
