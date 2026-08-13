export const CONSTANTS = {
  basePassword: 'Password@123',
  defaultProductNames: ['Sample Product A', 'Sample Product B', 'Sample Product C'],
  defaultUserDisplayName: 'Automation User',
  defaultCountry: 'India',
  defaultCity: 'Bengaluru',
  defaultCreditCard: '4111111111111111',
  defaultMonth: '12',
  defaultYear: '2030',
  defaultTimeoutMs: 30000,
  maxLocatorRetries: 5,
  retryDelayMs: 400,
} as const;

export type PurchaseData = {
  productName: string;
  name: string;
  country: string;
  city: string;
  creditCard: string;
  month: string;
  year: string;
};

export type GeneratedCredentials = {
  username: string;
  password: string;
};