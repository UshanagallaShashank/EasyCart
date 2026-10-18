// Checks who may ask for a refund and how much. No database is used.
import { describe, expect, it } from 'vitest';
import { refund_method, refund_request_problem, refundable_amount } from '../../../src/modules/refunds/refund-rules.js';

const now = new Date('2026-10-11T12:00:00Z');
const delivered = (extra = {}) => ({ status: 'fulfilled', payment_status: 'paid', payment_method: 'cash_on_delivery', total: 300, delivered_at: '2026-10-10T12:00:00Z', ...extra });

describe('refundable_amount', () => {
  it('is what was paid, minus refunds that are done or waiting', () => {
    expect(refundable_amount(delivered(), [])).toBe(300);
    expect(refundable_amount(delivered(), [{ status: 'refunded', amount: 100 }, { status: 'requested', amount: 50 }])).toBe(150);
  });

  it('does not count rejected or failed refunds', () => {
    expect(refundable_amount(delivered(), [{ status: 'rejected', amount: 300 }, { status: 'failed', amount: 300 }])).toBe(300);
  });

  it('never goes below zero', () => {
    expect(refundable_amount(delivered(), [{ status: 'refunded', amount: 500 }])).toBe(0);
  });
});

describe('refund_request_problem', () => {
  it('allows a delivered, paid order within 7 days', () => {
    expect(refund_request_problem(delivered(), [], 120, now)).toBeNull();
  });

  it('allows a cancelled order that was paid online', () => {
    expect(refund_request_problem(delivered({ status: 'cancelled', payment_method: 'online' }), [], 300, now)).toBeNull();
  });

  it('refuses unpaid orders and orders still in progress', () => {
    expect(refund_request_problem(delivered({ payment_status: 'unpaid' }), [], 10, now)).toContain('paid');
    expect(refund_request_problem(delivered({ status: 'confirmed' }), [], 10, now)).toContain('delivered or cancelled');
  });

  it('refuses a second request while one is waiting', () => {
    expect(refund_request_problem(delivered(), [{ status: 'requested', amount: 10 }], 10, now)).toContain('already waiting');
  });

  it('refuses more than is left, zero, and a fully refunded order', () => {
    expect(refund_request_problem(delivered(), [], 301, now)).toContain('up to Rs. 300.00');
    expect(refund_request_problem(delivered(), [], 0, now)).toContain('above 0');
    expect(refund_request_problem(delivered(), [{ status: 'refunded', amount: 300 }], 1, now)).toContain('in full');
  });

  it('refuses requests after 7 days', () => {
    expect(refund_request_problem(delivered({ delivered_at: '2026-10-01T12:00:00Z' }), [], 10, now)).toContain('within 7 days');
  });
});

describe('refund_method', () => {
  it('sends online payments back online and everything else as cash', () => {
    expect(refund_method({ payment_method: 'online' })).toBe('online');
    expect(refund_method({ payment_method: 'cash_on_delivery' })).toBe('cash');
  });
});
