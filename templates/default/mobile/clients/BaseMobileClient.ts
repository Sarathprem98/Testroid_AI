import { logger } from '../../utils/logger';
import { retryAsync } from '../../utils/retryHelper';
import type { MobileLocatorStrategy, MobileLocatorStrategyList, MobilePlatform } from '../types/mobileLocatorTypes';

type OptionalWaitOptions = {
  timeoutMs?: number;
};

// Screen Object base — the mobile-native counterpart to pages/BasePage.ts. Every Screen
// Object extends this and only touches the Appium session through these primitives,
// exactly like a Page Object only touches `page` through BasePage's protected methods.
export class BaseMobileClient {
  protected readonly driver: WebdriverIO.Browser;
  protected readonly platform: MobilePlatform;

  constructor(driver: WebdriverIO.Browser, platform: MobilePlatform) {
    this.driver = driver;
    this.platform = platform;
  }

  private appliesToCurrentPlatform(strategy: MobileLocatorStrategy): boolean {
    if (strategy.kind === 'androidUiAutomator') return this.platform === 'android';
    if (strategy.kind === 'iosPredicate') return this.platform === 'ios';
    return true;
  }

  private toSelectorString(strategy: MobileLocatorStrategy): string {
    switch (strategy.kind) {
      case 'accessibilityId':
        return `~${strategy.id}`;
      case 'androidUiAutomator':
        return `android=${strategy.expression}`;
      case 'iosPredicate':
        return `-ios predicate string:${strategy.expression}`;
      case 'id':
        return `id=${strategy.resourceId}`;
      case 'xpath':
        return strategy.selector;
      default:
        return strategy satisfies never;
    }
  }

  protected getStrategyDescription(strategy: MobileLocatorStrategy): string {
    switch (strategy.kind) {
      case 'accessibilityId':
        return `accessibilityId('${strategy.id}')`;
      case 'androidUiAutomator':
        return `androidUiAutomator('${strategy.expression}')`;
      case 'iosPredicate':
        return `iosPredicate('${strategy.expression}')`;
      case 'id':
        return `id('${strategy.resourceId}')`;
      case 'xpath':
        return strategy.selector;
      default:
        return strategy satisfies never;
    }
  }

  protected async findElement(
    strategies: MobileLocatorStrategyList,
    options: OptionalWaitOptions = {}
  ): Promise<WebdriverIO.Element> {
    const timeoutMs = options.timeoutMs ?? 5000;
    const applicable = strategies.filter((strategy) => this.appliesToCurrentPlatform(strategy));

    return retryAsync(async () => {
      let lastError: Error | undefined;

      for (const strategy of applicable) {
        const element = this.driver.$(this.toSelectorString(strategy));

        try {
          await element.waitForDisplayed({ timeout: timeoutMs });
          return await element.getElement();
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
        }
      }

      throw lastError ?? new Error(`Unable to locate element on ${this.platform} (no applicable strategy matched)`);
    }, { retries: 0 });
  }

  protected async tap(strategies: MobileLocatorStrategyList, options: OptionalWaitOptions = {}): Promise<void> {
    const element = await this.findElement(strategies, options);
    const context = strategies.map((s) => this.getStrategyDescription(s)).join(' | ');

    logger.mobile.gesture(`Tapping ${context}`);
    try {
      await element.click();
    } catch (error) {
      logger.error.exception(`Failed to tap ${context}: ${(error as Error).message}`);
      throw error;
    }
  }

  protected async fill(strategies: MobileLocatorStrategyList, value: string, options: OptionalWaitOptions = {}): Promise<void> {
    const element = await this.findElement(strategies, options);
    const context = strategies.map((s) => this.getStrategyDescription(s)).join(' | ');

    logger.mobile.element(`Setting value on ${context} (length=${value.length})`);
    try {
      await element.setValue(value);
    } catch (error) {
      logger.error.exception(`Failed to set value on ${context}: ${(error as Error).message}`);
      throw error;
    }
  }

  protected async getText(strategies: MobileLocatorStrategyList, options: OptionalWaitOptions = {}): Promise<string> {
    const element = await this.findElement(strategies, options);
    return element.getText();
  }

  protected async isVisible(strategies: MobileLocatorStrategyList, options: OptionalWaitOptions = {}): Promise<boolean> {
    try {
      await this.findElement(strategies, options);
      return true;
    } catch {
      return false;
    }
  }

  protected async waitForElement(
    strategies: MobileLocatorStrategyList,
    state: 'visible' | 'hidden' = 'visible',
    timeoutMs = 5000
  ): Promise<void> {
    const applicable = strategies.filter((strategy) => this.appliesToCurrentPlatform(strategy));
    const [first] = applicable;
    if (!first) {
      throw new Error(`No locator strategy applies to platform ${this.platform}`);
    }
    const element = this.driver.$(this.toSelectorString(first));
    await element.waitForDisplayed({ timeout: timeoutMs, reverse: state === 'hidden' });
  }

  // Modern Appium gesture APIs (driver.execute('mobile: ...')) — the legacy TouchAction
  // API is deprecated across current Appium 2.x drivers, so gestures are always issued
  // per-platform rather than through a single cross-platform touch primitive.
  protected async swipe(direction: 'up' | 'down' | 'left' | 'right', percent = 0.75): Promise<void> {
    logger.mobile.gesture(`Swiping ${direction} (${this.platform})`);
    if (this.platform === 'android') {
      const { width, height } = await this.driver.getWindowSize();
      await this.driver.execute('mobile: swipeGesture', {
        left: 0,
        top: 0,
        width,
        height,
        direction,
        percent,
      });
    } else {
      await this.driver.execute('mobile: swipe', { direction });
    }
  }

  protected async takeScreenshot(name: string): Promise<void> {
    const safeName = name.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
    logger.mobile.session(`Taking screenshot: ${safeName}`);
    try {
      await this.driver.saveScreenshot(`screenshots/mobile-${safeName}.png`);
    } catch {
      // screenshot failed — non-fatal, mirrors pages/BasePage.ts's takeScreenshot
    }
  }
}
