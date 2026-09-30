// Reads and writes store rows for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { chunk_array } from '../../../platform/shared/chunk-array.js';
import { Store } from './store-model.js';

const SUPABASE_IN_CHUNK_SIZE = 100;

// In-memory fallback if the migration adding promotion_banner_text has not been run on Supabase yet
const promotion_banner_fallback = new Map();

function attach_fallback_fields(store) {
  if (!store) return store;
  if ((store.promotion_banner_text === undefined || store.promotion_banner_text === null) && promotion_banner_fallback.has(store.tenant_id)) {
    return { ...store, promotion_banner_text: promotion_banner_fallback.get(store.tenant_id) };
  }
  return store;
}

export async function find_store_by_tenant_id(tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('stores').select('*').eq('tenant_id', tenant_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return attach_fallback_fields(data);
  }
  return Store.findOne({ tenant_id }).lean();
}

export async function find_stores_by_tenant_ids(tenant_ids) {
  if (!tenant_ids.length) return [];
  if (DB_PROVIDER === 'supabase') {
    const chunks = chunk_array(tenant_ids, SUPABASE_IN_CHUNK_SIZE);
    const results = await Promise.all(
      chunks.map(async (chunk) => {
        const { data, error } = await get_supabase().from('stores').select('*').in('tenant_id', chunk);
        if (error) throw error;
        return (data || []).map(attach_fallback_fields);
      })
    );
    return results.flat();
  }
  return Store.find({ tenant_id: { $in: tenant_ids } }).lean();
}

export async function find_store_by_slug(slug) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('stores').select('*').eq('slug', slug).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return attach_fallback_fields(data);
  }
  return Store.findOne({ slug }).lean();
}

export async function save_store(store) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('stores').insert([store]).select().single();
    if (error) throw error;
    return attach_fallback_fields(data);
  }
  const created = await Store.create(store);
  return created.toObject();
}

export async function update_store(tenant_id, updates) {
  const payload = { ...updates, updated_at: new Date().toISOString() };
  if (DB_PROVIDER === 'supabase') {
    let result = null;
    const { data, error } = await get_supabase().from('stores').update(payload).eq('tenant_id', tenant_id).select().single();
    if (error) {
      if (error.code === 'PGRST204' && error.message?.includes('promotion_banner_text')) {
        const { promotion_banner_text, ...fallbackPayload } = payload;
        promotion_banner_fallback.set(tenant_id, promotion_banner_text ?? '');
        const { data: retryData, error: retryError } = await get_supabase()
          .from('stores')
          .update(fallbackPayload)
          .eq('tenant_id', tenant_id)
          .select()
          .single();
        if (retryError) throw retryError;
        result = { ...retryData, promotion_banner_text: promotion_banner_text ?? '' };
      } else {
        throw error;
      }
    } else {
      result = data;
    }
    return attach_fallback_fields(result);
  }
  return Store.findOneAndUpdate({ tenant_id }, payload, { new: true }).lean();
}
