// Small platform-wide settings, stored as { key, value } rows. Needs the platform_settings table from migration 011.
import { get_supabase } from '../../platform/db/db.js';
import { DB_PROVIDER } from '../../env.js';
import { AppError } from '../../platform/shared/app-error.js';

// Returns the saved value, or null when nothing is saved yet or the table is not set up (callers then use defaults).
export async function read_setting(key) {
  if (DB_PROVIDER !== 'supabase') return null;
  const { data, error } = await get_supabase().from('platform_settings').select('value').eq('key', key).maybeSingle();
  if (error) return null;
  return data?.value ?? null;
}

export async function write_setting(key, value) {
  if (DB_PROVIDER !== 'supabase') throw new AppError('Settings are not available on this database', 501);
  const { error } = await get_supabase().from('platform_settings').upsert([{ key, value, updated_at: new Date().toISOString() }], { onConflict: 'key' });
  if (!error) return;
  if (error.code === 'PGRST205' || error.code === '42P01') throw new AppError('Settings are not set up yet. Run migration 011 in Supabase.', 503);
  throw error;
}
