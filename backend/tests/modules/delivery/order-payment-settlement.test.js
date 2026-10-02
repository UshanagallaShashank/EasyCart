import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculate_order_settlement,
  settle_order_payment
} from '../../../src/modules/delivery/services/order-settlement-service.js';
import { summarize_rider_money } from '../../../src/modules/delivery/lib/summarize-rider-money.js';
import { _clear_settlement_cache, get_order_settlement } from '../../../src/modules/delivery/repositories/order-settlement-store.js';

describe('Order Delivery Payment & Settlement', () => {
  beforeEach(() => {
    _clear_settlement_cache();
  });

  describe('calculate_order_settlement', () => {
    it('calculates COD order breakdown correctly (cash collected, store share, rider ride earning)', () => {
      const cod_order = {
        id: 'ord-1',
        total: 500,
        delivery_fee: 50,
        rider_earning: 50,
        cash_collected: 500,
        payment_status: 'paid',
        fulfillment_status: 'delivered'
      };

      const breakdown = calculate_order_settlement(cod_order);
      expect(breakdown.is_cod).toBe(true);
      expect(breakdown.cash_collected).toBe(500);
      expect(breakdown.rider_earning).toBe(50);
      expect(breakdown.store_amount).toBe(450);
      expect(breakdown.net_to_store).toBe(450);
      expect(breakdown.is_settled).toBe(false);
    });

    it('calculates online prepaid order breakdown correctly (cash collected = 0, store share = 0, rider earning = delivery fee)', () => {
      const prepaid_order = {
        id: 'ord-2',
        total: 400,
        delivery_fee: 40,
        rider_earning: 40,
        cash_collected: 0,
        payment_status: 'paid',
        fulfillment_status: 'delivered'
      };

      const breakdown = calculate_order_settlement(prepaid_order);
      expect(breakdown.is_cod).toBe(false);
      expect(breakdown.cash_collected).toBe(0);
      expect(breakdown.rider_earning).toBe(40);
      expect(breakdown.store_amount).toBe(0);
      expect(breakdown.net_to_store).toBe(0);
      expect(breakdown.is_settled).toBe(false);
    });

    it('includes existing settlement record info when settled', () => {
      const order = {
        id: 'ord-3',
        total: 300,
        delivery_fee: 30,
        rider_earning: 30,
        cash_collected: 300,
        fulfillment_status: 'delivered'
      };
      const record = {
        is_settled: true,
        settled_at: '2026-10-02T10:00:00.000Z',
        settled_by: 'store_owner',
        method: 'cash',
        note: 'Settled at store counter'
      };

      const breakdown = calculate_order_settlement(order, record);
      expect(breakdown.is_settled).toBe(true);
      expect(breakdown.settled_by).toBe('store_owner');
      expect(breakdown.method).toBe('cash');
      expect(breakdown.note).toBe('Settled at store counter');
    });
  });

  describe('reconciliation with summarize_rider_money', () => {
    it('clears cash_in_hand and payout_due when COD order is fully settled', () => {
      const delivered_orders = [
        {
          id: 'ord-10',
          fulfillment_status: 'delivered',
          delivered_at: '2026-10-02T11:00:00.000Z',
          rider_earning: 50,
          cash_collected: 500
        }
      ];

      // Before settlement: Rider collected 500 cash, earned 50
      const initial_summary = summarize_rider_money(delivered_orders, []);
      expect(initial_summary.cash_collected).toBe(500);
      expect(initial_summary.cash_deposited).toBe(0);
      expect(initial_summary.cash_in_hand).toBe(500); // Rider still holds 500 cash
      expect(initial_summary.earnings).toBe(50);
      expect(initial_summary.paid_out).toBe(0);
      expect(initial_summary.payout_due).toBe(50); // Rider owed 50 for the ride

      // After settlement:
      // 1. Rider deposited 500 cash collected (450 to store + 50 retained as payout)
      // 2. Rider was paid out 50 ride fee
      const settlements = [
        { kind: 'cash_deposit', amount: 500, note: 'Order #ord-10: COD cash remitted [order:ord-10]' },
        { kind: 'payout', amount: 50, note: 'Order #ord-10: Ride fee received [order:ord-10]' }
      ];

      const settled_summary = summarize_rider_money(delivered_orders, settlements);
      expect(settled_summary.cash_in_hand).toBe(0); // Fully reconciled!
      expect(settled_summary.payout_due).toBe(0);   // Ride fee received!
      expect(settled_summary.paid_out).toBe(50);
      expect(settled_summary.cash_deposited).toBe(500);
    });
  });
});
