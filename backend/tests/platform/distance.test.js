// Checks the map distance maths only. No database is used.
import { describe, expect, it } from 'vitest';
import { distance_km } from '../../src/platform/shared/distance.js';

describe('distance_km', () => {
  it('is zero for the same point', () => {
    expect(distance_km(17.8367, 78.6885, 17.8367, 78.6885)).toBeCloseTo(0, 5);
  });

  it('is about 111 km for one degree of latitude', () => {
    expect(distance_km(17, 78, 18, 78)).toBeGreaterThan(110);
    expect(distance_km(17, 78, 18, 78)).toBeLessThan(112);
  });

  it('gives the same distance in both directions', () => {
    expect(distance_km(17.84, 78.69, 17.9, 78.7)).toBeCloseTo(distance_km(17.9, 78.7, 17.84, 78.69), 8);
  });

  it('gives a small distance for two points about a kilometre apart', () => {
    const km = distance_km(17.8367, 78.6885, 17.8457, 78.6885);
    expect(km).toBeGreaterThan(0.9);
    expect(km).toBeLessThan(1.1);
  });
});
