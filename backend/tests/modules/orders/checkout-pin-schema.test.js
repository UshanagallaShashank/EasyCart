// Pure validation, no database: the optional map pin on a delivery checkout.
import { describe, it, expect } from 'vitest';
import { validate_checkout_input } from '../../../src/modules/orders/order-schemas.js';
import { order_point } from '../../../src/modules/delivery/lib/order-point.js';

const BASE = { items: [{ product_id: 'p1', quantity: 1 }], payment_method: 'cash_on_delivery', fulfillment_method: 'delivery', delivery_address: '12 Market Road, Hyderabad' };

describe('checkout map pin', () => {
  it('accepts a delivery order with no pin', () => {
    expect(validate_checkout_input(BASE).success).toBe(true);
  });

  it('accepts a delivery order with a pin', () => {
    const result = validate_checkout_input({ ...BASE, delivery_latitude: 17.385, delivery_longitude: 78.4867 });
    expect(result.success).toBe(true);
    expect(result.data.delivery_latitude).toBe(17.385);
  });

  it('rejects a pin with only one of latitude and longitude', () => {
    expect(validate_checkout_input({ ...BASE, delivery_latitude: 17.385 }).success).toBe(false);
    expect(validate_checkout_input({ ...BASE, delivery_longitude: 78.4867 }).success).toBe(false);
  });

  it('rejects a pin that is not on Earth', () => {
    expect(validate_checkout_input({ ...BASE, delivery_latitude: 123, delivery_longitude: 78 }).success).toBe(false);
    expect(validate_checkout_input({ ...BASE, delivery_latitude: 17, delivery_longitude: 400 }).success).toBe(false);
  });
});

describe('order_point', () => {
  it('returns the pin as numbers', () => {
    expect(order_point({ delivery_latitude: '17.385', delivery_longitude: '78.4867' })).toEqual({ latitude: 17.385, longitude: 78.4867 });
  });

  it('returns null when the order has no pin', () => {
    expect(order_point({ delivery_latitude: null, delivery_longitude: null })).toBeNull();
    expect(order_point({})).toBeNull();
  });
});
