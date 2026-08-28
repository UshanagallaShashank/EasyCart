// Mongoose schema and model for tenants (used when DB_PROVIDER is mongodb).
import mongoose from 'mongoose';

const tenant_schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    owner_id: { type: String, required: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    created_at: { type: Date, default: Date.now }
  },
  { collection: 'tenants' }
);

export const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenant_schema);
