// Mongoose schema and model for delivery partners (used when DB_PROVIDER is mongodb).
import mongoose from 'mongoose';

const rider_schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    date_of_birth: { type: String, default: null },
    vehicle_type: { type: String, default: null },
    vehicle_number: { type: String, default: null },
    license_number: { type: String, default: null },
    license_expiry: { type: String, default: null },
    address_line: { type: String, default: null },
    area: { type: String, default: null },
    city: { type: String, default: null },
    pincode: { type: String, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    location_updated_at: { type: Date, default: null },
    emergency_contact_name: { type: String, default: null },
    emergency_contact_phone: { type: String, default: null },
    upi_id: { type: String, default: null },
    documents: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected', 'suspended'], default: 'draft' },
    review_note: { type: String, default: null },
    submitted_at: { type: Date, default: null },
    reviewed_at: { type: Date, default: null },
    is_online: { type: Boolean, default: false },
    last_seen_at: { type: Date, default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'delivery_partners', minimize: false }
);

export const Rider = mongoose.models.Rider || mongoose.model('Rider', rider_schema);
