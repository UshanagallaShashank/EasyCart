// Reads and writes delivery partner rows for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { select_all_rows } from '../../../platform/shared/select-all-rows.js';
import { chunk_array } from '../../../platform/shared/chunk-array.js';
import { Rider } from './rider-model.js';

const TABLE = 'delivery_partners';

// Supabase returns numeric columns as numbers already; this keeps coordinates numbers or null for both databases.
function normalize(rider) {
  if (!rider) return rider;
  const latitude = rider.latitude === null || rider.latitude === undefined ? null : Number(rider.latitude);
  const longitude = rider.longitude === null || rider.longitude === undefined ? null : Number(rider.longitude);
  return { ...rider, latitude, longitude, documents: rider.documents ?? {} };
}

async function find_one(column, value) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from(TABLE).select('*').eq(column, value).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return normalize(data);
  }
  return normalize(await Rider.findOne({ [column]: value }).lean());
}

export function find_rider_by_id(id) {
  return find_one('id', id);
}

export function find_rider_by_user_id(user_id) {
  return find_one('user_id', user_id);
}

export async function find_riders_by_ids(ids) {
  if (!ids.length) return [];
  if (DB_PROVIDER === 'supabase') {
    const results = await Promise.all(chunk_array(ids, 100).map(async (chunk) => {
      const { data, error } = await get_supabase().from(TABLE).select('*').in('id', chunk);
      if (error) throw error;
      return data;
    }));
    return results.flat().map(normalize);
  }
  return (await Rider.find({ id: { $in: ids } }).lean()).map(normalize);
}

export async function find_all_riders() {
  if (DB_PROVIDER === 'supabase') {
    const rows = await select_all_rows(() => get_supabase().from(TABLE).select('*').order('created_at', { ascending: false }));
    return rows.map(normalize);
  }
  return (await Rider.find({}).sort({ created_at: -1 }).lean()).map(normalize);
}

export async function find_riders_by_status(status) {
  if (DB_PROVIDER === 'supabase') {
    const rows = await select_all_rows(() => get_supabase().from(TABLE).select('*').eq('status', status));
    return rows.map(normalize);
  }
  return (await Rider.find({ status }).lean()).map(normalize);
}

export async function save_rider(rider) {
  const row = { ...rider, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from(TABLE).insert([row]).select().single();
    if (error) throw error;
    return normalize(data);
  }
  return normalize((await Rider.create(row)).toObject());
}

export async function update_rider(id, updates) {
  const payload = { ...updates, updated_at: new Date().toISOString() };
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from(TABLE).update(payload).eq('id', id).select().single();
    if (error) throw error;
    return normalize(data);
  }
  return normalize(await Rider.findOneAndUpdate({ id }, payload, { new: true }).lean());
}
