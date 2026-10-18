// Reads the few order fields needed for platform-wide admin stats, across every store.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { select_all_rows } from '../../../platform/shared/select-all-rows.js';
import { Order } from './order-model.js';

const STATS_FIELDS = ['tenant_id', 'customer_id', 'total', 'status', 'created_at'];

const EARNINGS_FIELDS = ['tenant_id', 'total', 'delivery_fee', 'rider_id', 'created_at'];

// Delivered orders from every store, with the money fields earnings need.
export async function find_delivered_orders_for_earnings() {
  if (DB_PROVIDER === 'supabase') {
    return select_all_rows(() => get_supabase().from('orders').select(EARNINGS_FIELDS.join(',')).eq('status', 'fulfilled').order('id'));
  }
  return Order.find({ status: 'fulfilled' }, Object.fromEntries(EARNINGS_FIELDS.map((f) => [f, 1]))).lean();
}

export async function find_all_orders_for_stats() {
  if (DB_PROVIDER === 'supabase') {
    return select_all_rows(() => get_supabase().from('orders').select(STATS_FIELDS.join(',')).order('id'));
  }
  return Order.find({}, Object.fromEntries(STATS_FIELDS.map((f) => [f, 1]))).lean();
}
