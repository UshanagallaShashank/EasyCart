// Rules for rating an order, and the average the store owner sees.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../platform/shared/app-error.js';
import { find_order_by_id_for_customer } from '../orders/repositories/order-repository.js';
import { validate_rating_input } from './rating-schemas.js';
import { find_rating_by_order, save_rating, find_ratings_by_tenant } from './rating-repository.js';

async function find_own_order(customer_id, order_id) {
  const order = await find_order_by_id_for_customer(order_id, customer_id);
  if (!order) throw new AppError('Order not found', 404);
  return order;
}

export async function get_order_rating(customer_id, order_id) {
  await find_own_order(customer_id, order_id);
  return find_rating_by_order(order_id);
}

export async function rate_order(customer_id, order_id, payload) {
  const parsed = validate_rating_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }

  const order = await find_own_order(customer_id, order_id);
  if (order.status !== 'fulfilled') throw new AppError('You can rate an order once it is delivered', 400);

  const existing = await find_rating_by_order(order_id);
  if (existing) throw new AppError('You already rated this order', 409);

  return save_rating({
    id: randomUUID(),
    order_id,
    tenant_id: order.tenant_id,
    customer_id,
    rider_id: order.rider_id ?? null,
    store_stars: parsed.data.store_stars,
    delivery_stars: parsed.data.delivery_stars ?? null,
    comment: parsed.data.comment || null
  });
}

function average(numbers) {
  if (numbers.length === 0) return null;
  const total = numbers.reduce((sum, value) => sum + value, 0);
  return Math.round((total / numbers.length) * 10) / 10;
}

// What the owner sees: how many ratings, the averages, and the latest comments.
export async function get_ratings_summary(tenant_id) {
  const ratings = await find_ratings_by_tenant(tenant_id);
  const delivery_scores = ratings.map((rating) => rating.delivery_stars).filter((value) => value !== null);
  return {
    count: ratings.length,
    average_store: average(ratings.map((rating) => rating.store_stars)),
    average_delivery: average(delivery_scores),
    recent: ratings.filter((rating) => rating.comment).slice(0, 5).map((rating) => ({
      store_stars: rating.store_stars,
      delivery_stars: rating.delivery_stars,
      comment: rating.comment,
      created_at: rating.created_at
    }))
  };
}
