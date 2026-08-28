// Reads and writes order rows for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { Order } from './order-model.js';

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

export async function save_order(order) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('orders').insert([order]).select().single();
    if (error) throw error;
    return data;
  }
  const created = await Order.create(order);
  return created.toObject();
}

export async function update_order(id, tenant_id, updates) {
  const payload = { ...updates, updated_at: new Date().toISOString() };
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('orders').update(payload).eq('id', id).eq('tenant_id', tenant_id).select().single();
    if (error) throw error;
    return data;
  }
  return Order.findOneAndUpdate({ id, tenant_id }, payload, { new: true }).lean();
}
