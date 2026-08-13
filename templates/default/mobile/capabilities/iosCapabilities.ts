export type IosCapabilityOptions = {
  appPath?: string;
  deviceName?: string;
  platformVersion?: string;
  automationName?: string;
};

// Local execution requires a macOS host with Xcode installed (the XCUITest driver shells
// out to xcodebuild) — there is no Windows/Linux path for local iOS execution. This
// project's dev environment is Windows, so this capability set is written and typed but
// has never been exercised against a real simulator here — see the
// testroid-mobile-conventions skill for the macOS-only setup this requires.
export const buildIosCapabilities = (options: IosCapabilityOptions = {}): WebdriverIO.Capabilities => {
  const appPath = options.appPath ?? process.env.IOS_APP_PATH;
  const platformVersion = options.platformVersion ?? process.env.IOS_PLATFORM_VERSION;

  return {
    platformName: 'iOS',
    'appium:automationName': options.automationName ?? 'XCUITest',
    'appium:deviceName': options.deviceName ?? process.env.IOS_DEVICE_NAME ?? 'iPhone 15 Simulator',
    ...(platformVersion ? { 'appium:platformVersion': platformVersion } : {}),
    ...(appPath ? { 'appium:app': appPath } : {}),
    'appium:newCommandTimeout': 240,
  };
};
