// Platform admin tools for delivery partners: review applications, suspend, settle cash, and watch deliveries.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../platform/shared/app-error.js';
import { find_all_tenants } from '../../tenants/repositories/tenant-repository.js';
import { find_stores_by_tenant_ids } from '../../stores/repositories/store-repository.js';
import { to_admin_order } from '../../orders/lib/order-views.js';
import { find_all_riders, find_rider_by_id, find_riders_by_ids, update_rider } from '../repositories/rider-repository.js';
import { find_all_settlements, find_settlements_by_rider, save_settlement } from '../repositories/settlement-repository.js';
import { find_all_delivery_orders, find_orders_by_rider, find_orders_by_riders } from '../repositories/delivery-order-repository.js';
import { reject_schema, review_schema, settlement_schema, issues_message } from '../delivery-schemas.js';
import { summarize_rider_money, rider_daily_series } from '../lib/summarize-rider-money.js';
import { is_rider_available, ACTIVE_RIDER_STAGES, delivery_stage } from '../lib/delivery-stages.js';
import { sort_riders_by_distance, with_distance } from '../lib/sort-riders-by-distance.js';
import { to_full_rider } from '../lib/rider-views.js';
import { store_point } from './dispatch-service.js';
import { release_offers } from './rider-status-service.js';

function group_by(rows, field) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row[field])) groups.set(row[field], []);
    groups.get(row[field]).push(row);
  }
  return groups;
}

async function find_rider_or_404(id) {
  const rider = await find_rider_by_id(id);
  if (!rider) throw new AppError('Delivery partner not found', 404);
  return rider;
}

// Every rider with their money summary. With near_tenant_id, sorted nearest to that store first.
export async function list_riders_for_admin({ near_tenant_id } = {}) {
  const [riders, settlements, tenants] = await Promise.all([find_all_riders(), find_all_settlements(), find_all_tenants()]);
  // Only orders that ever had a rider, grouped once, instead of scanning every order for every rider.
  const orders_by_rider = group_by(await find_orders_by_riders(riders.map((rider) => rider.id)), 'rider_id');
  const settlements_by_rider = group_by(settlements, 'rider_id');
  const stores = await find_stores_by_tenant_ids(tenants.filter((tenant) => tenant.status === 'active').map((tenant) => tenant.id));
  const origin = near_tenant_id ? store_point(stores.find((store) => store.tenant_id === near_tenant_id)) : null;
  const ordered = origin ? sort_riders_by_distance(riders, origin) : with_distance(riders, null);

  const rows = ordered.map((rider) => {
    const own_orders = orders_by_rider.get(rider.id) ?? [];
    const money = summarize_rider_money(own_orders, settlements_by_rider.get(rider.id) ?? []);
    return {
      id: rider.id,
      full_name: rider.full_name,
      email: rider.email,
      phone_number: rider.phone_number,
      vehicle_type: rider.vehicle_type,
      vehicle_number: rider.vehicle_number,
      area: rider.area,
      city: rider.city,
      pincode: rider.pincode,
      status: rider.status,
      is_online: is_rider_available(rider),
      has_location: rider.latitude !== null,
      distance_km: rider.distance_km,
      active_orders: own_orders.filter((order) => order.status !== 'cancelled' && ACTIVE_RIDER_STAGES.includes(order.fulfillment_status)).length,
      deliveries: money.deliveries,
      cash_in_hand: money.cash_in_hand,
      payout_due: money.payout_due,
      submitted_at: rider.submitted_at ?? null,
      created_at: rider.created_at
    };
  });

  return {
    riders: rows,
    stores: stores
      .map((store) => ({ tenant_id: store.tenant_id, name: store.name, has_location: Boolean(store_point(store)) }))
      .sort((a, b) => a.name.localeCompare(b.name))
  };
}

export async function get_rider_for_admin(id) {
  const rider = await find_rider_or_404(id);
  const [orders, settlements] = await Promise.all([find_orders_by_rider(rider.id), find_settlements_by_rider(rider.id)]);
  const stores = await find_stores_by_tenant_ids([...new Set(orders.map((order) => order.tenant_id))]);
  const store_names = new Map(stores.map((store) => [store.tenant_id, store.name]));
  return {
    rider: await to_full_rider(rider),
    summary: summarize_rider_money(orders, settlements),
    daily: rider_daily_series(orders),
    settlements,
    orders: orders.map((order) => ({
      ...to_admin_order(order),
      store_name: store_names.get(order.tenant_id) ?? 'Store'
    }))
  };
}

async function set_status(id, from_statuses, updates, wrong_message) {
  const rider = await find_rider_or_404(id);
  if (!from_statuses.includes(rider.status)) throw new AppError(wrong_message, 400);
  await update_rider(rider.id, { ...updates, reviewed_at: new Date().toISOString() });
  return get_rider_for_admin(id);
}

export async function approve_rider(id, payload = {}) {
  const parsed = review_schema.safeParse(payload);
  if (!parsed.success) throw new AppError(issues_message(parsed.error), 400);
  return set_status(id, ['pending', 'rejected'], { status: 'approved', review_note: parsed.data.note || null }, 'Only applications waiting for review can be approved');
}

export async function reject_rider(id, payload) {
  const parsed = reject_schema.safeParse(payload ?? {});
  if (!parsed.success) throw new AppError(issues_message(parsed.error), 400);
  return set_status(id, ['pending'], { status: 'rejected', review_note: parsed.data.note, is_online: false }, 'Only applications waiting for review can be rejected');
}

export async function suspend_rider(id, payload) {
  const parsed = reject_schema.safeParse(payload ?? {});
  if (!parsed.success) throw new AppError(issues_message(parsed.error), 400);
  const result = await set_status(id, ['approved'], { status: 'suspended', review_note: parsed.data.note, is_online: false }, 'Only approved riders can be suspended');
  await release_offers(id);
  return result;
}

export async function reactivate_rider(id) {
  return set_status(id, ['suspended'], { status: 'approved', review_note: null }, 'Only suspended riders can be reactivated');
}

export async function record_settlement(id, admin_user_id, payload) {
  const parsed = settlement_schema.safeParse(payload ?? {});
  if (!parsed.success) throw new AppError(issues_message(parsed.error), 400);
  const rider = await find_rider_or_404(id);
  // Recording more than the rider holds (or is owed) would show negative balances, so it is refused with the real figure.
  const [orders, settlements] = await Promise.all([find_orders_by_rider(rider.id), find_settlements_by_rider(rider.id)]);
  const money = summarize_rider_money(orders, settlements);
  const limit = parsed.data.kind === 'cash_deposit' ? money.cash_in_hand : money.payout_due;
  if (parsed.data.amount > limit + 0.009) {
    throw new AppError(parsed.data.kind === 'cash_deposit' ? `The rider only holds Rs. ${limit.toFixed(2)} in cash` : `Only Rs. ${limit.toFixed(2)} is due to this rider`, 400);
  }
  await save_settlement({ id: randomUUID(), rider_id: rider.id, kind: parsed.data.kind, amount: parsed.data.amount, note: parsed.data.note || null, recorded_by: admin_user_id });
  return get_rider_for_admin(id);
}

// Every delivery order on the platform with its store and rider names.
export async function list_deliveries_for_admin() {
  const orders = await find_all_delivery_orders();
  const [stores, riders] = await Promise.all([
    find_stores_by_tenant_ids([...new Set(orders.map((order) => order.tenant_id))]),
    find_riders_by_ids([...new Set(orders.map((order) => order.rider_id).filter(Boolean))])
  ]);
  const store_names = new Map(stores.map((store) => [store.tenant_id, store.name]));
  const rider_names = new Map(riders.map((rider) => [rider.id, rider.full_name]));
  return orders.map((order) => ({
    id: order.id,
    store_name: store_names.get(order.tenant_id) ?? 'Store',
    tenant_id: order.tenant_id,
    rider_id: order.rider_id ?? null,
    rider_name: rider_names.get(order.rider_id) ?? null,
    stage: delivery_stage(order),
    rider_offer_status: order.rider_offer_status ?? null,
    delivery_address: order.delivery_address,
    total: Number(order.total),
    delivery_fee: Number(order.delivery_fee ?? 0),
    cash_collected: order.cash_collected === null || order.cash_collected === undefined ? null : Number(order.cash_collected),
    created_at: order.created_at,
    delivered_at: order.delivered_at ?? null
  }));
}
