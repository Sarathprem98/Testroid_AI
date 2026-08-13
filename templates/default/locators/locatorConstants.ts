import type { Page } from '@playwright/test';

export type AriaRole = Parameters<Page['getByRole']>[0];

/**
 * One way to find an element. `BasePage.findElement` walks a `LocatorStrategyList`
 * in this order and returns the first strategy that actually resolves, so a page
 * keeps working even after a CSS class or DOM structure changes underneath it —
 * as long as one of the fallback strategies still matches.
 */
export type LocatorStrategy =
  | { kind: 'role'; role: AriaRole; name: string | RegExp }
  | { kind: 'label'; text: string | RegExp }
  | { kind: 'placeholder'; text: string | RegExp }
  | { kind: 'text'; text: string | RegExp }
  | { kind: 'testId'; testId: string }
  | { kind: 'css'; selector: string }
  | { kind: 'xpath'; selector: string };

export type LocatorStrategyList = readonly LocatorStrategy[];

/**
 * Site-specific locators go here, grouped by page/module, e.g.:
 *
 * ```ts
 * export const locatorConstants = {
 *   login: {
 *     usernameInput: [
 *       { kind: 'role', role: 'textbox', name: 'Username' },
 *       { kind: 'label', text: 'Username' },
 *       { kind: 'placeholder', text: 'Username' },
 *       { kind: 'css', selector: '#username' },
 *     ] as const,
 *     submitButton: (label: string): LocatorStrategyList => [
 *       { kind: 'role', role: 'button', name: label },
 *       { kind: 'text', text: label },
 *     ] as const,
 *   },
 * } as const;
 * ```
 *
 * Order strategies most-semantic-first, most-brittle-last (role/label/placeholder/text
 * → testId → css → xpath) — see `pages/BasePage.ts` for how the fallback walk works, and
 * the `testroid-locator-conventions` skill (`skills/testroid-locator-conventions/SKILL.md`)
 * for the full convention. A Page Object should never hold a raw CSS/XPath selector inline;
 * it belongs here as a `LocatorStrategyList` entry instead.
 */
export const locatorConstants = {} as const;
