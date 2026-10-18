// Reads and writes category rows for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { Category } from './category-model.js';

export async function find_categories_by_tenant(tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('categories').select('*').eq('tenant_id', tenant_id);
    if (error) throw error;
    return data;
  }
  return Category.find({ tenant_id }).lean();
}

export async function find_category_by_id(id, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('categories').select('*').eq('id', id).eq('tenant_id', tenant_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Category.findOne({ id, tenant_id }).lean();
}

export async function find_category_by_name(name, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('categories').select('*').eq('name', name).eq('tenant_id', tenant_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Category.findOne({ name, tenant_id }).lean();
}

export async function save_category(category) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('categories').insert([category]).select().single();
    if (error) throw error;
    return data;
  }
  const created = await Category.create(category);
  return created.toObject();
}

export async function delete_category(id, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { error } = await get_supabase().from('categories').delete().eq('id', id).eq('tenant_id', tenant_id);
    if (error) throw error;
    return;
  }
  await Category.deleteOne({ id, tenant_id });
}
