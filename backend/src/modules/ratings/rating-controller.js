import { get_order_rating, rate_order, get_ratings_summary, get_store_reviews, get_product_ratings } from './rating-service.js';

export async function handle_get_my_order_rating(req, res, next) {
  try {
    const rating = await get_order_rating(req.user.id, req.params.id);
    res.status(200).json({ rating });
  } catch (err) {
    next(err);
  }
}

export async function handle_rate_my_order(req, res, next) {
  try {
    const rating = await rate_order(req.user.id, req.params.id, req.body);
    res.status(201).json({ rating });
  } catch (err) {
    next(err);
  }
}

export async function handle_ratings_summary(req, res, next) {
  try {
    const summary = await get_ratings_summary(req.tenant_id);
    res.status(200).json({ summary });
  } catch (err) {
    next(err);
  }
}

export async function handle_store_reviews(req, res, next) {
  try {
    res.status(200).json({ reviews: await get_store_reviews(req.tenant_id) });
  } catch (err) {
    next(err);
  }
}

export async function handle_product_ratings(req, res, next) {
  try {
    res.status(200).json({ ratings: await get_product_ratings(req.tenant_id) });
  } catch (err) {
    next(err);
  }
}
