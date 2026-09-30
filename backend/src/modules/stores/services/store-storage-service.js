import { get_supabase } from '../../../platform/db/db.js';
import { AppError } from '../../../platform/shared/app-error.js';

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'store-assets';

const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg'
};

let bucket_checked = false;

export async function ensure_storage_bucket(supabase) {
  if (bucket_checked) return;
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (!listError && buckets) {
      const exists = buckets.some((b) => b.name === BUCKET_NAME);
      if (!exists) {
        await supabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
      }
      bucket_checked = true;
    }
  } catch (err) {
    // If bucket already exists or permissions restrict listing, allow upload to proceed
    console.warn('Storage bucket check note:', err?.message || err);
  }
}

export function parse_base64_image(dataString) {
  if (typeof dataString !== 'string') {
    throw new AppError('Image file must be a base64 data string', 400);
  }

  const match = dataString.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!match) {
    throw new AppError('Invalid image data format. Expected a base64 data URL (e.g. data:image/png;base64,...)', 400);
  }

  const mimeType = match[1].toLowerCase();
  const ext = MIME_TO_EXT[mimeType];
  if (!ext) {
    throw new AppError(`Unsupported image type "${mimeType}". Allowed formats: JPEG, PNG, WEBP, GIF, SVG`, 400);
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0) {
    throw new AppError('Empty image data provided', 400);
  }

  if (buffer.length > 10 * 1024 * 1024) {
    throw new AppError('Image size exceeds 10MB limit', 400);
  }

  return { buffer, mimeType, ext };
}

export async function upload_store_asset_to_supabase({ user_id, file, type }) {
  if (!user_id) {
    throw new AppError('User ID is required to store assets', 401);
  }

  const supabase = get_supabase();
  if (!supabase) {
    throw new AppError('Supabase client is not available. Please verify database/storage configuration.', 500);
  }

  const { buffer, mimeType, ext } = parse_base64_image(file);
  await ensure_storage_bucket(supabase);

  // Store file strictly under user id: <userId>/<type>-<timestamp>.<ext>
  const assetType = type === 'banner' ? 'banner' : 'logo';
  const timestamp = Date.now();
  const filePath = `${user_id}/${assetType}-${timestamp}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true
    });

  if (uploadError) {
    throw new AppError(`Supabase Storage upload failed: ${uploadError.message}`, 500);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: publicUrlData?.publicUrl || '',
    path: filePath,
    bucket: BUCKET_NAME,
    user_id
  };
}
