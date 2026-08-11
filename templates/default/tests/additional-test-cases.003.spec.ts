import { faker } from '@faker-js/faker';
import { test as base, expect } from '../fixtures/testFixture';
import { ContactPage } from '../pages/ContactPage';
import { AboutPage } from '../pages/AboutPage';
import { registerHooks } from './hooks';
import { CONSTANTS } from '../utils/constants';
import { generateUsername } from '../utils/randomData';

const test = base.extend<{ contactPage: ContactPage; aboutPage: AboutPage }>({
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
  aboutPage: async ({ page }, use) => {
    await use(new AboutPage(page));
  },
});

registerHooks(test, 'Demoblaze additional test cases');

const PRODUCT_NAME = 'Samsung galaxy s6';

test.describe('@regression', () => {
  test.describe('Home Page UI', () => {
    test('TC-01 (Req TBD): Home page loads successfully @smoke @high', async ({ homePage }) => {
      await homePage.open();
      await homePage.verifyHomePage();
      await homePage.verifyProductGridVisible();
    });

    test('TC-02 (Req TBD): Navbar displays all expected menu items @medium', async ({ homePage }) => {
      await homePage.open();
      await homePage.verifyNavbarLinks();
    });

    test('TC-03 (Req TBD): Brand logo navigates to home page @medium', async ({ homePage }) => {
      await homePage.open();
      await homePage.openProduct(PRODUCT_NAME);
      await homePage.clickBrand();
      await homePage.verifyHomePage();
    });

    test('TC-04 (Req TBD): Carousel displays promotional banners @medium', async ({ homePage }) => {
      await homePage.open();
      await homePage.verifyCarouselVisible();

    });

    test('TC-05 (Req TBD): Carousel auto-rotates @low', async ({ homePage }) => {
      await homePage.open();
      const initialSlide = await homePage.getActiveCarouselSlideIndex();

      await expect
        .poll(async () => await homePage.getActiveCarouselSlideIndex(), { timeout: 10000, intervals: [500] })
        .not.toBe(initialSlide);
    });

    test('TC-06 (Req TBD): Carousel manual navigation controls @medium', async ({ homePage }) => {
      await homePage.open();

  
      const beforeNext = await homePage.getActiveCarouselSlideIndex();
      await expect(async () => {
        await homePage.clickCarouselNext();
        expect(await homePage.getActiveCarouselSlideIndex()).not.toBe(beforeNext);
      }).toPass({ timeout: 8000, intervals: [300] });
      const afterNext = await homePage.getActiveCarouselSlideIndex();

      await expect(async () => {
        await homePage.clickCarouselPrev();
        expect(await homePage.getActiveCarouselSlideIndex()).not.toBe(afterNext);
      }).toPass({ timeout: 8000, intervals: [300] });
    });
  });

  test.describe('Account & Cart Coverage (replaces Footer / Social Links, see Normalizer Change Log)', () => {
    test('TC-07 (Req TBD): Sign up with an already-registered username is rejected @medium', async ({ homePage, signUpPage }) => {
      const username = generateUsername();

      await homePage.open();
      await homePage.openSignUpModal();
      const firstMessage = await signUpPage.register(username, CONSTANTS.basePassword);
      expect(firstMessage).toContain('Sign up successful');
      await signUpPage.close();

      
      await homePage.open();
      await homePage.openSignUpModal();
      const duplicateMessage = await signUpPage.register(username, CONSTANTS.basePassword);
      expect(duplicateMessage).toContain('This user already exist');
      await signUpPage.close();
    });

    test('TC-08 (Req TBD): Log in with invalid credentials shows an error @medium', async ({ homePage, loginPage }) => {
      await homePage.open();
      await homePage.openLoginModal();

      const message = await loginPage.loginExpectingError(generateUsername('nonexistent'), 'wrong-password');
      expect(message).toContain('User does not exist');
    });

    test('TC-09 (Req TBD): Product grid pagination — Next button loads additional products @medium', async ({ homePage }) => {
      await homePage.open();
      const firstPage = await homePage.getDisplayedProductNames();

      await homePage.goToNextProductPage();
      
      await expect
        .poll(async () => await homePage.getDisplayedProductNames(), { timeout: 8000, intervals: [300] })
        .not.toEqual(firstPage);

      const secondPage = await homePage.getDisplayedProductNames();
      expect(secondPage.length).toBeGreaterThan(0);
    });

    test('TC-10 (Req TBD): Removing an item from the cart updates the cart table @medium', async ({ homePage, productPage, cartPage }) => {
      await homePage.open();
      await homePage.openProduct(PRODUCT_NAME);
      await productPage.addToCart();

      await homePage.openCart();
      await cartPage.verifyProductSummary(PRODUCT_NAME, '360');

      await cartPage.deleteItem(PRODUCT_NAME);
      await cartPage.verifyItemNotInCart(PRODUCT_NAME);
    });
  });

  test.describe('Contact Us', () => {
    test('TC-11 (Req TBD): Contact modal opens @medium', async ({ homePage }) => {
      await homePage.open();
      await homePage.openContactModal();
    });

    test('TC-12 (Req TBD): Contact modal field presence @medium', async ({ homePage, contactPage }) => {
      await homePage.open();
      await homePage.openContactModal();
      await contactPage.verifyFieldsPresent();
    });

    test('TC-13 (Req TBD): Submit Contact form with valid data @smoke @high', async ({ homePage, contactPage }) => {
      await homePage.open();
      await homePage.openContactModal();

      const message = await contactPage.submit(faker.person.fullName(), faker.internet.email(), faker.lorem.sentence());
      expect(message).toContain('Thanks for the message');
    });

    test('TC-14 (Req TBD): Submit Contact form with empty fields @medium', async ({ homePage, contactPage }) => {
      await homePage.open();
      await homePage.openContactModal();


      const message = await contactPage.submit('', '', '');
      expect(message).toContain('Thanks for the message');
    });

    test('TC-15 (Req TBD): Close Contact modal @low', async ({ homePage, contactPage }) => {
      await homePage.open();
      await homePage.openContactModal();
      await contactPage.close();
      await homePage.verifyHomePage();
    });
  });

  test.describe('About Us', () => {
    test('TC-16 (Req TBD): About Us modal opens @medium', async ({ homePage }) => {
      await homePage.open();
      await homePage.openAboutModal();
    });

    test('TC-17 (Req TBD): About Us modal displays video @low', async ({ homePage, aboutPage }) => {
      await homePage.open();
      await homePage.openAboutModal();
      await aboutPage.verifyVideoPresent();
      await aboutPage.clickPlay();
    });

    test('TC-18 (Req TBD): Close About Us modal @low', async ({ homePage, aboutPage }) => {
      await homePage.open();
      await homePage.openAboutModal();
      await aboutPage.close();
      await homePage.verifyHomePage();
    });
  });

  test.describe('Product Detail Page', () => {
    test('TC-19 (Req TBD): Navigate to product detail page @smoke @high', async ({ homePage }) => {
      await homePage.open();
      await homePage.openProduct(PRODUCT_NAME);
    });

    test('TC-20 (Req TBD): Product detail page content matches home page listing @smoke @high', async ({ homePage, productPage }) => {
      await homePage.open();
      const gridPrice = await homePage.getProductGridPrice(PRODUCT_NAME);

      await homePage.openProduct(PRODUCT_NAME);
      await productPage.verifyProductDetails(PRODUCT_NAME);

      const detailName = await productPage.getProductName();
      const detailPrice = await productPage.getProductPrice();

      expect(detailName.toLowerCase()).toContain(PRODUCT_NAME.toLowerCase());
      expect(detailPrice.replace(/\D/g, '')).toBe(gridPrice.replace(/\D/g, ''));
    });

    test('TC-21 (Req TBD): Product detail image loads @medium', async ({ homePage, productPage }) => {
      await homePage.open();
      await homePage.openProduct(PRODUCT_NAME);
      await productPage.verifyImageLoaded();
    });

    test('TC-22 (Req TBD): Back navigation from product detail page @medium', async ({ homePage, productPage }) => {
      await homePage.open();
      await homePage.openProduct(PRODUCT_NAME);
      await productPage.goBackToHome();
      await homePage.verifyHomePage();
      await homePage.verifyProductGridVisible();
    });
  });

  test.describe('Navigation / Error Handling', () => {
    test('TC-23 (Req TBD): Invalid product ID handled gracefully @smoke @high', async ({ page, productPage }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await productPage.openProductById('99999');

      expect(pageErrors).toEqual([]);
      await productPage.verifyPageDidNotCrash();
    });
  });

  test.describe('Responsive Layout', () => {
    test('TC-24 (Req TBD): Home page layout on mobile viewport @medium', async ({ page, homePage }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await homePage.open();

      await homePage.verifyMobileNavVisible();
      await homePage.verifyProductGridVisible();
 

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
    });
  });

  test.describe('Product Images', () => {
    test('TC-25 (Req TBD): All home page product images load correctly @medium', async ({ homePage }) => {
      await homePage.open();
      await homePage.verifyAllProductThumbnailsLoaded();
    });
  });
});
