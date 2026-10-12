// Reads and writes store rows for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { chunk_array } from '../../../platform/shared/chunk-array.js';
import { Store } from './store-model.js';
import { AppError } from '../../../platform/shared/app-error.js';

const SUPABASE_IN_CHUNK_SIZE = 100;

// In-memory fallback if the migration adding promotion_banner_text, max_delivery_radius_km, pincode, address, latitude, longitude
// (or free_delivery_above, migration 012) has not been run on Supabase yet
const promotion_banner_fallback = new Map();
const radius_fallback = new Map();
const pincode_fallback = new Map();
const address_fallback = new Map();
const lat_fallback = new Map();
const lng_fallback = new Map();
const free_delivery_fallback = new Map();

function attach_fallback_fields(store) {
  if (!store) return store;
  const tenant_id = store.tenant_id;
  let result = { ...store };
  if ((result.promotion_banner_text === undefined || result.promotion_banner_text === null) && promotion_banner_fallback.has(tenant_id)) {
    result.promotion_banner_text = promotion_banner_fallback.get(tenant_id);
  }
  if ((result.max_delivery_radius_km === undefined || result.max_delivery_radius_km === null) && radius_fallback.has(tenant_id)) {
    result.max_delivery_radius_km = radius_fallback.get(tenant_id);
  }
  if (result.address === undefined || result.address === null) {
    result.address = store.business_address || store.address_line || address_fallback.get(tenant_id) || null;
  }
  if (result.pincode === undefined || result.pincode === null) {
    const fromFallback = pincode_fallback.get(tenant_id);
    const fromAddress = (result.address && typeof result.address === 'string')
      ? result.address.match(/\b\d{6}\b/)?.[0]
      : null;
    result.pincode = fromFallback || fromAddress || null;
  }
  if ((result.latitude === undefined || result.latitude === null) && lat_fallback.has(tenant_id)) {
    result.latitude = lat_fallback.get(tenant_id);
  }
  if ((result.longitude === undefined || result.longitude === null) && lng_fallback.has(tenant_id)) {
    result.longitude = lng_fallback.get(tenant_id);
  }
  if (result.free_delivery_above === undefined && free_delivery_fallback.has(tenant_id)) {
    result.free_delivery_above = free_delivery_fallback.get(tenant_id);
  }
  return result;
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

export async function find_published_stores() {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('stores').select('*').eq('is_published', true);
    if (error) throw error;
    return (data || []).map(attach_fallback_fields);
  }
  return Store.find({ is_published: true }).lean();
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
  if (store.promotion_banner_text !== undefined) promotion_banner_fallback.set(store.tenant_id, store.promotion_banner_text);
  if (store.max_delivery_radius_km !== undefined) radius_fallback.set(store.tenant_id, store.max_delivery_radius_km);
  if (store.pincode !== undefined) pincode_fallback.set(store.tenant_id, store.pincode);
  if (store.address !== undefined) address_fallback.set(store.tenant_id, store.address);
  if (store.latitude !== undefined) lat_fallback.set(store.tenant_id, store.latitude);
  if (store.longitude !== undefined) lng_fallback.set(store.tenant_id, store.longitude);

  const toSave = { ...store };
  if (toSave.address && !toSave.business_address) {
    toSave.business_address = toSave.address;
  }
  if (toSave.address && !toSave.address_line) {
    toSave.address_line = toSave.address;
  }

  if (DB_PROVIDER === 'supabase') {
    const { promotion_banner_text, max_delivery_radius_km, pincode, address, ...supaStore } = toSave;
    let data;
    const res = await get_supabase().from('stores').insert([toSave]).select().single();
    if (res.error) {
      if (res.error.code === 'PGRST204') {
        const retryRes = await get_supabase().from('stores').insert([supaStore]).select().single();
        if (retryRes.error) throw retryRes.error;
        data = retryRes.data;
      } else {
        throw res.error;
      }
    } else {
      data = res.data;
    }
    return attach_fallback_fields(data);
  }
  const created = await Store.create(toSave);
  return created.toObject();
}

// Saves just the shop's colour theme. A clear message if the column is not there yet (migration 011 not run).
export async function update_store_color_theme(tenant_id, color_theme) {
  if (DB_PROVIDER !== 'supabase') {
    await Store.updateOne({ tenant_id }, { color_theme, updated_at: new Date().toISOString() });
    return;
  }
  const { error } = await get_supabase().from('stores').update({ color_theme, updated_at: new Date().toISOString() }).eq('tenant_id', tenant_id);
  if (!error) return;
  if (error.code === 'PGRST204' || error.code === '42703') throw new AppError('Shop themes are not set up yet. Run migration 011 in Supabase.', 503);
  throw error;
}

export async function update_store(tenant_id, updates) {
  const payload = { ...updates, updated_at: new Date().toISOString() };
  if (updates.address !== undefined) {
    payload.business_address = updates.address;
    payload.address_line = updates.address;
  }
  if (updates.promotion_banner_text !== undefined) {
    promotion_banner_fallback.set(tenant_id, updates.promotion_banner_text);
  }
  if (updates.max_delivery_radius_km !== undefined) {
    radius_fallback.set(tenant_id, updates.max_delivery_radius_km);
  }
  if (updates.pincode !== undefined) {
    pincode_fallback.set(tenant_id, updates.pincode);
  }
  if (updates.address !== undefined) {
    address_fallback.set(tenant_id, updates.address);
  }
  if (updates.latitude !== undefined) {
    lat_fallback.set(tenant_id, updates.latitude);
  }
  if (updates.longitude !== undefined) {
    lng_fallback.set(tenant_id, updates.longitude);
  }
  if (updates.free_delivery_above !== undefined) {
    free_delivery_fallback.set(tenant_id, updates.free_delivery_above);
  }

  if (DB_PROVIDER === 'supabase') {
    let result = null;
    const { data, error } = await get_supabase().from('stores').update(payload).eq('tenant_id', tenant_id).select().single();
    if (error) {
      if (error.code === 'PGRST204') {
        const { promotion_banner_text, max_delivery_radius_km, pincode, address, free_delivery_above, ...fallbackPayload } = payload;
        const { data: retryData, error: retryError } = await get_supabase()
          .from('stores')
          .update(fallbackPayload)
          .eq('tenant_id', tenant_id)
          .select()
          .single();
        if (retryError) throw retryError;
        result = retryData;
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
