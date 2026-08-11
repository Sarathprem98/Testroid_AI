import { test as base } from '@playwright/test';
import { DemoblazeApiClient } from '../clients/DemoblazeApiClient';

type ApiFixtureSet = {
  demoblazeApiClient: DemoblazeApiClient;
};

export const test = base.extend<ApiFixtureSet>({
  demoblazeApiClient: async ({ request }, use) => {
    await use(new DemoblazeApiClient(request));
  },
});

export { expect } from '@playwright/test';
