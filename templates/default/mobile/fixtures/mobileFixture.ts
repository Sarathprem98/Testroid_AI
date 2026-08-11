import { test as base } from '@playwright/test';
import { remote } from 'webdriverio';
import { logger } from '../../utils/logger';
import { buildMobileSessionConfig } from '../capabilities/capabilityBuilder';
import { SampleLoginScreen } from '../screens/SampleLoginScreen';
import type { MobilePlatform } from '../types/mobileLocatorTypes';

type MobileFixtureSet = {
  mobilePlatform: MobilePlatform;
  mobileDriver: WebdriverIO.Browser;
  sampleLoginScreen: SampleLoginScreen;
};

const resolvePlatform = (): MobilePlatform => {
  const raw = (process.env.MOBILE_PLATFORM ?? 'android').toLowerCase();
  return raw === 'ios' ? 'ios' : 'android';
};

export const test = base.extend<MobileFixtureSet>({
  mobilePlatform: async ({}, use) => {
    await use(resolvePlatform());
  },

  mobileDriver: async ({ mobilePlatform }, use) => {
    const { connection, capabilities, target } = buildMobileSessionConfig(mobilePlatform);
    logger.mobile.session(`Starting ${target} ${mobilePlatform} Appium session`);

    const driver = await remote({ ...connection, capabilities, logLevel: 'error' });

    try {
      await use(driver);
    } finally {
      logger.mobile.session(`Ending ${target} ${mobilePlatform} Appium session`);
      await driver.deleteSession();
    }
  },

  sampleLoginScreen: async ({ mobileDriver, mobilePlatform }, use) => {
    await use(new SampleLoginScreen(mobileDriver, mobilePlatform));
  },
});

export { expect } from '@playwright/test';
