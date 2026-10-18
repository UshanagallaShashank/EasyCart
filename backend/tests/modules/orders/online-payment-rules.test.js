// Checks that a shop cannot work on an online order before it is paid. Only the pure rules file is loaded.
import { describe, it, expect } from 'vitest';
import { status_change_problem } from '../../../src/modules/orders/lib/order-rules.js';

const online = (payment_status) => ({ status: 'pending', fulfillment_status: 'not_started', payment_method: 'online', payment_status });

describe('online orders and status changes', () => {
  it('blocks confirming or completing an online order that is not paid yet', () => {
    expect(status_change_problem(online('unpaid'), 'confirmed', { rider_handled: false })).toContain('not paid online yet');
    expect(status_change_problem(online('unpaid'), 'fulfilled', { rider_handled: false })).toContain('not paid online yet');
  });

  it('still lets the store cancel an unpaid online order', () => {
    expect(status_change_problem(online('unpaid'), 'cancelled', { rider_handled: false })).toBeNull();
  });

  it('lets the store confirm an online order once it is paid', () => {
    expect(status_change_problem(online('paid'), 'confirmed', { rider_handled: false })).toBeNull();
  });

  it('does not change anything for cash orders', () => {
    const cash = { status: 'pending', fulfillment_status: 'not_started', payment_method: 'cash_on_delivery', payment_status: 'unpaid' };
    expect(status_change_problem(cash, 'confirmed', { rider_handled: false })).toBeNull();
  });
});
