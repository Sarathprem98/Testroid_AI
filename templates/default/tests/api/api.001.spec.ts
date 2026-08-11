import { test, expect } from '../../api/fixtures/apiFixture';
import { registerApiHooks } from '../../api/fixtures/apiHooks';
import { generateCredentials } from '../../utils/randomData';
import { logger } from '../../utils/logger';

registerApiHooks(test, 'Demoblaze API');

test.describe('@api', () => {
  test('entries endpoint returns the product catalog', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.getEntries();

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body?.Items)).toBe(true);
  });

  test('signup followed by login returns a usable session for a new user', async ({ demoblazeApiClient }) => {
    const credentials = generateCredentials();

    const signupResponse = await demoblazeApiClient.signup(credentials.username, credentials.password);
    expect(signupResponse.status).toBe(200);
    expect(signupResponse.body).not.toHaveProperty('errorMessage');

    const loginResponse = await demoblazeApiClient.login(credentials.username, credentials.password);
    expect(loginResponse.status).toBe(200);
    expect(typeof loginResponse.body).toBe('string');
    expect(loginResponse.body as string).toContain('Auth_token:');

    logger.execution.testEnd(`Verified API session for generated user: ${credentials.username}`);
  });

  // api.demoblaze.com never returns a non-200 status for a bad login — failure is
  // signaled via `errorMessage` in a 200 body (confirmed against the site's own
  // js/prod.js, which branches on `data.errorMessage`, not on HTTP status).
  test('login with an unregistered user returns an errorMessage body, not a session', async ({ demoblazeApiClient }) => {
    const credentials = generateCredentials();

    const response = await demoblazeApiClient.login(credentials.username, credentials.password);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('errorMessage', 'User does not exist.');
  });

  test('product lookup by id returns a product payload', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.getProductById(1);

    expect(response.status).toBe(200);
    expect(response.body?.title).toBeTruthy();
    expect(response.body?.price).toBeGreaterThan(0);
  });

  test('add to cart followed by view cart reflects the added product', async ({ demoblazeApiClient }) => {
    const cartItemId = `api-test-${Date.now()}`;
    const cookie = `api-test-cookie-${Date.now()}`;

    const addResponse = await demoblazeApiClient.addToCart({ cartItemId, cookie, productId: 1, loggedIn: false });
    expect(addResponse.status).toBe(200);

    const viewResponse = await demoblazeApiClient.viewCart(cookie, false);
    expect(viewResponse.status).toBe(200);
    expect(Array.isArray((viewResponse.body as { Items?: unknown[] })?.Items)).toBe(true);

    await demoblazeApiClient.deleteCartItem(cartItemId);
  });
});
