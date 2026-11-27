import { useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { catalog } from '../../../../packages/clinical/catalog';
import type { Answer } from '../../../../packages/schema/types';
import { patientText } from '../../../../packages/translations/patient';
import { ui } from '../../../../packages/translations/ui';
import { useApp } from '../state/app-state';
import { Button, Notice, Page } from '../components/ui';
import { ResponseInput } from '../components/response-input';
export default function Patient() {
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const { session, settings, patientLocale: activeLocale, colors, recordAnswer } = useApp();
  const [source, setSource] = useState(false),
    [limit, setLimit] = useState(false);
  const answered = useRef(false);
  const patientLocale =
    (edit ? session?.events.find((e) => e.id === edit)?.patientLocale : undefined) ?? activeLocale;
  const item = catalog.items.find((i) => i.id === id);
  const t = ui[patientLocale];
  if (!session || !item) return <Redirect href="/" />;
  const question = patientText(
    item.id,
    item.sourceVersion,
    source ? settings.uiLocale : patientLocale,
  );
  function answer(value: Answer) {
    if (answered.current) return;
    try {
      recordAnswer(id, value, edit);
      answered.current = true;
      router.back();
    } catch {
      setLimit(true);
    }
  }
  return (
    <Page locale={patientLocale}>
      <Notice text={t.draft} />
      <Pressable
        accessibilityRole="button"
        testID="patient-question"
        accessibilityLabel={question}
        accessibilityHint={t.sourceToggle}
        onPress={() => setSource(!source)}
        style={{
          minHeight: ['bool', 'info'].includes(item.responseType) ? 240 : 144,
          padding: ['bool', 'info'].includes(item.responseType) ? 28 : 20,
          borderRadius: 20,
          backgroundColor: colors.brandSoft,
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            lineHeight: 43,
            fontWeight: '600',
            textAlign: 'center',
            color: colors.text,
          }}
        >
          {question}
        </Text>
      </Pressable>
      {limit && <Notice text={t.limit} />}
      {item.responseType === 'info' ? (
        <Button label={t.close} onPress={() => router.back()} />
      ) : (
        <ResponseInput
          key={`${id}:${edit ?? ''}`}
          type={item.responseType}
          locale={patientLocale}
          onAnswer={answer}
        />
      )}
    </Page>
  );
}
