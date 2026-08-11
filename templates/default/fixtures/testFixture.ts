import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SignUpPage } from '../pages/SignUpPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import type { PurchaseData } from '../utils/constants';
import { buildPurchaseData } from '../utils/randomData';
import { logger } from '../utils/logger';
import { NetworkLogger } from '../utils/networkHelper';
import { ConsoleLogger } from '../utils/consoleHelper';

type FixtureSet = {
  homePage: HomePage;
  signUpPage: SignUpPage;
  loginPage: LoginPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  purchaseData: PurchaseData;
};

export const test = base.extend<FixtureSet>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  signUpPage: async ({ page }, use) => {
    await use(new SignUpPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  purchaseData: async ({}, use, testInfo) => {
    const productName = testInfo.title.includes('Nexus 6')
      ? 'Nexus 6'
      : testInfo.title.includes('Sony vaio i5')
        ? 'Sony vaio i5'
        : 'Samsung galaxy s6';

    await use(buildPurchaseData(productName));
  },
});

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
