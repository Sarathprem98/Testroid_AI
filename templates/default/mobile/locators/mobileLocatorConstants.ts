import type { MobileLocatorStrategyList } from '../types/mobileLocatorTypes';

// No real native app exists in this project yet (Demoblaze is a website, automated via
// pages/** + Playwright, not a native app). The sampleLoginScreen group below is
// explicitly illustrative/placeholder — populate it (and any new screen group) with real
// accessibility ids/resource ids confirmed against an actual app once one is supplied for
// a ticket, the same way pages/HomePage.ts's locators are grounded in demoblaze.com's real DOM.
export const mobileLocatorConstants = {
  sampleLoginScreen: {
    usernameInput: [
      { kind: 'accessibilityId', id: 'username-input' },
      { kind: 'id', resourceId: 'username' },
      { kind: 'xpath', selector: '//*[@resource-id="username"]' },
    ] satisfies MobileLocatorStrategyList,
    passwordInput: [
      { kind: 'accessibilityId', id: 'password-input' },
      { kind: 'id', resourceId: 'password' },
      { kind: 'xpath', selector: '//*[@resource-id="password"]' },
    ] satisfies MobileLocatorStrategyList,
    loginButton: [
      { kind: 'accessibilityId', id: 'login-button' },
      { kind: 'androidUiAutomator', expression: 'new UiSelector().text("Login")' },
      { kind: 'iosPredicate', expression: 'label == "Login"' },
      { kind: 'id', resourceId: 'login' },
    ] satisfies MobileLocatorStrategyList,
    welcomeMessage: [
      { kind: 'accessibilityId', id: 'welcome-message' },
      { kind: 'id', resourceId: 'welcome' },
      { kind: 'xpath', selector: '//*[@resource-id="welcome"]' },
    ] satisfies MobileLocatorStrategyList,
  },
};
