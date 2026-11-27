import { catalog } from '../clinical/catalog';
import type { Answer } from './types';
import { validBodyRegion } from './body';

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid answer');
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((k) => !allowed.includes(k))) throw Error('Unexpected answer field');
}
function validDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function validateAnswer(responseType: string, value: unknown): asserts value is Answer {
  const spec = catalog.responseTypes[responseType];
  if (!spec || !spec.recordsAnswer) throw Error('Answer not permitted');
  const a = record(value);
  if (a.kind === 'choice') {
    keys(a, ['kind', 'code']);
    if (
      typeof a.code === 'string' &&
      [...catalog.commonNonanswers, ...(spec.options ?? [])].some((o) => o.id === a.code)
    )
      return;
    throw Error('Invalid answer code');
  }
  if (responseType === 'bool' || responseType === 'onset_interval') throw Error('Choice required');
  if (responseType === 'body') {
    keys(a, ['kind', 'points']);
    if (
      a.kind !== 'body' ||
      !Array.isArray(a.points) ||
      a.points.length < 1 ||
      a.points.length > 70
    )
      throw Error('Invalid body selection');
    const selected = new Set<string>();
    for (const point of a.points) {
      const p = record(point);
      keys(p, ['view', 'region']);
      if (
        !['front', 'back'].includes(String(p.view)) ||
        !spec.regions?.some((r) => r.id === p.region)
      )
        throw Error('Invalid anatomy');
      if (!validBodyRegion(p.view as 'front' | 'back', String(p.region)))
        throw Error('Invalid anatomy view');
      const key = p.view + ':' + String(p.region);
      if (selected.has(key)) throw Error('Duplicate body region');
      selected.add(key);
    }
    return;
  }
  if (a.kind === 'datetime' && responseType === 'elapsed') {
    keys(a, ['kind', 'value', 'approximate']);
    if (
      typeof a.value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(a.value) ||
      !validDate(a.value.slice(0, 10)) ||
      Number(a.value.slice(11, 13)) > 23 ||
      Number(a.value.slice(14, 16)) > 59 ||
      typeof a.approximate !== 'boolean'
    )
      throw Error('Invalid local date/time');
    return;
  }
  if (responseType === 'date') {
    keys(a, ['kind', 'value', 'approximate']);
    if (a.kind !== 'date' || !validDate(a.value) || typeof a.approximate !== 'boolean')
      throw Error('Invalid date');
    return;
  }
  keys(a, ['kind', 'value', 'unit', 'approximate']);
  if (
    a.kind !== 'number' ||
    typeof a.value !== 'number' ||
    !Number.isFinite(a.value) ||
    Math.abs(a.value) > 1e9 ||
    (spec.min !== undefined && a.value < spec.min) ||
    (spec.max !== undefined && a.value > spec.max)
  )
    throw Error('Invalid number');
  if (['integer', 'integer_scale'].includes(spec.kind) && !Number.isInteger(a.value))
    throw Error('Integer required');
  if (spec.units && !spec.units.some((u) => u.id === a.unit)) throw Error('Unit required');
  if (!spec.units && a.unit !== undefined && a.unit !== spec.unit?.id)
    throw Error('Unexpected unit');
  if (
    a.approximate !== undefined &&
    (typeof a.approximate !== 'boolean' || (a.approximate && !spec.allowApproximate))
  )
    throw Error('Approximation not permitted');
}
