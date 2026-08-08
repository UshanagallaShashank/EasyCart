// Connects to whichever database DB_PROVIDER points to (mongodb or supabase).
import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';
import { DB_PROVIDER, MONGODB_URI, SUPABASE_URL, SUPABASE_KEY } from '../env.js';

let supabase = null;

export async function connect_db() {
  if (DB_PROVIDER === 'supabase') {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    return;
  }
  await mongoose.connect(MONGODB_URI);
}

// Use this in services/repositories when DB_PROVIDER is "supabase"
export function get_supabase() {
  return supabase;
}
