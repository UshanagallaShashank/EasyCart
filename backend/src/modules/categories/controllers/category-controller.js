import { create_category, list_categories, remove_category } from '../services/category-service.js';

export async function handle_create_category(req, res, next) {
  try {
    const category = await create_category(req.tenant_id, req.body);
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}

export async function handle_list_categories(req, res, next) {
  try {
    const categories = await list_categories(req.tenant_id);
    res.status(200).json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function handle_delete_category(req, res, next) {
  try {
    await remove_category(req.tenant_id, req.params.id);
    res.status(200).json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}
