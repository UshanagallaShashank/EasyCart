import { create_product, list_products, get_product, update_product_details, remove_product } from '../services/product-service.js';

export async function handle_create_product(req, res, next) {
  try {
    const product = await create_product(req.tenant_id, req.body);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function handle_list_products(req, res, next) {
  try {
    const products = await list_products(req.tenant_id);
    res.status(200).json({ products });
  } catch (err) {
    next(err);
  }
}

export async function handle_get_product(req, res, next) {
  try {
    const product = await get_product(req.tenant_id, req.params.id);
    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function handle_update_product(req, res, next) {
  try {
    const product = await update_product_details(req.tenant_id, req.params.id, req.body);
    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function handle_delete_product(req, res, next) {
  try {
    await remove_product(req.tenant_id, req.params.id);
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}
