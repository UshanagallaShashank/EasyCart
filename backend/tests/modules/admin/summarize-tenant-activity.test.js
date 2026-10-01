// Unit tests for the per-store numbers shown on the platform admin store page.
import { describe, it, expect } from 'vitest';
import { summarize_tenant_activity } from '../../../src/modules/admin/services/summarize-tenant-activity.js';

const products = [
  { is_active: true, stock_quantity: 10, low_stock_threshold: 5 },
  { is_active: false, stock_quantity: 2, low_stock_threshold: 5 }
];
const orders = [
  { id: 'o1', customer_id: 'c1', total: 100, status: 'fulfilled', payment_status: 'paid', created_at: '2026-09-01T10:00:00Z' },
  { id: 'o2', customer_id: 'c1', total: 50, status: 'cancelled', payment_status: 'unpaid', created_at: '2026-09-03T10:00:00Z' },
  { id: 'o3', customer_id: 'c2', total: 70, status: 'pending', payment_status: 'unpaid', created_at: '2026-09-02T10:00:00Z' }
];

describe('summarize_tenant_activity', () => {
  it('counts products, low stock, orders, pending, and unique customers', () => {
    const result = summarize_tenant_activity(products, orders);
    expect(result).toMatchObject({ product_count: 2, active_product_count: 1, low_stock_count: 1, order_count: 3, pending_order_count: 1, customer_count: 2 });
  });

  it('excludes cancelled orders from revenue and lists newest orders first', () => {
    const result = summarize_tenant_activity(products, orders);
    expect(result.revenue).toBe(170);
    expect(result.recent_orders.map((o) => o.id)).toEqual(['o2', 'o3', 'o1']);
    expect(result.last_order_at).toBe('2026-09-03T10:00:00Z');
  });

  it('handles a store with no products or orders', () => {
    const result = summarize_tenant_activity([], []);
    expect(result).toMatchObject({ product_count: 0, order_count: 0, revenue: 0, customer_count: 0, last_order_at: null, recent_orders: [] });
  });
});
