# Mobile internal testing

This is an internal development build. All clinical material remains draft, not for patient use. There is no backend, sign-in, analytics, remote catalog or runtime AI. Clinical distribution is blocked.

## Run

Use Node 24 and pnpm 11.28.11 with the repository's isolated dependency layout. Hoisted reinstalls repeatedly failed on this Windows workspace with both 11.1.3 and 11.28.11. Expo's standard monorepo resolver supports isolated installs. From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm mobile
```

Open the project in an SDK 58-compatible Expo Go on Android/iOS, or build locally with the Android SDK/Xcode using Expo. No EAS account, hosted services or paid resources are required. `pnpm --dir apps/mobile web` offers a browser target for development checks; the deliverable is the mobile app.

For browser smoke tests start the app on port 8081, then `pnpm test:ui`. On Windows the tests use installed Edge by default. Set `PLAYWRIGHT_CHANNEL=chromium` and install Playwright Chromium to use that browser elsewhere. Screenshots contain only synthetic test inputs and are written to ignored `test-results/screens`.

`pnpm validate:release` **must fail** with the current draft. `OPENMEDTALK_BUILD_MODE=clinical` also refuses app configuration. Changing a build label is not clinical validation.

## Local Android phone APK (Windows)

Use the installed Android SDK, JDK 17 and SDK CMake 3.31.6/Ninja 1.12.1. Windows long-path support must be enabled. These tools address the observed Ninja long-path failure; see [Expo's Windows build guidance](https://docs.expo.dev/troubleshooting/windows-long-paths/). No EAS account, cloud build or signing service is used.

From `apps/mobile`, generate native sources and build:

```powershell
npx --yes @expo/agent-cli@latest prebuild --platform android --no-install
$env:EXPO_NO_TELEMETRY = '1'
$env:CMAKE_VERSION = '3.31.6'
Set-Location android
.\gradlew.bat :app:assembleRelease '-PreactNativeArchitectures=arm64-v8a' '-Pandroid.cmakeVersion=3.31.6' '-Pandroid.enableMinifyInReleaseBuilds=false' --no-daemon --max-workers=2
```

Quote dotted Gradle properties in PowerShell; an unquoted `-Pandroid.cmakeVersion=...` is split into different arguments. The output is `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`. This arm64 build targets 64-bit ARM Android phones, Android 7.0/API 24 or newer. The Android release variant embeds JavaScript/assets and uses the generated local debug certificate for internal testing; it is not a clinical release or a store-signed distribution. No Metro server or Expo Go is required by the embedded bundle. Generated native files and local APK artifacts are ignored by Git.

The internal APK command disables Android R8 shrinking/obfuscation for this build only. The standard optimized assembly reached R8 but was interrupted after prolonged optimization on this host; optimized native assembly remains unverified. Production JavaScript/Hermes bundling is retained. After changing config plugins or permissions, prebuild with `--no-clean` to synchronize existing native files while preserving compiler caches.

## Versioned content

- `docs/clinical/source-library-v0.2.draft.json`: authoritative structural source. v0.1 is never imported.
- `packages/translations/data/patient.v0.2.draft.json`: separate versioned patient question and response bundle with the actual English/Danish source and a German AI-generated development draft. All 579 German texts and response labels remain unreviewed. `provenance.de.v1.json` records the single-model generation; no independent second translation, back-translation or human validation has occurred. `pnpm data:source-drafts` deliberately replaces this development snapshot from the current seed, including removing German; do not run it over independently edited translations.
- `ui.<locale>.v1.json`: UI dictionaries. `pnpm data:ui` assembles the statically bundled UI registry; commit source and bundle together. No runtime network or dynamic evaluation is used.
- `language-names.v1.json`: localized names for all 45 language targets in each bundled UI locale. `pnpm data:ui` generates these with Node's CLDR data alongside the UI registry. The app reads the versioned JSON; it never calls `Intl.DisplayNames`, which is unavailable on Hermes. Commit this file when adding a UI locale.
- `navigation.v1.json` and `groups.v1.json`: localized category and literal-log headings.
- `locales.v1.json`: all 45 planned targets, autonyms, direction and region/country search metadata. Only complete development bundles can be selected. UI and patient languages are separate preferences, even when the same catalogs are currently available.

Update text and provenance in versioned data files, run synchronization only for the intended bundle, and run checks. Adding a locale requires complete UI, patient question/answer/control labels, navigation/group names and locale metadata. Missing patient content must fail closed, never silently fall back. Clinical approvals and maintainer release snapshots are still future work; development availability is not approval.

## Privacy and transfers

Only the explicit settings allowlist reaches AsyncStorage: UI locale, appearance, favorite language/question IDs, recent language IDs and setup completion. All session events, correction history and pending imports remain in React memory. Explicit end and process termination clear the active session; no recovery or secure-zeroization promise is made.

QR transfers are uncompressed, versioned JSON chunks with an integrity checksum and exact content snapshot hash covering patient and UI bundles. They are not encrypted or authenticated. Validate all chunks and values before preview; preview never mutates a session. Merge requires an explicit same-patient decision, deduplicates event IDs and rejects conflicts. Replace explicitly discards the active session. Limits: 500 events, 50 corrections/event, 200,000 payload characters, 256 chunks, 850 characters/chunk, 1,400 characters per scanned envelope. Larger logs fail closed. Camera denial retains manual chunk entry.

After editing patient translations, run `pnpm data:patient-hash`; `pnpm data:ui` also refreshes this hash. These commands preserve independently edited patient text. Transfer between differing snapshots deliberately fails closed. Original answer time and patient locale remain in correction history; the current answer uses its correction time for chronological display and relative-time interpretation.

Clipboard copying requires an explicit warning and action. Best-effort clearing checks that the clipboard still equals the app-owned value, then clears on leaving the transfer screen, backgrounding or after 60 seconds. Operating systems and clipboard managers may retain copies. Android uses screen capture prevention; iOS requests app-switcher blurring. Verify native behavior on actual devices.

## Licenses and outstanding validation

Project code remains MPL-2.0 under the root LICENSE. `apps/mobile/EXPO-TEMPLATE-LICENSE` retains the Expo scaffold's third-party MIT notice; it does not relicense OpenMedTalk. Installed dependencies retain their own licenses. The supplied brand has separate trademark concerns described in the repository's brand README.

The body diagram is an authored development schematic with front/back landmarks and anatomical laterality, plus an accessible region selector. It is not independently reviewed medical artwork. Clinical review, validated translations, native accessibility/RTL/dynamic-type, airplane-mode cold start, app-switcher privacy and real camera interoperability remain release gates. Record actual execution results in IMPLEMENTATION.md, never infer them from a successful bundle.

The earlier Android assembly failed in react-native-worklets with the old CMake/Ninja long-path handling. Using SDK CMake 3.31.6/Ninja 1.12.1 resolved native compilation. The internal arm64 APK has now assembled and passed signature, alignment, manifest and embedded-content verification; see IMPLEMENTATION.md for the exact artifact/hash. Its R8 optimization is disabled through the build command only; an optimized native assembly remains unverified. An earlier Expo Go launch attempt was inconclusive. Physical-device runtime/privacy/offline tests remain open. iOS assembly requires macOS and has not been executed here.
