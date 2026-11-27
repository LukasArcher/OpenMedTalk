import { it, expect } from 'vitest';
import tokens from '../assets/brand/tokens.json';
function luminance(hex: string) {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (values[0]! + 0.05) / (values[1]! + 0.05);
}
it('keeps text, pressed actions and essential input boundaries legible in both themes', () => {
  for (const theme of [tokens.light, tokens.dark]) {
    for (const background of [theme.background, theme.surface, theme.brandSoft])
      expect(contrast(theme.text, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(theme.secondary, theme.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(theme.onBrand, theme.brand)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(theme.onBrand, theme.brandPressed)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(theme.muted, theme.background)).toBeGreaterThanOrEqual(3);
    expect(contrast(theme.brand, theme.brandSoft)).toBeGreaterThanOrEqual(3);
  }
});
