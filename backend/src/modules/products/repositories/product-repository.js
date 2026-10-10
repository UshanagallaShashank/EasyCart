// Reads and writes product rows for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { Product } from './product-model.js';

export async function find_products_by_tenant(tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('products').select('*').eq('tenant_id', tenant_id);
    if (error) throw error;
    return data;
  }
  return Product.find({ tenant_id }).lean();
}

export async function find_product_by_id(id, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('products').select('*').eq('id', id).eq('tenant_id', tenant_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Product.findOne({ id, tenant_id }).lean();
}

export async function find_active_products_by_tenant(tenant_id, { search, category_id } = {}) {
  if (DB_PROVIDER === 'supabase') {
    let query = get_supabase().from('products').select('*').eq('tenant_id', tenant_id).eq('is_active', true);
    if (category_id) query = query.eq('category_id', category_id);
    if (search) query = query.ilike('name', `%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
  const filter = { tenant_id, is_active: true };
  if (category_id) filter.category_id = category_id;
  if (search) filter.name = { $regex: search, $options: 'i' };
  return Product.find(filter).lean();
}

export async function find_active_product_by_id(id, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('products').select('*').eq('id', id).eq('tenant_id', tenant_id).eq('is_active', true).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Product.findOne({ id, tenant_id, is_active: true }).lean();
}

export async function find_product_by_sku(sku, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('products').select('*').eq('sku', sku).eq('tenant_id', tenant_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Product.findOne({ sku, tenant_id }).lean();
}

export async function save_product(product) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('products').insert([product]).select().single();
    if (error) throw error;
    return data;
  }
  const created = await Product.create(product);
  return created.toObject();
}

export async function update_product(id, tenant_id, updates) {
  const payload = { ...updates, updated_at: new Date().toISOString() };
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('products').update(payload).eq('id', id).eq('tenant_id', tenant_id).select().single();
    if (error) throw error;
    return data;
  }
  return Product.findOneAndUpdate({ id, tenant_id }, payload, { new: true }).lean();
}

export async function delete_product(id, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { error } = await get_supabase().from('products').delete().eq('id', id).eq('tenant_id', tenant_id);
    if (error) throw error;
    return;
  }
  await Product.deleteOne({ id, tenant_id });
}
