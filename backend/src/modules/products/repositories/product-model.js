// Mongoose schema and model for products (used when DB_PROVIDER is mongodb).
import mongoose from 'mongoose';

const variant_schema = new mongoose.Schema(
  { label: String, sku: String, price: Number, stock: Number },
  { _id: false }
);

const product_schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    tenant_id: { type: String, required: true },
    category_id: { type: String, default: null },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    sku: { type: String, required: true },
    images: { type: [String], default: [] },
    variants: { type: [variant_schema], default: [] },
    stock_quantity: { type: Number, default: 0 },
    low_stock_threshold: { type: Number, default: 5 },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'products' }
);

product_schema.index({ tenant_id: 1, sku: 1 }, { unique: true });

export const Product = mongoose.models.Product || mongoose.model('Product', product_schema);
