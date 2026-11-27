import bundle from './data/ui.bundle.v1.json';
import type { Locale } from '../schema/types';
export type UiKey = keyof typeof bundle.en;
export const ui: Record<Locale, Record<UiKey, string>> = bundle;
