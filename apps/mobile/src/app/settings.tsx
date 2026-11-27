import { useApp } from '../state/app-state';
import { Page, Stack, Label, Notice, Button } from '../components/ui';
import { UiLanguages, Themes } from '../components/settings-controls';
import { LanguageList } from '../components/language-list';
import Constants from 'expo-constants';
import { patientBundleVersion } from '../../../../packages/translations/patient';
export default function Settings() {
  const { t, settings, updateSettings, storageError } = useApp();
  return (
    <Page title={t.settings}>
      <Stack>
        <Label large>{t.appLanguage}</Label>
        <UiLanguages />
      </Stack>
      <Stack>
        <Label large>{t.appearance}</Label>
        <Themes />
      </Stack>
      <Stack>
        <Label large>{t.favoriteLanguages}</Label>
        <LanguageList selectFavorites />
      </Stack>
      {storageError && (
        <>
          <Notice text={t.storageError} />
          <Button label={t.retry} onPress={() => updateSettings({ ...settings })} />
        </>
      )}
      <Stack>
        <Label large>{t.about}</Label>
        <Label>OpenMedTalk</Label>
        <Label>
          {[Constants.expoConfig?.version, patientBundleVersion].filter(Boolean).join(' · ')}
        </Label>
        <Notice text={t.draft} />
        <Label>{t.privacy}</Label>
        <Label>{t.license}</Label>
      </Stack>
    </Page>
  );
}
