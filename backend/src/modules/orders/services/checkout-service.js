import { AppError } from '../../../platform/shared/app-error.js';
import { validate_checkout_input } from '../order-schemas.js';
import { get_public_product } from '../../products/services/product-service.js';
import { create_order } from './order-service.js';

function resolve_unit_price_and_stock(product, variant_label) {
  if (!variant_label) {
    return { price: product.price, stock: product.stock_quantity };
  }
  const variant = product.variants.find((v) => v.label === variant_label);
  if (!variant) {
    throw new AppError(`Variant not found: ${variant_label}`, 400);
  }
  return { price: variant.price, stock: variant.stock };
}

export async function checkout(tenant_id, customer_id, payload) {
  const parsed = validate_checkout_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }

  const line_items = [];
  let total = 0;

  for (const item of parsed.data.items) {
    const product = await get_public_product(tenant_id, item.product_id);
    const { price, stock } = resolve_unit_price_and_stock(product, item.variant_label);
    if (stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }
    line_items.push({ product_id: product.id, name: product.name, price, quantity: item.quantity, variant_label: item.variant_label });
    total += price * item.quantity;
  }

  return create_order(tenant_id, customer_id, { items: line_items, total, payment_method: parsed.data.payment_method });
}
