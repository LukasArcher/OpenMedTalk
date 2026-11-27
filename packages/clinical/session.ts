import { catalog, itemById } from './catalog';
import { validateAnswer } from '../schema/answer';
import type { Answer, AnswerEvent, Locale, Session } from '../schema/types';
import { patientText, patientResponseTypes, patientNonanswers } from '../translations/patient';
import { ui } from '../translations/ui';

export function createEvent(
  id: string,
  itemId: string,
  patientLocale: Locale,
  answer: Answer,
  timestamp: string,
): AnswerEvent {
  const item = itemById(itemId);
  validateAnswer(item.responseType, answer);
  if (!id || !Number.isFinite(Date.parse(timestamp))) throw Error('Invalid event');
  return {
    id,
    itemId,
    itemVersion: item.sourceVersion,
    catalogVersion: catalog.libraryVersion,
    patientLocale,
    answer: JSON.parse(JSON.stringify(answer)) as Answer,
    timestamp,
  };
}
export function correctEvent(
  original: AnswerEvent,
  answer: Answer,
  timestamp: string,
): AnswerEvent {
  if ((original.corrections?.length ?? 0) >= 50) throw Error('Correction limit');
  const event = createEvent(
    original.id,
    original.itemId,
    original.patientLocale,
    answer,
    original.timestamp,
  );
  return {
    ...event,
    correctedAt: timestamp,
    corrections: [
      ...(original.corrections ?? []),
      {
        answer: original.answer,
        patientLocale: original.patientLocale,
        timestamp: original.correctedAt ?? original.timestamp,
      },
    ],
  };
}
export function answerText(event: AnswerEvent, locale: Locale): string {
  const spec = patientResponseTypes[itemById(event.itemId).responseType]!;
  const a = event.answer;
  if (a.kind === 'choice')
    return [...patientNonanswers, ...(spec.options ?? [])].find((o) => o.id === a.code)!.label[
      locale
    ];
  const approximate = 'approximate' in a && a.approximate ? ui[locale].approximate + ' ' : '';
  if (a.kind === 'date' || a.kind === 'datetime') return approximate + a.value;
  if (a.kind === 'body')
    return a.points
      .map(
        (p) =>
          `${spec.views!.find((v) => v.id === p.view)!.label[locale]}: ${spec.regions!.find((r) => r.id === p.region)!.label[locale]}`,
      )
      .join('; ');
  const unit = spec.units?.find((u) => u.id === a.unit) ?? spec.unit;
  const decimal =
    new Intl.NumberFormat(locale).formatToParts(1.1).find((p) => p.type === 'decimal')?.value ??
    '.';
  return (
    approximate +
    String(a.value).replace('.', decimal) +
    (unit ? ' ' + unit.label[locale] : '') +
    (spec.kind === 'integer_scale' ? ' / 10' : '')
  );
}
export function answerTimestamp(event: AnswerEvent): string {
  return event.correctedAt ?? event.timestamp;
}
export function groupedLog(session: Session, locale: Locale) {
  const result = new Map<
    string,
    { id: string; question: string; answer: string; timestamp: string }[]
  >();
  for (const e of [...session.events].sort((a, b) =>
    answerTimestamp(a).localeCompare(answerTimestamp(b)),
  )) {
    const item = itemById(e.itemId);
    for (const target of item.summaryTargets) {
      const list = result.get(target) ?? [];
      list.push({
        id: e.id,
        question: patientText(item.id, item.sourceVersion, locale),
        answer: answerText(e, locale),
        timestamp: answerTimestamp(e),
      });
      result.set(target, list);
    }
  }
  return [...result].map(([target, events]) => ({ target, events }));
}
export function mergeSessions(current: Session, incoming: Session): Session {
  const events = new Map(current.events.map((e) => [e.id, e]));
  for (const event of incoming.events) {
    const old = events.get(event.id);
    if (old && JSON.stringify(old) !== JSON.stringify(event)) throw Error('Conflicting event ID');
    events.set(event.id, event);
  }
  if (events.size > 500) throw Error('Session limit');
  return {
    ...current,
    events: [...events.values()].sort((a, b) =>
      answerTimestamp(a).localeCompare(answerTimestamp(b)),
    ),
  };
}
