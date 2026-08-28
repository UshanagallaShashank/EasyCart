// Lists orders for a tenant (owner view) or a customer (cross-tenant history).
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { Order } from './order-model.js';

export async function find_orders_by_tenant(tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('orders').select('*').eq('tenant_id', tenant_id);
    if (error) throw error;
    return data;
  }
  return Order.find({ tenant_id }).lean();
}

export async function find_orders_by_customer(customer_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('orders').select('*').eq('customer_id', customer_id);
    if (error) throw error;
    return data;
  }
  return Order.find({ customer_id }).lean();
}
