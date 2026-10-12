// Handles the HTTP side of the optional AI helpers and the list of switched-on features.
import { ai_enabled, write_product_description } from './ai-service.js';

export function handle_features(req, res) {
  res.status(200).json({ ai: ai_enabled() });
}

export async function handle_product_description(req, res, next) {
  try {
    res.status(200).json(await write_product_description(req.body));
  } catch (err) {
    next(err);
  }
}
