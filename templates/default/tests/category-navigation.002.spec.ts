import { expect, test } from '../fixtures/testFixture';
import type { ProductCategory } from '../pages/HomePage';
import { registerHooks } from './hooks';

registerHooks(test, 'Category navigation');

test.use({ launchOptions: { slowMo: 500 } });

test.describe('@regression', () => {
  test('TC-01-TC-03 (RQ-01-RQ-03): switching between Phones, Laptops, and Monitors updates the product list correctly @high', async ({ homePage }) => {
    await homePage.open();

    await homePage.selectCategory('Phones');
    await homePage.expectProductVisible('Samsung galaxy s6');
    expect((await homePage.getDisplayedProductNames()).length).toBeGreaterThan(0);

    await homePage.selectCategory('Laptops');
    await homePage.expectProductNotVisible('Samsung galaxy s6');
    expect((await homePage.getDisplayedProductNames()).length).toBeGreaterThan(0);

    await homePage.selectCategory('Monitors');
    await homePage.expectProductNotVisible('Samsung galaxy s6');
    expect((await homePage.getDisplayedProductNames()).length).toBeGreaterThan(0);
  });

  test('TC-04 (RQ-04): no stale products remain after switching from Phones to Monitors @medium', async ({ homePage }) => {
    await homePage.open();

    await homePage.selectCategory('Phones');
    await homePage.expectProductVisible('Samsung galaxy s6');

    await homePage.selectCategory('Monitors');
    await homePage.expectProductNotVisible('Samsung galaxy s6');
    await homePage.expectProductNotVisible('Nokia lumia 1520');
  });

  const categories: ProductCategory[] = ['Phones', 'Laptops', 'Monitors'];

  for (const category of categories) {
    test(`TC-05 (RQ-05): ${category} category displays its own products @high`, async ({ homePage }) => {
      await homePage.open();
      await homePage.selectCategory(category);

      const products = await homePage.getDisplayedProductNames();
      expect(products.length).toBeGreaterThan(0);

      if (category === 'Phones') {
        await homePage.expectProductVisible('Samsung galaxy s6');
      }
    });
  }
});
