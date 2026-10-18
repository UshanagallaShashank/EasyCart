// What each side may see of a rider. Documents, ID numbers and contacts stay with the rider and the admin.
import { REQUIRED_DOCUMENTS, rider_profile_schema } from '../delivery-schemas.js';
import { DOCUMENT_LABELS, delivery_file_url, file_type } from '../services/delivery-file-service.js';

const PROFILE_FIELDS = [
  'full_name', 'date_of_birth', 'vehicle_type', 'vehicle_number', 'license_number', 'license_expiry',
  'address_line', 'area', 'city', 'pincode', 'emergency_contact_name', 'emergency_contact_phone', 'upi_id'
];

export function pick_profile_fields(rider) {
  const profile = {};
  for (const field of PROFILE_FIELDS) profile[field] = rider[field] ?? '';
  return profile;
}

// Lists what is still missing before the application can be sent.
export function find_missing_steps(rider) {
  const missing = [];
  if (!rider_profile_schema.safeParse(pick_profile_fields(rider)).success) missing.push('profile');
  const documents = rider.documents ?? {};
  for (const kind of REQUIRED_DOCUMENTS) {
    if (!documents[kind]) missing.push(kind);
  }
  return missing;
}

// Every stored document as a list with links that expire in an hour.
export async function list_documents_with_links(rider) {
  const documents = rider.documents ?? {};
  const entries = [];
  for (const [kind, value] of Object.entries(documents)) {
    if (kind === 'other') {
      (value ?? []).forEach((item, index) => entries.push({ kind, index, path: item.path, title: item.label || DOCUMENT_LABELS.other }));
    } else if (value) {
      entries.push({ kind, path: value, title: DOCUMENT_LABELS[kind] ?? kind });
    }
  }
  return Promise.all(entries.map(async ({ path, ...entry }) => ({
    ...entry,
    file_name: path.split('/').pop(),
    type: file_type(path),
    url: await delivery_file_url(path)
  })));
}

export async function partner_photo_url(rider) {
  return delivery_file_url(rider?.documents?.partner_photo ?? null);
}

// The rider as they see themselves, and as the admin reviewing them sees them.
export async function to_full_rider(rider) {
  return {
    id: rider.id,
    user_id: rider.user_id,
    email: rider.email,
    phone_number: rider.phone_number,
    ...pick_profile_fields(rider),
    latitude: rider.latitude,
    longitude: rider.longitude,
    location_updated_at: rider.location_updated_at ?? null,
    status: rider.status,
    review_note: rider.review_note ?? null,
    submitted_at: rider.submitted_at ?? null,
    reviewed_at: rider.reviewed_at ?? null,
    is_online: Boolean(rider.is_online),
    last_seen_at: rider.last_seen_at ?? null,
    created_at: rider.created_at,
    documents: await list_documents_with_links(rider),
    photo_url: await partner_photo_url(rider),
    missing_steps: find_missing_steps(rider)
  };
}

// What a customer or store sees of the rider handling their order: enough to recognise them at the door.
export async function to_handover_rider(rider, { include_phone }) {
  if (!rider) return null;
  return {
    id: rider.id,
    full_name: rider.full_name,
    vehicle_type: rider.vehicle_type,
    vehicle_number: rider.vehicle_number || null,
    phone_number: include_phone ? rider.phone_number : null,
    photo_url: await partner_photo_url(rider)
  };
}
