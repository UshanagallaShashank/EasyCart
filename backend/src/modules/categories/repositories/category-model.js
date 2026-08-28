// Mongoose schema and model for categories (used when DB_PROVIDER is mongodb).
import mongoose from 'mongoose';

const category_schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    tenant_id: { type: String, required: true },
    name: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
  },
  { collection: 'categories' }
);

category_schema.index({ tenant_id: 1, name: 1 }, { unique: true });

export const Category = mongoose.models.Category || mongoose.model('Category', category_schema);
