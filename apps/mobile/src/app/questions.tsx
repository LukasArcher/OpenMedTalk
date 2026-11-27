import { useState } from 'react';
import { Pressable, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { searchItems } from '../../../../packages/clinical/catalog';
import navigation from '../../../../packages/translations/data/navigation.v1.json';
import { patientText } from '../../../../packages/translations/patient';
import { useApp } from '../state/app-state';
import { Button, Field, Page, Row } from '../components/ui';
export default function Questions() {
  const params = useLocalSearchParams<{ category?: string; favorites?: string }>();
  const { session, settings, updateSettings, t, colors, canUndo, undo } = useApp();
  const [query, setQuery] = useState('');
  if (!session) return <Redirect href="/" />;
  const title =
    (params.category
      ? (navigation[settings.uiLocale] as Record<string, string>)[params.category]
      : undefined) ?? (params.favorites ? t.favorites : t.search);
  const items = searchItems(query, settings.uiLocale, params.category).filter(
    (i) =>
      i.presentationPriority !== 'optional_secondary' &&
      (!params.favorites || settings.questionFavorites.includes(i.id)),
  );
  return (
    <Page
      scroll={false}
      title={title}
    >
      <Field
        accessibilityLabel={t.search}
        placeholder={t.search}
        value={query}
        onChangeText={setQuery}
      />
      {canUndo && <Button label={t.undo} onPress={undo} />}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const favorite = settings.questionFavorites.includes(item.id);
          return (
            <Row
              key={item.id}
              label={patientText(item.id, item.sourceVersion, settings.uiLocale)}
              onPress={() => router.push({ pathname: '/patient', params: { id: item.id } })}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t.favoriteQuestion}: ${patientText(item.id, item.sourceVersion, settings.uiLocale)}`}
                accessibilityState={{ selected: favorite }}
                style={{
                  minWidth: 48,
                  minHeight: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() =>
                  updateSettings({
                    questionFavorites: favorite
                      ? settings.questionFavorites.filter((id) => id !== item.id)
                      : [...settings.questionFavorites, item.id],
                  })
                }
              >
                <Ionicons
                  name={favorite ? 'star' : 'star-outline'}
                  size={24}
                  color={colors.brand}
                />
              </Pressable>
            </Row>
          );
        }}
      />
    </Page>
  );
}
