// Checks who earns what from delivered orders. No database is used.
import { describe, expect, it } from 'vitest';
import { order_amounts, sum_orders, sum_by_day } from '../../../src/modules/earnings/earnings-math.js';

const rates = { commission_percent: 6, rider_share_percent: 80 };

describe('order_amounts', () => {
  it('splits a 300 rupee order with a 20 rupee fee when a rider delivers it', () => {
    // The customer paid 320: 300 of items and 20 of delivery.
    const result = order_amounts({ total: 320, delivery_fee: 20, rider_id: 'rider-1' }, rates);
    expect(result.items_value).toBe(300);
    expect(result.commission).toBe(18);
    expect(result.rider_pay).toBe(16);
    expect(result.platform_earns).toBe(22); // 18 commission + 4 of the delivery fee
    expect(result.shop_keeps).toBe(282);
  });

  it('gives the delivery fee to the shop when the shop delivers it itself', () => {
    const result = order_amounts({ total: 320, delivery_fee: 20, rider_id: null }, rates);
    expect(result.rider_pay).toBe(0);
    expect(result.platform_earns).toBe(18); // commission only
    expect(result.shop_keeps).toBe(302); // 300 - 18 + 20
  });

  it('takes commission after a coupon discount, because the total already has it removed', () => {
    // 300 of items, 50 off, 20 delivery: the customer paid 270.
    const result = order_amounts({ total: 270, delivery_fee: 20, rider_id: null }, rates);
    expect(result.items_value).toBe(250);
    expect(result.commission).toBe(15);
  });

  it('never goes below zero', () => {
    const result = order_amounts({ total: 10, delivery_fee: 20, rider_id: null }, rates);
    expect(result.items_value).toBe(0);
    expect(result.commission).toBe(0);
  });

  it('everything paid is accounted for', () => {
    const order = { total: 320, delivery_fee: 20, rider_id: 'rider-1' };
    const result = order_amounts(order, rates);
    expect(result.shop_keeps + result.platform_earns + result.rider_pay).toBeCloseTo(320, 2);
  });
});

describe('sum_orders', () => {
  it('adds up several orders', () => {
    const orders = [
      { total: 320, delivery_fee: 20, rider_id: 'r' },
      { total: 100, delivery_fee: 0, rider_id: null }
    ];
    const totals = sum_orders(orders, rates);
    expect(totals.orders).toBe(2);
    expect(totals.items_value).toBe(400);
    expect(totals.commission).toBe(24);
  });

  it('is all zeros with no orders', () => {
    expect(sum_orders([], rates)).toEqual({ orders: 0, items_value: 0, commission: 0, rider_pay: 0, platform_earns: 0, shop_keeps: 0 });
  });
});

describe('sum_by_day', () => {
  it('returns one row per day, oldest first, including quiet days', () => {
    const now = new Date(2026, 9, 10, 12, 0, 0);
    const orders = [{ total: 100, delivery_fee: 0, rider_id: null, created_at: new Date(2026, 9, 9, 15, 0, 0).toISOString() }];
    const days = sum_by_day(orders, rates, 3, now);
    expect(days.map((day) => day.date)).toEqual(['2026-10-08', '2026-10-09', '2026-10-10']);
    expect(days.map((day) => day.orders)).toEqual([0, 1, 0]);
    expect(days[1].commission).toBe(6);
  });
});
