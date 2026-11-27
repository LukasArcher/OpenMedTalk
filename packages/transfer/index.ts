import { catalog, itemById } from '../clinical/catalog';
import { validateAnswer } from '../schema/answer';
import type { Session } from '../schema/types';
import { sourceHash, patientBundleHash } from '../translations/patient';
import { isAvailableLocale } from '../translations/locales';

const MAX_PAYLOAD = 200_000,
  CHUNK_SIZE = 850,
  MAX_CHUNKS = 256;
const idPattern = /^[A-Za-z0-9_-]{1,100}$/;
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw Error('Malformed transfer');
  return value as Record<string, unknown>;
}
function exactKeys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((k) => !allowed.includes(k)))
    throw Error('Unexpected transfer field');
}
function checksum(value: string): string {
  let crc = 0xffffffff;
  for (let i = 0; i < value.length; i++) {
    crc ^= value.charCodeAt(i);
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}
export function validateSession(value: unknown): asserts value is Session {
  const session = object(value);
  exactKeys(session, ['id', 'events']);
  if (
    typeof session.id !== 'string' ||
    !idPattern.test(session.id) ||
    !Array.isArray(session.events) ||
    session.events.length > 500
  )
    throw Error('Invalid session');
  const ids = new Set<string>();
  for (const raw of session.events) {
    const e = object(raw);
    exactKeys(e, [
      'id',
      'itemId',
      'itemVersion',
      'catalogVersion',
      'patientLocale',
      'answer',
      'timestamp',
      'correctedAt',
      'corrections',
    ]);
    if (
      typeof e.id !== 'string' ||
      !idPattern.test(e.id) ||
      ids.has(e.id) ||
      typeof e.itemId !== 'string'
    )
      throw Error('Invalid event ID');
    ids.add(e.id);
    const item = itemById(e.itemId);
    if (
      e.itemVersion !== item.sourceVersion ||
      e.catalogVersion !== catalog.libraryVersion ||
      !isAvailableLocale(e.patientLocale)
    )
      throw Error('Incompatible catalog or locale');
    for (const field of ['timestamp', 'correctedAt']) {
      const time = e[field];
      if (field === 'correctedAt' && time === undefined) continue;
      if (
        typeof time !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(time) ||
        !Number.isFinite(Date.parse(time)) ||
        new Date(time).toISOString() !== time
      )
        throw Error('Invalid event time');
    }
    validateAnswer(item.responseType, e.answer);
    if (e.corrections !== undefined) {
      if (!Array.isArray(e.corrections) || e.corrections.length > 50)
        throw Error('Invalid corrections');
      for (const correction of e.corrections) {
        const c = object(correction);
        exactKeys(c, ['answer', 'patientLocale', 'timestamp']);
        if (
          !isAvailableLocale(c.patientLocale) ||
          typeof c.timestamp !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(c.timestamp) ||
          !Number.isFinite(Date.parse(c.timestamp)) ||
          new Date(c.timestamp).toISOString() !== c.timestamp
        )
          throw Error('Invalid correction');
        validateAnswer(item.responseType, c.answer);
      }
    }
  }
}
interface Chunk {
  format: 'OMT1';
  hash: string;
  index: number;
  total: number;
  data: string;
}
function parseChunk(text: string): Chunk {
  if (text.length > 1400) throw Error('Oversized QR');
  const chunk = object(JSON.parse(text));
  exactKeys(chunk, ['format', 'hash', 'index', 'total', 'data']);
  if (
    chunk.format !== 'OMT1' ||
    typeof chunk.hash !== 'string' ||
    !/^[a-f0-9]{8}$/.test(chunk.hash) ||
    typeof chunk.index !== 'number' ||
    typeof chunk.total !== 'number' ||
    !Number.isInteger(chunk.index) ||
    !Number.isInteger(chunk.total) ||
    chunk.total < 1 ||
    chunk.total > MAX_CHUNKS ||
    chunk.index < 0 ||
    chunk.index >= chunk.total ||
    typeof chunk.data !== 'string' ||
    chunk.data.length > CHUNK_SIZE
  )
    throw Error('Invalid QR chunk');
  return chunk as unknown as Chunk;
}
export function encodeTransfer(session: Session): string[] {
  validateSession(session);
  if (!session.events.length) throw Error('No active answers');
  const payload = JSON.stringify({
    version: 1,
    catalog: catalog.libraryVersion,
    sourceHash,
    translations: patientBundleHash,
    session,
  });
  if (payload.length > MAX_PAYLOAD) throw Error('Transfer too large');
  const hash = checksum(payload),
    total = Math.ceil(payload.length / CHUNK_SIZE);
  return Array.from({ length: total }, (_, index) =>
    JSON.stringify({
      format: 'OMT1',
      hash,
      index,
      total,
      data: payload.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
    }),
  );
}
export function acceptChunk(current: string[], text: string): string[] {
  const next = parseChunk(text);
  if (!current.length) return [text];
  const first = parseChunk(current[0]!);
  if (first.hash !== next.hash || first.total !== next.total)
    throw Error('Different transfer: reset scanner first');
  const existing = current.find((c) => parseChunk(c).index === next.index);
  if (existing && existing !== text) throw Error('Conflicting chunk');
  return existing ? current : [...current, text];
}
export function transferProgress(chunks: string[]) {
  return { received: chunks.length, total: chunks.length ? parseChunk(chunks[0]!).total : 0 };
}
export function decodeTransfer(chunks: string[]): Session {
  if (!chunks.length || chunks.length > MAX_CHUNKS) throw Error('Incomplete transfer');
  let accepted: string[] = [];
  for (const chunk of chunks) accepted = acceptChunk(accepted, chunk);
  const parts = accepted.map(parseChunk).sort((a, b) => a.index - b.index);
  const first = parts[0]!;
  if (parts.length !== first.total || parts.some((p, i) => p.index !== i))
    throw Error('Incomplete transfer');
  const payload = parts.map((p) => p.data).join('');
  if (payload.length > MAX_PAYLOAD || checksum(payload) !== first.hash)
    throw Error('QR integrity check failed');
  const value = object(JSON.parse(payload));
  exactKeys(value, ['version', 'catalog', 'sourceHash', 'translations', 'session']);
  if (
    value.version !== 1 ||
    value.catalog !== catalog.libraryVersion ||
    value.sourceHash !== sourceHash ||
    value.translations !== patientBundleHash
  )
    throw Error('Incompatible transfer version');
  validateSession(value.session);
  return value.session;
}
