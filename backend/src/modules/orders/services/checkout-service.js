import { AppError } from '../../../platform/shared/app-error.js';
import { validate_checkout_input } from '../order-schemas.js';
import { get_public_product } from '../../products/services/product-service.js';
import { get_own_store } from '../../stores/services/store-service.js';
import { resolve_active_coupon, apply_coupon_discount } from '../../coupons/services/coupon-service.js';
import { create_order } from './order-service.js';
import { merge_cart_lines } from '../lib/order-rules.js';

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
  let subtotal = 0;

  for (const item of merge_cart_lines(parsed.data.items)) {
    const product = await get_public_product(tenant_id, item.product_id);
    const { price, stock } = resolve_unit_price_and_stock(product, item.variant_label);
    if (stock < item.quantity) {
      throw new AppError(stock > 0 ? `Only ${stock} left of ${product.name}` : `${product.name} is out of stock`, 400);
    }
    line_items.push({ product_id: product.id, name: product.name, price, quantity: item.quantity, variant_label: item.variant_label });
    subtotal += price * item.quantity;
  }

  let discount_amount = 0;
  let coupon_code = null;
  if (parsed.data.coupon_code) {
    const coupon = await resolve_active_coupon(tenant_id, parsed.data.coupon_code);
    discount_amount = apply_coupon_discount(subtotal, coupon);
    coupon_code = coupon.code;
  }

  const { fulfillment_method, delivery_address } = parsed.data;
  let delivery_fee = 0;
  if (fulfillment_method === 'delivery') {
    const store = await get_own_store(tenant_id);
    delivery_fee = store.delivery_fee ?? 0;
  }

  const total = subtotal - discount_amount + delivery_fee;

  return create_order(tenant_id, customer_id, {
    items: line_items,
    total,
    payment_method: parsed.data.payment_method,
    fulfillment_method,
    delivery_address: fulfillment_method === 'delivery' ? delivery_address : null,
    delivery_fee,
    coupon_code,
    discount_amount
  });
}
