// Stores the ID and business proof documents sent with a store request, plus a small details file
// (business address and the document paths) kept next to them. Nothing here needs database columns.
// Everything goes in a PRIVATE bucket (unlike store logos), and documents are only shown to the admin through short-lived signed links.
import { get_supabase } from '../../../platform/db/db.js';
import { AppError } from '../../../platform/shared/app-error.js';

const DOCUMENT_BUCKET = process.env.SUPABASE_REQUEST_DOCS_BUCKET || 'store-request-docs';
const MAX_DOCUMENT_BYTES = 3 * 1024 * 1024;
const SIGNED_LINK_SECONDS = 60 * 60;

const MIME_TO_EXT = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

let bucket_checked = false;

async function ensure_document_bucket(supabase) {
  if (bucket_checked) return;
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((bucket) => bucket.name === DOCUMENT_BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(DOCUMENT_BUCKET, { public: false, fileSizeLimit: MAX_DOCUMENT_BYTES });
  }
  bucket_checked = true;
}

export function parse_base64_document(data_string, label) {
  const marker = ';base64,';
  const marker_position = typeof data_string === 'string' ? data_string.indexOf(marker) : -1;

  if (typeof data_string !== 'string' || !data_string.startsWith('data:')) {
    throw new AppError(`${label} is required`, 400);
  }
  if (marker_position === -1) {
    throw new AppError(`${label} could not be read. Please upload it again.`, 400);
  }

  // "data:application/pdf;base64,AAAA..." -> mime type is between "data:" and ";base64,"
  const mime_type = data_string.slice('data:'.length, marker_position).toLowerCase();
  const ext = MIME_TO_EXT[mime_type];
  if (!ext) {
    throw new AppError(`${label} must be a PDF, JPG, PNG or WEBP file`, 400);
  }

  const buffer = Buffer.from(data_string.slice(marker_position + marker.length), 'base64');
  if (buffer.length === 0) {
    throw new AppError(`${label} is empty`, 400);
  }
  if (buffer.length > MAX_DOCUMENT_BYTES) {
    throw new AppError(`${label} must be 3MB or smaller`, 400);
  }

  return { buffer, mime_type, ext };
}

// Uploads one document and returns its path inside the private bucket.
export async function upload_request_document({ customer_id, file, kind, label }) {
  const { buffer, mime_type, ext } = parse_base64_document(file, label);

  const supabase = get_supabase();
  if (!supabase) {
    throw new AppError('File storage is not available. Please try again later.', 500);
  }
  await ensure_document_bucket(supabase);

  const path = `${customer_id}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(DOCUMENT_BUCKET).upload(path, buffer, { contentType: mime_type, upsert: true });
  if (error) {
    throw new AppError(`Could not upload ${label.toLowerCase()}: ${error.message}`, 500);
  }
  return path;
}

// A link the admin can open for an hour; returns null if there is no document or the link cannot be made.
export async function create_signed_document_url(path) {
  if (!path) return null;
  const supabase = get_supabase();
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(DOCUMENT_BUCKET).createSignedUrl(path, SIGNED_LINK_SECONDS);
  if (error) return null;
  return data?.signedUrl ?? null;
}

function details_path(customer_id) {
  return `${customer_id}/details.json`;
}

// Saves the business address and where the two documents were stored, for the admin to review later.
export async function save_request_details(customer_id, details) {
  const supabase = get_supabase();
  if (!supabase) {
    throw new AppError('File storage is not available. Please try again later.', 500);
  }
  await ensure_document_bucket(supabase);

  const file = Buffer.from(JSON.stringify(details), 'utf-8');
  const { error } = await supabase.storage.from(DOCUMENT_BUCKET).upload(details_path(customer_id), file, { contentType: 'application/json', upsert: true });
  if (error) {
    throw new AppError(`Could not save the request details: ${error.message}`, 500);
  }
}

// Returns the saved details, or null when this applicant has none (for example an older request).
export async function read_request_details(customer_id) {
  const supabase = get_supabase();
  if (!supabase) return null;

  const { data, error } = await supabase.storage.from(DOCUMENT_BUCKET).download(details_path(customer_id));
  if (error || !data) return null;

  try {
    return JSON.parse(await data.text());
  } catch {
    return null;
  }
}
