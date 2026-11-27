import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { Catalog } from '../packages/schema/types';
import { patientContentHash } from './lib/patient-bundle-hash';
const source = readFileSync('docs/clinical/source-library-v0.2.draft.json', 'utf8');
const catalog = JSON.parse(source) as Catalog;
const bundle = {
  version: catalog.libraryVersion,
  status: 'draft_not_for_clinical_use',
  provenance: 'Repository English/Danish source; no generated or validated translation',
  sourceHash: createHash('sha256').update(JSON.stringify(catalog)).digest('hex'),
  responseTypes: catalog.responseTypes,
  commonNonanswers: catalog.commonNonanswers,
  items: Object.fromEntries(
    catalog.items.map((i) => [
      i.id,
      { version: i.sourceVersion, text: { en: i.source.en.text, da: i.source.da.text } },
    ]),
  ),
};
const ui = JSON.parse(
  readFileSync('packages/translations/data/ui.bundle.v1.json', 'utf8'),
) as object;
writeFileSync(
  'packages/translations/data/patient.v0.2.draft.json',
  JSON.stringify({ ...bundle, contentHash: patientContentHash(bundle, ui) }, null, 2) + '\n',
);
