import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.loginLocators.usernameInput, username);
    await this.fill(this.loginLocators.passwordInput, password);
    await this.click(this.loginLocators.submitButton);
  }

  async close(): Promise<void> {
    await this.click(this.loginLocators.closeButton, { force: true });
    await this.waitForElement(this.loginLocators.closeButton, 'hidden').catch(() => undefined);
  }

  async loginExpectingError(username: string, password: string): Promise<string> {
    await this.fill(this.loginLocators.usernameInput, username);
    await this.fill(this.loginLocators.passwordInput, password);

    return await this.acceptDialog(async () => {
      await this.click(this.loginLocators.submitButton);
    });
  }
}
