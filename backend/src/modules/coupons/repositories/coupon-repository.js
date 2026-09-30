// Reads and writes coupon rows for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { Coupon } from './coupon-model.js';

export async function find_coupons_by_tenant(tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('coupons').select('*').eq('tenant_id', tenant_id);
    if (error) throw error;
    return data;
  }
  return Coupon.find({ tenant_id }).lean();
}

export async function find_coupon_by_id(id, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('coupons').select('*').eq('id', id).eq('tenant_id', tenant_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Coupon.findOne({ id, tenant_id }).lean();
}

export async function find_coupon_by_code(code, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('coupons').select('*').eq('code', code).eq('tenant_id', tenant_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Coupon.findOne({ code, tenant_id }).lean();
}

export async function save_coupon(coupon) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('coupons').insert([coupon]).select().single();
    if (error) throw error;
    return data;
  }
  const created = await Coupon.create(coupon);
  return created.toObject();
}

export async function update_coupon(id, tenant_id, updates) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('coupons').update(updates).eq('id', id).eq('tenant_id', tenant_id).select().single();
    if (error) throw error;
    return data;
  }
  return Coupon.findOneAndUpdate({ id, tenant_id }, updates, { new: true }).lean();
}

export async function delete_coupon(id, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { error } = await get_supabase().from('coupons').delete().eq('id', id).eq('tenant_id', tenant_id);
    if (error) throw error;
    return;
  }
  await Coupon.deleteOne({ id, tenant_id });
}
