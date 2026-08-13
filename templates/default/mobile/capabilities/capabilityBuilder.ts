import type { Capabilities } from '@wdio/types';
import { logger } from '../../utils/logger';
import type { MobilePlatform } from '../types/mobileLocatorTypes';
import { buildAndroidCapabilities } from './androidCapabilities';
import { buildIosCapabilities } from './iosCapabilities';

export type MobileExecutionTarget = 'local' | 'cloud';

export type MobileSessionConfig = {
  platform: MobilePlatform;
  target: MobileExecutionTarget;
  connection: Pick<Capabilities.WebdriverIOConfig, 'protocol' | 'hostname' | 'port' | 'path' | 'user' | 'key' | 'connectionRetryTimeout'>;
  capabilities: WebdriverIO.Capabilities;
};

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Cloud provider config is intentionally generic (env-var driven, no vendor-specific
// capability keys hardcoded) so this project isn't locked to one device-farm vendor.
// Wire in a specific provider's own capability additions (e.g. BrowserStack's
// `bstack:options`, Sauce Labs' `sauce:options`) via MOBILE_CLOUD_CAPABILITIES_JSON —
// see the testroid-mobile-conventions skill for provider-specific examples.
const parseCloudCapabilitiesOverride = (): Record<string, unknown> => {
  const raw = process.env.MOBILE_CLOUD_CAPABILITIES_JSON;
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (error) {
    logger.error.exception(`MOBILE_CLOUD_CAPABILITIES_JSON is not valid JSON: ${(error as Error).message}`);
    return {};
  }
};

const resolveTarget = (): MobileExecutionTarget => {
  const raw = (process.env.MOBILE_EXECUTION_TARGET ?? 'local').toLowerCase();
  return raw === 'cloud' ? 'cloud' : 'local';
};

export const buildMobileSessionConfig = (platform: MobilePlatform): MobileSessionConfig => {
  const target = resolveTarget();
  const baseCapabilities = platform === 'android' ? buildAndroidCapabilities() : buildIosCapabilities();

  if (target === 'local') {
    logger.mobile.capabilities(`Building LOCAL ${platform} capabilities`);
    return {
      platform,
      target,
      connection: {
        protocol: 'http',
        hostname: process.env.APPIUM_SERVER_HOSTNAME ?? '127.0.0.1',
        port: toNumber(process.env.APPIUM_SERVER_PORT, 4723),
        path: process.env.APPIUM_SERVER_PATH ?? '/',
      },
      capabilities: baseCapabilities,
    };
  }

  logger.mobile.capabilities(`Building CLOUD ${platform} capabilities (provider-agnostic)`);
  return {
    platform,
    target,
    connection: {
      protocol: process.env.MOBILE_CLOUD_PROTOCOL ?? 'https',
      hostname: process.env.MOBILE_CLOUD_HOSTNAME, // e.g. 'hub-cloud.browserstack.com', 'ondemand.us-west-1.saucelabs.com' — TBD until a provider is chosen
      port: toNumber(process.env.MOBILE_CLOUD_PORT, 443),
      path: process.env.MOBILE_CLOUD_PATH ?? '/wd/hub',
      user: process.env.MOBILE_CLOUD_USERNAME,
      key: process.env.MOBILE_CLOUD_ACCESS_KEY,
      connectionRetryTimeout: 180000,
    },
    capabilities: {
      ...baseCapabilities,
      ...parseCloudCapabilitiesOverride(),
    },
  };
};
