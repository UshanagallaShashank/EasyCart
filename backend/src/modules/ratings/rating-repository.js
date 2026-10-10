// Reads and writes order ratings. Needs the tables from migration 010 (Supabase only).
import { get_supabase } from '../../platform/db/db.js';
import { DB_PROVIDER } from '../../env.js';
import { AppError } from '../../platform/shared/app-error.js';

function database() {
  if (DB_PROVIDER !== 'supabase') throw new AppError('Ratings are not available on this database', 501);
  return get_supabase();
}

function check(error) {
  if (!error) return;
  if (error.code === 'PGRST205' || error.code === '42P01') throw new AppError('Ratings are not set up yet', 503);
  throw error;
}

export async function find_rating_by_order(order_id) {
  const { data, error } = await database().from('order_ratings').select('*').eq('order_id', order_id).maybeSingle();
  if (error && error.code !== 'PGRST116') check(error);
  return data ?? null;
}

export async function save_rating(rating) {
  const { data, error } = await database().from('order_ratings').insert([rating]).select().single();
  check(error);
  return data;
}

export async function find_ratings_by_tenant(tenant_id) {
  const { data, error } = await database().from('order_ratings').select('*').eq('tenant_id', tenant_id).order('created_at', { ascending: false });
  check(error);
  return data || [];
}
