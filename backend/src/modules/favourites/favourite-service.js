// Rules for saving and removing favourite products.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../platform/shared/app-error.js';
import { find_active_product_by_id } from '../products/repositories/product-repository.js';
import { find_favourite_product_ids, save_favourite, delete_favourite } from './favourite-repository.js';

export async function list_favourites(customer_id, tenant_id) {
  return find_favourite_product_ids(customer_id, tenant_id);
}

export async function add_favourite(customer_id, tenant_id, product_id) {
  const product = await find_active_product_by_id(product_id, tenant_id);
  if (!product) throw new AppError('Product not found', 404);
  await save_favourite({ id: randomUUID(), tenant_id, customer_id, product_id });
}

export async function remove_favourite(customer_id, product_id) {
  await delete_favourite(customer_id, product_id);
}
