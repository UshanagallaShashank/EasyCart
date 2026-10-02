// Reads and writes rider settlements (cash handed in, payouts made) for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { RiderSettlement } from './settlement-model.js';

const TABLE = 'rider_settlements';

function normalize(row) {
  return { ...row, amount: Number(row.amount) };
}

export async function find_settlements_by_rider(rider_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from(TABLE).select('*').eq('rider_id', rider_id).order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(normalize);
  }
  return (await RiderSettlement.find({ rider_id }).sort({ created_at: -1 }).lean()).map(normalize);
}

export async function find_all_settlements() {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from(TABLE).select('*');
    if (error) throw error;
    return data.map(normalize);
  }
  return (await RiderSettlement.find({}).lean()).map(normalize);
}

export async function save_settlement(settlement) {
  const row = { ...settlement, created_at: new Date().toISOString() };
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from(TABLE).insert([row]).select().single();
    if (error) throw error;
    return normalize(data);
  }
  return normalize((await RiderSettlement.create(row)).toObject());
}
