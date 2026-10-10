import { z } from 'zod';
import { AppError } from '../../../platform/shared/app-error.js';
import { get_own_store, update_store_settings, set_store_published, get_public_store_by_slug, list_nearby_stores, upload_store_image } from '../services/store-service.js';

const nearby_query = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180)
});

export async function handle_nearby_stores(req, res, next) {
  try {
    const parsed = nearby_query.safeParse(req.query);
    if (!parsed.success) throw new AppError('Send your location as lat and lng', 400);
    const stores = await list_nearby_stores(parsed.data.lat, parsed.data.lng);
    res.status(200).json({ stores });
  } catch (err) {
    next(err);
  }
}

export async function handle_get_own_store(req, res, next) {
  try {
    const store = await get_own_store(req.tenant_id);
    res.status(200).json({ store });
  } catch (err) {
    next(err);
  }
}

export async function handle_update_store_settings(req, res, next) {
  try {
    const store = await update_store_settings(req.tenant_id, req.body);
    res.status(200).json({ store });
  } catch (err) {
    next(err);
  }
}

export async function handle_upload_store_image(req, res, next) {
  try {
    const { file, type } = req.body;
    const result = await upload_store_image({
      user_id: req.user.id,
      tenant_id: req.tenant_id,
      file,
      type
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handle_publish_store(req, res, next) {
  try {
    const store = await set_store_published(req.tenant_id, true);
    res.status(200).json({ store });
  } catch (err) {
    next(err);
  }
}

export async function handle_unpublish_store(req, res, next) {
  try {
    const store = await set_store_published(req.tenant_id, false);
    res.status(200).json({ store });
  } catch (err) {
    next(err);
  }
}

export async function handle_get_public_store(req, res, next) {
  try {
    const store = await get_public_store_by_slug(req.params.slug);
    res.status(200).json({ store });
  } catch (err) {
    next(err);
  }
}
