import views from './data/body-views.v1.json';
import layout from './data/body-layout.v1.json';
export function validBodyRegion(view: 'front' | 'back', region: string): boolean {
  return !views[view].excludedRegions.includes(region);
}
export function bodyPointPosition(
  view: 'front' | 'back',
  region: string,
): [number, number] | undefined {
  const point = (layout as Record<string, number[]>)[region];
  if (!point) return undefined;
  return [view === 'back' ? 200 - point[0]! : point[0]!, point[1]!];
}
export function bodyRegionAt(view: 'front' | 'back', x: number, y: number): string | undefined {
  let distance = 24 * 24;
  let selected: string | undefined;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return undefined;
  for (const region of Object.keys(layout)) {
    if (region === 'diffuse' || !validBodyRegion(view, region)) continue;
    const point = bodyPointPosition(view, region)!;
    const next = (x - point[0]) ** 2 + (y - point[1]) ** 2;
    if (next < distance) {
      distance = next;
      selected = region;
    }
  }
  return selected;
}
