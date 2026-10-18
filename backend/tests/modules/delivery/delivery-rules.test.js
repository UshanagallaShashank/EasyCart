import { describe, it, expect } from 'vitest';
import { create_delivery_code, create_pickup_code, code_matches } from '../../../src/modules/delivery/lib/delivery-codes.js';
import { is_offer_expired, is_rider_flow } from '../../../src/modules/delivery/lib/delivery-stages.js';
import { summarize_rider_money, rider_daily_series } from '../../../src/modules/delivery/lib/summarize-rider-money.js';
import { to_owner_order, to_customer_order, to_admin_order } from '../../../src/modules/orders/lib/order-views.js';
import { rider_profile_schema } from '../../../src/modules/delivery/delivery-schemas.js';

describe('handover codes', () => {
  it('makes 6-digit delivery codes and 4-digit pickup codes', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(create_delivery_code()).toMatch(/^[0-9]{6}$/);
      expect(create_pickup_code()).toMatch(/^[0-9]{4}$/);
    }
  });
  it('matches only the exact code', () => {
    expect(code_matches('012345', '012345')).toBe(true);
    expect(code_matches('12345', '012345')).toBe(false);
    expect(code_matches(undefined, '012345')).toBe(false);
  });
});

describe('order views keep each code on one side', () => {
  const order = { id: 'o1', delivery_code: '123456', pickup_code: '9876', delivery_photo_path: 'x.jpg', declined_rider_ids: ['r'], fulfillment_status: 'dispatched', status: 'confirmed' };
  it('never shows the customer code to the store', () => {
    expect(to_owner_order(order)).not.toHaveProperty('delivery_code');
    expect(to_owner_order(order).pickup_code).toBe('9876');
  });
  it('never shows the pickup code to the customer, and hides their code once delivered', () => {
    expect(to_customer_order(order)).not.toHaveProperty('pickup_code');
    expect(to_customer_order(order).delivery_code).toBe('123456');
    expect(to_customer_order({ ...order, fulfillment_status: 'delivered' }).delivery_code).toBeNull();
  });
  it('shows neither code to the admin', () => {
    const view = to_admin_order(order);
    expect(view).not.toHaveProperty('delivery_code');
    expect(view).not.toHaveProperty('pickup_code');
  });
});

describe('delivery stages', () => {
  it('knows when an offer has run out', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    expect(is_offer_expired({ fulfillment_status: 'rider_assigned', rider_offer_status: 'offered', rider_offer_expires_at: past })).toBe(true);
    expect(is_offer_expired({ fulfillment_status: 'rider_assigned', rider_offer_status: 'accepted', rider_offer_expires_at: past })).toBe(false);
  });
  it('treats an order as rider-handled once a rider search starts', () => {
    expect(is_rider_flow({ fulfillment_status: 'not_started' })).toBe(false);
    expect(is_rider_flow({ fulfillment_status: 'ready_for_delivery' })).toBe(true);
    expect(is_rider_flow({ fulfillment_status: 'delivered', rider_id: 'r1' })).toBe(true);
    expect(is_rider_flow({ fulfillment_status: 'dispatched', rider_id: null })).toBe(false);
  });
});

describe('summarize_rider_money', () => {
  const now = new Date('2026-10-02T12:00:00Z');
  const orders = [
    { fulfillment_status: 'delivered', delivered_at: '2026-10-02T09:00:00Z', rider_earning: 30, cash_collected: 530 },
    { fulfillment_status: 'delivered', delivered_at: '2026-09-20T09:00:00Z', rider_earning: 40, cash_collected: 240 },
    { fulfillment_status: 'dispatched', rider_earning: null, cash_collected: null }
  ];
  const settlements = [{ kind: 'cash_deposit', amount: 500 }, { kind: 'payout', amount: 30 }];

  it('adds up deliveries, earnings and cash held', () => {
    const summary = summarize_rider_money(orders, settlements, now);
    expect(summary).toMatchObject({ deliveries: 2, deliveries_today: 1, earnings: 70, earnings_today: 30, cash_collected: 770, cash_in_hand: 270, paid_out: 30, payout_due: 40 });
  });
  it('builds a day-by-day series ending today', () => {
    const series = rider_daily_series(orders, 3, now);
    expect(series).toHaveLength(3);
    expect(series[2]).toMatchObject({ deliveries: 1, earnings: 30 });
  });
});

describe('rider_profile_schema', () => {
  const base = {
    full_name: 'Ravi Kumar', date_of_birth: '1995-04-01', vehicle_type: 'bike', vehicle_number: 'TS09AB1234',
    license_number: 'TS0920190001234', license_expiry: '2030-01-01', address_line: '12 MG Road', area: 'Ameerpet',
    city: 'Hyderabad', pincode: '500016', emergency_contact_name: 'Sita', emergency_contact_phone: '9876543210', upi_id: ''
  };
  it('accepts a complete motorbike profile', () => {
    expect(rider_profile_schema.safeParse(base).success).toBe(true);
  });
  it('requires a licence for motor vehicles but not for a bicycle', () => {
    const no_licence = { ...base, license_number: '', license_expiry: '', vehicle_number: '' };
    expect(rider_profile_schema.safeParse(no_licence).success).toBe(false);
    expect(rider_profile_schema.safeParse({ ...no_licence, vehicle_type: 'bicycle' }).success).toBe(true);
  });
});
