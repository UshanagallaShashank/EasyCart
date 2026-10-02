// Mongoose schema and model for rider cash deposits and payouts (used when DB_PROVIDER is mongodb).
import mongoose from 'mongoose';

const settlement_schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    rider_id: { type: String, required: true, index: true },
    kind: { type: String, enum: ['cash_deposit', 'payout'], required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: null },
    recorded_by: { type: String, default: null },
    created_at: { type: Date, default: Date.now }
  },
  { collection: 'rider_settlements' }
);

export const RiderSettlement = mongoose.models.RiderSettlement || mongoose.model('RiderSettlement', settlement_schema);
