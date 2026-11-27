import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
const directory = 'packages/translations/data';
const files = readdirSync(directory).filter(
  (file) => file !== 'ui.bundle.v1.json' && /^ui\.[a-zA-Z-]+\.v1\.json$/.test(file),
);
const bundle = Object.fromEntries(
  files.map((file) => [
    file.split('.')[1]!,
    JSON.parse(readFileSync(`${directory}/${file}`, 'utf8')) as Record<string, string>,
  ]),
);
writeFileSync(`${directory}/ui.bundle.v1.json`, JSON.stringify(bundle, null, 2) + '\n');
const locales = JSON.parse(readFileSync(`${directory}/locales.v1.json`, 'utf8')) as {
  id: string;
  autonym: string;
}[];
const names = Object.fromEntries(
  Object.keys(bundle).map((locale) => {
    const display = new Intl.DisplayNames([locale], { type: 'language' });
    return [
      locale,
      Object.fromEntries(locales.map(({ id, autonym }) => [id, display.of(id) ?? autonym])),
    ];
  }),
);
writeFileSync(`${directory}/language-names.v1.json`, JSON.stringify(names, null, 2) + '\n');
