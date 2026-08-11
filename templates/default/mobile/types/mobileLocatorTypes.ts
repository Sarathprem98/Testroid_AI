export type MobilePlatform = 'android' | 'ios';

// Mirrors locators/locatorConstants.ts's LocatorStrategy/LocatorStrategyList pattern
// (an ordered fallback list, most semantic/robust first, most brittle last) — same
// idea, mapped onto Appium/WebdriverIO's native selector strategies instead of DOM ones.
export type MobileLocatorStrategy =
  | { kind: 'accessibilityId'; id: string } // '~id' — cross-platform, maps to content-desc (Android) / accessibilityIdentifier (iOS)
  | { kind: 'androidUiAutomator'; expression: string } // 'android=UiSelector...' — Android only, skipped on iOS sessions
  | { kind: 'iosPredicate'; expression: string } // '-ios predicate string:...' — iOS only, skipped on Android sessions
  | { kind: 'id'; resourceId: string } // native resource-id (Android) / name (iOS) — platform-specific but stable
  | { kind: 'xpath'; selector: string }; // last resort — most brittle, native XML tree is not a stable contract

export type MobileLocatorStrategyList = readonly MobileLocatorStrategy[];
