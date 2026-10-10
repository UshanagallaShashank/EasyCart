// Persists and retrieves user status ('active' | 'inactive') and last_active_at timestamps.
import { get_supabase } from '../../../platform/db/db.js';
import { DB_PROVIDER } from '../../../env.js';
import { User } from './user-model.js';

const STORAGE_PATH = '_system/user-status.json';
let in_memory_store = null;
let last_sync_time = 0;
const SYNC_TTL_MS = 15000;

async function load_store() {
  const now = Date.now();
  if (in_memory_store && now - last_sync_time < SYNC_TTL_MS) {
    return in_memory_store;
  }

  in_memory_store = {};
  last_sync_time = now;

  if (DB_PROVIDER === 'supabase') {
    try {
      const supabase = get_supabase();
      if (!supabase) return in_memory_store;
      const { data, error } = await supabase.storage.from('store-assets').download(STORAGE_PATH);
      if (!error && data) {
        const text = await data.text();
        in_memory_store = JSON.parse(text || '{}');
      }
    } catch {
      // Storage file does not exist yet; default empty store
    }
  }

  return in_memory_store;
}

async function persist_store() {
  if (DB_PROVIDER === 'supabase' && in_memory_store) {
    try {
      const supabase = get_supabase();
      if (!supabase) return;
      await supabase.storage.from('store-assets').upload(
        STORAGE_PATH,
        Buffer.from(JSON.stringify(in_memory_store)),
        { upsert: true, contentType: 'application/json' }
      );
    } catch (err) {
      console.error('Error persisting user status store:', err?.message || err);
    }
  }
}

export async function get_all_user_meta() {
  if (DB_PROVIDER === 'mongodb') {
    const users = await User.find({}, { id: 1, status: 1, last_active_at: 1 }).lean();
    const map = {};
    for (const u of users) {
      map[u.id] = { status: u.status || 'active', last_active_at: u.last_active_at ? new Date(u.last_active_at).toISOString() : null };
    }
    return map;
  }

  return await load_store();
}

export async function get_user_status(userId) {
  if (DB_PROVIDER === 'mongodb') {
    const u = await User.findOne({ id: userId }, { status: 1 }).lean();
    return u?.status || 'active';
  }

  const store = await load_store();
  return store[userId]?.status || 'active';
}

export async function get_user_last_active(userId) {
  if (DB_PROVIDER === 'mongodb') {
    const u = await User.findOne({ id: userId }, { last_active_at: 1 }).lean();
    return u?.last_active_at ? new Date(u.last_active_at).toISOString() : null;
  }

  const store = await load_store();
  return store[userId]?.last_active_at || null;
}

export async function set_user_status(userId, status) {
  if (DB_PROVIDER === 'mongodb') {
    await User.updateOne({ id: userId }, { $set: { status } });
    return;
  }

  const store = await load_store();
  if (!store[userId]) store[userId] = {};
  store[userId].status = status;
  await persist_store();
}

export async function set_user_last_active(userId, last_active_at = new Date().toISOString()) {
  if (DB_PROVIDER === 'mongodb') {
    await User.updateOne({ id: userId }, { $set: { last_active_at: new Date(last_active_at) } });
    return;
  }

  const store = await load_store();
  if (!store[userId]) store[userId] = {};
  store[userId].last_active_at = last_active_at;
  await persist_store();
}
