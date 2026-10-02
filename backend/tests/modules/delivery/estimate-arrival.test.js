// Pure logic, no database: how far is the rider and how long will they take?
import { describe, it, expect } from 'vitest';
import { estimate_arrival } from '../../../src/modules/delivery/lib/estimate-arrival.js';

const NOW = new Date('2026-10-02T10:00:00Z').getTime();
const STORE = { latitude: 17.385, longitude: 78.4867 };
// About 2.2 km north of the store in a straight line.
const rider = (overrides = {}) => ({ latitude: 17.405, longitude: 78.4867, vehicle_type: 'bike', location_updated_at: '2026-10-02T09:58:00Z', ...overrides });

describe('estimate_arrival', () => {
  it('gives a distance and minutes from the rider\'s last position', () => {
    const result = estimate_arrival(rider(), STORE, NOW);
    expect(result.distance_km).toBeGreaterThan(2);
    expect(result.distance_km).toBeLessThan(3.5);
    expect(result.minutes).toBeGreaterThanOrEqual(5);
    expect(result.minutes).toBeLessThan(15);
  });

  it('takes longer on a bicycle than on a bike', () => {
    const bike = estimate_arrival(rider({ vehicle_type: 'bike' }), STORE, NOW);
    const bicycle = estimate_arrival(rider({ vehicle_type: 'bicycle' }), STORE, NOW);
    expect(bicycle.minutes).toBeGreaterThan(bike.minutes);
  });

  it('never says 0 minutes when the rider is at the store', () => {
    const result = estimate_arrival(rider({ latitude: STORE.latitude, longitude: STORE.longitude }), STORE, NOW);
    expect(result.minutes).toBe(1);
  });

  it('gives nothing when the rider\'s position is old', () => {
    expect(estimate_arrival(rider({ location_updated_at: '2026-10-02T09:00:00Z' }), STORE, NOW)).toBeNull();
  });

  it('gives nothing when the rider has never shared a position', () => {
    expect(estimate_arrival(rider({ latitude: null, longitude: null, location_updated_at: null }), STORE, NOW)).toBeNull();
  });

  it('gives nothing when the store has no location', () => {
    expect(estimate_arrival(rider(), null, NOW)).toBeNull();
  });
});
