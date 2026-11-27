import type { ExpoConfig } from 'expo/config';
if (process.env.OPENMEDTALK_BUILD_MODE === 'clinical')
  throw Error('Clinical builds are blocked pending source and translation review');
const config: ExpoConfig = {
  name: 'OpenMedTalk Internal',
  slug: 'openmedtalk-internal',
  version: '0.1.1',
  scheme: 'openmedtalk',
  userInterfaceStyle: 'automatic',
  icon: '../../assets/brand/exports/app-icon-1024.png',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'org.openmedtalk.internal',
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },
  android: {
    versionCode: 2,
    package: 'org.openmedtalk.internal',
    allowBackup: false,
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.VIBRATE',
    ],
    adaptiveIcon: {
      foregroundImage: '../../assets/brand/exports/android-adaptive-foreground-1024.png',
      backgroundColor: '#FFFFFF',
    },
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: '../../assets/brand/exports/app-icon-32.png',
  },
  plugins: [
    'expo-router',
    'expo-localization',
    [
      'expo-camera',
      {
        cameraPermission: 'Scan an offline OpenMedTalk transfer QR code.',
        recordAudioAndroid: false,
        barcodeScannerEnabled: true,
      },
    ],
  ],
  extra: { contentMode: 'development', catalogVersion: '0.2.0-draft' },
};
export default config;
