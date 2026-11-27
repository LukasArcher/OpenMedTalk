import { createHash } from 'node:crypto';
export function patientContentHash(bundle: object, ui: object): string {
  const content = { ...bundle } as Record<string, unknown>;
  delete content.contentHash;
  return createHash('sha256')
    .update(JSON.stringify({ patient: content, ui }))
    .digest('hex');
}
