# OpenMedTalk — coding agent instructions

Read README.md, docs/PRODUCT.md, docs/DESIGN.md, docs/ARCHITECTURE.md, docs/CLINICAL.md and docs/IMPLEMENTATION.md before modifying code. Follow them in that order except that clinical safety requirements always win. Latest written requirements override any mockup, legacy draft or example. Work in small, testable milestones; do not generate the whole system in one unreviewable change.

## Non-negotiable
- OpenMedTalk — Clinical communication without barriers. Official app free, open source, offline, no ads, account or telemetry. No patient identification fields, patient history, persistent clinical storage, diagnostics, triage, scores or AI inference.
- One question or instruction per patient screen. Clinician selects a specific question in their UI language. Patient sees only selected patient language; tapping the question toggles source language for clinician. All patient-facing controls are localized. No symptom checklist, no refusal button, no forced algorithm flow.
- Anamnesis is a literal question/answer/time log organized under ABCDE, SAMPLER, OPQRST, Other; never paraphrase, aggregate or infer clinical findings. No source-person field. Do not invent answers. No positive/negative clinical color inference.
- Clinical questions and translations are drafts until reviewed. Never bypass release gating to achieve a larger language count. Demo build only for unreviewed content. No real patient data in tests, fixtures, logs or portal.
- White/gray, quiet, spacious UI, restrained petrol brand accent, no gradients, decorative illustrations, boilerplate or AI-style copy. Read docs/DESIGN.md before UI implementation.
- TypeScript strict; small modules, named domain concepts, no speculative abstractions, no unnecessary dependencies or comments. Use conventional names and real tests. Never fabricate clinical review, tests or credentials.
- No secrets in repo. Do not provision paid resources, deploy to production or publish stores without explicit approval.
- Keep existing MPL-2.0 license. Other directory licensing remains proposed pending maintainer confirmation; do not silently relicense.
- After each milestone: lint, typecheck, unit tests, relevant UI smoke tests; document actual results and outstanding blockers. Update progress in docs/IMPLEMENTATION.md. If constraints conflict, stop only the affected decision and implement independent work.

Start with milestone 0 and 1; read existing files and use the actual dataset and reference assets if present. Do not substitute invented clinical content for missing source files.

## Current clinical seed
Use `docs/clinical/source-library-v0.2.draft.json` as the authoritative development seed. Do not use v0.1 as runtime input. Read `docs/clinical/MIGRATION-v0.2.md`; validate the current dataset and implement its response/presentation policies rather than remigrating the old source. The draft is not clinical-release content.

## UI copy: strict no-filler rule
Do not add explanatory microcopy, subtitles, helper paragraphs, introductory sentences, marketing copy, reassurance, redundant captions, or tooltips just to fill space. A heading and self-explanatory controls are sufficient. Every visible string must serve a necessary clinical, navigation, input, accessibility or safety function. No “Choose a language to get started”, “Select a category below”, “This question does not require an answer”, or descriptions that repeat a button label. Do not replace removed text with decorative elements. Preserve whitespace. Necessary clinical instructions, scale anchors, validation errors, privacy/export warnings and essential safety disclosures remain concise and localized. Place contextual help in About/Help unless required at the point of action. Apply to mobile app and editorial portal. Review each screen and remove redundant text before marking it complete.
