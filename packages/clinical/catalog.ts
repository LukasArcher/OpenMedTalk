import source from '../../docs/clinical/source-library-v0.2.draft.json';
import type { Catalog, ClinicalItem, Locale } from '../schema/types';
import { patientText } from '../translations/patient';

export const catalog = source as unknown as Catalog;
const normalize = (value: string) =>
  value.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase().trim();
export function validateCatalog(data: Catalog): void {
  if (data.schemaVersion !== '0.2.0' || data.libraryVersion !== '0.2.0-draft')
    throw Error('Unsupported catalog');
  const ids = new Set<string>();
  const categories = new Set(data.categories.map((c) => c.id));
  const texts = { en: new Set<string>(), da: new Set<string>() };
  for (const item of data.items) {
    if (
      ids.has(item.id) ||
      !item.id ||
      !Number.isInteger(item.sourceVersion) ||
      item.sourceVersion < 1
    )
      throw Error('Invalid item ID/version');
    ids.add(item.id);
    if (
      !data.responseTypes[item.responseType] ||
      !item.categories.length ||
      item.categories.some((c) => !categories.has(c))
    )
      throw Error('Invalid item reference');
    for (const locale of ['en', 'da'] as const) {
      const text = normalize(item.source[locale].text);
      if (!text || texts[locale].has(text)) throw Error('Duplicate or missing source');
      texts[locale].add(text);
    }
    if (
      item.summaryTargets.some(
        (t) => !/^(ABCDE\.[ABCDE]|SAMPLER\.[SAMPLER]|OPQRST\.[OPQRST]|OTHER\.[a-z_]+)$/.test(t),
      )
    )
      throw Error('Invalid log mapping');
    if (new Set(item.summaryTargets).size !== item.summaryTargets.length)
      throw Error('Duplicate mapping');
  }
  if (data.commonNonanswers.map((o) => o.id).join(',') !== 'unknown,not_understood')
    throw Error('Invalid nonanswers');
}
export function assertRelease(data: Catalog): void {
  validateCatalog(data);
  if (
    data.status !== 'released' ||
    data.items.some(
      (i) =>
        i.releaseStatus !== 'released' ||
        Object.values(i.source).some((s) => s.reviewStatus !== 'expert_verified'),
    )
  )
    throw Error('Clinical release blocked: source and translation review required');
}
export function itemById(id: string): ClinicalItem {
  const item = catalog.items.find((i) => i.id === id);
  if (!item) throw Error('Unknown item');
  return item;
}
export function searchItems(query: string, locale: Locale, category?: string): ClinicalItem[] {
  const term = normalize(query);
  return catalog.items.filter(
    (i) =>
      (!category || i.categories.includes(category)) &&
      normalize(patientText(i.id, i.sourceVersion, locale)).includes(term),
  );
}
validateCatalog(catalog);
