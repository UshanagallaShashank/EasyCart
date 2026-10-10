import { translate_texts, translation_enabled } from './translate-service.js';

export async function handle_translate(req, res, next) {
  try {
    const translations = await translate_texts(req.body);
    res.status(200).json({ translations, enabled: translation_enabled() });
  } catch (err) {
    next(err);
  }
}
