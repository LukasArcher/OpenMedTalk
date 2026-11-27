import { useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import {
  acceptChunk,
  decodeTransfer,
  encodeTransfer,
  transferProgress,
} from '../../../../packages/transfer/index';
import { mergeSessions, answerText, answerTimestamp } from '../../../../packages/clinical/session';
import { exportText } from '../../../../packages/clinical/export';
import { patientText } from '../../../../packages/translations/patient';
import type { Session } from '../../../../packages/schema/types';
import { useApp } from '../state/app-state';
import { Button, Field, Label, Notice, Page, Stack } from '../components/ui';
import { QrCode } from '../components/qr-code';
export default function Transfer() {
  const { session, settings, t, importSession } = useApp();
  const [mode, setMode] = useState<'menu' | 'qr' | 'scan' | 'copy' | 'preview'>('menu');
  const [index, setIndex] = useState(0);
  const [chunks, setChunks] = useState<string[]>([]);
  const [incoming, setIncoming] = useState<Session>();
  const [manual, setManual] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(true);
  const copiedValue = useRef('');
  const scanChunks = useRef<string[]>([]);
  const previousSessionId = useRef(session?.id);
  async function clearClipboard() {
    const value = copiedValue.current;
    copiedValue.current = '';
    if (value) {
      try {
        if ((await Clipboard.getStringAsync()) === value) await Clipboard.setStringAsync('');
      } catch {
        /* OS clipboard access can be denied. */
      }
    }
    setCopied(false);
  }
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      setCameraActive(state === 'active');
      if (state !== 'active') void clearClipboard();
    });
    return () => {
      sub.remove();
      void clearClipboard();
    };
  }, []);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => void clearClipboard(), 60_000);
    return () => clearTimeout(timer);
  }, [copied]);
  useEffect(() => {
    if (previousSessionId.current && !session) {
      setChunks([]);
      scanChunks.current = [];
      setIncoming(undefined);
      setManual('');
      setMode('menu');
      void clearClipboard();
    }
    previousSessionId.current = session?.id;
  }, [session]);
  function read(text: string) {
    try {
      const next = acceptChunk(scanChunks.current, text);
      scanChunks.current = next;
      setChunks(next);
      setError('');
      const progress = transferProgress(next);
      if (progress.received === progress.total) {
        setIncoming(decodeTransfer(next));
        setMode('preview');
      }
    } catch {
      setError(t.transferError);
    }
  }
  function showQr() {
    try {
      if (!session) return;
      setChunks(encodeTransfer(session));
      setIndex(0);
      setMode('qr');
      setError('');
    } catch {
      setError(t.transferError);
    }
  }
  function scan() {
    setChunks([]);
    scanChunks.current = [];
    setIncoming(undefined);
    setError('');
    setMode('scan');
  }
  const progress = mode === 'scan' ? transferProgress(chunks) : undefined;
  return (
    <Page
      title={
        mode === 'menu'
          ? t.export
          : mode === 'qr'
            ? t.showQr
            : mode === 'scan'
              ? t.scanQr
              : t.preview
      }
    >
      {!!error && (error !== t.cameraDenied || permission?.granted) && <Notice text={error} />}
      {mode === 'menu' && (
        <>
          <Notice text={t.copyWarning} />
          <Button
            label={t.showQr}
            icon="qr-code-outline"
            disabled={!session?.events.length}
            onPress={showQr}
          />
          <Button label={t.scanQr} icon="scan-outline" onPress={scan} />
          <Button
            label={t.copy}
            icon="copy-outline"
            disabled={!session?.events.length}
            onPress={() => setMode('copy')}
          />
        </>
      )}
      {mode === 'qr' && chunks[index] && (
        <>
          <Notice text={t.copyWarning} />
          <QrCode value={chunks[index]!} />
          {chunks.length > 1 && (
            <>
              <Label>
                {t.transferParts} {index + 1} / {chunks.length}
              </Label>
              <Stack row>
                <Button label={t.back} disabled={index === 0} onPress={() => setIndex(index - 1)} />
                <Button
                  label={t.continue}
                  disabled={index === chunks.length - 1}
                  onPress={() => setIndex(index + 1)}
                />
              </Stack>
            </>
          )}
        </>
      )}
      {mode === 'scan' && (
        <>
          {permission?.granted && cameraActive ? (
            <CameraView
              style={{ height: 300, borderRadius: 16 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={(result) => read(result.data)}
              onMountError={() => setError(t.cameraDenied)}
            />
          ) : (
            <>
              <Notice text={t.cameraDenied} />
              <Button
                label={t.camera}
                onPress={() => void requestPermission().catch(() => setError(t.cameraDenied))}
              />
            </>
          )}
          {!!chunks.length && (
            <Label>
              {progress!.received} / {progress!.total}
            </Label>
          )}
          <Field
            accessibilityLabel={t.manualQr}
            placeholder={t.manualQr}
            value={manual}
            onChangeText={setManual}
            multiline
            maxLength={1400}
            autoCapitalize="none"
          />
          <Button
            label={t.readQr}
            disabled={!manual}
            onPress={() => {
              read(manual);
              setManual('');
            }}
          />
          <Button label={t.reset} onPress={scan} />
        </>
      )}
      {mode === 'copy' && session && (
        <>
          <Notice text={t.copyWarning} />
          <Label>{exportText(session, settings.uiLocale)}</Label>
          <Button
            label={t.copy}
            primary
            onPress={() => {
              const value = exportText(session, settings.uiLocale);
              void Clipboard.setStringAsync(value)
                .then(() => {
                  copiedValue.current = value;
                  setCopied(true);
                })
                .catch(() => setError(t.transferError));
            }}
          />
          {copied && <Button label={t.copyClear} onPress={() => void clearClipboard()} />}
        </>
      )}
      {mode === 'preview' && incoming && (
        <>
          <Notice text={t.importWarning} />
          {incoming.events.map((e) => (
            <View key={e.id} style={{ gap: 8 }}>
              <Label muted>
                {e.patientLocale} · {new Date(answerTimestamp(e)).toLocaleString(settings.uiLocale)}
              </Label>
              <Label>{patientText(e.itemId, e.itemVersion, settings.uiLocale)}</Label>
              <Label>{answerText(e, settings.uiLocale)}</Label>
            </View>
          ))}
          <Button
            label={t.replace}
            primary
            onPress={() => {
              importSession(incoming);
              setIncoming(undefined);
              router.replace('/log');
            }}
          />
          {!!session?.events.length && (
            <Button
              label={t.merge}
              onPress={() => {
                try {
                  importSession(mergeSessions(session, incoming));
                  setIncoming(undefined);
                  router.replace('/log');
                } catch {
                  setError(t.conflict);
                }
              }}
            />
          )}
          <Button
            label={t.cancel}
            onPress={() => {
              setIncoming(undefined);
              scan();
            }}
          />
        </>
      )}
    </Page>
  );
}
