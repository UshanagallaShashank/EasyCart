import { translate_texts, translation_enabled } from './translate-service.js';

function handler(signed_in) {
  return async (req, res, next) => {
    try {
      const translations = await translate_texts(req.body, { signed_in });
      res.status(200).json({ translations, enabled: translation_enabled() });
    } catch (err) {
      next(err);
    }
  };
}

export const handle_translate = handler(true);
export const handle_public_translate = handler(false);
