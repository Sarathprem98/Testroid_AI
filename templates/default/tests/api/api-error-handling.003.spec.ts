import { test, expect } from '../../api/fixtures/apiFixture';
import { registerApiHooks } from '../../api/fixtures/apiHooks';
import { generateCredentials } from '../../utils/randomData';

registerApiHooks(test, 'Demoblaze API — Error Handling');

test.describe('@api', () => {
  // TC-01
  test('GET request to a POST-only endpoint (/addtocart) returns 405', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.sendRaw('GET', '/addtocart');

    expect(response.status).toBe(405);
  });

  // TC-02
  test('POST request to a GET-only endpoint (/entries) returns 405', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.sendRaw('POST', '/entries', {});

    expect(response.status).toBe(405);
  });

  // TC-03
  test('request to a non-existent endpoint returns 404', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.sendRaw('GET', '/nonexistentendpoint123');

    expect(response.status).toBe(404);
  });

  // TC-04
  test('signup with missing username and password returns a bad-parameter errorMessage', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.sendRaw('POST', '/signup', {});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('errorMessage', 'Bad parameter, missing username or password');
  });

  // TC-05 — malformed JSON is rejected at the transport layer (Werkzeug), before it ever reaches
  // application logic, unlike every other failure case in this file (all of which return 200 +
  // errorMessage). Response body is HTML, not JSON.
  test('malformed JSON syntax in the request body returns 400', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.sendRaw('POST', '/signup', '{username: not valid json');

    expect(response.status).toBe(400);
    expect(response.headers['content-type']).toContain('text/html');
  });

  // TC-06 — verified defect: a null prod_id is silently accepted, not validated (Test Plan Section
  // 17 R7). Asserted as a regression guard per reviewer decision, 2026-07-29 — will fail loudly if
  // the API starts validating this field.
  test('add-to-cart with a null prod_id is silently accepted, not validated (known defect)', async ({ demoblazeApiClient }) => {
    const cartItemId = `api-error-handling-${Date.now()}`;
    const cookie = `api-error-handling-cookie-${Date.now()}`;

    const response = await demoblazeApiClient.addToCart({ cartItemId, cookie, productId: null as unknown as number, loggedIn: false });

    expect(response.status).toBe(200);
    expect((response.body as Record<string, unknown> | undefined)?.errorMessage).toBeUndefined();

    await demoblazeApiClient.deleteCartItem(cartItemId);
  });

  // TC-07 — no server-side session validation exists on cart endpoints; a cookie never produced
  // by any signup/login/addtocart still returns a valid (empty) cart, not a rejection.
  test('viewcart with a fabricated, never-issued cookie is not rejected', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.viewCart('totally-made-up-nonexistent-cookie', false);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ Items: [] });
  });

  // TC-08
  test('check with a tampered/never-issued token returns a malformed-token errorMessage', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.checkToken('totally-tampered-fake-token-xyz');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('errorMessage', 'Bad parameter, token malformed.');
  });

  // TC-09 (RQ-09, expired token rejection) is intentionally not implemented — Blocked pending
  // reviewer input on whether the AUT's tokens expire at all, see
  // docs/test_cases/demoblaze-api-error-handling.md.

  // TC-10 (RQ-10, duplicate signup) is intentionally not re-implemented here — already covered by
  // tests/api/api-catalog-cart-auth.002.spec.ts:67-77 ("signup with an already-registered
  // username returns a duplicate-user errorMessage"). See
  // docs/reuse_map/demoblaze-api-error-handling.md Section 5 (cross-ticket-spec-duplication) for
  // the reviewer decision behind this, confirmed 2026-07-29.

  // TC-11 — verified live 2026-07-29: a 300-character username is accepted with no length
  // validation error.
  test('signup with an extremely long username is accepted without a length validation error', async ({ demoblazeApiClient }) => {
    const credentials = generateCredentials();
    const longUsername = `${credentials.username}_${'a'.repeat(280)}`;

    const response = await demoblazeApiClient.signup(longUsername, credentials.password);

    expect(response.status).toBe(200);
    expect(response.body).not.toHaveProperty('errorMessage');
  });

  // TC-12 — verified live 2026-07-29: a SQL-injection-style username is accepted as an ordinary
  // string, with no crash and no visible injection effect.
  test('signup with a SQL-injection-style username is accepted as an ordinary string, no crash', async ({ demoblazeApiClient }) => {
    const credentials = generateCredentials();
    const sqliUsername = `${credentials.username}' OR '1'='1`;

    const response = await demoblazeApiClient.signup(sqliUsername, credentials.password);

    expect(response.status).toBe(200);
    expect(response.body).not.toHaveProperty('errorMessage');
  });

  // TC-13 — verified defect: a non-numeric product id crashes the server with a 500, exactly the
  // failure mode the SPEC says should never happen. Asserted as a regression guard per reviewer
  // decision, 2026-07-29.
  test('product lookup with a non-numeric id crashes with a 500 (known defect)', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.getProductById('abc');

    expect(response.status).toBe(500);
  });

  // TC-14 (RQ-14, out-of-range product id) is intentionally not re-implemented here — already
  // covered by tests/api/api-catalog-cart-auth.002.spec.ts:59-64 ("product lookup by a
  // non-existent id returns a Not found errorMessage, not a crash"). See
  // docs/reuse_map/demoblaze-api-error-handling.md Section 5 for the reviewer decision, confirmed
  // 2026-07-29.

  // TC-15 — verified defect: an empty-string token crashes the server with a 500. Asserted as a
  // regression guard per reviewer decision, 2026-07-29.
  test('check with an empty token crashes with a 500 (known defect)', async ({ demoblazeApiClient }) => {
    const response = await demoblazeApiClient.checkToken('');

    expect(response.status).toBe(500);
  });
});
