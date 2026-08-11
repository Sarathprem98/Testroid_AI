import { faker } from '@faker-js/faker';
import { CONSTANTS, type GeneratedCredentials, type PurchaseData } from './constants';

export const generateTimestamp = (): string => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-');
};

export const generateUsername = (prefix = 'automation'): string => {
  const randomSuffix = faker.number.int({ min: 100000, max: 999999 });
  return `${prefix}_${Date.now()}_${randomSuffix}`;
};

export const generateCredentials = (): GeneratedCredentials => ({
  username: generateUsername(),
  password: CONSTANTS.basePassword,
});

export const buildPurchaseData = (productName: string): PurchaseData => ({
  productName,
  name: CONSTANTS.defaultUserDisplayName,
  country: CONSTANTS.defaultCountry,
  city: CONSTANTS.defaultCity,
  creditCard: CONSTANTS.defaultCreditCard,
  month: CONSTANTS.defaultMonth,
  year: CONSTANTS.defaultYear,
});

export const pickRandomProduct = (): string => {
  return faker.helpers.arrayElement(CONSTANTS.defaultProductNames);
};