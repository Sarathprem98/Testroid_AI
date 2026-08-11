import type { Page, TestInfo } from '@playwright/test';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { logger } from './logger';

export type AccessibilityScanOptions = {
  /** WCAG/axe tags to scan against. Defaults to axe's WCAG 2.1 A/AA rule set. */
  tags?: string[];
  /** CSS selectors to exclude from the scan (e.g. third-party widgets). */
  exclude?: string[];
};

const DEFAULT_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const buildAxe = (page: Page, options: AccessibilityScanOptions = {}) => {
  let builder = new AxeBuilder({ page }).withTags(options.tags ?? DEFAULT_TAGS);

  for (const selector of options.exclude ?? []) {
    builder = builder.exclude(selector);
  }

  return builder;
};

/**
 * Runs an axe-core scan and logs/attaches results without failing the test.
 * Used passively from hooks so every test gets accessibility visibility
 * without turning pre-existing Demoblaze violations into hard failures.
 */
export const scanAccessibility = async (
  page: Page,
  testInfo: TestInfo,
  options: AccessibilityScanOptions = {}
): Promise<void> => {
  if (page.isClosed()) {
    return;
  }

  logger.accessibility.scanStart(testInfo.title);

  try {
    const results = await buildAxe(page, options).analyze();

    if (results.violations.length === 0) {
      logger.accessibility.clean(testInfo.title);
      return;
    }

    for (const violation of results.violations) {
      logger.accessibility.violation(
        `[${violation.impact ?? 'unknown'}] ${violation.id} - ${violation.help} (${violation.nodes.length} node(s)) - ${testInfo.title}`
      );
    }

    await testInfo.attach(`accessibility-violations-${testInfo.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`, {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });
  } catch (error) {
    logger.accessibility.scanFailed(`${testInfo.title}: ${(error as Error).message}`);
  }
};

/**
 * Runs an axe-core scan and asserts zero violations. For dedicated
 * @a11y specs that check a specific, known-good page state.
 */
export const expectNoAccessibilityViolations = async (
  page: Page,
  options: AccessibilityScanOptions = {}
): Promise<void> => {
  const results = await buildAxe(page, options).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
};
