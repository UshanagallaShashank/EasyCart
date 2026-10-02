// Business logic for delivery payment settlements between delivery partners and stores.
// Handles COD cash remittance to the store and ride fee payouts to the partner.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../platform/shared/app-error.js';
import { find_order_by_id } from '../../orders/repositories/order-repository.js';
import { find_orders_by_tenant } from '../../orders/repositories/order-query-repository.js';
import { find_store_by_tenant_id, find_stores_by_tenant_ids } from '../../stores/repositories/store-repository.js';
import { find_rider_by_id, find_riders_by_ids } from '../repositories/rider-repository.js';
import { find_order_by_id_any_store, find_orders_by_rider } from '../repositories/delivery-order-repository.js';
import { save_settlement, find_all_settlements, find_settlements_by_rider } from '../repositories/settlement-repository.js';
import { get_rider_for_user } from './rider-application-service.js';
import {
  get_order_settlement,
  set_order_settlement,
  get_settlements_for_tenant,
  get_settlements_for_rider,
  parse_settlement_note
} from '../repositories/order-settlement-store.js';

/**
 * Calculates financial breakdown for an order:
 * - Cash collected from customer (COD vs online prepaid)
 * - Rider earning for the ride (delivery fee)
 * - Store product share (total - rider_earning)
 * - Net cash remittance to store
 */
export function calculate_order_settlement(order, settlement_record = null) {
  const cash_collected = Number(order.cash_collected ?? (order.payment_status === 'paid' && order.fulfillment_status !== 'delivered' ? 0 : order.total));
  const rider_earning = Number(order.rider_earning ?? order.delivery_fee ?? 0);
  const is_cod = cash_collected > 0;
  const store_amount = is_cod ? Math.max(0, Math.round((cash_collected - rider_earning) * 100) / 100) : 0;
  const net_to_store = store_amount;

  return {
    order_id: order.id,
    cash_collected,
    rider_earning,
    store_amount,
    net_to_store,
    is_cod,
    is_settled: Boolean(settlement_record?.is_settled),
    settled_at: settlement_record?.settled_at ?? null,
    settled_by: settlement_record?.settled_by ?? null,
    method: settlement_record?.method ?? null,
    note: settlement_record?.note ?? null
  };
}

/**
 * Settles order payment between Store and Delivery Partner:
 * 1. For COD: Partner remits cash to store -> records 'cash_deposit' in settlements
 * 2. Partner receives ride fee -> records 'payout' in settlements
 * 3. Reconciles both balances to 0 for this order.
 */
export async function settle_order_payment({ tenant_id, order_id, user_id, method = 'cash', note = null, settled_by = 'store_owner' }) {
  const order = await find_order_by_id(order_id, tenant_id);
  if (!order) throw new AppError('Order not found', 404);
  if (order.fulfillment_method !== 'delivery') throw new AppError('This is not a delivery order', 400);
  if (order.fulfillment_status !== 'delivered') throw new AppError('Only delivered orders can be settled', 400);
  if (!order.rider_id) throw new AppError('No delivery partner assigned to this order', 400);

  const existing = await get_order_settlement(order.id);
  if (existing?.is_settled) {
    return { ok: true, already_settled: true, settlement: calculate_order_settlement(order, existing) };
  }

  const breakdown = calculate_order_settlement(order, null);
  const safe_method = ['cash', 'upi', 'bank_transfer'].includes(method) ? method : 'cash';
  const tag = `[order:${order.id}|tenant:${order.tenant_id}|mode:${safe_method}]`;

  // 1. If cash was collected from customer, record cash deposit for the rider
  if (breakdown.cash_collected > 0) {
    await save_settlement({
      id: randomUUID(),
      rider_id: order.rider_id,
      kind: 'cash_deposit',
      amount: breakdown.cash_collected,
      note: `Order #${order.id.slice(0, 8)}: COD cash collected from customer remitted to store via ${safe_method.toUpperCase()}${note ? ` · ${note}` : ''} ${tag}`,
      recorded_by: user_id
    });
  }

  // 2. Record ride fee payout for the delivery partner
  if (breakdown.rider_earning > 0) {
    await save_settlement({
      id: randomUUID(),
      rider_id: order.rider_id,
      kind: 'payout',
      amount: breakdown.rider_earning,
      note: `Order #${order.id.slice(0, 8)}: Ride fee received by partner for delivery via ${safe_method.toUpperCase()}${note ? ` · ${note}` : ''} ${tag}`,
      recorded_by: user_id
    });
  }

  // 3. Update order settlement cache
  const settlement_record = await set_order_settlement(order.id, {
    tenant_id: order.tenant_id,
    rider_id: order.rider_id,
    is_settled: true,
    settled_at: new Date().toISOString(),
    settled_by,
    method: safe_method,
    note: note || null,
    cash_collected: breakdown.cash_collected,
    store_amount: breakdown.store_amount,
    rider_earning: breakdown.rider_earning
  });

  return {
    ok: true,
    settlement: calculate_order_settlement(order, settlement_record)
  };
}

/**
 * Allows the delivery partner to record cash remittance to the store.
 */
export async function rider_pay_store({ user_id, order_id, method = 'cash', note = null }) {
  const rider = await get_rider_for_user(user_id);
  const order = await find_order_by_id_any_store(order_id);
  if (!order || order.rider_id !== rider.id) throw new AppError('Order not found', 404);
  if (order.fulfillment_status !== 'delivered') throw new AppError('Only delivered orders can be settled with the store', 400);

  return settle_order_payment({
    tenant_id: order.tenant_id,
    order_id: order.id,
    user_id,
    method,
    note: note || 'Paid by rider at store counter',
    settled_by: 'rider'
  });
}

/**
 * Returns store's settlement summary and list of delivered orders.
 */
export async function get_store_delivery_settlements(tenant_id) {
  const [orders, all_settlements] = await Promise.all([
    find_orders_by_tenant(tenant_id),
    find_all_settlements().catch(() => [])
  ]);

  const db_settlement_map = new Map();
  for (const s of all_settlements) {
    const parsed = parse_settlement_note(s.note);
    if (parsed) {
      const existing = db_settlement_map.get(parsed.order_id);
      db_settlement_map.set(parsed.order_id, {
        order_id: parsed.order_id,
        tenant_id: parsed.tenant_id || existing?.tenant_id || tenant_id,
        rider_id: s.rider_id || existing?.rider_id,
        is_settled: true,
        settled_at: s.created_at || existing?.settled_at,
        settled_by: existing?.settled_by || (s.note.includes('rider') ? 'rider' : 'store_owner'),
        method: parsed.method || existing?.method || 'cash',
        note: s.note,
        has_cash_deposit: Boolean(existing?.has_cash_deposit || s.kind === 'cash_deposit'),
        has_payout: Boolean(existing?.has_payout || s.kind === 'payout')
      });
    }
  }

  const delivered = orders.filter((o) => o.fulfillment_method === 'delivery' && o.fulfillment_status === 'delivered');
  const rider_ids = [...new Set(delivered.map((o) => o.rider_id).filter(Boolean))];
  const riders = await find_riders_by_ids(rider_ids);
  const rider_map = new Map(riders.map((r) => [r.id, r]));

  let pending_cash_from_riders = 0;
  let pending_rider_payouts = 0;
  let settled_cash_total = 0;
  let settled_orders_count = 0;
  let pending_orders_count = 0;

  const rows = [];
  for (const order of delivered) {
    const record = db_settlement_map.get(order.id) || await get_order_settlement(order.id);
    const breakdown = calculate_order_settlement(order, record);
    const rider = order.rider_id ? rider_map.get(order.rider_id) : null;

    if (breakdown.is_settled) {
      settled_orders_count += 1;
      settled_cash_total += breakdown.store_amount;
    } else {
      pending_orders_count += 1;
      pending_cash_from_riders += breakdown.store_amount;
      pending_rider_payouts += breakdown.rider_earning;
    }

    rows.push({
      order_id: order.id,
      created_at: order.created_at,
      delivered_at: order.delivered_at ?? null,
      rider_id: order.rider_id ?? null,
      rider_name: rider?.full_name ?? null,
      rider_phone: rider?.phone_number ?? null,
      total: order.total,
      has_cash_deposit: record?.has_cash_deposit ?? breakdown.is_settled,
      has_payout: record?.has_payout ?? breakdown.is_settled,
      ...breakdown
    });
  }

  // Sort newest delivered first
  rows.sort((a, b) => new Date(b.delivered_at || b.created_at).getTime() - new Date(a.delivered_at || a.created_at).getTime());

  return {
    summary: {
      pending_cash_from_riders: Math.round(pending_cash_from_riders * 100) / 100,
      pending_rider_payouts: Math.round(pending_rider_payouts * 100) / 100,
      settled_cash_total: Math.round(settled_cash_total * 100) / 100,
      settled_orders_count,
      pending_orders_count
    },
    orders: rows
  };
}

/**
 * Returns delivery partner's orders with store details and payment settlement status.
 */
export async function get_rider_delivery_settlements(user_id) {
  const rider = await get_rider_for_user(user_id);
  const [orders, db_settlements] = await Promise.all([
    find_orders_by_rider(rider.id),
    find_settlements_by_rider(rider.id).catch(() => [])
  ]);

  // Build a map of order settlements directly from real DB settlements
  const db_settlement_map = new Map();
  for (const s of db_settlements) {
    const parsed = parse_settlement_note(s.note);
    if (parsed) {
      const existing = db_settlement_map.get(parsed.order_id);
      db_settlement_map.set(parsed.order_id, {
        order_id: parsed.order_id,
        tenant_id: parsed.tenant_id || existing?.tenant_id || null,
        rider_id: rider.id,
        is_settled: true,
        settled_at: s.created_at || existing?.settled_at || null,
        settled_by: existing?.settled_by || (s.note.includes('rider') ? 'rider' : 'store_owner'),
        method: parsed.method || existing?.method || 'cash',
        note: s.note,
        has_cash_deposit: Boolean(existing?.has_cash_deposit || s.kind === 'cash_deposit'),
        has_payout: Boolean(existing?.has_payout || s.kind === 'payout')
      });
    }
  }

  const delivered = orders.filter((o) => o.fulfillment_status === 'delivered');
  const store_ids = [...new Set(delivered.map((o) => o.tenant_id).filter(Boolean))];
  const stores = await find_stores_by_tenant_ids(store_ids);
  const store_map = new Map(stores.map((s) => [s.tenant_id, s]));

  let pending_cash_to_stores = 0;
  let pending_ride_earnings = 0;
  let settled_cash_total = 0;
  let settled_store_cash = 0;
  let settled_orders_count = 0;
  let pending_orders_count = 0;

  const rows = [];
  for (const order of delivered) {
    const record = db_settlement_map.get(order.id) || await get_order_settlement(order.id);
    const breakdown = calculate_order_settlement(order, record);
    const store = store_map.get(order.tenant_id);

    if (breakdown.is_settled) {
      settled_orders_count += 1;
      settled_cash_total += breakdown.rider_earning;
      settled_store_cash += breakdown.store_amount;
    } else {
      pending_orders_count += 1;
      pending_cash_to_stores += breakdown.store_amount;
      pending_ride_earnings += breakdown.rider_earning;
    }

    rows.push({
      order_id: order.id,
      store_id: order.tenant_id,
      store_name: store?.name ?? 'Store',
      store_address: store?.address_line ?? null,
      created_at: order.created_at,
      delivered_at: order.delivered_at ?? null,
      total: order.total,
      has_cash_deposit: record?.has_cash_deposit ?? breakdown.is_settled,
      has_payout: record?.has_payout ?? breakdown.is_settled,
      ...breakdown
    });
  }

  rows.sort((a, b) => new Date(b.delivered_at || b.created_at).getTime() - new Date(a.delivered_at || a.created_at).getTime());

  return {
    summary: {
      pending_cash_to_stores: Math.round(pending_cash_to_stores * 100) / 100,
      pending_ride_earnings: Math.round(pending_ride_earnings * 100) / 100,
      settled_cash_total: Math.round(settled_cash_total * 100) / 100,
      settled_store_cash: Math.round(settled_store_cash * 100) / 100,
      settled_orders_count,
      pending_orders_count,
      total_orders_count: delivered.length
    },
    orders: rows
  };
}
