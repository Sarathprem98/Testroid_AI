import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyProductDetails(productName: string): Promise<void> {
    await this.expectVisible(this.productLocators.title);
    await this.expectVisible(this.productLocators.price);
    await this.expectVisible(this.productLocators.description);
  }

  async addToCart(): Promise<string> {
    return await this.acceptDialog(async () => {
      await this.click(this.productLocators.addToCartButton);
    });
  }

  async getProductName(): Promise<string> {
    return await this.getText(this.productLocators.title);
  }

  async getProductPrice(): Promise<string> {
    return await this.getText(this.productLocators.price);
  }

  async verifyImageLoaded(): Promise<void> {
    await this.expectImageLoaded(this.productLocators.image);
  }

  async goBackToHome(): Promise<void> {
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
    await this.waitForReady();
  }

  async openProductById(productId: string): Promise<void> {
    await this.goto(`prod.html?idp_=${productId}`);
    await this.waitForReady();
  }

  async verifyPageDidNotCrash(): Promise<void> {
    await this.expectVisible(this.homeLocators.brand);
  }
}
