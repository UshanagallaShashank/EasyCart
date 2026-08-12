import mongoose from 'mongoose';
import { get_supabase } from '../db/db.js';
import { DB_PROVIDER } from '../env.js';

const memory_users = new Map();

const user_schema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone_number: { type: String, required: true },
    password_hash: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
  },
  { collection: 'users' }
);

export const User = mongoose.models.User || mongoose.model('User', user_schema);

export async function find_user_by_email(email) {
  const normalized = String(email).toLowerCase();

  if (process.env.NODE_ENV === 'test') {
    return memory_users.get(normalized) || null;
  }

  if (DB_PROVIDER === 'supabase') {
    const supabase = get_supabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalized)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  }

  return User.findOne({ email: normalized }).lean();
}

export async function save_user(user) {
  const normalized = {
    ...user,
    email: String(user.email).toLowerCase(),
    username: String(user.username).trim(),
    phone_number: String(user.phone_number).trim()
  };

  if (process.env.NODE_ENV === 'test') {
    memory_users.set(normalized.email, normalized);
    return normalized;
  }

  if (DB_PROVIDER === 'supabase') {
    const supabase = get_supabase();
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: normalized.username,
          email: normalized.email,
          phone_number: normalized.phone_number,
          password_hash: normalized.password_hash,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  const created_user = await User.create({
    username: normalized.username,
    email: normalized.email,
    phone_number: normalized.phone_number,
    password_hash: normalized.password_hash,
    created_at: new Date().toISOString()
  });

  return created_user.toObject();
}
