// Reads and writes store rows for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { Store } from './store-model.js';

export async function find_store_by_tenant_id(tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('stores').select('*').eq('tenant_id', tenant_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Store.findOne({ tenant_id }).lean();
}

export async function find_store_by_slug(slug) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('stores').select('*').eq('slug', slug).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Store.findOne({ slug }).lean();
}

export async function save_store(store) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('stores').insert([store]).select().single();
    if (error) throw error;
    return data;
  }
  const created = await Store.create(store);
  return created.toObject();
}

export async function update_store(tenant_id, updates) {
  const payload = { ...updates, updated_at: new Date().toISOString() };
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('stores').update(payload).eq('tenant_id', tenant_id).select().single();
    if (error) throw error;
    return data;
  }
  return Store.findOneAndUpdate({ tenant_id }, payload, { new: true }).lean();
}
