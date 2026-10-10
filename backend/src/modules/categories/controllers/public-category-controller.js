import { list_categories } from '../services/category-service.js';

export async function handle_list_public_categories(req, res, next) {
  try {
    const categories = await list_categories(req.tenant_id);
    res.status(200).json({ categories: categories.map((c) => ({ id: c.id, name: c.name })) });
  } catch (err) {
    next(err);
  }
}
