import { defineConfig, devices } from '@playwright/test';
import { OrtoniReportConfig } from 'ortoni-report';
import dotenv from 'dotenv';
import path from 'path';
import * as os from 'os';
import { NetworkLogger } from './utils/networkHelper';
import { ConsoleLogger } from './utils/consoleHelper';
import { ExecutionLogger } from './utils/executionHelper';
import { logger } from './utils/logger';

dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

const ortoniReportConfig: OrtoniReportConfig = {
  // 'never' here — ortoni-report's own 'always'/'on-failure' spins up an Express server in
  // onExit() that blocks forever awaiting Ctrl+C. OrtoniAutoOpenReporter below pops the
  // generated file open without holding the process, so `npm test` still exits normally.
  open: 'never',
  folderPath: 'ortoni-report',
  filename: 'index.html',
  title: 'Ortoni Test Report',
  projectName: 'Playwright AI Framework',
  testType: 'Functional',
  authorName: os.userInfo().username,
  base64Image: false,
  stdIO: false,
  meta: {
    'Test Cycle': 'Feb, 2026',
    version: '4',
    description: 'My automation suite',
    release: '0.6',
    platform: os.type(),
  },
};

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
const apiBaseURL = process.env.API_BASE_URL ?? 'http://localhost:3000/api';
const headless = toBoolean(process.env.HEADLESS, true);
const slowMo = toNumber(process.env.SLOW_MO, 0);
const timeout = toNumber(process.env.TIMEOUT, 30000);
const retries = toNumber(process.env.RETRIES, 0);
const workers = toNumber(process.env.WORKERS, 1);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries,
  workers,
  timeout,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['allure-playwright', { outputFolder: 'allure-results', suiteTitle: false, detail: true }],
    ['./utils/allureReportGenerator.ts'],
    ['ortoni-report', ortoniReportConfig],
    ['./utils/ortoniAutoOpenReporter.ts'],
  ],
  outputDir: 'test-results/artifacts',
  use: {
    baseURL,
    headless,
    launchOptions: {
      slowMo,
    },
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    storageState: process.env.STORAGE_STATE || undefined,
    actionTimeout: timeout,
    navigationTimeout: timeout,
    testIdAttribute: 'data-testid',
  },
  expect: {
    timeout,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /tests[\\/](api|mobile)[\\/]/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: /tests[\\/](api|mobile)[\\/]/,
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: apiBaseURL,
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
        },
      },
    },
    {
      // Native Android/iOS app automation via Appium (mobile/**), not a browser project —
      // no `use.browserName`, since the session is a WebdriverIO Appium driver instance
      // owned by mobile/fixtures/mobileFixture.ts, not a Playwright BrowserContext.
      // Specs skip themselves cleanly (not fail) when no app/Appium environment is
      // configured — see tests/mobile/sample-app.appium.spec.ts.
      name: 'mobile-app',
      testDir: './tests/mobile',
      timeout: toNumber(process.env.MOBILE_TIMEOUT, 120000),
    },
  ],
  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('./global-teardown.ts'),
});
