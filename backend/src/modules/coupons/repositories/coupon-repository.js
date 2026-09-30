// Reads and writes coupon rows for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { Coupon } from './coupon-model.js';

// In-memory fallback if the migration adding expires_at has not been run on Supabase yet
const expires_at_fallback = new Map();

function attach_fallback_fields(coupon) {
  if (!coupon) return coupon;
  if ((coupon.expires_at === undefined || coupon.expires_at === null) && expires_at_fallback.has(coupon.id)) {
    return { ...coupon, expires_at: expires_at_fallback.get(coupon.id) };
  }
  return { ...coupon, expires_at: coupon.expires_at ?? null };
}

export async function find_coupons_by_tenant(tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('coupons').select('*').eq('tenant_id', tenant_id);
    if (error) throw error;
    return (data || []).map(attach_fallback_fields);
  }
  return Coupon.find({ tenant_id }).lean();
}

export async function find_coupon_by_id(id, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('coupons').select('*').eq('id', id).eq('tenant_id', tenant_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return attach_fallback_fields(data);
  }
  return Coupon.findOne({ id, tenant_id }).lean();
}

export async function find_coupon_by_code(code, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('coupons').select('*').eq('code', code).eq('tenant_id', tenant_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return attach_fallback_fields(data);
  }
  return Coupon.findOne({ code, tenant_id }).lean();
}

export async function save_coupon(coupon) {
  if (DB_PROVIDER === 'supabase') {
    let result = null;
    const { data, error } = await get_supabase().from('coupons').insert([coupon]).select().single();
    if (error) {
      if (error.code === '42703' || (error.code === 'PGRST204' && error.message?.includes('expires_at'))) {
        const { expires_at, ...fallbackPayload } = coupon;
        if (expires_at !== undefined) {
          expires_at_fallback.set(coupon.id, expires_at);
        }
        const { data: retryData, error: retryError } = await get_supabase().from('coupons').insert([fallbackPayload]).select().single();
        if (retryError) throw retryError;
        result = { ...retryData, expires_at: expires_at ?? null };
      } else {
        throw error;
      }
    } else {
      result = data;
    }
    return attach_fallback_fields(result);
  }
  const created = await Coupon.create(coupon);
  return created.toObject();
}

export async function update_coupon(id, tenant_id, updates) {
  if (DB_PROVIDER === 'supabase') {
    let result = null;
    const { data, error } = await get_supabase().from('coupons').update(updates).eq('id', id).eq('tenant_id', tenant_id).select().single();
    if (error) {
      if (error.code === '42703' || (error.code === 'PGRST204' && error.message?.includes('expires_at'))) {
        const { expires_at, ...fallbackPayload } = updates;
        if (expires_at !== undefined) {
          expires_at_fallback.set(id, expires_at);
        }
        const { data: retryData, error: retryError } = await get_supabase().from('coupons').update(fallbackPayload).eq('id', id).eq('tenant_id', tenant_id).select().single();
        if (retryError) throw retryError;
        result = { ...retryData, expires_at: expires_at ?? null };
      } else {
        throw error;
      }
    } else {
      result = data;
    }
    return attach_fallback_fields(result);
  }
  return Coupon.findOneAndUpdate({ id, tenant_id }, updates, { new: true }).lean();
}

export async function delete_coupon(id, tenant_id) {
  expires_at_fallback.delete(id);
  if (DB_PROVIDER === 'supabase') {
    const { error } = await get_supabase().from('coupons').delete().eq('id', id).eq('tenant_id', tenant_id);
    if (error) throw error;
    return;
  }
  await Coupon.deleteOne({ id, tenant_id });
}
