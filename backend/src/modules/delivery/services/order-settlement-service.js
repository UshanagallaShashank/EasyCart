// Settling a delivered cash order between the rider and the store.
// The rider hands the store its share in cash (order total minus the delivery fee) and keeps the delivery fee as pay.
// Whether an order is settled is stored on the order itself, so every server sees the same answer.
// The two money movements are also written to the rider's ledger (rider_settlements) for their earnings page.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../platform/shared/app-error.js';
import { find_order_by_id } from '../../orders/repositories/order-repository.js';
import { find_orders_by_tenant } from '../../orders/repositories/order-query-repository.js';
import { find_stores_by_tenant_ids } from '../../stores/repositories/store-repository.js';
import { find_riders_by_ids } from '../repositories/rider-repository.js';
import { find_order_by_id_any_store, find_orders_by_rider, update_order_if } from '../repositories/delivery-order-repository.js';
import { save_settlement } from '../repositories/settlement-repository.js';
import { get_rider_for_user } from './rider-application-service.js';

const METHODS = ['cash', 'upi', 'bank_transfer'];

function round(value) {
  return Math.round(value * 100) / 100;
}

// The settlement saved on an order, or null while it is still open.
export function settlement_record_of(order) {
  if (!order.settled_at) return null;
  return { is_settled: true, settled_at: order.settled_at, settled_by: order.settled_by ?? null, method: order.settlement_method ?? null, note: order.settlement_note ?? null };
}

// Who owes what on one order: the cash the rider holds, their fee, and the store's share.
export function calculate_order_settlement(order, record = settlement_record_of(order)) {
  const cash_collected = Number(order.cash_collected ?? (order.payment_status === 'paid' && order.fulfillment_status !== 'delivered' ? 0 : order.total));
  const rider_earning = Number(order.rider_earning ?? order.delivery_fee ?? 0);
  const is_cod = cash_collected > 0;
  const store_amount = is_cod ? Math.max(0, round(cash_collected - rider_earning)) : 0;
  const is_settled = Boolean(record?.is_settled);

  return {
    order_id: order.id,
    cash_collected,
    rider_earning,
    store_amount,
    net_to_store: store_amount,
    is_cod,
    is_settled,
    settled_at: record?.settled_at ?? null,
    settled_by: record?.settled_by ?? null,
    method: record?.method ?? null,
    note: record?.note ?? null,
    has_cash_deposit: is_settled && cash_collected > 0,
    has_payout: is_settled && rider_earning > 0
  };
}

async function settle(order, { user_id, method, note, settled_by }) {
  if (order.fulfillment_method !== 'delivery') throw new AppError('This is not a delivery order', 400);
  if (order.fulfillment_status !== 'delivered') throw new AppError('Only delivered orders can be settled', 400);
  if (!order.rider_id) throw new AppError('No delivery partner on this order', 400);
  if (order.settled_at) return { ok: true, already_settled: true, settlement: calculate_order_settlement(order) };

  const safe_method = METHODS.includes(method) ? method : 'cash';
  const clean_note = typeof note === 'string' && note.trim() ? note.trim().slice(0, 200) : null;

  // Claim the order first. If the store and rider both press "settle" at once, only one claim succeeds.
  const settled = await update_order_if(order.id, { settled_at: null }, {
    settled_at: new Date().toISOString(), settled_by, settlement_method: safe_method, settlement_note: clean_note
  });
  if (!settled) return { ok: true, already_settled: true, settlement: calculate_order_settlement(await find_order_by_id_any_store(order.id)) };

  const breakdown = calculate_order_settlement(settled);
  const label = `Order #${order.id.slice(0, 8)}`;
  if (breakdown.cash_collected > 0) {
    await save_settlement({ id: randomUUID(), rider_id: order.rider_id, order_id: order.id, kind: 'cash_deposit', amount: breakdown.cash_collected, note: `${label}: cash handed to the store (${safe_method})`, recorded_by: user_id });
  }
  if (breakdown.rider_earning > 0) {
    await save_settlement({ id: randomUUID(), rider_id: order.rider_id, order_id: order.id, kind: 'payout', amount: breakdown.rider_earning, note: `${label}: delivery fee kept by the rider`, recorded_by: user_id });
  }
  return { ok: true, settlement: breakdown };
}

export async function settle_order_payment({ tenant_id, order_id, user_id, method = 'cash', note = null, settled_by = 'store_owner' }) {
  const order = await find_order_by_id(order_id, tenant_id);
  if (!order) throw new AppError('Order not found', 404);
  return settle(order, { user_id, method, note, settled_by });
}

export async function rider_pay_store({ user_id, order_id, method = 'cash', note = null }) {
  const rider = await get_rider_for_user(user_id);
  const order = await find_order_by_id_any_store(order_id);
  if (!order || order.rider_id !== rider.id) throw new AppError('Order not found', 404);
  return settle(order, { user_id, method, note: note || 'Paid by rider at store counter', settled_by: 'rider' });
}

function newest_first(rows) {
  return rows.sort((a, b) => new Date(b.delivered_at || b.created_at).getTime() - new Date(a.delivered_at || a.created_at).getTime());
}

// The store's delivered orders with what each rider still owes it.
export async function get_store_delivery_settlements(tenant_id) {
  const delivered = (await find_orders_by_tenant(tenant_id)).filter((o) => o.fulfillment_method === 'delivery' && o.fulfillment_status === 'delivered');
  const riders = await find_riders_by_ids([...new Set(delivered.map((o) => o.rider_id).filter(Boolean))]);
  const rider_map = new Map(riders.map((r) => [r.id, r]));

  const rows = delivered.map((order) => {
    const rider = rider_map.get(order.rider_id);
    return { order_id: order.id, created_at: order.created_at, delivered_at: order.delivered_at ?? null, rider_id: order.rider_id ?? null, rider_name: rider?.full_name ?? null, rider_phone: rider?.phone_number ?? null, total: order.total, ...calculate_order_settlement(order) };
  });
  const open = rows.filter((row) => !row.is_settled);
  const done = rows.filter((row) => row.is_settled);
  const sum = (list, field) => round(list.reduce((total, row) => total + row[field], 0));

  return {
    summary: {
      pending_cash_from_riders: sum(open, 'store_amount'),
      pending_rider_payouts: sum(open, 'rider_earning'),
      settled_cash_total: sum(done, 'store_amount'),
      settled_orders_count: done.length,
      pending_orders_count: open.length
    },
    orders: newest_first(rows)
  };
}

// The rider's delivered orders with the cash they still owe each store.
export async function get_rider_delivery_settlements(user_id) {
  const rider = await get_rider_for_user(user_id);
  const delivered = (await find_orders_by_rider(rider.id)).filter((o) => o.fulfillment_status === 'delivered');
  const stores = await find_stores_by_tenant_ids([...new Set(delivered.map((o) => o.tenant_id))]);
  const store_map = new Map(stores.map((s) => [s.tenant_id, s]));

  const rows = delivered.map((order) => {
    const store = store_map.get(order.tenant_id);
    return { order_id: order.id, store_id: order.tenant_id, store_name: store?.name ?? 'Store', store_address: store?.address ?? null, created_at: order.created_at, delivered_at: order.delivered_at ?? null, total: order.total, ...calculate_order_settlement(order) };
  });
  const open = rows.filter((row) => !row.is_settled);
  const done = rows.filter((row) => row.is_settled);
  const sum = (list, field) => round(list.reduce((total, row) => total + row[field], 0));

  return {
    summary: {
      pending_cash_to_stores: sum(open, 'store_amount'),
      pending_ride_earnings: sum(open, 'rider_earning'),
      settled_cash_total: sum(done, 'rider_earning'),
      settled_store_cash: sum(done, 'store_amount'),
      settled_orders_count: done.length,
      pending_orders_count: open.length,
      total_orders_count: rows.length
    },
    orders: newest_first(rows)
  };
}
