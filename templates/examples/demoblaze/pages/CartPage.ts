import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyItemInCart(productName: string, price: string, quantity = '1'): Promise<void> {
    await this.expectVisible(this.cartLocators.rows);
    const row = this.page.locator('#tbodyid tr').filter({ hasText: productName }).first();
    const cells = row.locator('td');

    await expect(row).toBeVisible();
    await expect(cells.nth(1)).toHaveText(productName);
    await expect(cells.nth(2)).toHaveText(price);
    await expect(this.page.locator('#tbodyid tr')).toHaveCount(Number(quantity));
  }

  async openPlaceOrder(): Promise<void> {
    await this.click(this.cartLocators.placeOrderButton);
    await this.waitForElement(this.cartLocators.placeOrderModal, 'visible', 10000);
  }

  async verifyProductSummary(productName: string, price: string): Promise<void> {
    await this.verifyItemInCart(productName, price, '1');
  }

  async deleteItem(productName: string): Promise<void> {
    await this.click(this.cartLocators.deleteButtonFor(productName));
  }

  async verifyItemNotInCart(productName: string): Promise<void> {
    await this.expectHidden(this.cartLocators.deleteButtonFor(productName));
  }
}
