// Saves a customer's photo for one of their orders (for a rating or a refund) in the public photo storage.
// Photos go in the customer's own folder, which is how a rating or refund later proves the photo is theirs.
import { get_supabase } from '../../platform/db/db.js';
import { SUPABASE_URL } from '../../env.js';
import { AppError } from '../../platform/shared/app-error.js';
import { ensure_storage_bucket } from '../stores/services/store-storage-service.js';
import { find_order_by_id_for_customer } from '../orders/repositories/order-repository.js';
import { read_photo } from './photo-rules.js';

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'store-assets';
const PURPOSES = ['review', 'refund'];

// The start of every public photo link in our storage: <supabase>/storage/v1/object/public/<bucket>
export function public_photo_prefix() {
  if (!SUPABASE_URL) return '';
  let base = SUPABASE_URL;
  while (base.endsWith('/')) base = base.slice(0, -1);
  return `${base}/storage/v1/object/public/${BUCKET_NAME}`;
}

export async function upload_order_photo({ customer_id, order_id, purpose, file }) {
  if (!PURPOSES.includes(purpose)) throw new AppError('Say what the photo is for (review or refund)', 400);
  const order = await find_order_by_id_for_customer(order_id, customer_id);
  if (!order) throw new AppError('Order not found', 404);

  const { buffer, mime, ext } = read_photo(file);
  const supabase = get_supabase();
  if (!supabase) throw new AppError('Photo storage is not available right now', 503);
  await ensure_storage_bucket(supabase);

  const path = `${customer_id}/${purpose}-${order_id}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, buffer, { contentType: mime, upsert: false });
  if (error) throw new AppError('The photo could not be saved. Please try again.', 502);

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return { url: data?.publicUrl ?? '' };
}
