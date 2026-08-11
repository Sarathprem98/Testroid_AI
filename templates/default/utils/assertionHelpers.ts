import { expect, type Locator, type Page } from '@playwright/test';

export const expectVisible = async (locator: Locator, message?: string): Promise<void> => {
  await expect(locator, message).toBeVisible();
};

export const expectEnabled = async (locator: Locator, message?: string): Promise<void> => {
  await expect(locator, message).toBeEnabled();
};

export const expectText = async (locator: Locator, value: string | RegExp, message?: string): Promise<void> => {
  await expect(locator, message).toHaveText(value);
};

export const expectPageTitle = async (page: Page, value: string | RegExp): Promise<void> => {
  await expect(page).toHaveTitle(value);
};

export const expectPageUrl = async (page: Page, value: string | RegExp): Promise<void> => {
  await expect(page).toHaveURL(value);
};