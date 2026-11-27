import { describe, it, expect } from 'vitest';
import {
  catalog,
  itemById,
  validateCatalog,
  assertRelease,
  searchItems,
} from '../packages/clinical/catalog';
import { validateAnswer } from '../packages/schema/answer';
import {
  createEvent,
  correctEvent,
  answerText,
  groupedLog,
  mergeSessions,
} from '../packages/clinical/session';
import { locales } from '../packages/translations/locales';

describe('v0.2 clinical foundation', () => {
  it('validates the actual 579-item source, 30 categories and all locales', () => {
    expect(() => validateCatalog(catalog)).not.toThrow();
    expect(catalog.items).toHaveLength(579);
    expect(catalog.categories).toHaveLength(30);
    expect(locales).toHaveLength(45);
    expect(locales.find((l) => l.id === 'ar')?.direction).toBe('rtl');
    expect(new Set(locales.map((l) => l.id)).size).toBe(45);
  });
  it('blocks every draft from clinical release', () =>
    expect(() => assertRelease(catalog)).toThrow());
  it('has separate meals, five literal onset options and no refusal answer', () => {
    for (const meal of ['breakfast', 'lunch', 'dinner', 'six_hours'])
      expect(itemById('intake_002_' + meal).responseType).toBe('bool');
    expect(catalog.responseTypes.onset_interval!.options).toHaveLength(5);
    expect(catalog.commonNonanswers.map((o) => o.id)).toEqual(['unknown', 'not_understood']);
  });
  it('searches exact clinician source without changing items', () => {
    expect(searchItems('chest', 'en').length).toBeGreaterThan(0);
    expect(searchItems('bryst', 'da').length).toBeGreaterThan(0);
  });
  it('rejects missing, mismatched, nonfinite and default-like answers', () => {
    for (const value of [
      null,
      {},
      { kind: 'number', value: NaN },
      { kind: 'choice', code: 'declined' },
    ])
      expect(() => validateAnswer('bool', value)).toThrow();
    expect(() => validateAnswer('info', { kind: 'choice', code: 'yes' })).toThrow();
    expect(() => validateAnswer('nrs', { kind: 'number', value: 11 })).toThrow();
    expect(() => validateAnswer('count', { kind: 'number', value: 1.5 })).toThrow();
    expect(() => validateAnswer('elapsed', { kind: 'number', value: 2 })).toThrow();
    expect(() =>
      validateAnswer('date', { kind: 'date', value: '2025-02-30', approximate: false }),
    ).toThrow();
  });
  it('accepts all response forms without inferred values', () => {
    for (const kind of ['temperature', 'nrs', 'count', 'weeks', 'minutes', 'seconds', 'metres'])
      expect(() => validateAnswer(kind, { kind: 'number', value: 0 })).not.toThrow();
    for (const [kind, unit] of [
      ['duration', 's'],
      ['elapsed', 'h'],
      ['age', 'yr'],
      ['glucose', 'mmol/L'],
    ])
      expect(() =>
        validateAnswer(kind!, { kind: 'number', value: 2, unit, approximate: false }),
      ).not.toThrow();
    expect(() =>
      validateAnswer('body', { kind: 'body', points: [{ view: 'front', region: 'right_hand' }] }),
    ).not.toThrow();
    expect(() =>
      validateAnswer('date', { kind: 'date', value: '2024-02-29', approximate: true }),
    ).not.toThrow();
    expect(() =>
      validateAnswer('elapsed', {
        kind: 'datetime',
        value: '2026-01-01T23:59',
        approximate: false,
      }),
    ).not.toThrow();
    expect(() =>
      validateAnswer('elapsed', {
        kind: 'datetime',
        value: '2026-01-01T24:00',
        approximate: false,
      }),
    ).toThrow();
    expect(() =>
      validateAnswer('onset_interval', { kind: 'choice', code: 'at_least_7d' }),
    ).not.toThrow();
  });
  it('stores repeated literal answers once and maps the same event to multiple groups', () => {
    const a = createEvent(
      'event-a',
      'heart_001',
      'en',
      { kind: 'choice', code: 'no' },
      '2026-01-01T10:00:00.000Z',
    );
    const b = createEvent(
      'event-b',
      'heart_001',
      'da',
      { kind: 'choice', code: 'yes' },
      '2026-01-01T10:01:00.000Z',
    );
    const session = { id: 'session-a', events: [a, b] };
    const log = groupedLog(session, 'en');
    expect(log.filter((g) => g.events.some((e) => e.id === a.id)).length).toBeGreaterThan(1);
    expect(session.events).toHaveLength(2);
    expect(JSON.stringify(a)).not.toMatch(/patientName|sourcePerson|summary/);
    expect(mergeSessions(session, session).events).toHaveLength(2);
    expect(() =>
      mergeSessions(session, {
        ...session,
        events: [{ ...a, answer: { kind: 'choice', code: 'yes' } }],
      }),
    ).toThrow();
  });
  it('keeps literal correction history and original answer time', () => {
    const original = createEvent(
      'original',
      'heart_001',
      'en',
      { kind: 'choice', code: 'no' },
      '2026-01-01T10:00:00.000Z',
    );
    const corrected = correctEvent(
      original,
      { kind: 'choice', code: 'yes' },
      '2026-01-01T10:01:00.000Z',
    );
    expect(corrected.id).toBe(original.id);
    expect(corrected.timestamp).toBe(original.timestamp);
    expect(corrected.corrections).toEqual([
      { answer: original.answer, patientLocale: 'en', timestamp: original.timestamp },
    ]);
    expect(corrected.answer).toEqual({ kind: 'choice', code: 'yes' });
    expect(original.answer).toEqual({ kind: 'choice', code: 'no' });
    const entries = groupedLog({ id: 'corrected-session', events: [corrected] }, 'en');
    expect(entries[0]!.events[0]!.timestamp).toBe('2026-01-01T10:01:00.000Z');
  });
  it('preserves accepted numeric precision and blocks impossible anatomical combinations', () => {
    const item = catalog.items.find((i) => i.responseType === 'temperature')!;
    const event = createEvent(
      'precise',
      item.id,
      'en',
      { kind: 'number', value: 0.123456789 },
      '2026-01-01T10:00:00.000Z',
    );
    expect(answerText(event, 'en')).toBe('0.123456789 °C');
    expect(() =>
      validateAnswer('body', { kind: 'body', points: [{ view: 'back', region: 'face' }] }),
    ).toThrow();
    expect(() =>
      validateAnswer('body', { kind: 'body', points: [{ view: 'front', region: 'upper_back' }] }),
    ).toThrow();
  });
});
