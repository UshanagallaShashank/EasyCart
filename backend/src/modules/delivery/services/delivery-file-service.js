// Saves rider documents and delivery proof photos in a private bucket and makes short-lived links to them.
import { AppError } from '../../../platform/shared/app-error.js';
import { upload_private_file, create_private_file_url } from '../../../platform/storage/private-file-storage.js';
import { parse_base64_document } from '../../stores/services/store-request-document-service.js';

const BUCKET = 'delivery-partner-files';
const IMAGE_ONLY = new Set(['partner_photo', 'vehicle_photo', 'delivery_proof']);

export const DOCUMENT_LABELS = {
  partner_photo: 'Profile photo',
  vehicle_photo: 'Vehicle photo',
  license_front: 'Driving licence (front)',
  license_back: 'Driving licence (back)',
  vehicle_rc: 'Vehicle registration (RC)',
  id_proof: 'ID proof',
  insurance: 'Vehicle insurance',
  other: 'Other document',
  delivery_proof: 'Delivery photo'
};

export async function save_delivery_file({ folder, kind, file }) {
  const label = DOCUMENT_LABELS[kind] ?? 'File';
  const { buffer, mime_type, ext } = parse_base64_document(file, label);
  if (IMAGE_ONLY.has(kind) && ext === 'pdf') {
    throw new AppError(`${label} must be a photo (JPG, PNG or WEBP)`, 400);
  }
  return upload_private_file(BUCKET, `${folder}/${kind}-${Date.now()}.${ext}`, buffer, mime_type);
}

export function delivery_file_url(file_path) {
  return create_private_file_url(BUCKET, file_path);
}

export function file_type(file_path) {
  return String(file_path).toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
}
