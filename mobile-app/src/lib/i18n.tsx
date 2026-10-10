// Languages for the whole app. Nothing is translated by hand here: every English text the app shows, and every
// product name, is translated once by the server's translation service (Google Translate or Claude, set on the server),
// then kept on this phone, so from then on it shows instantly and works offline.
// Screens write t('Add to cart'); anything not translated yet simply shows in English for a moment.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, hasApiToken } from './api';
import { getLocal, setLocal } from './storage';

export type Language = 'en' | 'te' | 'hi';

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिन्दी' }
];

const LANGUAGE_KEY = 'easycart.language';
// Every English text this phone has shown. When the language changes they are all translated ahead, in a few requests.
const SEEN_KEY = 'easycart.translations.seen';
const cacheKey = (language: Language) => `easycart.translations.${language}`;

const WAIT_MS = 120;
const RETRY_MS = 30_000;
const SAVE_SEEN_MS = 2000;
// Matches the server: signed-in people may send bigger batches; before sign-in only short texts are allowed.
const BATCH_SIGNED_IN = 50;
const BATCH_PUBLIC = 30;
const PUBLIC_MAX_LENGTH = 120;
// The list of seen texts keeps only the newest ones, so it never grows without limit.
const MAX_SEEN = 3000;

// Fills {name} style gaps. Written with split and join so it is easy to read.
function fill(text: string, values?: Record<string, string | number>): string {
  if (!values) return text;
  let result = text;
  for (const key of Object.keys(values)) {
    result = result.split(`{${key}}`).join(String(values[key]));
  }
  return result;
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await getLocal(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export type Translate = (english: string, values?: Record<string, string | number>) => string;

interface LanguageState {
  language: Language;
  setLanguage(next: Language): void;
  t: Translate;
  // null while unknown, false when the server has no translation service switched on.
  available: boolean | null;
}

// Without a provider (should not happen) text simply stays in English instead of crashing.
const LanguageContext = createContext<LanguageState>({ language: 'en', setLanguage: () => undefined, t: (english, values) => fill(english, values), available: null });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [cache, setCache] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const languageRef = useRef<Language>('en');
  const seen = useRef(new Set<string>());
  const asked = useRef(new Set<string>());
  const pending = useRef(new Set<string>());
  const flushTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const seenTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const serverCannot = useRef(false);

  const flush = useCallback(async () => {
    const target = languageRef.current;
    if (target === 'en' || serverCannot.current) {
      pending.current.clear();
      return;
    }

    const signedIn = hasApiToken();
    let batch = [...pending.current];
    if (!signedIn) {
      // Before sign-in only short texts can be translated; the longer ones wait until after sign-in.
      for (const text of batch) {
        if (text.length > PUBLIC_MAX_LENGTH) {
          pending.current.delete(text);
          asked.current.delete(text);
        }
      }
      batch = batch.filter((text) => text.length <= PUBLIC_MAX_LENGTH);
    }
    batch = batch.slice(0, signedIn ? BATCH_SIGNED_IN : BATCH_PUBLIC);
    batch.forEach((text) => pending.current.delete(text));
    if (batch.length === 0) return;

    try {
      const result = await api<{ translations: string[]; enabled: boolean }>(signedIn ? '/translate' : '/translate/public', { method: 'POST', body: { language: target, texts: batch } });
      if (languageRef.current !== target) return; // the language changed while we waited
      setAvailable(result.enabled);
      if (!result.enabled) {
        serverCannot.current = true;
        return;
      }
      setCache((current) => {
        const next = { ...current };
        batch.forEach((text, index) => { next[text] = result.translations[index] ?? text; });
        setLocal(cacheKey(target), JSON.stringify(next)).catch(() => undefined);
        return next;
      });
    } catch {
      // Offline or the server is busy: try these texts again a little later, without hammering the server.
      setTimeout(() => {
        batch.forEach((text) => { asked.current.delete(text); });
      }, RETRY_MS);
      return;
    }
    if (pending.current.size > 0) flushTimer.current = setTimeout(() => void flush(), WAIT_MS);
  }, []);

  const ask = useCallback((text: string) => {
    if (languageRef.current === 'en' || serverCannot.current || asked.current.has(text)) return;
    asked.current.add(text);
    pending.current.add(text);
    clearTimeout(flushTimer.current);
    // Many texts appear together (a whole screen), so they go in one request.
    flushTimer.current = setTimeout(() => void flush(), WAIT_MS);
  }, [flush]);

  // Opens a language: what this phone already knows shows at once, and everything seen before is translated ahead.
  const openLanguage = useCallback(async (target: Language) => {
    languageRef.current = target;
    asked.current = new Set();
    pending.current = new Set();
    if (target === 'en') {
      setCache({});
      return;
    }
    const known = await readJson<Record<string, string>>(cacheKey(target), {});
    if (languageRef.current !== target) return;
    Object.keys(known).forEach((text) => asked.current.add(text));
    setCache(known);
    // Translating ahead is only done after sign-in; before that, only what is on screen is translated.
    if (hasApiToken()) seen.current.forEach((text) => ask(text));
  }, [ask]);

  useEffect(() => {
    (async () => {
      const saved = await getLocal(LANGUAGE_KEY).catch(() => null);
      const start: Language = saved === 'te' || saved === 'hi' ? saved : 'en';
      seen.current = new Set(await readJson<string[]>(SEEN_KEY, []));
      setLanguageState(start);
      await openLanguage(start);
      setReady(true);
    })();
  }, [openLanguage]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    setLocal(LANGUAGE_KEY, next).catch(() => undefined);
    void openLanguage(next);
  }, [openLanguage]);

  // Remembers a text the app has shown, saving the list now and then (not on every screen).
  const noteSeen = useCallback((text: string) => {
    if (seen.current.has(text)) return;
    seen.current.add(text);
    if (seen.current.size > MAX_SEEN) {
      const oldest = seen.current.values().next().value;
      if (oldest !== undefined) seen.current.delete(oldest);
    }
    clearTimeout(seenTimer.current);
    seenTimer.current = setTimeout(() => {
      setLocal(SEEN_KEY, JSON.stringify([...seen.current])).catch(() => undefined);
    }, SAVE_SEEN_MS);
  }, []);

  const t = useCallback<Translate>((english, values) => {
    noteSeen(english);
    if (language === 'en') return fill(english, values);
    const translated = cache[english];
    if (translated === undefined) ask(english);
    return fill(translated ?? english, values);
  }, [language, cache, ask, noteSeen]);

  const value = useMemo(() => ({ language, setLanguage, t, available }), [language, setLanguage, t, available]);

  // Wait the moment it takes to read the saved language, so the app never flashes in the wrong one.
  if (!ready) return null;
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageState {
  return useContext(LanguageContext);
}

export function useT(): Translate {
  return useLanguage().t;
}

// Text that comes from the shop's data (a product name or description), in the shopper's language.
export function useContent(text: string | null | undefined): string {
  const { t } = useLanguage();
  return text ? t(text) : '';
}
