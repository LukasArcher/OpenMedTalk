import { Redirect, router } from 'expo-router';
import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { catalog } from '../../../../packages/clinical/catalog';
import navigation from '../../../../packages/translations/data/navigation.v1.json';
import { languageName } from '../../../../packages/translations/language-names';
import { useApp } from '../state/app-state';
import { Button, Label, Page, Stack } from '../components/ui';
const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  intro: 'chatbubbles-outline',
  general: 'person-outline',
  pain: 'flash-outline',
  airway: 'megaphone-outline',
  head: 'person-circle-outline',
  thorax: 'body-outline',
  heart: 'heart-outline',
  lungs: 'cloud-outline',
  neuro: 'pulse-outline',
  abdomen: 'ellipse-outline',
  urinary: 'water-outline',
  pregnancy: 'woman-outline',
  back: 'body-outline',
  limbs: 'walk-outline',
  skin: 'hand-left-outline',
  allergy: 'flower-outline',
  medication: 'medkit-outline',
  history: 'time-outline',
  intake: 'restaurant-outline',
  events: 'calendar-outline',
  metabolic: 'water-outline',
  trauma: 'bandage-outline',
  toxic: 'flask-outline',
  psych: 'chatbubble-outline',
  safety: 'shield-outline',
  pediatric: 'happy-outline',
  witness: 'eye-outline',
  exam: 'clipboard-outline',
  treatment: 'medical-outline',
  transport: 'car-outline',
};
export default function Categories() {
  const { session, t, settings, patientLocale, colors } = useApp();
  if (!session) return <Redirect href="/" />;
  return (
    <Page
      title={t.categories}
    >
      <Button
        label={`${t.patientLanguage}: ${languageName(patientLocale, settings.uiLocale)}`}
        icon="globe-outline"
        onPress={() => router.push('/')}
      />
      <Stack row>
        <Button label={t.search} icon="search-outline" onPress={() => router.push('/questions')} />
        <Button
          label={t.favorites}
          icon="star-outline"
          onPress={() => router.push({ pathname: '/questions', params: { favorites: '1' } })}
        />
      </Stack>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {catalog.categories.map((c) => (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/questions', params: { category: c.id } })}
            style={{
              flexBasis: '47%',
              flexGrow: 1,
              minHeight: 132,
              padding: 16,
              gap: 16,
              borderWidth: 1,
              borderRadius: 16,
              borderColor: colors.border,
              justifyContent: 'space-between',
            }}
          >
            <Ionicons name={icons[c.id] ?? 'ellipse-outline'} size={32} color={colors.brand} />
            <Label>{(navigation[settings.uiLocale] as Record<string, string>)[c.id]}</Label>
          </Pressable>
        ))}
      </View>
    </Page>
  );
}
