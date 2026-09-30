// Mongoose schema and model for coupons (used when DB_PROVIDER is mongodb).
import mongoose from 'mongoose';

const coupon_schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    tenant_id: { type: String, required: true },
    code: { type: String, required: true },
    discount_type: { type: String, enum: ['flat', 'percent'], required: true },
    discount_value: { type: Number, required: true },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
  },
  { collection: 'coupons' }
);

coupon_schema.index({ tenant_id: 1, code: 1 }, { unique: true });

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', coupon_schema);
