import { expect, it } from 'vitest';
import { languageName } from '../packages/translations/language-names';
import names from '../packages/translations/data/language-names.v1.json';
import { availableLocales, locales } from '../packages/translations/locales';
import { ui } from '../packages/translations/ui';
import type { Locale } from '../packages/schema/types';

it('bundles names for every configured language in each available UI language', () => {
  expect(Object.keys(names).sort()).toEqual(Object.keys(ui).sort());
  for (const uiLocale of availableLocales) {
    for (const locale of locales) {
      expect(languageName(locale.id, uiLocale.id as Locale).trim().length).toBeGreaterThan(0);
    }
  }
  expect(() => languageName('unknown-language', 'en')).toThrow('Language name unavailable');
});

it('resolves localized names when the JavaScript engine has no DisplayNames constructor', () => {
  const descriptor = Object.getOwnPropertyDescriptor(Intl, 'DisplayNames');
  Object.defineProperty(Intl, 'DisplayNames', { value: undefined, configurable: true });
  try {
    expect(languageName('de', 'da')).toBe('tysk');
    expect(languageName('da', 'de')).toBe('Dänisch');
    expect(languageName('de', 'en')).toBe('German');
  } finally {
    if (descriptor) Object.defineProperty(Intl, 'DisplayNames', descriptor);
    else Reflect.deleteProperty(Intl, 'DisplayNames');
  }
});
