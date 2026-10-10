// Reads and writes order rows for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { Order } from './order-model.js';
import { publish_order_change } from '../../../platform/live/live-bus.js';

export async function find_order_by_id(id, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('orders').select('*').eq('id', id).eq('tenant_id', tenant_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Order.findOne({ id, tenant_id }).lean();
}

export async function find_order_by_id_for_customer(id, customer_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('orders').select('*').eq('id', id).eq('customer_id', customer_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Order.findOne({ id, customer_id }).lean();
}

async function insert_order(order) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('orders').insert([order]).select().single();
    if (error) throw error;
    return data;
  }
  const created = await Order.create(order);
  return created.toObject();
}

export async function save_order(order) {
  const saved = await insert_order(order);
  publish_order_change(saved);
  return saved;
}

async function write_order(id, tenant_id, payload) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('orders').update(payload).eq('id', id).eq('tenant_id', tenant_id).select().single();
    if (error) throw error;
    return data;
  }
  return Order.findOneAndUpdate({ id, tenant_id }, payload, { new: true }).lean();
}

// Every order change tells the store, customer, rider and admins to refresh (see platform/live).
// previous_rider_id: the rider the order was just taken from, so their screen drops it too.
export async function update_order(id, tenant_id, updates, previous_rider_id = null) {
  const updated = await write_order(id, tenant_id, { ...updates, updated_at: new Date().toISOString() });
  publish_order_change(updated, previous_rider_id);
  return updated;
}
