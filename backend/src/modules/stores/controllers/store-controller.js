import { update_store_settings, set_store_published, get_public_store_by_slug } from '../services/store-service.js';


export async function handle_update_store_settings(req, res, next) {
  try {
    const store = await update_store_settings(req.tenant_id, req.body);
    res.status(200).json({ store });
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
