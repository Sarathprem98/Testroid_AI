import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SignUpPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async register(username: string, password: string): Promise<string> {
    await this.fill(this.signUpLocators.usernameInput, username);
    await this.fill(this.signUpLocators.passwordInput, password);

    return await this.acceptDialog(async () => {
      await this.click(this.signUpLocators.submitButton);
    });
  }

  async close(): Promise<void> {
    await this.click(this.signUpLocators.closeButton, { force: true });
    await this.waitForElement(this.signUpLocators.closeButton, 'hidden').catch(() => undefined);
  }
}
