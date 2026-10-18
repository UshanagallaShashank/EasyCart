import { search_public_products, get_public_product } from '../services/product-service.js';

export async function handle_search_public_products(req, res, next) {
  try {
    const products = await search_public_products(req.tenant_id, {
      search: req.query.search,
      category_id: req.query.category_id
    });
    res.status(200).json({ products });
  } catch (err) {
    next(err);
  }
}

export async function handle_get_public_product(req, res, next) {
  try {
    const product = await get_public_product(req.tenant_id, req.params.id);
    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
}
