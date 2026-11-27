import { it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import source from '../docs/clinical/source-library-v0.2.draft.json';
import bundle from '../packages/translations/data/patient.v0.2.draft.json';
import en from '../packages/translations/data/ui.en.v1.json';
import da from '../packages/translations/data/ui.da.v1.json';
import { ui } from '../packages/translations/ui';
import { availableLocales, locales } from '../packages/translations/locales';
import {
  patientText,
  patientResponseTypes,
  patientNonanswers,
} from '../packages/translations/patient';
import navigation from '../packages/translations/data/navigation.v1.json';
import groups from '../packages/translations/data/groups.v1.json';
import type { Locale } from '../packages/schema/types';
import { createEvent, answerText } from '../packages/clinical/session';
import { assertRelease, catalog } from '../packages/clinical/catalog';
it('offers a complete German development bundle without opening clinical release', () => {
  expect(availableLocales.some((locale) => locale.id === 'de')).toBe(true);
  const locale = 'de' as Locale;
  for (const item of source.items) {
    expect(patientText(item.id, item.sourceVersion, locale).trim().length).toBeGreaterThan(0);
  }
  const event = createEvent(
    'synthetic-german',
    'thorax_001',
    locale,
    { kind: 'choice', code: 'no' },
    '2026-01-01T10:00:00.000Z',
  );
  expect(answerText(event, locale)).toBe('Nein');
  expect(bundle.status).toBe('draft_not_for_clinical_use');
  expect(() => assertRelease(catalog)).toThrow();
});
it('keeps the versioned UI registry and patient source snapshot synchronized', () => {
  expect(ui.en).toEqual(en);
  expect(ui.da).toEqual(da);
  expect(bundle.sourceHash).toBe(createHash('sha256').update(JSON.stringify(source)).digest('hex'));
  const { contentHash, ...content } = bundle;
  expect(contentHash).toBe(
    createHash('sha256')
      .update(JSON.stringify({ patient: content, ui }))
      .digest('hex'),
  );
  for (const item of source.items) {
    expect(patientText(item.id, item.sourceVersion, 'en')).toBe(item.source.en.text);
    expect(patientText(item.id, item.sourceVersion, 'da')).toBe(item.source.da.text);
  }
  for (const [translated, original] of [
    [bundle.responseTypes, source.responseTypes],
    [bundle.commonNonanswers, source.commonNonanswers],
  ]) {
    const sourceOnly = JSON.parse(
      JSON.stringify(translated, (key, value: unknown) => {
        if (key !== 'label' && key !== 'displayName') return value;
        const labels = value as Record<string, string>;
        return { en: labels.en, da: labels.da };
      }),
    ) as unknown;
    expect(sourceOnly).toEqual(original);
  }
});
it('requires complete question, response, category and group labels without patient fallback', () => {
  expect(() => patientText('thorax_001', 99, 'en')).toThrow();
  expect(() => patientText('thorax_001', 1, 'uk' as Locale)).toThrow();
  for (const locale of availableLocales) {
    const id = locale.id as Locale;
    for (const spec of Object.values(patientResponseTypes)) {
      for (const option of [
        ...(spec.options ?? []),
        ...(spec.units ?? []),
        ...(spec.unit ? [spec.unit] : []),
        ...(spec.regions ?? []),
        ...(spec.views ?? []),
        ...patientNonanswers,
        ...(spec.anchors ?? []),
      ])
        expect(option.label[id]?.length).toBeGreaterThan(0);
    }
    for (const category of source.categories)
      expect((navigation[id] as Record<string, string>)[category.id]?.length).toBeGreaterThan(0);
    for (const target of new Set(source.items.flatMap((i) => i.summaryTargets)))
      expect((groups[id] as Record<string, string>)[target]?.length).toBeGreaterThan(0);
  }
  for (const locale of locales) expect(() => Intl.getCanonicalLocales(locale.id)).not.toThrow();
});
