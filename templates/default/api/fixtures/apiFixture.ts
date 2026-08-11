import { test as base } from '@playwright/test';
import { BaseApiClient } from '../clients/BaseApiClient';

type ApiFixtureSet = {
  apiClient: BaseApiClient;
};

export const test = base.extend<ApiFixtureSet>({
  apiClient: async ({ request }, use) => {
    await use(new BaseApiClient(request));
  },
});

export { expect } from '@playwright/test';
