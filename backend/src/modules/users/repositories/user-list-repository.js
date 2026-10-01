// Lists every user for platform admins, without password hashes.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { User } from './user-model.js';

const PUBLIC_USER_FIELDS = ['id', 'username', 'email', 'phone_number', 'role', 'tenant_id', 'created_at'];

export async function find_all_users_public() {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('users').select(PUBLIC_USER_FIELDS.join(','));
    if (error) throw error;
    return data || [];
  }
  return User.find({}, Object.fromEntries(PUBLIC_USER_FIELDS.map((f) => [f, 1]))).lean();
}
