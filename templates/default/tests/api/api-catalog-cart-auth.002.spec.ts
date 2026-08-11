import { test, expect } from '../../api/fixtures/apiFixture';
import { registerApiHooks } from '../../api/fixtures/apiHooks';
import { generateCredentials } from '../../utils/randomData';

registerApiHooks(test, 'Demoblaze API — Catalog, Cart, Auth');

test.describe('@api', () => {
  // TC-02
  test('entries response items expose the verified field set (id, title, price, cat, desc, img)', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.getEntries();
    const item = response.body?.Items?.[0];

    expect(response.status).toBe(200);
    expect(item).toBeTruthy();
    expect(typeof item?.id).toBe('number');
    expect(typeof item?.title).toBe('string');
    expect(item?.title).toBeTruthy();
    expect(item?.price).toBeGreaterThan(0);
    expect(typeof item?.cat).toBe('string');
    expect(typeof item?.desc).toBe('string');
    expect(typeof item?.img).toBe('string');
  });

  // TC-03, TC-04, TC-05 — category values are the live API's own values (phone/notebook/monitor),
  // not the UI's display names (Phones/Laptops/Monitors) — see DemoblazeApiClient.getProductsByCategory().
  for (const category of ['phone', 'notebook', 'monitor']) {
    test(`bycat filters to only "${category}" products`, async ({ demoblazeApiClient }) => {
      const response = await demoblazeApiClient.getProductsByCategory(category);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body?.Items)).toBe(true);
      for (const item of response.body?.Items ?? []) {
        expect(item.cat).toBe(category);
      }
    });
  }

  // TC-06
  test('bycat with a non-existent category returns an empty result, not an error', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.getProductsByCategory('NonExistentCategory');

    expect(response.status).toBe(200);
    expect(response.body?.Items).toEqual([]);
  });

  // TC-07 — extends the existing "product lookup by id" coverage (tests/api/api.001.spec.ts,
  // which only asserts title/price) with the desc/img assertions that flow doesn't make.
  test('product lookup by a valid id includes desc and img in addition to title and price', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.getProductById(1);

    expect(response.status).toBe(200);
    expect(response.body?.title).toBeTruthy();
    expect(response.body?.price).toBeGreaterThan(0);
    expect(response.body?.desc).toBeTruthy();
    expect(response.body?.img).toBeTruthy();
  });

  // TC-08
  test('product lookup by a non-existent id returns a Not found errorMessage, not a crash', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.getProductById(999999);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('errorMessage', 'Not found.');
  });

  // TC-10
  test('signup with an already-registered username returns a duplicate-user errorMessage', async ({ demoblazeApiClient }) => {
    const credentials = generateCredentials();

    const firstSignup = await demoblazeApiClient.signup(credentials.username, credentials.password);
    expect(firstSignup.status).toBe(200);
    expect(firstSignup.body).not.toHaveProperty('errorMessage');

    const duplicateSignup = await demoblazeApiClient.signup(credentials.username, credentials.password);
    expect(duplicateSignup.status).toBe(200);
    expect(duplicateSignup.body).toHaveProperty('errorMessage', 'This user already exist.');
  });

  // TC-13
  test('login with a registered username but wrong password returns a Wrong password errorMessage', async ({ demoblazeApiClient }) => {
    const credentials = generateCredentials();

    const signupResponse = await demoblazeApiClient.signup(credentials.username, credentials.password);
    expect(signupResponse.status).toBe(200);

    const loginResponse = await demoblazeApiClient.login(credentials.username, `wrong-${credentials.password}`);
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('errorMessage', 'Wrong password.');
  });

  // TC-14, TC-15 — extends the existing add/view/delete flow (tests/api/api.001.spec.ts)
  // with the item-presence and post-delete-absence assertions that flow doesn't make.
  test('added cart item is reflected in view-cart and removed after delete', async ({ demoblazeApiClient }) => {
    const cartItemId = `api-catalog-cart-auth-${Date.now()}`;
    const cookie = `api-catalog-cart-auth-cookie-${Date.now()}`;

    const addResponse = await demoblazeApiClient.addToCart({ cartItemId, cookie, productId: 1, loggedIn: false });
    expect(addResponse.status).toBe(200);

    const viewAfterAdd = await demoblazeApiClient.viewCart(cookie, false);
    expect(viewAfterAdd.status).toBe(200);
    const addedItem = (viewAfterAdd.body as { Items?: Array<{ id?: string; prod_id?: number }> })?.Items?.find((i) => i.id === cartItemId);
    expect(addedItem).toBeTruthy();
    expect(addedItem?.prod_id).toBe(1);

    const deleteResponse = await demoblazeApiClient.deleteCartItem(cartItemId);
    expect(deleteResponse.status).toBe(200);

    const viewAfterDelete = await demoblazeApiClient.viewCart(cookie, false);
    expect(viewAfterDelete.status).toBe(200);
    const remainingItem = (viewAfterDelete.body as { Items?: Array<{ id?: string }> })?.Items?.find((i) => i.id === cartItemId);
    expect(remainingItem).toBeUndefined();
  });

  // TC-16 — the client already supports loggedIn: true; this is the first test to exercise that path.
  // For flag: true, `cookie` must be the Auth_token value from login, not an arbitrary string —
  // an arbitrary cookie returns { errorMessage: "Bad parameter, token malformed." } (confirmed live,
  // Stage 5b, 2026-07-29); this was not previously documented anywhere in the codebase.
  test('add to cart followed by view cart reflects the added product for an authenticated session', async ({ demoblazeApiClient }) => {
    const credentials = generateCredentials();
    const cartItemId = `api-catalog-cart-auth-auth-${Date.now()}`;

    const signupResponse = await demoblazeApiClient.signup(credentials.username, credentials.password);
    expect(signupResponse.status).toBe(200);

    const loginResponse = await demoblazeApiClient.login(credentials.username, credentials.password);
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body as string).toContain('Auth_token:');
    const cookie = (loginResponse.body as string).replace('Auth_token: ', '');

    const addResponse = await demoblazeApiClient.addToCart({ cartItemId, cookie, productId: 1, loggedIn: true });
    expect(addResponse.status).toBe(200);

    const viewResponse = await demoblazeApiClient.viewCart(cookie, true);
    expect(viewResponse.status).toBe(200);
    const addedItem = (viewResponse.body as { Items?: Array<{ id?: string; prod_id?: number }> })?.Items?.find((i) => i.id === cartItemId);
    expect(addedItem).toBeTruthy();
    expect(addedItem?.prod_id).toBe(1);

    await demoblazeApiClient.deleteCartItem(cartItemId);
  });

  // TC-17 (RQ-15, cart totals/quantities) is intentionally not implemented — Blocked pending
  // a human decision, see docs/test_cases/demoblaze-api-catalog-cart-auth.md.
});
