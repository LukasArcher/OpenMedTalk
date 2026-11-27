import { useApp } from '../state/app-state';
import { Button, Stack } from './ui';
import { availableLocales, isAvailableLocale } from '../../../../packages/translations/locales';
export function UiLanguages() {
  const { settings, updateSettings } = useApp();
  return (
    <Stack>
      {availableLocales.map((l) => (
        <Button
          key={l.id}
          label={l.autonym}
          selected={settings.uiLocale === l.id}
          onPress={() => {
            if (isAvailableLocale(l.id)) updateSettings({ uiLocale: l.id });
          }}
        />
      ))}
    </Stack>
  );
}
export function Themes() {
  const { settings, updateSettings, t } = useApp();
  return (
    <Stack>
      {(['light', 'dark', 'system'] as const).map((theme) => (
        <Button
          key={theme}
          label={t[theme]}
          selected={settings.theme === theme}
          onPress={() => updateSettings({ theme })}
        />
      ))}
    </Stack>
  );
}
