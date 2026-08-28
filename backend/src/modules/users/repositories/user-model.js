// Mongoose schema and model for users (used when DB_PROVIDER is mongodb).
import mongoose from 'mongoose';

const user_schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone_number: { type: String, required: true },
    password_hash: { type: String, required: true },
    role: { type: String, default: 'tenant_owner' },
    tenant_id: { type: String, default: null },
    created_at: { type: Date, default: Date.now }
  },
  { collection: 'users' }
);

export const User = mongoose.models.User || mongoose.model('User', user_schema);
