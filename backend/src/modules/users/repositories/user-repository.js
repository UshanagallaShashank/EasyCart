// Reads and writes user rows for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { User } from './user-model.js';

export async function find_user_by_email(email) {
  const normalized = String(email).toLowerCase();

  if (DB_PROVIDER === 'supabase') {
    const supabase = get_supabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalized)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  }

  return User.findOne({ email: normalized }).lean();
}

export async function save_user(user) {
  const normalized = {
    ...user,
    email: String(user.email).toLowerCase(),
    username: String(user.username).trim(),
    phone_number: String(user.phone_number).trim()
  };

  if (DB_PROVIDER === 'supabase') {
    const supabase = get_supabase();
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: normalized.id,
          username: normalized.username,
          email: normalized.email,
          phone_number: normalized.phone_number,
          password_hash: normalized.password_hash,
          role: normalized.role,
          tenant_id: normalized.tenant_id,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  const created_user = await User.create({
    id: normalized.id,
    username: normalized.username,
    email: normalized.email,
    phone_number: normalized.phone_number,
    password_hash: normalized.password_hash,
    role: normalized.role,
    tenant_id: normalized.tenant_id,
    created_at: new Date().toISOString()
  });

  return created_user.toObject();
}

export async function set_user_tenant_id(id, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('users').update({ tenant_id }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  return User.findOneAndUpdate({ id }, { tenant_id }, { new: true }).lean();
}
