import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { availableLocales } from '../../../../packages/translations/locales';
import { languageName } from '../../../../packages/translations/language-names';
import type { Locale } from '../../../../packages/schema/types';
import { useApp } from '../state/app-state';
import { Button, Field, Label, Notice, Page, Stack } from '../components/ui';
import { LanguageList } from '../components/language-list';
export default function Picker() {
  const { ready, settings, t, session, selectLanguage, storageError } = useApp();
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [showRegions, setShowRegions] = useState(false);
  if (!ready) return null;
  if (!settings.setupDone) return <Redirect href="/setup" />;
  const choose = (id: Locale) => {
    selectLanguage(id);
    router.push('/categories');
  };
  const ids = availableLocales
    .filter(
      (l) =>
        (!region || l.regions.includes(region)) &&
        [
          l.name,
          l.autonym,
          ...l.countries,
          languageName(l.id, settings.uiLocale),
        ]
          .join(' ')
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()),
    )
    .map((l) => l.id);
  return (
    <Page
      title={t.patientLanguage}
      back={false}
      actions={
        <Button
          label={t.settings}
          icon="settings-outline"
          onPress={() => router.push('/settings')}
        />
      }
    >
      <Notice text={t.draft} />
      {storageError && <Notice text={t.storageError} />}
      <Field
        accessibilityLabel={t.search}
        placeholder={t.search}
        value={query}
        onChangeText={setQuery}
      />
      {session && <Button label={t.sessionActive} onPress={() => router.push('/categories')} />}
      {!query && !region && settings.favorites.length > 0 && (
        <Stack>
          <Label>{t.favorites}</Label>
          <LanguageList ids={settings.favorites} onSelect={choose} />
        </Stack>
      )}
      {!query && !region && settings.recent.length > 0 && (
        <Stack>
          <Label>{t.recent}</Label>
          <LanguageList ids={settings.recent} onSelect={choose} />
        </Stack>
      )}
      <Stack>
        <Label>{region ? t[region as keyof typeof t] : t.allLanguages}</Label>
        <LanguageList ids={ids} onSelect={choose} />
        {!ids.length && <Notice text={t.unavailable} />}
      </Stack>
      <Button label={t.regions} icon="globe-outline" onPress={() => setShowRegions(!showRegions)} />
      {showRegions && (
        <Stack>
          {['Europe', 'Middle East', 'Africa', 'Asia', 'Americas', 'Oceania'].map((r) => (
            <Button
              key={r}
              label={t[r as keyof typeof t]}
              selected={region === r}
              onPress={() => setRegion(region === r ? '' : r)}
            />
          ))}
        </Stack>
      )}
      <Button label={t.scanQr} icon="scan-outline" onPress={() => router.push('/transfer')} />
    </Page>
  );
}
