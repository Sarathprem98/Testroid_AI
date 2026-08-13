import { expect, type Locator, type Page } from '@playwright/test';
import { logger } from '../utils/logger';
import { type LocatorStrategy, type LocatorStrategyList, locatorConstants } from '../locators/locatorConstants';
import { retryAsync } from '../utils/retryHelper';
import { ConsoleLogger } from '../utils/consoleHelper';

type OptionalWaitOptions = {
  timeoutMs?: number;
  force?: boolean;
};

type CapturedConsoleMessage = {
  type: string;
  text: string;
};

/**
 * Base class every Page Object extends. Owns the "auto-healing" locator strategy:
 * an element is described as an ordered `LocatorStrategyList` (see
 * `locators/locatorConstants.ts`) instead of a single selector, and `findElement`/
 * `findElements` walk that list — most semantic first, most brittle last — returning
 * the first strategy that actually resolves. If a site's markup changes and breaks
 * the primary strategy, a Page Object built on `BasePage` keeps working as long as
 * one of the fallback strategies still matches, instead of failing outright.
 */
export class BasePage {
  protected readonly page: Page;
  private consoleMessages: CapturedConsoleMessage[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  protected async goto(path = '/'): Promise<void> {
    logger.ui.navigation(`Navigating to ${path}`);
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  protected async reload(): Promise<void> {
    logger.ui.navigation('Reloading page');
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  protected async pressKey(key: string): Promise<void> {
    logger.ui.click(`Pressing key: ${key}`);
    await this.page.keyboard.press(key);
  }

  protected startConsoleCapture(): void {
    this.consoleMessages = [];
    this.page.on('console', (message) => {
      this.consoleMessages.push({ type: message.type(), text: message.text() });
      ConsoleLogger.handleMessage(message);
    });
    this.page.on('pageerror', (error) => {
      this.consoleMessages.push({ type: 'pageerror', text: error.message });
      ConsoleLogger.handlePageError(error);
    });
  }

  protected getCapturedConsoleMessages(): CapturedConsoleMessage[] {
    return this.consoleMessages;
  }

  protected async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  protected buildLocator(strategy: LocatorStrategy): Locator {
    switch (strategy.kind) {
      case 'role':
        return this.page.getByRole(strategy.role, { name: strategy.name });
      case 'label':
        return this.page.getByLabel(strategy.text);
      case 'placeholder':
        return this.page.getByPlaceholder(strategy.text);
      case 'text':
        return this.page.getByText(strategy.text);
      case 'testId':
        return this.page.getByTestId(strategy.testId);
      case 'css':
        return this.page.locator(strategy.selector);
      default:
        return this.page.locator('html');
    }
  }

  /** Walks `strategies` in order, returning the first one that resolves within `timeoutMs`. */
  protected async findElement(strategies: LocatorStrategyList, options: OptionalWaitOptions = {}): Promise<Locator> {
    const timeoutMs = options.timeoutMs ?? 5000;

    return retryAsync(async () => {
      let lastError: Error | undefined;

      for (const strategy of strategies) {
        const locator = this.buildLocator(strategy).first();

        try {
          await locator.waitFor({ state: 'visible', timeout: timeoutMs });
          return locator;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
        }
      }

      throw lastError ?? new Error('Unable to locate element');
    }, { retries: 0 });
  }

  protected getStrategyDescription(strategy: LocatorStrategy): string {
    switch (strategy.kind) {
      case 'role':
        return `getByRole('${strategy.role}')`;
      case 'label':
        return `getByLabel('${strategy.text}')`;
      case 'placeholder':
        return `getByPlaceholder('${strategy.text}')`;
      case 'text':
        return `getByText('${strategy.text}')`;
      case 'testId':
        return `getByTestId('${strategy.testId}')`;
      case 'css':
        return strategy.selector;
      default:
        return 'unknown';
    }
  }

  protected async click(strategies: LocatorStrategyList, options: OptionalWaitOptions = {}): Promise<void> {
    const locator = await this.findElement(strategies, options);
    const context = strategies.map(s => this.getStrategyDescription(s)).join(' | ');

    logger.ui.click(`Clicking ${context}`);
    try {
      await locator.click({ timeout: 3000, force: options.force ?? false });
    } catch (error) {
      logger.error.exception(`Failed to click ${context}: ${(error as Error).message}`);
      throw error;
    }
  }

  protected async fill(strategies: LocatorStrategyList, value: string, options: OptionalWaitOptions = {}): Promise<void> {
    const locator = await this.findElement(strategies, options);
    const context = strategies.map(s => this.getStrategyDescription(s)).join(' | ');

    logger.ui.fill(`Filling "${context}" with value length=${value.length}`);
    try {
      await locator.fill(value, { timeout: 3000 });
    } catch (error) {
      logger.error.exception(`Failed to fill "${context}": ${(error as Error).message}`);
      throw error;
    }
  }

  protected async selectOption(strategies: LocatorStrategyList, value: string, options: OptionalWaitOptions = {}): Promise<void> {
    const locator = await this.findElement(strategies, options);
    const context = strategies.map(s => this.getStrategyDescription(s)).join(' | ');

    logger.ui.dropdown(`Selecting "${value}" in ${context}`);
    try {
      await locator.selectOption(value, { timeout: 3000 });
    } catch (error) {
      logger.error.exception(`Failed to select in "${context}": ${(error as Error).message}`);
      throw error;
    }
  }

  protected async check(strategies: LocatorStrategyList, options: OptionalWaitOptions = {}): Promise<void> {
    const locator = await this.findElement(strategies, options);
    const context = strategies.map(s => this.getStrategyDescription(s)).join(' | ');

    logger.ui.check(`Checking ${context}`);
    try {
      await locator.check({ timeout: 3000 });
    } catch (error) {
      logger.error.exception(`Failed to check ${context}: ${(error as Error).message}`);
      throw error;
    }
  }

  protected async uncheck(strategies: LocatorStrategyList, options: OptionalWaitOptions = {}): Promise<void> {
    const locator = await this.findElement(strategies, options);
    const context = strategies.map(s => this.getStrategyDescription(s)).join(' | ');

    logger.ui.check(`Unchecking ${context}`);
    try {
      await locator.uncheck({ timeout: 3000 });
    } catch (error) {
      logger.error.exception(`Failed to uncheck ${context}: ${(error as Error).message}`);
      throw error;
    }
  }

  protected async hover(strategies: LocatorStrategyList, options: OptionalWaitOptions = {}): Promise<void> {
    const locator = await this.findElement(strategies, options);
    const context = strategies.map(s => this.getStrategyDescription(s)).join(' | ');

    logger.ui.hover(`Hovering over ${context}`);
    try {
      await locator.hover({ timeout: 3000 });
    } catch (error) {
      logger.error.exception(`Failed to hover ${context}: ${(error as Error).message}`);
      throw error;
    }
  }

  protected async waitForElement(strategies: LocatorStrategyList, state: 'visible' | 'hidden' | 'attached' = 'visible', timeoutMs = 3000): Promise<void> {
    const locator = await this.findElement(strategies, { timeoutMs });
    logger.debug.locator(`Waiting for element state=${state}`);
    await locator.waitFor({ state, timeout: timeoutMs });
  }

  protected async waitForPageLoad(timeoutMs = 3000): Promise<void> {
    logger.debug.internal(`Waiting for page load state=networkidle`);
    try {
      await this.page.waitForLoadState('networkidle', { timeout: timeoutMs });
    } catch (error) {
      logger.warning.slowElement(`Page load exceeded ${timeoutMs}ms`);
      throw error;
    }
  }

  protected async takeScreenshot(name: string): Promise<void> {
    const safeName = name.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
    logger.execution.screenshot(`Taking screenshot: ${safeName}`);
    try {
      await this.page.screenshot({ path: `screenshots/${safeName}.png`, fullPage: true });
    } catch {
      // screenshot failed
    }
  }

  protected async scrollIntoView(strategies: LocatorStrategyList, options: OptionalWaitOptions = {}): Promise<void> {
    const locator = await this.findElement(strategies, options);
    const context = strategies.map(s => this.getStrategyDescription(s)).join(' | ');
    logger.debug.internal(`Scrolling into view: ${context}`);
    try {
      await locator.scrollIntoViewIfNeeded();
    } catch (error) {
      logger.warning.slowElement(`Scroll failed for ${context}: ${(error as Error).message}`);
    }
  }

  protected async getText(strategies: LocatorStrategyList, options: OptionalWaitOptions = {}): Promise<string> {
    const locator = await this.findElement(strategies, options);
    logger.debug.locator('Getting text');
    try {
      const text = await locator.textContent({ timeout: 3000 });
      return text ?? '';
    } catch (error) {
      logger.error.exception(`Failed to get text: ${(error as Error).message}`);
      throw error;
    }
  }

  protected async isVisible(strategies: LocatorStrategyList, options: OptionalWaitOptions = {}): Promise<boolean> {
    logger.debug.locator('Checking visibility');
    try {
      await this.findElement(strategies, options);
      return true;
    } catch {
      return false;
    }
  }

  protected async expectVisible(strategies: LocatorStrategyList): Promise<void> {
    logger.debug.locator('Asserting element is visible');
    const locator = await this.findElement(strategies);
    await expect(locator).toBeVisible();
  }

  protected async expectHidden(strategies: LocatorStrategyList): Promise<void> {
    logger.debug.locator('Asserting element is not present');
    const locator = this.buildLocator(strategies[0]);
    await expect(locator).toHaveCount(0);
  }

  protected async expectImageLoaded(strategies: LocatorStrategyList): Promise<void> {
    logger.debug.locator('Asserting image loaded (naturalWidth > 0)');
    const locator = await this.findElement(strategies);
    await expect(async () => {
      const naturalWidth = await locator.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }).toPass({ timeout: 5000 });
  }

  protected async expectAllImagesLoaded(strategies: LocatorStrategyList): Promise<void> {
    logger.debug.locator('Asserting all matched images loaded (naturalWidth > 0)');
    const locator = await this.findElements(strategies);
    await expect(async () => {
      const naturalWidths = await locator.evaluateAll((imgs: HTMLImageElement[]) => imgs.map(img => img.naturalWidth));
      expect(naturalWidths.length).toBeGreaterThan(0);
      for (const width of naturalWidths) {
        expect(width).toBeGreaterThan(0);
      }
    }).toPass({ timeout: 5000 });
  }

  /** Same fallback walk as `findElement`, but returns every match of the winning strategy. */
  protected async findElements(strategies: LocatorStrategyList, options: OptionalWaitOptions = {}): Promise<Locator> {
    const timeoutMs = options.timeoutMs ?? 5000;

    return retryAsync(async () => {
      let lastError: Error | undefined;

      for (const strategy of strategies) {
        const locator = this.buildLocator(strategy);

        try {
          await locator.first().waitFor({ state: 'visible', timeout: timeoutMs });
          return locator;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
        }
      }

      throw lastError ?? new Error('Unable to locate elements');
    }, { retries: 0 });
  }

  protected async getAllTexts(strategies: LocatorStrategyList, options: OptionalWaitOptions = {}): Promise<string[]> {
    const locator = await this.findElements(strategies, options);
    logger.debug.locator('Getting all texts');
    const texts = await locator.allTextContents();
    return texts.map(text => text.trim()).filter(Boolean);
  }

  protected async expectText(strategies: LocatorStrategyList, expected: string | RegExp): Promise<void> {
    logger.debug.locator(`Asserting text "${expected}"`);
    const locator = await this.findElement(strategies);
    await expect(locator).toContainText(expected);
  }

  protected async acceptDialog(action: () => Promise<void>): Promise<string> {
    const dialogMessage = new Promise<string>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        const message = dialog.message();
        await dialog.accept();
        resolve(message);
      });
    });

    await action();
    return await dialogMessage;
  }

  protected async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    return await retryAsync(operation);
  }

  protected async assertCurrentUrl(expected: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(expected);
  }

  protected async assertTitle(expected: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(expected);
  }

  /** Site-specific locator groups from `locators/locatorConstants.ts`, e.g. `this.locators.login`. */
  protected readonly locators = locatorConstants;
}
