import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyFieldsPresent(): Promise<void> {
    await this.expectVisible(this.contactLocators.nameInput);
    await this.expectVisible(this.contactLocators.emailInput);
    await this.expectVisible(this.contactLocators.messageInput);
  }

  async submit(name: string, email: string, message: string): Promise<string> {
    await this.fill(this.contactLocators.nameInput, name);
    await this.fill(this.contactLocators.emailInput, email);
    await this.fill(this.contactLocators.messageInput, message);

    return await this.acceptDialog(async () => {
      await this.click(this.contactLocators.sendButton);
    });
  }

  async close(): Promise<void> {
    await this.click(this.contactLocators.closeButton);
    await this.waitForElement(this.contactLocators.closeButton, 'hidden').catch(() => undefined);
  }
}
