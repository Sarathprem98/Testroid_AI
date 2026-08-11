import type { Page } from '@playwright/test';

export type AriaRole = Parameters<Page['getByRole']>[0];

export type LocatorStrategy =
  | { kind: 'role'; role: AriaRole; name: string | RegExp }
  | { kind: 'label'; text: string | RegExp }
  | { kind: 'placeholder'; text: string | RegExp }
  | { kind: 'text'; text: string | RegExp }
  | { kind: 'testId'; testId: string }
  | { kind: 'css'; selector: string }
  | { kind: 'xpath'; selector: string };

export type LocatorStrategyList = readonly LocatorStrategy[];

export const locatorConstants = {
  home: {
    brand: [
      { kind: 'role', role: 'link', name: 'PRODUCT STORE' },
      { kind: 'css', selector: 'a.navbar-brand' },
    ] as const,
    signUpLink: [
      { kind: 'role', role: 'link', name: 'Sign up' },
      { kind: 'text', text: 'Sign up' },
      { kind: 'css', selector: '#signin2' },
    ] as const,
    loginLink: [
      { kind: 'role', role: 'link', name: 'Log in' },
      { kind: 'text', text: 'Log in' },
      { kind: 'css', selector: '#login2' },
    ] as const,
    logoutLink: [
      { kind: 'role', role: 'link', name: 'Log out' },
      { kind: 'text', text: 'Log out' },
      { kind: 'css', selector: '#logout2' },
    ] as const,
    cartLink: [
      { kind: 'role', role: 'link', name: 'Cart' },
      { kind: 'text', text: 'Cart' },
      { kind: 'css', selector: '#cartur' },
    ] as const,
    welcomeLabel: [
      { kind: 'text', text: /^Welcome\s+/ },
      { kind: 'css', selector: '#nameofuser' },
    ] as const,
    productCard: (productName: string): LocatorStrategyList => [
      { kind: 'role', role: 'link', name: productName },
      { kind: 'text', text: productName },
      { kind: 'css', selector: `a.hrefch[href*="prod.html"]:has-text("${productName}")` },
      { kind: 'xpath', selector: `//a[contains(@class,'hrefch') and normalize-space(.)='${productName}']` },
    ] as const,
    nextButton: [
      { kind: 'role', role: 'button', name: 'Next' },
      { kind: 'text', text: 'Next' },
      { kind: 'css', selector: '#next2' },
    ] as const,
    categoryLink: (category: 'Phones' | 'Laptops' | 'Monitors'): LocatorStrategyList => [
      { kind: 'role', role: 'link', name: category },
      { kind: 'text', text: category },
      { kind: 'css', selector: `a[onclick*="byCat"]:has-text("${category}")` },
    ] as const,
    // multi-element list locator scoped to a container id; no role/label
    // fallback can express this without breaking the container scoping
    productGridItems: [
      { kind: 'css', selector: '#tbodyid a.hrefch' },
    ] as const,
    homeNavLink: [
      { kind: 'role', role: 'link', name: 'Home' },
      { kind: 'css', selector: 'a.nav-link[href="index.html"]' },
    ] as const,
    contactLink: [
      { kind: 'role', role: 'link', name: 'Contact' },
      { kind: 'css', selector: 'a[data-target="#exampleModal"]' },
    ] as const,
    aboutUsLink: [
      { kind: 'role', role: 'link', name: 'About us' },
      { kind: 'css', selector: 'a[data-target="#videoModal"]' },
    ] as const,
    // css leads intentionally: the carousel's next/prev anchors carry
    // role="button" with accessible names "Previous"/"Next", but "Next"
    // collides with the unrelated product-grid pagination button
    // (`home.nextButton`, id #next2), so role-first would be ambiguous
    carouselNextControl: [
      { kind: 'css', selector: '.carousel-control-next' },
      { kind: 'role', role: 'button', name: 'Next' },
    ] as const,
    carouselPrevControl: [
      { kind: 'css', selector: '.carousel-control-prev' },
      { kind: 'role', role: 'button', name: 'Previous' },
    ] as const,
    carouselActiveSlideImage: [
      { kind: 'css', selector: '.carousel-item.active img' },
    ] as const,
    carouselActiveIndicator: [
      { kind: 'css', selector: '.carousel-indicators li.active' },
    ] as const,
    productGridImages: [
      { kind: 'css', selector: '#tbodyid img' },
    ] as const,
    navbarToggler: [
      { kind: 'css', selector: '.navbar-toggler' },
    ] as const,
    // css leads intentionally, same collision as carouselNextControl above:
    // getByRole('button', {name:'Next'}) matches both this pagination
    // button and the carousel's next arrow, and resolves to the carousel
    // first in DOM order — confirmed live by `home.nextButton` silently
    // advancing the carousel instead of the product grid
    productGridNextButton: [
      { kind: 'css', selector: '#next2' },
      { kind: 'role', role: 'button', name: 'Next' },
    ] as const,
    // scoped to the card containing the given product name, to read the
    // grid-displayed price for cross-page comparison against the detail page
    productCardPrice: (productName: string): LocatorStrategyList => [
      { kind: 'css', selector: `.card:has(a.hrefch:has-text("${productName}")) h5` },
    ] as const,
    faviconLink: [
      { kind: 'css', selector: 'link[rel*="icon"]' },
    ] as const,
  },
  signUp: {
    usernameInput: [
      { kind: 'role', role: 'textbox', name: 'Username:' },
      { kind: 'label', text: 'Username:' },
      { kind: 'placeholder', text: 'Username' },
      { kind: 'css', selector: '#sign-username' },
    ] as const,
    passwordInput: [
      { kind: 'role', role: 'textbox', name: 'Password:' },
      { kind: 'label', text: 'Password:' },
      { kind: 'placeholder', text: 'Password' },
      { kind: 'css', selector: '#sign-password' },
    ] as const,
    submitButton: [
      { kind: 'role', role: 'button', name: 'Sign up' },
      { kind: 'text', text: 'Sign up' },
      { kind: 'css', selector: '#signInModal .btn-primary' },
    ] as const,
    closeButton: [
      { kind: 'role', role: 'button', name: 'Close' },
      { kind: 'text', text: 'Close' },
      { kind: 'css', selector: '#signInModal .btn-secondary' },
    ] as const,
  },
  login: {
    usernameInput: [
      { kind: 'role', role: 'textbox', name: 'Username:' },
      { kind: 'label', text: 'Username:' },
      { kind: 'placeholder', text: 'Username' },
      { kind: 'css', selector: '#loginusername' },
    ] as const,
    passwordInput: [
      { kind: 'role', role: 'textbox', name: 'Password:' },
      { kind: 'label', text: 'Password:' },
      { kind: 'placeholder', text: 'Password' },
      { kind: 'css', selector: '#loginpassword' },
    ] as const,
    submitButton: [
      { kind: 'role', role: 'button', name: 'Log in' },
      { kind: 'text', text: 'Log in' },
      { kind: 'css', selector: '#logInModal .btn-primary' },
    ] as const,
    closeButton: [
      { kind: 'role', role: 'button', name: 'Close' },
      { kind: 'text', text: 'Close' },
      { kind: 'css', selector: '#logInModal .btn-secondary' },
    ] as const,
  },
  product: {
    // css kept first intentionally: the role/text fallbacks below are
    // wildcard matches (any heading / any text) and could resolve to an
    // unrelated element earlier on the page if promoted to primary
    title: [
      { kind: 'css', selector: '.name' },
      { kind: 'role', role: 'heading', name: /./ },
    ] as const,
    price: [
      { kind: 'css', selector: '.price-container' },
      { kind: 'text', text: /^\$\d+/ },
    ] as const,
    addToCartButton: [
      { kind: 'role', role: 'link', name: 'Add to cart' },
      { kind: 'role', role: 'button', name: 'Add to cart' },
      { kind: 'text', text: 'Add to cart' },
      { kind: 'css', selector: '.btn.btn-success' },
    ] as const,
    // same wildcard-match caveat as title above
    description: [
      { kind: 'css', selector: '#more-information p' },
      { kind: 'text', text: /./ },
    ] as const,
    image: [
      { kind: 'css', selector: '.item.active img' },
    ] as const,
  },
  cart: {
    placeOrderButton: [
      { kind: 'role', role: 'button', name: 'Place Order' },
      { kind: 'text', text: 'Place Order' },
      { kind: 'css', selector: 'button[onclick="orderModal()"]' },
    ] as const,
    placeOrderModal: [
      { kind: 'text', text: 'Place order' },
      { kind: 'css', selector: '#orderModal' },
    ] as const,
    // multi-element list locator scoped to a container id; same exception
    // as home.productGridItems above
    rows: [
      { kind: 'css', selector: '#tbodyid tr' },
    ] as const,
    // scoped to the row containing the given product name, to avoid
    // matching every "Delete" link when multiple items are in the cart
    deleteButtonFor: (productName: string): LocatorStrategyList => [
      { kind: 'css', selector: `#tbodyid tr:has-text("${productName}") a:has-text("Delete")` },
    ] as const,
  },
  checkout: {
    nameInput: [
      { kind: 'label', text: 'Name' },
      { kind: 'placeholder', text: 'Name' },
      { kind: 'css', selector: '#name' },
    ] as const,
    countryInput: [
      { kind: 'label', text: 'Country' },
      { kind: 'placeholder', text: 'Country' },
      { kind: 'css', selector: '#country' },
    ] as const,
    cityInput: [
      { kind: 'label', text: 'City' },
      { kind: 'placeholder', text: 'City' },
      { kind: 'css', selector: '#city' },
    ] as const,
    creditCardInput: [
      { kind: 'label', text: 'Credit card' },
      { kind: 'placeholder', text: 'Credit card' },
      { kind: 'css', selector: '#card' },
    ] as const,
    monthInput: [
      { kind: 'label', text: 'Month' },
      { kind: 'placeholder', text: 'Month' },
      { kind: 'css', selector: '#month' },
    ] as const,
    yearInput: [
      { kind: 'label', text: 'Year' },
      { kind: 'placeholder', text: 'Year' },
      { kind: 'css', selector: '#year' },
    ] as const,
    purchaseButton: [
      { kind: 'role', role: 'button', name: 'Purchase' },
      { kind: 'text', text: 'Purchase' },
      { kind: 'css', selector: '#orderModal .btn-primary' },
    ] as const,
    // css leads here (breaking the usual role/text-first fallback order):
    // getByText('Thank you for your purchase!') resolves to just the <h2>
    // heading, not the surrounding .sweet-alert box, so innerText() on it
    // loses the Id/Amount/Card Number/Date paragraph the caller needs
    confirmationModal: [
      { kind: 'css', selector: '.sweet-alert.showSweetAlert.visible' },
      { kind: 'css', selector: '.sweet-alert.visible' },
      { kind: 'text', text: 'Thank you for your purchase!' },
    ] as const,
    confirmationOkButton: [
      { kind: 'role', role: 'button', name: 'OK' },
      { kind: 'text', text: 'OK' },
      { kind: 'css', selector: '.sweet-alert .confirm' },
    ] as const,
  },
  contact: {
    // css leads for name/email: the live site's <label for="..."> values
    // are mismatched (both labels point at #recipient-name), so getByLabel
    // resolves to the wrong field — verified against the live DOM 2026-07-15
    nameInput: [
      { kind: 'css', selector: '#recipient-name' },
    ] as const,
    emailInput: [
      { kind: 'css', selector: '#recipient-email' },
    ] as const,
    messageInput: [
      { kind: 'label', text: 'Message:' },
      { kind: 'css', selector: '#message-text' },
    ] as const,
    sendButton: [
      { kind: 'role', role: 'button', name: 'Send message' },
      { kind: 'css', selector: 'button[onclick="send()"]' },
    ] as const,
    closeButton: [
      { kind: 'role', role: 'button', name: 'Close' },
      { kind: 'css', selector: '#exampleModal .btn-secondary' },
    ] as const,
    modalTitle: [
      { kind: 'text', text: 'New message' },
      { kind: 'css', selector: '#exampleModalLabel' },
    ] as const,
  },
  about: {
    modalTitle: [
      { kind: 'text', text: 'About us' },
      { kind: 'css', selector: '#videoModalLabel' },
    ] as const,
    videoPlayer: [
      { kind: 'css', selector: '#videoModal #example-video' },
    ] as const,
    videoPlayButton: [
      { kind: 'css', selector: '#videoModal .vjs-big-play-button' },
    ] as const,
    closeButton: [
      { kind: 'role', role: 'button', name: 'Close' },
      { kind: 'css', selector: '#videoModal .btn-secondary' },
    ] as const,
  },
} as const;