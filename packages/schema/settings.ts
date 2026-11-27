import { locales, isAvailableLocale } from '../translations/locales';
import { catalog } from '../clinical/catalog';
import type { Locale } from './types';
export interface Settings {
  uiLocale: Locale;
  theme: 'system' | 'light' | 'dark';
  favorites: string[];
  recent: string[];
  questionFavorites: string[];
  setupDone: boolean;
}
export function parseSettings(raw: unknown): Settings {
  const value = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const ids = (key: string, allowed: Set<string>, max: number) =>
    Array.isArray(value[key])
      ? [
          ...new Set(
            (value[key] as unknown[]).filter(
              (v): v is string => typeof v === 'string' && allowed.has(v),
            ),
          ),
        ].slice(0, max)
      : [];
  const localeIds = new Set(locales.map((l) => l.id));
  return {
    uiLocale: isAvailableLocale(value.uiLocale) ? value.uiLocale : 'en',
    theme: value.theme === 'dark' ? 'dark' : value.theme === 'light' ? 'light' : 'system',
    favorites: ids('favorites', localeIds, 45),
    recent: ids('recent', localeIds, 8),
    questionFavorites: ids('questionFavorites', new Set(catalog.items.map((i) => i.id)), 579),
    setupDone: value.setupDone === true,
  };
}
