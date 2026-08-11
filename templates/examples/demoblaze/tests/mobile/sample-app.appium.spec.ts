import { test, expect } from '../../mobile/fixtures/mobileFixture';
import { registerMobileHooks } from '../../mobile/fixtures/mobileHooks';
import { generateCredentials } from '../../utils/randomData';

// This project has no real native app yet (see mobile/screens/SampleLoginScreen.ts and
// mobile/locators/mobileLocatorConstants.ts's sampleLoginScreen group — both explicitly
// illustrative placeholders). Rather than fabricate a pass/fail against a nonexistent app,
// this spec declares its environment requirement up front and skips cleanly when unmet.
const hasLocalApp = Boolean(process.env.ANDROID_APP_PATH || process.env.IOS_APP_PATH);
const isCloudTarget = process.env.MOBILE_EXECUTION_TARGET === 'cloud';
const mobileEnvironmentConfigured = hasLocalApp || isCloudTarget;

test.describe('@mobile-app', () => {
  test.skip(
    !mobileEnvironmentConfigured,
    'No app/Appium environment configured (set ANDROID_APP_PATH/IOS_APP_PATH for local execution, or MOBILE_EXECUTION_TARGET=cloud with the MOBILE_CLOUD_* vars) — see testpal-mobile-conventions Skill for setup steps.'
  );

  registerMobileHooks(test, 'Sample App Login');

  test('should log in and show a welcome message', async ({ sampleLoginScreen }) => {
    const { username, password } = generateCredentials();

    await sampleLoginScreen.login(username, password);

    expect(await sampleLoginScreen.isWelcomeMessageVisible()).toBe(true);
  });
});
