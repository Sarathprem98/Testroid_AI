import { expect, test } from '../fixtures/testFixture';
import { CONSTANTS } from '../utils/constants';
import { generateCredentials } from '../utils/randomData';
import { logger } from '../utils/logger';
import { registerHooks } from './hooks';

registerHooks(test, 'Purchase flow');

test.describe('@purchase', () => {
  test('should sign up, log in, add a product, and complete the purchase in one flow', async ({ homePage, signUpPage, loginPage, productPage, cartPage, checkoutPage }) => {
    const credentials = generateCredentials();
    const productName = 'Samsung galaxy s6';
    const productPrice = '360';

    await homePage.open();

    await homePage.openSignUpModal();
    const signUpMessage = await signUpPage.register(credentials.username, credentials.password);
    logger.execution.testStart(`Generated username: ${credentials.username}`);
    expect(signUpMessage).toContain('Sign up successful');
    await signUpPage.close();

    await homePage.openLoginModal();
    await loginPage.login(credentials.username, credentials.password);
    await homePage.verifyLoggedIn(credentials.username);

    await homePage.openProduct(productName);
    await productPage.verifyProductDetails(productName);

    const addToCartMessage = await productPage.addToCart();
    expect(addToCartMessage).toContain('Product added');

    await homePage.openCart();
    await cartPage.verifyProductSummary(productName, productPrice);

    await cartPage.openPlaceOrder();
    await checkoutPage.fillOrderForm({
      name: CONSTANTS.defaultUserDisplayName,
      country: CONSTANTS.defaultCountry,
      city: CONSTANTS.defaultCity,
      creditCard: CONSTANTS.defaultCreditCard,
      month: CONSTANTS.defaultMonth,
      year: CONSTANTS.defaultYear,
    });

    const confirmation = await checkoutPage.purchase();
    logger.execution.testEnd(`Order ID: ${confirmation.orderId}`);
    logger.execution.duration(`Amount: ${confirmation.amount}`);
    logger.execution.duration(`Card Number: ${confirmation.cardNumber}`);

    expect(confirmation.orderId).not.toEqual('');
    expect(confirmation.amount).toContain('360');
    expect(confirmation.cardNumber).toContain('4111');
    expect(confirmation.rawText).toContain('Thank you for your purchase!');

    await checkoutPage.closeConfirmation();

    await homePage.verifyHomePage();
  });
});
