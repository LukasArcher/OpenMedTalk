import { it, expect } from 'vitest';
import { encodeTransfer, decodeTransfer, acceptChunk } from '../packages/transfer/index';
import { createEvent } from '../packages/clinical/session';
import { crc32 } from 'node:zlib';
const session = {
  id: 'synthetic-session',
  events: [
    createEvent(
      'synthetic-event',
      'heart_001',
      'da',
      { kind: 'choice', code: 'yes' },
      '2026-01-01T10:00:00.000Z',
    ),
  ],
};
it('round-trips a bounded offline transfer in arbitrary chunk order', () => {
  const chunks = encodeTransfer(session);
  let state: string[] = [];
  for (const chunk of [...chunks].reverse()) state = acceptChunk(state, chunk);
  expect(decodeTransfer(state)).toEqual(session);
  expect(acceptChunk(state, chunks[0]!)).toEqual(state);
});
it('rejects corrupted, oversized, incomplete, incompatible and mixed transfers', () => {
  const chunks = encodeTransfer(session);
  expect(() => decodeTransfer([chunks[0]!.replace('heart', 'lungs')])).toThrow();
  expect(() => acceptChunk([], 'x'.repeat(1401))).toThrow();
  expect(() => decodeTransfer([])).toThrow();
  const other = encodeTransfer({ ...session, id: 'other' });
  expect(() => acceptChunk(chunks, other[0]!)).toThrow();
  expect(() =>
    encodeTransfer({ ...session, events: [{ ...session.events[0]!, catalogVersion: 'unknown' }] }),
  ).toThrow();
  expect(() =>
    encodeTransfer({
      ...session,
      events: [{ ...session.events[0]!, patientLocale: 'ar' as 'en' }],
    }),
  ).toThrow();
});
it('rejects a different translation snapshot even with a valid transfer checksum', () => {
  const frames = encodeTransfer(session).map((frame) => JSON.parse(frame) as { data: string });
  const envelope = JSON.parse(frames.map((frame) => frame.data).join('')) as Record<
    string,
    unknown
  >;
  envelope.translations = '0'.repeat(64);
  const payload = JSON.stringify(envelope),
    total = Math.ceil(payload.length / 850);
  const hash = crc32(Buffer.from(payload)).toString(16).padStart(8, '0');
  const foreign = Array.from({ length: total }, (_, index) =>
    JSON.stringify({
      format: 'OMT1',
      hash,
      index,
      total,
      data: payload.slice(index * 850, (index + 1) * 850),
    }),
  );
  expect(() => decodeTransfer(foreign)).toThrow('Incompatible transfer version');
});
it('chunks larger sessions, rejects missing chunks and event ID conflicts', () => {
  const many = {
    ...session,
    events: Array.from({ length: 50 }, (_, i) => ({ ...session.events[0]!, id: 'synthetic-' + i })),
  };
  const chunks = encodeTransfer(many);
  expect(chunks.length).toBeGreaterThan(1);
  expect(() => decodeTransfer(chunks.slice(1))).toThrow();
  expect(decodeTransfer(chunks)).toEqual(many);
  expect(() => encodeTransfer({ ...many, events: [...many.events, many.events[0]!] })).toThrow();
});
