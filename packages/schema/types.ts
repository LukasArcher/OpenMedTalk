import type uiBundle from '../translations/data/ui.bundle.v1.json';
export type Locale = keyof typeof uiBundle;
export type Labels = Record<Locale, string>;
export interface Option {
  id: string;
  label: Labels;
}
export interface ResponseSpec {
  kind: string;
  options?: Option[];
  units?: Option[];
  unit?: Option;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  allowApproximate?: boolean;
  anchors?: { value: number; label: Labels }[];
  regions?: Option[];
  views?: Option[];
  recordsAnswer: boolean;
}
export interface ClinicalItem {
  id: string;
  sourceVersion: number;
  categories: string[];
  responseType: string;
  summaryTargets: string[];
  source: Record<Locale, { text: string; reviewStatus: string }>;
  releaseStatus: string;
  presentationPriority: string;
}
export interface Catalog {
  schemaVersion: string;
  libraryVersion: string;
  status: string;
  categories: { id: string; label: Labels }[];
  commonNonanswers: Option[];
  responseTypes: Record<string, ResponseSpec>;
  items: ClinicalItem[];
}
export interface BodyPoint {
  view: 'front' | 'back';
  region: string;
}
export type Answer =
  | { kind: 'choice'; code: string }
  | { kind: 'number'; value: number; unit?: string; approximate?: boolean }
  | { kind: 'date'; value: string; approximate: boolean }
  | { kind: 'datetime'; value: string; approximate: boolean }
  | { kind: 'body'; points: BodyPoint[] };
export interface AnswerEvent {
  id: string;
  itemId: string;
  itemVersion: number;
  catalogVersion: string;
  patientLocale: Locale;
  answer: Answer;
  timestamp: string;
  correctedAt?: string;
  corrections?: { answer: Answer; patientLocale: Locale; timestamp: string }[];
}
export interface Session {
  id: string;
  events: AnswerEvent[];
}
