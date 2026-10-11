import { describe, it, expect } from 'vitest';
import { can_see_order, why_rider_cannot_take } from '../../../src/modules/delivery/services/dispatch-service.js';
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

describe('can_see_order (first come, first served)', () => {
  const waiting = { id: 'o1', fulfillment_status: 'ready_for_delivery', rider_id: null, declined_rider_ids: [] };

  it('shows a waiting order to every free rider near the store', () => {
    expect(can_see_order(rider('near', 17.386, 78.487), waiting, 0, store, now)).toBe(true);
    expect(can_see_order(rider('also-near', 17.45, 78.55), waiting, 0, store, now)).toBe(true);
  });

  it('hides it from riders who declined, are offline, stale, unapproved or full', () => {
    expect(can_see_order(rider('declined', 17.3851, 78.4868), { ...waiting, declined_rider_ids: ['declined'] }, 0, store, now)).toBe(false);
    expect(can_see_order(rider('offline', 17.3852, 78.4868, { is_online: false }), waiting, 0, store, now)).toBe(false);
    expect(can_see_order(rider('stale', 17.3853, 78.4868, { last_seen_at: new Date(now - 3 * 60 * 60 * 1000).toISOString() }), waiting, 0, store, now)).toBe(false);
    expect(can_see_order(rider('pending', 17.3854, 78.4868, { status: 'pending' }), waiting, 0, store, now)).toBe(false);
    expect(can_see_order(rider('full', 17.3855, 78.4868), waiting, 2, store, now)).toBe(false);
  });

  it('still shows it when the store or rider has no location', () => {
    expect(can_see_order(rider('a', 17.4, 78.5), waiting, 0, null, now)).toBe(true);
    expect(can_see_order(rider('b', null, null), waiting, 0, store, now)).toBe(true);
  });
});

describe('why_rider_cannot_take', () => {
  const waiting = { id: 'o1', fulfillment_status: 'ready_for_delivery', rider_id: null, declined_rider_ids: [] };

  it('says the real reason instead of always "another rider took it"', () => {
    expect(why_rider_cannot_take(rider('a', 17.386, 78.487), waiting, 0, store, now)).toBeNull();
    expect(why_rider_cannot_take(rider('a', 17.386, 78.487), waiting, 2, store, now)).toMatch(/already have 2 orders/);
    expect(why_rider_cannot_take(rider('a', 17.386, 78.487), { ...waiting, rider_id: 'b', fulfillment_status: 'rider_assigned' }, 0, store, now)).toMatch(/Another rider/);
    expect(why_rider_cannot_take(rider('a', 17.386, 78.487), { ...waiting, status: 'cancelled' }, 0, store, now)).toMatch(/cancelled/);
    expect(why_rider_cannot_take(rider('a', 17.386, 78.487), { ...waiting, rider_id: 'a', fulfillment_status: 'rider_assigned' }, 0, store, now)).toMatch(/already accepted/);
    expect(why_rider_cannot_take(rider('a', 17.386, 78.487, { is_online: false }), waiting, 0, store, now)).toMatch(/Go online/);
    expect(why_rider_cannot_take(rider('a', 18.5, 79.5), waiting, 0, store, now)).toMatch(/too far/);
  });
});
