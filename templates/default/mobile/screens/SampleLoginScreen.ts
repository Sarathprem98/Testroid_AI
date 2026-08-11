import { BaseMobileClient } from '../clients/BaseMobileClient';
import { mobileLocatorConstants } from '../locators/mobileLocatorConstants';
import type { MobilePlatform } from '../types/mobileLocatorTypes';

// Illustrative placeholder Screen Object — this project has no real native app yet
// (see mobileLocatorConstants.ts's sampleLoginScreen group). Wired end to end
// (typechecked, fixture-registered) so the mobile-app project has a concrete shape to
// follow once a real app is supplied for a ticket; not exercised against a real device.
export class SampleLoginScreen extends BaseMobileClient {
  private readonly locators = mobileLocatorConstants.sampleLoginScreen;

  constructor(driver: WebdriverIO.Browser, platform: MobilePlatform) {
    super(driver, platform);
  }

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.locators.usernameInput, username);
    await this.fill(this.locators.passwordInput, password);
    await this.tap(this.locators.loginButton);
  }

  async getWelcomeMessage(): Promise<string> {
    return this.getText(this.locators.welcomeMessage);
  }

  async isWelcomeMessageVisible(): Promise<boolean> {
    return this.isVisible(this.locators.welcomeMessage);
  }
}
