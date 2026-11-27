# Mobile implementation plan — 2026-11-26

Implements PRODUCT, DESIGN, ARCHITECTURE, CLINICAL and milestones 0–4 of IMPLEMENTATION. The user authorized implementation of the existing design; no new product design approval is required.

## Architecture decisions

- Expo/React Native with Expo Router; pure TypeScript domain and transfer packages. No backend, authentication, telemetry or network data fetching.
- Versioned source v0.2 remains authoritative. UI dictionaries, patient question/answer bundles and locale metadata are independent data. English and Danish source text is draft, not validated translation. Unsupported locales remain unavailable rather than falling back.
- Only settings, favorite IDs and recent locale IDs persist. Sessions and imports live exclusively in memory. App switcher protection on native platforms; no promise of secure memory erasure.
- Answer codes plus immutable source/catalog versions resolve literal text. Reject mismatching catalogs on import. No summaries or inferred facts.
- Bounded uncompressed JSON QR chunks avoid decompression attacks and a compression dependency. Integrity is corruption detection, not authentication. Preview and explicit replace/merge precede mutation; event-ID conflicts block merge.
- Reuse supplied brand exports. Follow all eight inspected reference boards for layout, with written specifications taking precedence over historical branding, mixed languages, colored Yes/No, onset wording and synthesized logs.

## Ordered checkpoints

0. Workspace, strict TypeScript, lint, test runner, lockfile, CI and documented local commands. Verify clean install and empty foundation checks.
1. Runtime catalog validation, 45 locale metadata, response validators, search, immutable answer events and literal grouping. Tests first: all 579 items, all 16 response types, release rejection, meals/onset, no phantom answers, repeated questions, laterality, input bounds.
2. Data-driven tokens, three-step setup, persistent settings, independent patient language picker, favorites/recent/search and region browsing. Verify cold launch and no session persistence.
3. Category/question navigation, search/favorites, individual patient template, localized source toggle and controls, all response types, undo/correction and body selections. Verify rendered layouts, light/dark and enlarged text; Android/iOS verification only when devices are available.
4. Literal grouped/chronological log, edit/delete, explicit end, copy preview and warning, QR export/scanner/import preview, bounded validation and merge conflicts. Test malicious payloads, chunk mixing, dedupe, catalog/locale mismatch, camera denial and restart behavior.

## Review focus

Reject malformed transfer data before mutation; no clinical content fallback; no default answers; correct anatomical laterality in RTL; no persistent clinical data. Missing independently reviewed anatomy artwork, clinical content approvals and native device tests must be reported honestly.
