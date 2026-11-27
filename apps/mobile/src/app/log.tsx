import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { patientText } from '../../../../packages/translations/patient';
import { answerText, answerTimestamp, groupedLog } from '../../../../packages/clinical/session';
import names from '../../../../packages/translations/data/groups.v1.json';
import { useApp } from '../state/app-state';
import { Button, Label, Notice, Page, Stack } from '../components/ui';
import { ConfirmAction } from '../components/confirm-action';
export default function Log() {
  const { session, t, settings, removeAnswer, endSession, undo, canUndo, colors } = useApp();
  const [active, setActive] = useState<string>();
  const [section, setSection] = useState('ABCDE');
  const [pending, setPending] = useState<string>();
  if (!session) return <Redirect href="/" />;
  const groups: Record<string, string> = names[settings.uiLocale];
  const mapped = groupedLog(session, settings.uiLocale);
  function controls(id: string) {
    return (
      <Stack row>
        <Button
          label={t.edit}
          onPress={() => {
            setActive(undefined);
            router.push({
              pathname: '/patient',
              params: { id: session!.events.find((e) => e.id === id)!.itemId, edit: id },
            });
          }}
        />
        <Button label={t.delete} onPress={() => { setActive(undefined); setPending(id); }} />
      </Stack>
    );
  }
  return (
    <Page
      title={t.log}
      actions={
        <Button label={t.export} icon="qr-code-outline" onPress={() => router.push('/transfer')} />
      }
    >
      <Stack row style={{ flexWrap: 'wrap' }}>
        {['ABCDE', 'SAMPLER', 'OPQRST', 'OTHER', 'all'].map((s) => (
          <Button
            key={s}
            label={s === 'OTHER' ? t.other : s === 'all' ? t.all : s}
            selected={section === s}
            onPress={() => setSection(s)}
          />
        ))}
      </Stack>
      {canUndo && <Button label={t.undo} onPress={undo} />}
      {pending && (
        <ConfirmAction
          message={pending === 'end' ? t.endWarning : t.deleteWarning}
          onCancel={() => setPending(undefined)}
          onConfirm={() => {
            if (pending === 'end') {
              endSession();
              router.replace('/');
            } else removeAnswer(pending);
            setPending(undefined);
          }}
        />
      )}
      {!session.events.length && <Notice text={t.empty} />}
      {section === 'all'
        ? [...session.events]
            .sort((a, b) => answerTimestamp(a).localeCompare(answerTimestamp(b)))
            .map((e) => (
              <Pressable key={e.id} onLongPress={() => setActive(e.id)} accessibilityRole="button" onAccessibilityTap={() => setActive(e.id)} style={{ padding: 16, gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 12 }}>
                <Label muted>
                  {new Date(answerTimestamp(e)).toLocaleTimeString(settings.uiLocale)}
                </Label>
                <Label>{patientText(e.itemId, e.itemVersion, settings.uiLocale)}</Label>
                <Label>{answerText(e, settings.uiLocale)}</Label>

              </Pressable>
            ))
        : Object.keys(groups)
            .filter((target) => target.startsWith(section + '.'))
            .map((target) => (
              <Stack key={target}>
                <Label large>{groups[target]}</Label>
                {(mapped.find((g) => g.target === target)?.events ?? []).map((e) => (
                  <Pressable key={e.id} onLongPress={() => setActive(e.id)} accessibilityRole="button" onAccessibilityTap={() => setActive(e.id)} style={{ padding: 16, gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 12 }}>
                    <Label muted>
                      {new Date(e.timestamp).toLocaleTimeString(settings.uiLocale)}
                    </Label>
                    <Label>{e.question}</Label>
                    <Label>{e.answer}</Label>

                  </Pressable>
                ))}
              </Stack>
            ))}
      <Modal visible={!!active} transparent animationType="fade" onRequestClose={() => setActive(undefined)}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0008' }}>
          <View style={{ padding: 24, gap: 16, backgroundColor: colors.background, borderRadius: 16 }}>
            {active && controls(active)}
            <Button label={t.close} onPress={() => setActive(undefined)} />
          </View>
        </View>
      </Modal>
      <Button label={t.end} onPress={() => setPending('end')} />
    </Page>
  );
}
