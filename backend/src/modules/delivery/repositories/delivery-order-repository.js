// Order lookups that cross stores, needed to hand orders to riders and to show a rider their deliveries.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { select_all_rows } from '../../../platform/shared/select-all-rows.js';
import { Order } from '../../orders/repositories/order-model.js';
import { publish_order_change } from '../../../platform/live/live-bus.js';

export async function find_order_by_id_any_store(id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('orders').select('*').eq('id', id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Order.findOne({ id }).lean();
}

export async function find_orders_by_rider(rider_id) {
  if (DB_PROVIDER === 'supabase') {
    const rows = await select_all_rows(() => get_supabase().from('orders').select('*').eq('rider_id', rider_id).order('created_at', { ascending: false }));
    return rows;
  }
  return Order.find({ rider_id }).sort({ created_at: -1 }).lean();
}

export async function find_orders_by_riders(rider_ids) {
  if (!rider_ids.length) return [];
  if (DB_PROVIDER === 'supabase') {
    return select_all_rows(() => get_supabase().from('orders').select('*').in('rider_id', rider_ids));
  }
  return Order.find({ rider_id: { $in: rider_ids } }).lean();
}

export async function find_orders_in_stages(stages) {
  if (DB_PROVIDER === 'supabase') {
    return select_all_rows(() => get_supabase().from('orders').select('*').in('fulfillment_status', stages).neq('status', 'cancelled'));
  }
  return Order.find({ fulfillment_status: { $in: stages }, status: { $ne: 'cancelled' } }).lean();
}

export async function find_all_delivery_orders() {
  if (DB_PROVIDER === 'supabase') {
    return select_all_rows(() => get_supabase().from('orders').select('*').eq('fulfillment_method', 'delivery').order('created_at', { ascending: false }));
  }
  return Order.find({ fulfillment_method: 'delivery' }).sort({ created_at: -1 }).lean();
}

// Updates an order only if it is still in the state the caller saw, so two riders can never both take it.
// Returns the updated order, or null when someone else changed it first.
export async function update_order_if(id, expected, updates) {
  const updated = await write_order_if(id, expected, { ...updates, updated_at: new Date().toISOString() });
  // The rider it was taken from (if any) also refreshes, so a passed-on offer disappears from their screen.
  if (updated) publish_order_change(updated, expected.rider_id && expected.rider_id !== updated.rider_id ? expected.rider_id : null);
  return updated;
}

async function write_order_if(id, expected, payload) {
  if (DB_PROVIDER === 'supabase') {
    let query = get_supabase().from('orders').update(payload).eq('id', id);
    for (const [column, value] of Object.entries(expected)) {
      query = value === null ? query.is(column, null) : query.eq(column, value);
    }
    const { data, error } = await query.select().maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  }
  return Order.findOneAndUpdate({ id, ...expected }, payload, { new: true }).lean();
}
