// Checks a photo sent from the phone. Pure, so it is easy to test: no storage, no database.
import { AppError } from '../../platform/shared/app-error.js';

// Customers may send ordinary photos only. SVG is refused because it can carry code.
const ALLOWED_TYPES = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const BASE64_MARKER = ';base64,';

// Reads "data:image/jpeg;base64,...." into the bytes, the type and the file ending.
export function read_photo(data_url) {
  if (typeof data_url !== 'string' || !data_url.startsWith('data:')) throw new AppError('Send the photo as an image file', 400);
  const marker_at = data_url.indexOf(BASE64_MARKER);
  if (marker_at === -1) throw new AppError('Send the photo as an image file', 400);

  const mime = data_url.slice('data:'.length, marker_at).toLowerCase();
  const ext = ALLOWED_TYPES[mime];
  if (!ext) throw new AppError('Only JPEG, PNG or WEBP photos can be added', 400);

  const buffer = Buffer.from(data_url.slice(marker_at + BASE64_MARKER.length), 'base64');
  if (buffer.length === 0) throw new AppError('The photo is empty', 400);
  if (buffer.length > MAX_PHOTO_BYTES) throw new AppError('The photo is too large (3 MB at most)', 400);
  return { buffer, mime, ext };
}
