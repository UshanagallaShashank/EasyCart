// Reads and writes a customer's saved products. Needs the tables from migration 010 (Supabase only).
import { get_supabase } from '../../platform/db/db.js';
import { DB_PROVIDER } from '../../env.js';
import { AppError } from '../../platform/shared/app-error.js';

function database() {
  if (DB_PROVIDER !== 'supabase') throw new AppError('Favourites are not available on this database', 501);
  return get_supabase();
}

// If the migration has not been run yet, say so clearly instead of crashing.
function check(error) {
  if (!error) return;
  if (error.code === 'PGRST205' || error.code === '42P01') throw new AppError('Favourites are not set up yet', 503);
  throw error;
}

export async function find_favourite_product_ids(customer_id, tenant_id) {
  const { data, error } = await database().from('favourites').select('product_id').eq('customer_id', customer_id).eq('tenant_id', tenant_id);
  check(error);
  return (data || []).map((row) => row.product_id);
}

// Saving the same product twice is fine: the second save changes nothing.
export async function save_favourite(favourite) {
  const { error } = await database().from('favourites').upsert([favourite], { onConflict: 'customer_id,product_id', ignoreDuplicates: true });
  check(error);
}

export async function delete_favourite(customer_id, product_id) {
  const { error } = await database().from('favourites').delete().eq('customer_id', customer_id).eq('product_id', product_id);
  check(error);
}
