import { useState } from 'react';
import Svg, { Path, Ellipse, Circle, G } from 'react-native-svg';
import { View, Pressable, Platform } from 'react-native';
import type { BodyPoint, Locale } from '../../../../packages/schema/types';
import { patientResponseTypes } from '../../../../packages/translations/patient';
import { useApp } from '../state/app-state';
import { ui } from '../../../../packages/translations/ui';
import { validBodyRegion, bodyPointPosition, bodyRegionAt } from '../../../../packages/schema/body';
import { Button, Stack, Label } from './ui';

const outline =
  'M 89 58 C 87 70 84 77 75 80 L 55 87 C 42 91 38 101 35 118 L 29 158 L 18 198 L 10 215 L 12 222 L 19 218 L 16 230 L 20 234 L 25 222 L 23 237 L 28 238 L 31 222 L 31 233 L 36 231 L 39 213 L 47 187 L 55 155 L 61 122 C 67 142 70 156 66 178 L 61 204 C 59 225 63 250 68 271 L 68 301 L 61 338 C 59 352 63 361 68 365 L 65 379 L 54 388 Q 52 397 66 397 L 81 395 L 85 383 L 83 362 L 88 326 L 91 300 L 91 272 L 96 223 L 104 223 L 109 272 L 109 300 L 112 326 L 117 362 L 115 383 L 119 395 L 134 397 Q 148 397 146 388 L 135 379 L 132 365 C 137 361 141 352 139 338 L 132 301 L 132 271 C 137 250 141 225 139 204 L 134 178 C 130 156 133 142 139 122 L 145 155 L 153 187 L 161 213 L 164 231 L 169 233 L 169 222 L 172 238 L 177 237 L 175 222 L 180 234 L 184 230 L 181 218 L 188 222 L 190 215 L 182 198 L 171 158 L 165 118 C 162 101 158 91 145 87 L 125 80 C 116 77 113 70 111 58 Z';
export function BodyMap({
  locale,
  points,
  onChange,
}: {
  locale: Locale;
  points: BodyPoint[];
  onChange: (points: BodyPoint[]) => void;
}) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [showRegions, setShowRegions] = useState(false);
  const { colors } = useApp();
  const t = ui[locale];
  const spec = patientResponseTypes.body!;
  const regions = spec.regions!.filter((r) => validBodyRegion(view, r.id));
  const toggle = (region: string) =>
    onChange(
      points.some((p) => p.view === view && p.region === region)
        ? points.filter((p) => !(p.view === view && p.region === region))
        : [...points, { view, region }],
    );
  return (
    <Stack>
      <Stack row>
        <Button label={t.front} selected={view === 'front'} onPress={() => setView('front')} />
        <Button label={t.bodyBack} selected={view === 'back'} onPress={() => setView('back')} />
      </Stack>
      <View style={{ alignItems: 'center', direction: 'ltr' }}>
        <Pressable
          testID="body-map"
          accessibilityRole="imagebutton"
          accessibilityLabel={view === 'front' ? t.front : t.bodyBack}
          onPress={({ nativeEvent }) => {
            const press = nativeEvent as typeof nativeEvent & {
              offsetX?: number;
              offsetY?: number;
            };
            const x = Platform.OS === 'web' ? press.offsetX : nativeEvent.locationX;
            const y = Platform.OS === 'web' ? press.offsetY : nativeEvent.locationY;
            const region = bodyRegionAt(view, x ?? NaN, y ?? NaN);
            if (region) toggle(region);
          }}
        >
          <Svg
            width={200}
            height={405}
            pointerEvents="none"
            viewBox="0 0 200 405"
            accessibilityLabel={view === 'front' ? t.front : t.bodyBack}
          >
            <Path d={outline} fill={colors.surface} stroke={colors.text} strokeWidth={1.2} />
            <Ellipse
              cx={100}
              cy={37}
              rx={21}
              ry={28}
              fill={colors.surface}
              stroke={colors.text}
              strokeWidth={1.2}
            />
            <Path d="M79 30 Q74 24 78 43 M121 30 Q126 24 122 43" fill="none" stroke={colors.text} />
            {view === 'front' ? (
              <G stroke={colors.secondary} fill="none" strokeWidth={1}>
                <Path d="M86 33 Q90 30 94 33 M106 33 Q110 30 114 33 M100 35 L97 45 L102 45 M93 52 Q100 55 107 52 M76 86 L94 91 M124 86 L106 91 M69 109 Q83 120 96 115 M131 109 Q117 120 104 115 M100 122 L100 164 M72 275 Q79 283 86 276 M114 276 Q121 283 128 275" />
                <Circle cx={89} cy={35} r={1} />
                <Circle cx={111} cy={35} r={1} />
              </G>
            ) : (
              <G stroke={colors.secondary} fill="none">
                <Path d="M100 84 L100 181 M74 100 Q83 113 78 132 M126 100 Q117 113 122 132 M69 183 Q100 197 131 183 M70 219 Q86 231 100 219 Q114 231 130 219" />
              </G>
            )}
            {points
              .filter((p) => p.view === view)
              .map((p) => {
                const [x, y] = bodyPointPosition(view, p.region) ?? [100, 150];
                return (
                  <Circle
                    key={p.region}
                    cx={x}
                    cy={y}
                    r={7}
                    fill={colors.brand}
                    stroke={colors.background}
                    strokeWidth={2}
                  />
                );
              })}
          </Svg>
        </Pressable>
      </View>
      {points.map((point) => (
        <Label key={`${point.view}:${point.region}`}>
          {spec.views!.find((v) => v.id === point.view)!.label[locale]}:{' '}
          {spec.regions!.find((r) => r.id === point.region)!.label[locale]}
        </Label>
      ))}
      <Button
        label={t.bodyRegions}
        selected={showRegions}
        onPress={() => setShowRegions(!showRegions)}
      />
      {showRegions && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {regions.map((region) => (
            <View key={region.id} style={{ minWidth: '45%', flexGrow: 1 }}>
              <Button
                label={region.label[locale]}
                selected={points.some((p) => p.view === view && p.region === region.id)}
                onPress={() => toggle(region.id)}
              />
            </View>
          ))}
        </View>
      )}
      <Button label={t.clear} onPress={() => onChange([])} />
    </Stack>
  );
}
