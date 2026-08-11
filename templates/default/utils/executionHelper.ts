import { type Page } from '@playwright/test';
import { logger } from '../utils/logger';

export class ExecutionLogger {
  static async logTestStart(page: Page, testName: string): Promise<void> {
    logger.execution.testStart(testName);
    const context = page.context();
    const browser = context?.browser();

    if (browser) {
      logger.application.browser(`Browser launched for test: ${testName}`);
      try {
        logger.execution.browserInfo(`Browser: ${(browser as any).name()}`);
      } catch {
        logger.execution.browserInfo('Browser: unknown');
      }
    }
  }

  static logTestEnd(testName: string, status: string, duration: number): void {
    logger.execution.testEnd(`${testName} - Status: ${status}`);
    logger.execution.duration(`Duration: ${duration}ms`);
    logger.application.testExecution(`Test ${testName} completed with status ${status}`);
  }

  static logRetry(testName: string, attempt: number, reason: string): void {
    logger.execution.retry(`Retry #${attempt} for ${testName}: ${reason}`);
    logger.warning.retry(`Retry attempt ${attempt} for ${testName}: ${reason}`);
  }

  static logBrowserClose(): void {
    logger.application.browser('Browser closed');
  }
}
