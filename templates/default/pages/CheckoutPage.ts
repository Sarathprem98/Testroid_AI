import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type ConfirmationDetails = {
  orderId: string;
  amount: string;
  cardNumber: string;
  rawText: string;
};

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async fillOrderForm(order: {
    name: string;
    country: string;
    city: string;
    creditCard: string;
    month: string;
    year: string;
  }): Promise<void> {
    await this.expectVisible(this.checkoutLocators.nameInput);
    await this.fill(this.checkoutLocators.nameInput, order.name);
    await this.fill(this.checkoutLocators.countryInput, order.country);
    await this.fill(this.checkoutLocators.cityInput, order.city);
    await this.fill(this.checkoutLocators.creditCardInput, order.creditCard);
    await this.fill(this.checkoutLocators.monthInput, order.month);
    await this.fill(this.checkoutLocators.yearInput, order.year);
  }

  async purchase(): Promise<ConfirmationDetails> {
    await this.click(this.checkoutLocators.purchaseButton);

    const confirmation = await this.findElement(this.checkoutLocators.confirmationModal, { timeoutMs: 10000 });

    const rawText = (await confirmation.innerText()) ?? '';
    const orderIdMatch = rawText.match(/Id:\s*(\d+)/i);
    const amountMatch = rawText.match(/Amount:\s*([^\n\r]+)/i);
    const cardMatch = rawText.match(/Card Number:\s*([^\n\r]+)/i);

    return {
      orderId: orderIdMatch?.[1] ?? '',
      amount: amountMatch?.[1]?.trim() ?? '',
      cardNumber: cardMatch?.[1]?.trim() ?? '',
      rawText,
    };
  }

  async closeConfirmation(): Promise<void> {
    await this.click(this.checkoutLocators.confirmationOkButton);
  }
}
