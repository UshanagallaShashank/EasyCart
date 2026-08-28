// Reads and writes tenant rows for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { Tenant } from './tenant-model.js';

export async function find_tenant_by_slug(slug) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('tenants').select('*').eq('slug', slug).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Tenant.findOne({ slug }).lean();
}

export async function find_tenant_by_owner_id(owner_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('tenants').select('*').eq('owner_id', owner_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Tenant.findOne({ owner_id }).lean();
}

export async function save_tenant(tenant) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('tenants').insert([tenant]).select().single();
    if (error) throw error;
    return data;
  }
  const created = await Tenant.create(tenant);
  return created.toObject();
}
