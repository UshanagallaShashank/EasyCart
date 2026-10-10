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

// True when the database is missing a column (migration 011 not run yet).
function is_missing_column(error) {
  return error?.code === 'PGRST204' || error?.code === '42703';
}

// Saves the rating. If the photo and item-star columns are not there yet, the stars and comment are still saved.
export async function save_rating(rating) {
  const { data, error } = await database().from('order_ratings').insert([rating]).select().single();
  if (error && is_missing_column(error)) {
    const { photo_urls, item_stars, ...basic } = rating;
    console.warn('order_ratings is missing photo_urls or item_stars (run migration 011); saved the rating without them.');
    const retry = await database().from('order_ratings').insert([basic]).select().single();
    check(retry.error);
    return { ...retry.data, extras_saved: false };
  }
  check(error);
  return data;
}

// Every store's stars, for the "near you" list. Empty when ratings are not set up.
export async function find_all_store_stars() {
  if (DB_PROVIDER !== 'supabase') return [];
  const { data, error } = await get_supabase().from('order_ratings').select('tenant_id,store_stars');
  if (error) return [];
  return data || [];
}

export async function find_ratings_by_tenant(tenant_id) {
  const { data, error } = await database().from('order_ratings').select('*').eq('tenant_id', tenant_id).order('created_at', { ascending: false });
  check(error);
  return data || [];
}
