import { useState } from 'react';
import { Image } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../state/app-state';
import { Button, Notice, Page } from '../components/ui';
import { UiLanguages, Themes } from '../components/settings-controls';
import { LanguageList } from '../components/language-list';
import brandImage from '../../../../assets/brand/exports/horizontal-1x.png';
export default function Setup() {
  const [step, setStep] = useState(0);
  const { t, updateSettings } = useApp();
  return (
    <Page
      back={false}
      title={[t.appLanguage, t.appearance, t.favoriteLanguages][step]}
      footer={
        <Button
          label={step === 2 ? t.done : t.continue}
          primary
          onPress={() => {
            if (step < 2) setStep(step + 1);
            else {
              updateSettings({ setupDone: true });
              router.replace('/');
            }
          }}
        />
      }
    >
      {step === 0 && (
        <>
          <Image source={brandImage} style={{ width: '100%', height: 100 }} resizeMode="contain" />
          <UiLanguages />
          <Notice text={t.draft} />
        </>
      )}
      {step === 1 && <Themes />}
      {step === 2 && <LanguageList selectFavorites />}
      {step > 0 && <Button label={t.back} onPress={() => setStep(step - 1)} />}
    </Page>
  );
}
