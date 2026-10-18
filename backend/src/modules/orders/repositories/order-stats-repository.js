// Reads the few order fields needed for platform-wide admin stats, across every store.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { select_all_rows } from '../../../platform/shared/select-all-rows.js';
import { Order } from './order-model.js';

const STATS_FIELDS = ['tenant_id', 'customer_id', 'total', 'status', 'created_at'];

export async function find_all_orders_for_stats() {
  if (DB_PROVIDER === 'supabase') {
    return select_all_rows(() => get_supabase().from('orders').select(STATS_FIELDS.join(',')).order('id'));
  }
  return Order.find({}, Object.fromEntries(STATS_FIELDS.map((f) => [f, 1]))).lean();
}
