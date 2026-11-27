import bundle from './data/patient.v0.2.draft.json';
import type { Locale, ResponseSpec, Option } from '../schema/types';
export const patientResponseTypes = bundle.responseTypes as unknown as Record<string, ResponseSpec>;
export const patientNonanswers = bundle.commonNonanswers as unknown as Option[];
export const sourceHash = bundle.sourceHash;
export const patientBundleHash = bundle.contentHash;
export const patientBundleVersion = bundle.version;
const items: Record<string, { version: number; text: Record<Locale, string> }> = bundle.items;
export function patientText(id: string, version: number, locale: Locale): string {
  const item = items[id];
  if (!item || item.version !== version || !item.text[locale])
    throw Error('Patient translation unavailable');
  return item.text[locale];
}
