// Translates texts on request and remembers every result, so each text is only ever translated once per server run.
import { z } from 'zod';
import { TRANSLATE_PROVIDER, ANTHROPIC_API_KEY, TRANSLATE_MODEL } from '../../env.js';
import { AppError } from '../../platform/shared/app-error.js';
import { create_translator, LANGUAGE_NAMES } from './translate-provider.js';

const translator = create_translator({ provider: TRANSLATE_PROVIDER, api_key: ANTHROPIC_API_KEY, model: TRANSLATE_MODEL });

const MAX_TEXTS = 30;
const MAX_LENGTH = 300;
const MAX_REMEMBERED = 5000;

export const translate_schema = z.object({
  language: z.enum(['te', 'hi']),
  texts: z.array(z.string().trim().min(1).max(MAX_LENGTH)).min(1).max(MAX_TEXTS)
});

const remembered = new Map();
const key_of = (language, text) => `${language}:${text}`;

function remember(language, text, translation) {
  if (remembered.size >= MAX_REMEMBERED) remembered.delete(remembered.keys().next().value); // forget the oldest
  remembered.set(key_of(language, text), translation);
}

export async function translate_texts(input) {
  const parsed = translate_schema.safeParse(input);
  if (!parsed.success) throw new AppError(`Send up to ${MAX_TEXTS} texts of up to ${MAX_LENGTH} letters, with language te or hi`, 400);
  const { language, texts } = parsed.data;

  const missing = [...new Set(texts)].filter((text) => !remembered.has(key_of(language, text)));
  if (missing.length > 0) {
    try {
      const done = await translator.translate(missing, language);
      // With no translation service set up the texts come back unchanged, so there is nothing worth remembering.
      if (translator.name !== 'none') missing.forEach((text, index) => remember(language, text, done[index]));
    } catch (err) {
      // A failed translation must never break the screen: the shopper just sees the original text.
      console.warn(`Translation to ${LANGUAGE_NAMES[language]} failed:`, err?.message || err);
    }
  }

  return texts.map((text) => remembered.get(key_of(language, text)) ?? text);
}

export function translation_enabled() {
  return translator.name !== 'none';
}
