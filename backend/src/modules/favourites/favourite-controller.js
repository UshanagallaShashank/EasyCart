import { list_favourites, add_favourite, remove_favourite } from './favourite-service.js';

export async function handle_list_favourites(req, res, next) {
  try {
    const product_ids = await list_favourites(req.user.id, req.tenant_id);
    res.status(200).json({ product_ids });
  } catch (err) {
    next(err);
  }
}

export async function handle_add_favourite(req, res, next) {
  try {
    await add_favourite(req.user.id, req.tenant_id, req.params.product_id);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function handle_remove_favourite(req, res, next) {
  try {
    await remove_favourite(req.user.id, req.params.product_id);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}
