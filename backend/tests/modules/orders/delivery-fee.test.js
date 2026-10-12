// Checks the free-delivery rule on its own. No database.
import { describe, expect, it } from 'vitest';
import { delivery_fee_for } from '../../../src/modules/orders/lib/delivery-fee.js';

describe('delivery fee', () => {
  it('charges the normal fee when the shop has no free-delivery amount', () => {
    expect(delivery_fee_for({ fee: 30, free_above: null, order_value: 1000 })).toBe(30);
    expect(delivery_fee_for({ fee: 30, free_above: undefined, order_value: 1000 })).toBe(30);
    expect(delivery_fee_for({ fee: 30, free_above: 0, order_value: 1000 })).toBe(30);
  });

  it('waives the fee once the order reaches the amount', () => {
    expect(delivery_fee_for({ fee: 30, free_above: 499, order_value: 499 })).toBe(0);
    expect(delivery_fee_for({ fee: 30, free_above: 499, order_value: 800 })).toBe(0);
  });

  it('still charges just below the amount', () => {
    expect(delivery_fee_for({ fee: 30, free_above: 499, order_value: 498.5 })).toBe(30);
  });

  it('treats a missing fee as free', () => {
    expect(delivery_fee_for({ fee: null, free_above: 499, order_value: 10 })).toBe(0);
  });
});
