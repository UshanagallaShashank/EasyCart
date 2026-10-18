import { describe, it, expect } from 'vitest';
import { choose_rider } from '../../../src/modules/delivery/services/dispatch-service.js';
import { sort_riders_by_distance } from '../../../src/modules/delivery/lib/sort-riders-by-distance.js';
import { haversine_km } from '../../../src/modules/delivery/lib/haversine-km.js';

const now = Date.now();
const recent = new Date(now - 60 * 1000).toISOString();
const store = { latitude: 17.385, longitude: 78.4867 };

function rider(id, latitude, longitude, extra = {}) {
  return { id, latitude, longitude, status: 'approved', is_online: true, last_seen_at: recent, ...extra };
}

describe('haversine_km', () => {
  it('measures roughly 1.1 km per 0.01 degree of latitude', () => {
    expect(haversine_km(store, { latitude: 17.395, longitude: 78.4867 })).toBeCloseTo(1.11, 1);
  });
  it('returns null when a point has no coordinates', () => {
    expect(haversine_km(store, { latitude: null, longitude: null })).toBeNull();
  });
});

describe('sort_riders_by_distance', () => {
  it('puts the nearest first and riders without a location last', () => {
    const sorted = sort_riders_by_distance([rider('far', 17.5, 78.6), rider('none', null, null), rider('near', 17.386, 78.487)], store);
    expect(sorted.map((r) => r.id)).toEqual(['near', 'far', 'none']);
    expect(sorted[0].distance_km).toBeLessThan(1);
  });
});

describe('choose_rider', () => {
  it('picks the nearest available rider', () => {
    const chosen = choose_rider([rider('far', 17.5, 78.6), rider('near', 17.386, 78.487)], new Map(), [], store, now);
    expect(chosen.id).toBe('near');
  });

  it('skips riders who declined, are offline, stale, unapproved or full', () => {
    const riders = [
      rider('declined', 17.3851, 78.4868),
      rider('offline', 17.3852, 78.4868, { is_online: false }),
      rider('stale', 17.3853, 78.4868, { last_seen_at: new Date(now - 3 * 60 * 60 * 1000).toISOString() }),
      rider('pending', 17.3854, 78.4868, { status: 'pending' }),
      rider('full', 17.3855, 78.4868),
      rider('ok', 17.45, 78.55)
    ];
    const chosen = choose_rider(riders, new Map([['full', 2]]), ['declined'], store, now);
    expect(chosen.id).toBe('ok');
  });

  it('returns null when nobody is free', () => {
    expect(choose_rider([rider('a', 17.4, 78.5, { is_online: false })], new Map(), [], store, now)).toBeNull();
  });

  it('still finds a rider when the store has no location', () => {
    expect(choose_rider([rider('a', null, null)], new Map(), [], null, now).id).toBe('a');
  });
});
