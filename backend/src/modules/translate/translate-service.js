// Translates texts on request and remembers every result, so each text is only ever translated once per server run.
import { z } from 'zod';
import { TRANSLATE_PROVIDER, GOOGLE_TRANSLATE_API_KEY, ANTHROPIC_API_KEY, TRANSLATE_MODEL } from '../../env.js';
import { AppError } from '../../platform/shared/app-error.js';
import { create_translator, LANGUAGE_NAMES } from './translate-provider.js';

const translator = create_translator({
  provider: TRANSLATE_PROVIDER,
  api_key: TRANSLATE_PROVIDER === 'google' ? GOOGLE_TRANSLATE_API_KEY : ANTHROPIC_API_KEY,
  model: TRANSLATE_MODEL
});

// Signed-in people can translate whole screens and product lists. Before sign-in only short screen words are allowed.
const LIMITS = {
  signed_in: { max_texts: 50, max_length: 300 },
  public: { max_texts: 30, max_length: 120 }
};
const MAX_REMEMBERED = 20000;

const remembered = new Map();
const key_of = (language, text) => `${language}:${text}`;

function remember(language, text, translation) {
  if (remembered.size >= MAX_REMEMBERED) remembered.delete(remembered.keys().next().value); // forget the oldest
  remembered.set(key_of(language, text), translation);
}

export async function translate_texts(input, { signed_in }) {
  const limits = signed_in ? LIMITS.signed_in : LIMITS.public;
  const schema = z.object({
    language: z.enum(['te', 'hi']),
    texts: z.array(z.string().trim().min(1).max(limits.max_length)).min(1).max(limits.max_texts)
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new AppError(`Send up to ${limits.max_texts} texts of up to ${limits.max_length} letters, with language te or hi`, 400);
  const { language, texts } = parsed.data;

  const missing = [...new Set(texts)].filter((text) => !remembered.has(key_of(language, text)));
  if (missing.length > 0 && translator.name !== 'none') {
    try {
      const done = await translator.translate(missing, language);
      missing.forEach((text, index) => remember(language, text, done[index]));
    } catch (err) {
      // A failed translation must never break the screen: people just see the original text.
      console.warn(`Translation to ${LANGUAGE_NAMES[language]} failed:`, err?.message || err);
    }
  }

  return texts.map((text) => remembered.get(key_of(language, text)) ?? text);
}

export function translation_enabled() {
  return translator.name !== 'none';
}
