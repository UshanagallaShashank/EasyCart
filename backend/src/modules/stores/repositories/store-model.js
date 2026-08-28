// Mongoose schema and model for stores (used when DB_PROVIDER is mongodb).
import mongoose from 'mongoose';

const store_schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    tenant_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo_url: { type: String, default: null },
    banner_url: { type: String, default: null },
    theme: { type: String, default: 'default' },
    is_published: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'stores' }
);

export const Store = mongoose.models.Store || mongoose.model('Store', store_schema);
