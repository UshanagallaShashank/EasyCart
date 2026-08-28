// Mongoose schema and model for orders (used when DB_PROVIDER is mongodb).
import mongoose from 'mongoose';

const order_item_schema = new mongoose.Schema(
  { product_id: String, name: String, price: Number, quantity: Number, variant_label: String },
  { _id: false }
);

const order_schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    tenant_id: { type: String, required: true },
    customer_id: { type: String, required: true },
    items: { type: [order_item_schema], default: [] },
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'fulfilled', 'cancelled'], default: 'pending' },
    payment_status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    payment_method: { type: String, default: 'cash_on_delivery' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'orders' }
);

export const Order = mongoose.models.Order || mongoose.model('Order', order_schema);
