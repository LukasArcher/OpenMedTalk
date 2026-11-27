import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useApp } from '../state/app-state';
import type { Locale } from '../../../../packages/schema/types';
import { ui } from '../../../../packages/translations/ui';
import { locales } from '../../../../packages/translations/locales';

export function Label({
  children,
  large = false,
  muted = false,
}: {
  children: ReactNode;
  large?: boolean;
  muted?: boolean;
}) {
  const { colors } = useApp();
  return (
    <Text
      accessibilityRole={large ? 'header' : undefined}
      style={{
        color: muted ? colors.secondary : colors.text,
        fontSize: large ? 28 : 18,
        lineHeight: large ? 36 : 26,
        fontWeight: large ? '600' : '400',
        flexShrink: 1,
      }}
    >
      {children}
    </Text>
  );
}
export function Button({
  label,
  onPress,
  selected = false,
  primary = false,
  disabled = false,
  icon,
  big = false,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  primary?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  big?: boolean;
}) {
  const { colors } = useApp();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: big ? 110 : 52,
          backgroundColor: primary
            ? pressed
              ? colors.brandPressed
              : colors.brand
            : selected || pressed
              ? colors.brandSoft
              : colors.surface,
          borderColor: selected ? colors.brand : colors.border,
          opacity: disabled ? 0.45 : 1,
        },
        big && { flex: 1 },
      ]}
    >
      {icon && <Ionicons name={icon} size={24} color={primary ? colors.onBrand : colors.brand} />}
      <Text
        style={{
          color: primary ? colors.onBrand : colors.text,
          fontSize: big ? 28 : 18,
          fontWeight: '600',
          textAlign: 'center',
          flexShrink: 1,
        }}
      >
        {label}
      </Text>
      {selected && <Ionicons name="checkmark-circle-outline" size={24} color={colors.brand} />}
    </Pressable>
  );
}
export function Row({
  label,
  accessibilityLabel,
  onPress,
  children,
  selected = false,
}: {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  children?: ReactNode;
  selected?: boolean;
}) {
  const { colors } = useApp();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: selected ? colors.brandSoft : 'transparent',
        borderRadius: selected ? 12 : 0,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        onPress={onPress}
        style={{
          flex: 1,
          minHeight: 68,
          paddingVertical: 18,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Label>{label}</Label>
      </Pressable>
      {children}
    </View>
  );
}
export function Field(props: TextInputProps) {
  const { colors } = useApp();
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.secondary}
      style={[
        {
          minHeight: 52,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.muted,
          borderRadius: 12,
          color: colors.text,
          backgroundColor: colors.background,
          fontSize: 18,
        },
        props.style,
      ]}
    />
  );
}
export function Page({
  title,
  children,
  back = true,
  actions,
  footer,
  scroll = true,
  locale,
}: {
  title?: string;
  children: ReactNode;
  back?: boolean;
  actions?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  locale?: Locale;
}) {
  const { colors, t: defaultText, settings } = useApp();
  const direction =
    locales.find((l) => l.id === (locale ?? settings.uiLocale))?.direction === 'rtl'
      ? 'rtl'
      : 'ltr';
  const t = locale ? ui[locale] : defaultText;
  const body = <View style={[styles.content, !scroll && { flex: 1 }]}>{children}</View>;
  return (
    <SafeAreaView
      testID="screen"
      style={{ flex: 1, backgroundColor: colors.background, direction }}
    >
      <View style={styles.header}>
        {back && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={styles.icon}
          >
            <Ionicons
              name={direction === 'rtl' ? 'chevron-forward' : 'chevron-back'}
              size={28}
              color={colors.text}
            />
          </Pressable>
        )}
        {title && (
          <View style={{ flex: 1 }}>
            <Label large>{title}</Label>
          </View>
        )}
        {actions}
      </View>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {body}
        </ScrollView>
      ) : (
        body
      )}
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}
export function Stack({
  children,
  row = false,
  style,
}: {
  children: ReactNode;
  row?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View style={[{ gap: 12, flexDirection: row ? 'row' : 'column' }, style]}>{children}</View>
  );
}
export function Notice({ text }: { text: string }) {
  return (
    <Text
      accessibilityRole="alert"
      style={{ fontSize: 16, lineHeight: 24, color: useApp().colors.secondary }}
    >
      {text}
    </Text>
  );
}
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 72,
  },
  icon: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, gap: 24, flexGrow: 1 },
  footer: { padding: 24, gap: 12 },
  button: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});
