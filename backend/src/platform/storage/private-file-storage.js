// Keeps private files (rider documents, delivery proof photos) and hands out short-lived links to them.
// Uses a private Supabase Storage bucket when Supabase is configured. Without it (local development with MongoDB),
// files go to a folder on disk and links point at /api/private-files, signed so they expire like Supabase's.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import { get_supabase } from '../db/db.js';
import { JWT_SECRET } from '../../env.js';
import { AppError } from '../shared/app-error.js';

export const LINK_SECONDS = 60 * 60;
const LOCAL_ROOT = path.resolve(process.cwd(), '.private-uploads');
const MAX_BUCKET_BYTES = 5 * 1024 * 1024;
const checked_buckets = new Set();

async function ensure_bucket(supabase, bucket) {
  if (checked_buckets.has(bucket)) return;
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!(buckets || []).some((item) => item.name === bucket)) {
    await supabase.storage.createBucket(bucket, { public: false, fileSizeLimit: MAX_BUCKET_BYTES });
  }
  checked_buckets.add(bucket);
}

// Only plain names like "abc-123/photo-1.jpg" are accepted, so a path can never climb out of its folder.
function safe_local_path(bucket, file_path) {
  if (!/^[\w-]+$/.test(bucket) || !/^[\w-]+(\/[\w.-]+)*$/.test(file_path) || file_path.includes('..')) {
    throw new AppError('Invalid file path', 400);
  }
  return path.join(LOCAL_ROOT, bucket, file_path);
}

export async function upload_private_file(bucket, file_path, buffer, mime_type) {
  const supabase = get_supabase();
  if (supabase) {
    await ensure_bucket(supabase, bucket);
    const { error } = await supabase.storage.from(bucket).upload(file_path, buffer, { contentType: mime_type, upsert: true });
    if (error) throw new AppError(`Could not save the file: ${error.message}`, 500);
    return file_path;
  }

  const target = safe_local_path(bucket, file_path);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, buffer);
  return file_path;
}

// A link that works for an hour, or null when there is no file.
export async function create_private_file_url(bucket, file_path) {
  if (!file_path) return null;
  const supabase = get_supabase();
  if (supabase) {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(file_path, LINK_SECONDS);
    if (error) return null;
    return data?.signedUrl ?? null;
  }
  const token = jwt.sign({ bucket, file_path }, JWT_SECRET, { expiresIn: LINK_SECONDS });
  return `/api/private-files/${token}`;
}

const EXT_TO_MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf' };

// Reads a local file behind a signed link. Throws 404 for a bad, expired or missing link.
export async function read_local_private_file(token) {
  try {
    const { bucket, file_path } = jwt.verify(token, JWT_SECRET);
    const buffer = await readFile(safe_local_path(bucket, file_path));
    const ext = file_path.split('.').pop().toLowerCase();
    return { buffer, mime_type: EXT_TO_MIME[ext] || 'application/octet-stream' };
  } catch {
    throw new AppError('File not found or link expired', 404);
  }
}
