import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AboutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyVideoPresent(): Promise<void> {
    await this.expectVisible(this.aboutLocators.videoPlayer);
    await this.expectVisible(this.aboutLocators.videoPlayButton);
  }

  async clickPlay(): Promise<void> {
    await this.click(this.aboutLocators.videoPlayButton);
  }

  async close(): Promise<void> {
    await this.click(this.aboutLocators.closeButton);
    await this.waitForElement(this.aboutLocators.closeButton, 'hidden').catch(() => undefined);
  }
}
