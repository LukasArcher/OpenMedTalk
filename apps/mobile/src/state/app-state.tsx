import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { randomUUID } from 'expo-crypto';
import { useColorScheme } from 'react-native';
import { createEvent, correctEvent } from '../../../../packages/clinical/session';
import { parseSettings, type Settings } from '../../../../packages/schema/settings';
import type { Answer, Locale, Session } from '../../../../packages/schema/types';
import { ui } from '../../../../packages/translations/ui';
import { isAvailableLocale } from '../../../../packages/translations/locales';
import tokens from '../../../../assets/brand/tokens.json';

const SETTINGS_KEY = 'openmedtalk.settings.v1';
function useAppState() {
  const [settings, setSettings] = useState<Settings>(() => {
    const locale = getLocales()[0];
    const candidates = [
      locale?.languageTag,
      `${locale?.languageCode}-${locale?.languageScriptCode}`,
      `${locale?.languageCode}-${locale?.regionCode}`,
      locale?.languageCode,
    ];
    return { ...parseSettings(null), uiLocale: candidates.find(isAvailableLocale) ?? 'en' };
  });
  const [ready, setReady] = useState(false),
    [storageError, setStorageError] = useState(false);
  const [session, setSession] = useState<Session | null>(null),
    [patientLocale, setPatientLocale] = useState<Locale>('en');
  const [undoSession, setUndoSession] = useState<Session | null>(null);
  const scheme = useColorScheme();
  const saveQueue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        if (active && raw) setSettings(parseSettings(JSON.parse(raw)));
      })
      .catch(() => {
        if (active) setStorageError(true);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  function updateSettings(update: Partial<Settings>) {
    setSettings((current) => parseSettings({ ...current, ...update }));
  }
  useEffect(() => {
    if (!ready) return;
    const serialized = JSON.stringify(parseSettings(settings));
    saveQueue.current = saveQueue.current
      .catch(() => {})
      .then(() => AsyncStorage.setItem(SETTINGS_KEY, serialized))
      .then(() => setStorageError(false))
      .catch(() => setStorageError(true));
  }, [settings, ready]);
  function selectLanguage(locale: Locale) {
    setPatientLocale(locale);
    setSession((current) => current ?? { id: randomUUID(), events: [] });
    updateSettings({
      recent: [locale, ...settings.recent.filter((id) => id !== locale)].slice(0, 8),
    });
  }
  function recordAnswer(itemId: string, answer: Answer, editId?: string) {
    if (!session) throw Error('No session');
    if (session.events.length >= 500 && !editId) throw Error('Session limit');
    const original = editId ? session.events.find((e) => e.id === editId) : undefined;
    if (editId && (!original || original.itemId !== itemId)) throw Error('Invalid correction');
    const now = new Date().toISOString();
    const event = original
      ? correctEvent(original, answer, now)
      : createEvent(randomUUID(), itemId, patientLocale, answer, now);
    setUndoSession(session);
    setSession({
      ...session,
      events: editId
        ? session.events.map((e) => (e.id === editId ? event : e))
        : [...session.events, event],
    });
  }
  function removeAnswer(id: string) {
    if (!session) return;
    setUndoSession(session);
    setSession({ ...session, events: session.events.filter((e) => e.id !== id) });
  }
  function endSession() {
    setSession(null);
    setUndoSession(null);
  }
  function importSession(value: Session) {
    setSession(value);
    setUndoSession(null);
    const locale = value.events.at(-1)?.patientLocale;
    if (locale) setPatientLocale(locale);
  }
  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && scheme === 'dark');
  const colors = isDark ? tokens.dark : tokens.light;
  return {
    settings,
    updateSettings,
    ready,
    storageError,
    session,
    patientLocale,
    selectLanguage,
    recordAnswer,
    removeAnswer,
    endSession,
    importSession,
    undo: () => {
      if (undoSession) setSession(undoSession);
      setUndoSession(null);
    },
    canUndo: !!undoSession,
    colors,
    isDark,
    t: ui[settings.uiLocale],
  };
}
type AppState = ReturnType<typeof useAppState>;
const Context = createContext<AppState | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const state = useAppState();
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
export function useApp() {
  const state = useContext(Context);
  if (!state) throw Error('Missing app provider');
  return state;
}
