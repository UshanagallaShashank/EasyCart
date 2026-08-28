// Connects to whichever database DB_PROVIDER points to (mongodb or supabase).
import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';
import { DB_PROVIDER, MONGODB_URI, SUPABASE_URL, SUPABASE_KEY } from '../../env.js';

let supabase = null;

export async function connect_db() {
  try {
    if (DB_PROVIDER === 'supabase') {
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      return;
    }
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    console.error('Failed to connect to the database:', err.message);
    process.exit(1);
  }
}

// Use this in services/repositories when DB_PROVIDER is "supabase"
export function get_supabase() {
  return supabase;
}

export async function is_db_connected() {
  if (DB_PROVIDER === 'supabase') {
    if (!supabase) return false;
    const { error } = await supabase.from('_health_check').select('*').limit(1);
    // A "table not found" error still means Supabase itself responded fine.
    return !error || error.code === 'PGRST205';
  }
  return mongoose.connection.readyState === 1;
}
