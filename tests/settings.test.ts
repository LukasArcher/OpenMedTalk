import { it, expect } from 'vitest';
import { parseSettings } from '../packages/schema/settings';
import { ui } from '../packages/translations/ui';
it('persists only settings IDs, never session data or arbitrary input', () => {
  expect(
    parseSettings({
      uiLocale: 'da',
      theme: 'dark',
      favorites: ['en'],
      recent: ['da'],
      questionFavorites: ['heart_001'],
      setupDone: true,
      events: [{ patient: 'forbidden' }],
    }),
  ).not.toHaveProperty('events');
  expect(
    parseSettings({ uiLocale: 'xx', theme: 'invalid', favorites: ['xx'], recent: [{}, 'da'] }),
  ).toMatchObject({ uiLocale: 'en', theme: 'system', favorites: [], recent: ['da'] });
  expect(() => parseSettings(null)).not.toThrow();
});
it('has complete independent UI dictionaries without fallback', () => {
  for (const dictionary of Object.values(ui)) {
    expect(Object.keys(dictionary).sort()).toEqual(Object.keys(ui.en).sort());
    expect(Object.values(dictionary).every((v) => v.length > 0)).toBe(true);
  }
});
