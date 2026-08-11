import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type ProductCategory = 'Phones' | 'Laptops' | 'Monitors';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/');
    await this.waitForReady();
  }

  async verifyHomePage(): Promise<void> {
    await this.assertTitle(/STORE/);
    await this.expectVisible(this.homeLocators.brand);
  }

  async openSignUpModal(): Promise<void> {
    await this.click(this.homeLocators.signUpLink);
    await this.expectVisible(this.signUpLocators.usernameInput);
  }

  async openLoginModal(): Promise<void> {
    await this.click(this.homeLocators.loginLink);
    await this.expectVisible(this.loginLocators.usernameInput);
  }

  async openCart(): Promise<void> {
    await this.click(this.homeLocators.cartLink);
    await this.assertCurrentUrl(/cart\.html/);
  }

  async openProduct(productName: string): Promise<void> {
    await this.click(this.homeLocators.productCard(productName));
    await this.assertCurrentUrl(/prod\.html\?idp_=/);
  }

  async verifyLoggedIn(username: string): Promise<void> {
    await this.expectVisible(this.homeLocators.logoutLink);
    await this.expectText(this.homeLocators.welcomeLabel, new RegExp(`Welcome\\s+${username}`, 'i'));
  }

  async verifyLoggedOut(): Promise<void> {
    await this.expectVisible(this.homeLocators.signUpLink);
    await this.expectVisible(this.homeLocators.loginLink);
  }

  async selectCategory(category: ProductCategory): Promise<void> {
    await this.click(this.homeLocators.categoryLink(category));
    await this.waitForElement(this.homeLocators.productGridItems, 'visible');
  }

  async getDisplayedProductNames(): Promise<string[]> {
    return this.getAllTexts(this.homeLocators.productGridItems);
  }

  async expectProductVisible(productName: string): Promise<void> {
    await this.expectVisible(this.homeLocators.productCard(productName));
  }

  async expectProductNotVisible(productName: string): Promise<void> {
    await this.expectHidden(this.homeLocators.productCard(productName));
  }

  async verifyProductGridVisible(): Promise<void> {
    await this.expectVisible(this.homeLocators.productGridItems);
  }

  async clickBrand(): Promise<void> {
    await this.click(this.homeLocators.brand);
    await this.waitForReady();
  }

  async verifyNavbarLinks(): Promise<void> {
    await this.expectVisible(this.homeLocators.homeNavLink);
    await this.expectVisible(this.homeLocators.contactLink);
    await this.expectVisible(this.homeLocators.aboutUsLink);
    await this.expectVisible(this.homeLocators.cartLink);
    await this.expectVisible(this.homeLocators.loginLink);
    await this.expectVisible(this.homeLocators.signUpLink);
  }

  async verifyCarouselVisible(): Promise<void> {
    await this.expectVisible(this.homeLocators.carouselActiveSlideImage);
  }

  async getActiveCarouselSlideIndex(): Promise<string> {
    const locator = await this.findElement(this.homeLocators.carouselActiveIndicator);
    return (await locator.getAttribute('data-slide-to')) ?? '';
  }

  async clickCarouselNext(): Promise<void> {
    await this.click(this.homeLocators.carouselNextControl);
  }

  async clickCarouselPrev(): Promise<void> {
    await this.click(this.homeLocators.carouselPrevControl);
  }

  async openContactModal(): Promise<void> {
    await this.click(this.homeLocators.contactLink);
    await this.expectVisible(this.contactLocators.modalTitle);
  }

  async openAboutModal(): Promise<void> {
    await this.click(this.homeLocators.aboutUsLink);
    await this.expectVisible(this.aboutLocators.modalTitle);
  }

  async verifyAllProductThumbnailsLoaded(): Promise<void> {
    await this.expectAllImagesLoaded(this.homeLocators.productGridImages);
  }

  async getProductGridPrice(productName: string): Promise<string> {
    return await this.getText(this.homeLocators.productCardPrice(productName));
  }

  async verifyMobileNavVisible(): Promise<void> {
    await this.expectVisible(this.homeLocators.navbarToggler);
  }

  async goToNextProductPage(): Promise<void> {
    await this.click(this.homeLocators.productGridNextButton);
    await this.waitForElement(this.homeLocators.productGridItems, 'visible');
  }

  async reloadPage(): Promise<void> {
    await this.reload();
    await this.waitForReady();
  }

  beginConsoleCapture(): void {
    this.startConsoleCapture();
  }

  getConsoleErrors(): string[] {
    return this.getCapturedConsoleMessages()
      .filter(message => message.type === 'error' || message.type === 'pageerror')
      .map(message => message.text);
  }

  getMixedContentWarnings(): string[] {
    return this.getCapturedConsoleMessages()
      .filter(message => /mixed content/i.test(message.text))
      .map(message => message.text);
  }

  async verifySecureConnection(): Promise<void> {
    await this.assertCurrentUrl(/^https:\/\//);
  }

  async getNavbarLinkLabels(): Promise<string[]> {
    return this.page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.navbar-toggler, .navbar-brand, .navbar-nav .nav-link')) as HTMLElement[];
      return links
        .filter(el => el.offsetParent !== null)
        .map(el => el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName);
    });
  }

  async tabThroughNavbar(steps: number): Promise<{ label: string; hasVisibleFocusIndicator: boolean }[]> {
    const results: { label: string; hasVisibleFocusIndicator: boolean }[] = [];

    for (let i = 0; i < steps; i += 1) {
      await this.pressKey('Tab');
      const info = await this.page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) {
          return { label: '', outlineStyle: 'none', outlineWidth: '0px', boxShadow: 'none' };
        }
        const computed = window.getComputedStyle(el);
        return {
          label: el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName,
          outlineStyle: computed.outlineStyle,
          outlineWidth: computed.outlineWidth,
          boxShadow: computed.boxShadow,
        };
      });

      results.push({
        label: info.label,
        hasVisibleFocusIndicator: (info.outlineStyle !== 'none' && info.outlineWidth !== '0px') || info.boxShadow !== 'none',
      });
    }

    return results;
  }

  async getFaviconHref(): Promise<string | null> {
    const locator = this.buildLocator(this.homeLocators.faviconLink[0]).first();
    return locator.getAttribute('href');
  }

  async isFaviconResourceLoaded(): Promise<boolean> {
    const href = await this.getFaviconHref();
    if (!href) {
      return false;
    }
    const response = await this.page.request.get(href);
    return response.ok();
  }
}
