import { readFileSync, writeFileSync } from 'node:fs';
import { patientContentHash } from './lib/patient-bundle-hash';
const path = 'packages/translations/data/patient.v0.2.draft.json';
const bundle = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
const ui = JSON.parse(
  readFileSync('packages/translations/data/ui.bundle.v1.json', 'utf8'),
) as object;
bundle.contentHash = patientContentHash(bundle, ui);
writeFileSync(path, JSON.stringify(bundle, null, 2) + '\n');
