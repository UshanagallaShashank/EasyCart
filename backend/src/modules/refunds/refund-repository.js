// Reads and writes refunds. Needs the refunds table from migration 011 (Supabase only).
import { get_supabase } from '../../platform/db/db.js';
import { DB_PROVIDER } from '../../env.js';
import { AppError } from '../../platform/shared/app-error.js';

function database() {
  if (DB_PROVIDER !== 'supabase') throw new AppError('Refunds are not available on this database', 501);
  return get_supabase();
}

function check(error) {
  if (!error) return;
  if (error.code === 'PGRST205' || error.code === '42P01') throw new AppError('Refunds are not set up yet', 503);
  // The database allows only one waiting refund per order.
  if (error.code === '23505') throw new AppError('A refund for this order is already waiting for the store', 409);
  throw error;
}

export async function save_refund(refund) {
  const { data, error } = await database().from('refunds').insert([refund]).select().single();
  check(error);
  return data;
}

export async function update_refund(id, updates) {
  const { data, error } = await database().from('refunds').update(updates).eq('id', id).select().single();
  check(error);
  return data;
}

export async function find_refund_by_id(id) {
  const { data, error } = await database().from('refunds').select('*').eq('id', id).maybeSingle();
  if (error && error.code !== 'PGRST116') check(error);
  return data ?? null;
}

async function find_where(column, value) {
  const { data, error } = await database().from('refunds').select('*').eq(column, value).order('created_at', { ascending: false });
  check(error);
  return data || [];
}

export const find_refunds_by_order = (order_id) => find_where('order_id', order_id);
export const find_refunds_by_tenant = (tenant_id) => find_where('tenant_id', tenant_id);
export const find_refunds_by_customer = (customer_id) => find_where('customer_id', customer_id);

export async function find_recent_refunds(limit = 300) {
  const { data, error } = await database().from('refunds').select('*').order('created_at', { ascending: false }).limit(limit);
  check(error);
  return data || [];
}
