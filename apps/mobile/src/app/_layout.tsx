import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../state/app-state';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import * as Capture from 'expo-screen-capture';
function Layout() {
  const { isDark, colors } = useApp();
  useEffect(() => {
    if (Platform.OS === 'ios') void Capture.enableAppSwitcherProtectionAsync().catch(() => {});
    if (Platform.OS === 'android')
      void Capture.preventScreenCaptureAsync('privacy').catch(() => {});
    return () => {
      if (Platform.OS === 'android') void Capture.allowScreenCaptureAsync('privacy');
    };
  }, []);
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      />
    </>
  );
}
export default function Root() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}
