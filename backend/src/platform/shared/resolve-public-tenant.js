// Resolves req.tenant_id from a public :slug param, without requiring auth.
import { AppError } from './app-error.js';
import { find_store_by_slug } from '../../modules/stores/repositories/store-repository.js';

export async function resolve_public_tenant(req, res, next) {
  try {
    const store = await find_store_by_slug(req.params.slug);
    if (!store || !store.is_published) {
      throw new AppError('Store not found', 404);
    }
    req.tenant_id = store.tenant_id;
    req.store = { name: store.name, slug: store.slug, theme: store.theme };
    next();
  } catch (err) {
    next(err);
  }
}
