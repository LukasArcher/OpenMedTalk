# Clinical source migration v0.2

Current seed: [source-library-v0.2.draft.json](source-library-v0.2.draft.json). Original v0.1 is retained unchanged for provenance, not runtime consumption.

## What changed

- 579 items (521 questions, 58 instructions); 30 categories, 478 yes/no questions. Previous: 561 items, 505 questions, 56 instructions, 463 yes/no.
- Removed the shared declined/prefer-not-to-answer option. Unknown and not understood remain; backing out produces no answer.
- Replaced intake_002 with four independent yes/no meal questions (breakfast today, lunch today, dinner today, within the last six hours). Do not combine into a questionnaire or infer fasting duration.
- Four symptom onset questions now use the same five fixed coarse intervals. Exact/approximate date or time remains available in separate clinically relevant questions, especially last known well, medication and exposure.
- Fever yes/no is primary. Measured temperature questions are secondary and not shown as a default follow-up.
- Split 17 compound source items into independent questions/instructions. Removed two questions about caregiver relationship. Retired IDs and replacement IDs are in the migration metadata. One combined descriptor, black and tar-like stool, is intentionally retained as a single clinical concept.
- Age of a child remains an optional clinical question, not an identification field. No patient name/CPR or demographics form. Addressee (patient/caregiver/witness) is editorial translation context only; not a selector or source-person log field.
- Patient UI policies are encoded: one item per screen, target language only by default, tap to reveal clinician language, no default answer, two large side-by-side yes/no controls, two smaller nonanswers, explicit confirmation for complex values, information displays without fabricated acknowledgment, body map front/back and localization versus radiation, NRS slider, count control.
- Log policy is literal question/answer/time, grouped by ABCDE, SAMPLER, OPQRST and Other. No inferred findings, summaries or duplicate answer records.

## Validation performed
Programmatic checks: JSON parses; IDs unique; Danish and English question texts have no exact normalized duplicates; categories and response types resolve; log target syntax is valid; every source entry is draft and blocked pending review. Counts recalculated from actual items. This is a structural audit, not a medical, linguistic, accessibility or usability validation. No translation generation or runtime tests have been performed. All source versions changed by a response-format change are incremented; split concepts have new IDs. Shared response schema changed from 0.1 to 0.2.

## Remaining review
Confirm time labels and precise timing workflow; clinical review of all source questions, wording, risk labels and mappings; verify translations in context, especially negation and time units. Ensure frontend never displays a whole set of patient symptoms at once. Do not translate or publish as approved until the source review and applicable release gates are satisfied. 
