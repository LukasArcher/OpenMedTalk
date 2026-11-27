import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { availableLocales } from '../../../../packages/translations/locales';
import { languageName } from '../../../../packages/translations/language-names';
import type { Locale } from '../../../../packages/schema/types';
import { useApp } from '../state/app-state';
import { Row } from './ui';
export function LanguageList({
  ids,
  onSelect,
  selectFavorites = false,
}: {
  ids?: string[];
  onSelect?: (id: Locale) => void;
  selectFavorites?: boolean;
}) {
  const { settings, updateSettings, colors, t } = useApp();
  const list = ids
    ? ids.flatMap((id) => availableLocales.filter((l) => l.id === id))
    : availableLocales;
  return (
    <>
      {list.map((l) => {
        const favorite = settings.favorites.includes(l.id);
        const name = languageName(l.id, settings.uiLocale);
        return (
          <Row
            key={l.id}
            label={`\u2068${name}\u2069 — \u2068${l.autonym}\u2069`}
            accessibilityLabel={`${name} — ${l.autonym}`}
            onPress={() => {
              if (selectFavorites)
                updateSettings({
                  favorites: favorite
                    ? settings.favorites.filter((id) => id !== l.id)
                    : [...settings.favorites, l.id],
                });
              else onSelect?.(l.id as Locale);
            }}
            selected={selectFavorites && favorite}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t.favorites}: ${name}`}
              accessibilityState={{ selected: favorite }}
              onPress={() =>
                updateSettings({
                  favorites: favorite
                    ? settings.favorites.filter((id) => id !== l.id)
                    : [...settings.favorites, l.id],
                })
              }
              style={{
                minWidth: 52,
                minHeight: 52,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name={favorite ? 'star' : 'star-outline'} size={24} color={colors.brand} />
            </Pressable>
          </Row>
        );
      })}
    </>
  );
}
