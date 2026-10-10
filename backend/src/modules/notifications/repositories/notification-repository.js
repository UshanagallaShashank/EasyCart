// Reads and writes notification rows for whichever database is configured.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { Notification } from './notification-model.js';

export async function find_notifications_by_tenant(tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('notifications').select('*').eq('tenant_id', tenant_id).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  return Notification.find({ tenant_id }).sort({ created_at: -1 }).lean();
}

export async function find_notification_by_id(id, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('notifications').select('*').eq('id', id).eq('tenant_id', tenant_id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  return Notification.findOne({ id, tenant_id }).lean();
}

export async function save_notification(notification) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('notifications').insert([notification]).select().single();
    if (error) throw error;
    return data;
  }
  const created = await Notification.create(notification);
  return created.toObject();
}

export async function mark_notification_read(id, tenant_id) {
  if (DB_PROVIDER === 'supabase') {
    const { data, error } = await get_supabase().from('notifications').update({ is_read: true }).eq('id', id).eq('tenant_id', tenant_id).select().single();
    if (error) throw error;
    return data;
  }
  return Notification.findOneAndUpdate({ id, tenant_id }, { is_read: true }, { new: true }).lean();
}
