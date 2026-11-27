import { useState } from 'react';
import { View, Text } from 'react-native';
import { Host, Switch } from '@expo/ui';
import type { Answer, BodyPoint, Locale } from '../../../../packages/schema/types';
import { patientResponseTypes, patientNonanswers } from '../../../../packages/translations/patient';
import { validateAnswer } from '../../../../packages/schema/answer';
import { ui } from '../../../../packages/translations/ui';
import { useApp } from '../state/app-state';
import { Button, Field, Label, Notice, Stack } from './ui';
import { BodyMap } from './body-map';
export function ResponseInput({
  type,
  locale,
  onAnswer,
}: {
  type: string;
  locale: Locale;
  onAnswer: (answer: Answer) => void;
}) {
  const [value, setValue] = useState(''),
    [unit, setUnit] = useState<string>(),
    [code, setCode] = useState<string>(),
    [points, setPoints] = useState<BodyPoint[]>([]),
    [approximate, setApproximate] = useState(false),
    [absolute, setAbsolute] = useState(false),
    [error, setError] = useState(false);
  const { colors, isDark } = useApp();
  const t = ui[locale];
  const spec = patientResponseTypes[type]!;
  const answer = (): Answer => {
    if (type === 'onset_interval') return { kind: 'choice', code: code ?? '' };
    if (type === 'body') return { kind: 'body', points };
    if (type === 'date') return { kind: 'date', value, approximate };
    if (absolute) return { kind: 'datetime', value, approximate };
    if (!value.trim() || !/^-?\d+(?:[.,]\d+)?$/.test(value)) throw Error('Value required');
    return {
      kind: 'number',
      value: Number(value.replace(',', '.')),
      ...(unit ? { unit } : {}),
      ...(spec.allowApproximate ? { approximate } : {}),
    };
  };
  function confirm() {
    try {
      const a = answer();
      validateAnswer(type, a);
      onAnswer(a);
    } catch {
      setError(true);
    }
  }
  if (type === 'bool')
    return (
      <Stack>
        <Stack row>
          {spec.options!.map((o) => (
            <Button
              big
              key={o.id}
              label={o.label[locale]}
              onPress={() => onAnswer({ kind: 'choice', code: o.id })}
            />
          ))}
        </Stack>
        <Nonanswers locale={locale} onAnswer={onAnswer} />
      </Stack>
    );
  return (
    <Stack style={{ gap: 24 }}>
      {type === 'onset_interval' ? (
        <Stack>
          {spec.options!.map((o) => (
            <Button
              key={o.id}
              label={o.label[locale]}
              selected={code === o.id}
              onPress={() => {
                setCode(o.id);
                setError(false);
              }}
            />
          ))}
        </Stack>
      ) : type === 'body' ? (
        <BodyMap
          locale={locale}
          points={points}
          onChange={(value) => {
            setPoints(value);
            setError(false);
          }}
        />
      ) : type === 'nrs' ? (
        <Stack>
          <Text
            style={{ textAlign: 'center', fontSize: 56, color: colors.text, fontWeight: '600' }}
          >
            {value || '—'}
            {value !== '' ? ' / 10' : ''}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {Array.from({ length: 11 }, (_, n) => (
              <View key={n} style={{ minWidth: 52, flexGrow: 1 }}>
                <Button
                  label={String(n)}
                  selected={value === String(n)}
                  onPress={() => {
                    setValue(String(n));
                    setError(false);
                  }}
                />
              </View>
            ))}
          </View>
          <Stack row>
            {spec.anchors!.map((a) => (
              <View key={a.value} style={{ flex: 1 }}>
                <Label>{a.label[locale]}</Label>
              </View>
            ))}
          </Stack>
        </Stack>
      ) : (
        <Stack>
          {type === 'elapsed' && (
            <Stack>
              <Button
                label={t.relative}
                selected={!absolute}
                onPress={() => {
                  setAbsolute(false);
                  setValue('');
                }}
              />
              <Button
                label={t.absolute}
                selected={absolute}
                onPress={() => {
                  setAbsolute(true);
                  setValue('');
                }}
              />
            </Stack>
          )}
          {type === 'date' || absolute ? (
            <Field
              accessibilityLabel={absolute ? t.datetime : t.date}
              placeholder={absolute ? t.datetime : t.date}
              value={value}
              onChangeText={(next) => {
                setValue(next);
                setError(false);
              }}
              autoCapitalize="none"
              maxLength={absolute ? 16 : 10}
            />
          ) : (
            <Stack>
              {spec.unit && <Label>{spec.unit.label[locale]}</Label>}
              <Field
                accessibilityLabel={t.value}
                value={value}
                onChangeText={(next) => {
                  setValue(next);
                  setError(false);
                }}
                keyboardType="decimal-pad"
                maxLength={16}
                style={{ fontSize: 40, textAlign: 'center', minHeight: 88 }}
              />
              {['count', 'weeks'].includes(type) && (
                <Stack row>
                  <Button
                    label={t.decrease}
                    icon="remove-outline"
                    onPress={() => setValue(String(Math.max(0, (Number(value) || 0) - 1)))}
                  />
                  <Button
                    label={t.increase}
                    icon="add-outline"
                    onPress={() => setValue(String((Number(value) || 0) + 1))}
                  />
                </Stack>
              )}
              {spec.units && (
                <Stack>
                  {spec.units.map((u) => (
                    <Button
                      key={u.id}
                      label={u.label[locale]}
                      selected={unit === u.id}
                      onPress={() => {
                        setUnit(u.id);
                        setError(false);
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          )}
          {(spec.allowApproximate || type === 'date') && (
            <Host colorScheme={isDark ? 'dark' : 'light'} seedColor={colors.brand} matchContents>
              <Switch value={approximate} onValueChange={setApproximate} label={t.approximate} />
            </Host>
          )}
        </Stack>
      )}
      {error && <Notice text={t.invalid} />}
      <Button label={t.confirm} primary onPress={confirm} />
      <Nonanswers locale={locale} onAnswer={onAnswer} />
    </Stack>
  );
}
function Nonanswers({ locale, onAnswer }: { locale: Locale; onAnswer: (answer: Answer) => void }) {
  return (
    <Stack row>
      {patientNonanswers.map((o) => (
        <View key={o.id} style={{ flex: 1 }}>
          <Button
            label={o.label[locale]}
            onPress={() => onAnswer({ kind: 'choice', code: o.id })}
          />
        </View>
      ))}
    </Stack>
  );
}
