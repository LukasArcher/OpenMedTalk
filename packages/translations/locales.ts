import data from './data/locales.v1.json';
import uiBundle from './data/ui.bundle.v1.json';
import patientBundle from './data/patient.v0.2.draft.json';
import type { Locale } from '../schema/types';
export const locales = data;
export function isAvailableLocale(id: unknown): id is Locale {
  return (
    typeof id === 'string' &&
    Object.hasOwn(uiBundle, id) &&
    Object.values(patientBundle.items).every((i) => Object.hasOwn(i.text, id))
  );
}
export const availableLocales = locales.filter(
  (l) => l.developmentAvailable && isAvailableLocale(l.id),
);
