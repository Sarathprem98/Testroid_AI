export type AndroidCapabilityOptions = {
  appPath?: string;
  deviceName?: string;
  platformVersion?: string;
  automationName?: string;
};

// Local execution: an Android emulator (Android Studio AVD) or a USB-connected device
// with the app under test installed/available at `appPath`. Requires ANDROID_HOME + a
// running `adb` daemon — see the testpal-mobile-conventions skill for setup steps.
export const buildAndroidCapabilities = (options: AndroidCapabilityOptions = {}): WebdriverIO.Capabilities => {
  const appPath = options.appPath ?? process.env.ANDROID_APP_PATH;
  const platformVersion = options.platformVersion ?? process.env.ANDROID_PLATFORM_VERSION;

  return {
    platformName: 'Android',
    'appium:automationName': options.automationName ?? 'UiAutomator2',
    'appium:deviceName': options.deviceName ?? process.env.ANDROID_DEVICE_NAME ?? 'Android Emulator',
    ...(platformVersion ? { 'appium:platformVersion': platformVersion } : {}),
    ...(appPath ? { 'appium:app': appPath } : {}),
    'appium:newCommandTimeout': 240,
  };
};
