// Pure logic, no database: which stores does a customer belong to?
import { describe, it, expect } from 'vitest';
import { pick_customer_stores } from '../../../src/modules/orders/lib/pick-customer-stores.js';

const STORE_A = { tenant_id: 'ta', slug: 'store-a', name: 'Store A', logo_url: null, is_published: true };
const STORE_B = { tenant_id: 'tb', slug: 'store-b', name: 'Store B', logo_url: 'logo.png', is_published: true };

describe('pick_customer_stores', () => {
  it('returns the store the customer ordered from', () => {
    const orders = [{ tenant_id: 'ta', created_at: '2026-10-01T10:00:00Z' }];
    expect(pick_customer_stores(orders, [STORE_A])).toEqual([{ slug: 'store-a', name: 'Store A', logo_url: null }]);
  });

  it('lists the most recently ordered store first', () => {
    const orders = [
      { tenant_id: 'ta', created_at: '2026-09-01T10:00:00Z' },
      { tenant_id: 'tb', created_at: '2026-10-01T10:00:00Z' }
    ];
    expect(pick_customer_stores(orders, [STORE_A, STORE_B]).map((store) => store.slug)).toEqual(['store-b', 'store-a']);
  });

  it('lists a store once even after many orders', () => {
    const orders = [
      { tenant_id: 'ta', created_at: '2026-09-01T10:00:00Z' },
      { tenant_id: 'ta', created_at: '2026-09-05T10:00:00Z' },
      { tenant_id: 'ta', created_at: '2026-09-09T10:00:00Z' }
    ];
    expect(pick_customer_stores(orders, [STORE_A])).toHaveLength(1);
  });

  it('skips stores that are not published', () => {
    const orders = [{ tenant_id: 'ta', created_at: '2026-10-01T10:00:00Z' }];
    expect(pick_customer_stores(orders, [{ ...STORE_A, is_published: false }])).toEqual([]);
  });

  it('skips orders whose store cannot be found', () => {
    const orders = [{ tenant_id: 'gone', created_at: '2026-10-01T10:00:00Z' }];
    expect(pick_customer_stores(orders, [STORE_A])).toEqual([]);
  });

  it('returns nothing for a customer with no orders', () => {
    expect(pick_customer_stores([], [STORE_A])).toEqual([]);
  });
});
