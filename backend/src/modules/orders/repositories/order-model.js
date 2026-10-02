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
    fulfillment_method: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
    delivery_address: { type: String, default: null },
    delivery_fee: { type: Number, default: 0 },
    fulfillment_status: { type: String, default: 'not_started' },
    assigned_to: { type: String, default: null },
    rider_id: { type: String, default: null, index: true },
    rider_offer_status: { type: String, default: null },
    rider_offer_expires_at: { type: Date, default: null },
    declined_rider_ids: { type: [String], default: [] },
    delivery_code: { type: String, default: null },
    delivery_code_attempts: { type: Number, default: 0 },
    pickup_code: { type: String, default: null },
    pickup_code_attempts: { type: Number, default: 0 },
    ready_at: { type: Date, default: null },
    accepted_at: { type: Date, default: null },
    picked_up_at: { type: Date, default: null },
    delivered_at: { type: Date, default: null },
    delivery_photo_path: { type: String, default: null },
    cash_collected: { type: Number, default: null },
    rider_earning: { type: Number, default: null },
    settled_at: { type: Date, default: null },
    settled_by: { type: String, default: null },
    settlement_method: { type: String, default: null },
    settlement_note: { type: String, default: null },
    coupon_code: { type: String, default: null },
    discount_amount: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'orders' }
);

export const Order = mongoose.models.Order || mongoose.model('Order', order_schema);
