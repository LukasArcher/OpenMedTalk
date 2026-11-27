import { it, expect } from 'vitest';
import { bodyRegionAt, bodyPointPosition } from '../packages/schema/body';
import { catalog } from '../packages/clinical/catalog';
it('maps body taps to literal regions with anatomical laterality independent of RTL', () => {
  expect(bodyRegionAt('front', 24, 218)).toBe('right_hand');
  expect(bodyRegionAt('back', 176, 218)).toBe('right_hand');
  expect(bodyPointPosition('front', 'left_hand')).toEqual([176, 218]);
  expect(bodyPointPosition('back', 'left_hand')).toEqual([24, 218]);
  expect(bodyRegionAt('front', 0, 0)).toBeUndefined();
  expect(bodyRegionAt('back', 100, 120)).toBe('upper_back');
  for (const region of catalog.responseTypes.body!.regions!) {
    const point = bodyPointPosition('front', region.id)!;
    expect(point).toBeDefined();
    expect(point[0]).toBeGreaterThanOrEqual(0);
    expect(point[0]).toBeLessThanOrEqual(200);
    expect(point[1]).toBeGreaterThanOrEqual(0);
    expect(point[1]).toBeLessThanOrEqual(405);
    if (region.id.startsWith('right_')) {
      const left = region.id.replace('right_', 'left_');
      expect(point[0]).toBeLessThan(bodyPointPosition('front', left)![0]);
      expect(bodyPointPosition('back', region.id)![0]).toBeGreaterThan(
        bodyPointPosition('back', left)![0],
      );
    }
  }
});
