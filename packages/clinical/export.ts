import { groupedLog } from './session';
import groupNames from '../translations/data/groups.v1.json';
import { ui } from '../translations/ui';
import type { Locale, Session } from '../schema/types';
export function exportText(session: Session, locale: Locale): string {
  const groups: Record<string, string> = groupNames[locale];
  const log = groupedLog(session, locale);
  const sections = ['ABCDE', 'SAMPLER', 'OPQRST', 'OTHER'];
  return [
    `OpenMedTalk · ${locale} · 0.2.0-draft`,
    ui[locale].draft,
    ...sections.flatMap((section) => [
      section === 'OTHER' ? ui[locale].other : section,
      ...Object.keys(groups)
        .filter((target) => target.startsWith(section + '.'))
        .flatMap((target) => {
          const entries = log.find((g) => g.target === target)?.events ?? [];
          return entries.length
            ? [groups[target]!, ...entries.map((e) => `${e.timestamp}\n${e.question}\n${e.answer}`)]
            : [];
        }),
    ]),
  ].join('\n\n');
}
