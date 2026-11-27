import names from './data/language-names.v1.json';
import type { Locale } from '../schema/types';

const localized: Record<Locale, Record<string, string>> = names;

export function languageName(id: string, uiLocale: Locale): string {
  const name = localized[uiLocale][id];
  if (!name) throw Error('Language name unavailable');
  return name;
}
