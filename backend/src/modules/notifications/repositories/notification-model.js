// Mongoose schema and model for notifications (used when DB_PROVIDER is mongodb).
import mongoose from 'mongoose';

const notification_schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    tenant_id: { type: String, required: true },
    type: { type: String, enum: ['order_placed', 'cart_abandoned'], required: true },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
  },
  { collection: 'notifications' }
);

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notification_schema);
