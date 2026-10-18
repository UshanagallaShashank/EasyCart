import { describe, it, expect } from 'vitest';
import { status_change_problem, merge_cart_lines, plan_stock_change } from '../../../src/modules/orders/lib/order-rules.js';
import { choose_rider } from '../../../src/modules/delivery/services/dispatch-service.js';
import { licence_problem } from '../../../src/modules/delivery/lib/delivery-stages.js';

const order = (status, fulfillment_status = 'not_started') => ({ status, fulfillment_status });

describe('status_change_problem', () => {
  it('lets an open order move forward or be cancelled', () => {
    expect(status_change_problem(order('pending'), 'confirmed', { rider_handled: false })).toBeNull();
    expect(status_change_problem(order('pending'), 'fulfilled', { rider_handled: false })).toBeNull();
    expect(status_change_problem(order('confirmed'), 'cancelled', { rider_handled: false })).toBeNull();
  });

  it('never reopens a cancelled or completed order, or moves backwards', () => {
    expect(status_change_problem(order('cancelled'), 'pending', { rider_handled: false })).toMatch(/cannot be reopened/);
    expect(status_change_problem(order('fulfilled'), 'cancelled', { rider_handled: false })).toMatch(/already complete/);
    expect(status_change_problem(order('confirmed'), 'pending', { rider_handled: false })).toMatch(/cannot go from/);
  });

  it('protects rider deliveries', () => {
    expect(status_change_problem(order('confirmed', 'dispatched'), 'cancelled', { rider_handled: true })).toMatch(/rider already has/);
    expect(status_change_problem(order('confirmed', 'rider_assigned'), 'fulfilled', { rider_handled: true })).toMatch(/delivery partner/);
    expect(status_change_problem(order('confirmed', 'rider_assigned'), 'cancelled', { rider_handled: true })).toBeNull();
  });

  it('allows the same status again as a no-op', () => {
    expect(status_change_problem(order('cancelled'), 'cancelled', { rider_handled: false })).toBeNull();
  });
});

describe('merge_cart_lines', () => {
  it('adds up the same product and size added twice, keeping sizes apart', () => {
    const lines = merge_cart_lines([
      { product_id: 'p1', quantity: 2 },
      { product_id: 'p1', quantity: 3 },
      { product_id: 'p1', variant_label: 'M', quantity: 1 },
      { product_id: 'p1', variant_label: 'M', quantity: 1 }
    ]);
    expect(lines).toEqual([{ product_id: 'p1', quantity: 5 }, { product_id: 'p1', variant_label: 'M', quantity: 2 }]);
  });
});

describe('plan_stock_change', () => {
  const product = { name: 'Shirt', stock_quantity: 4, variants: [{ label: 'M', stock: 2 }, { label: 'L', stock: 0 }] };

  it('takes variant stock from the variant and plain stock from the product', () => {
    const plan = plan_stock_change(product, [{ quantity: 3 }, { variant_label: 'M', quantity: 2 }], -1);
    expect(plan).toEqual({ stock_quantity: 1, variants: [{ label: 'M', stock: 0 }, { label: 'L', stock: 0 }] });
    expect(product.variants[0].stock).toBe(2);
  });

  it('explains what is short', () => {
    expect(plan_stock_change(product, [{ quantity: 5 }], -1).problem).toBe('Only 4 left of Shirt');
    expect(plan_stock_change(product, [{ variant_label: 'L', quantity: 1 }], -1).problem).toBe('Only 0 left of Shirt (L)');
    expect(plan_stock_change(product, [{ variant_label: 'XL', quantity: 1 }], -1).problem).toMatch(/no longer available/);
  });

  it('puts stock back on cancel', () => {
    expect(plan_stock_change(product, [{ variant_label: 'L', quantity: 2 }], 1).variants[1].stock).toBe(2);
  });
});

describe('dispatch radius and licence', () => {
  const now = Date.now();
  const seen = new Date(now - 60_000).toISOString();
  const rider = (id, latitude, longitude) => ({ id, latitude, longitude, status: 'approved', is_online: true, last_seen_at: seen });
  const store = { latitude: 17.385, longitude: 78.4867 };

  it('does not offer orders to riders too far away, but still tries riders with no location', () => {
    expect(choose_rider([rider('far', 18.5, 79.5)], new Map(), [], store, now)).toBeNull();
    expect(choose_rider([rider('far', 18.5, 79.5), rider('unknown', null, null)], new Map(), [], store, now).id).toBe('unknown');
  });

  it('blocks going online with an expired licence, except on a bicycle', () => {
    const today = new Date('2026-10-02T10:00:00');
    expect(licence_problem({ vehicle_type: 'bike', license_expiry: '2026-10-01' }, today)).toMatch(/expired/);
    expect(licence_problem({ vehicle_type: 'bike', license_expiry: '2026-10-02' }, today)).toBeNull();
    expect(licence_problem({ vehicle_type: 'bicycle', license_expiry: '2020-01-01' }, today)).toBeNull();
  });
});
