// Translates words that come from the shop's data (product names, descriptions) when the app is in Telugu or Hindi.
// The server translates each text once and remembers it; the phone remembers it too, so it appears instantly next time.
// If the server has no translation service set up, texts just stay as the shop typed them.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api } from './api';
import { useLanguage, type Language } from './i18n';
import { getLocal, setLocal } from './storage';

const BATCH_SIZE = 30;
const WAIT_MS = 150;
const storageKey = (language: Language) => `easycart.content.${language}`;

interface ContentState {
  language: Language;
  cache: Record<string, string>;
  ask(text: string): void;
}

const ContentContext = createContext<ContentState>({ language: 'en', cache: {}, ask: () => undefined });

export function ContentTranslationProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [cache, setCache] = useState<Record<string, string>>({});
  const asked = useRef(new Set<string>());
  const pending = useRef(new Set<string>());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Set when the server says it has no translation service, so we stop asking for the rest of the session.
  const serverCannot = useRef(false);

  // Switching language starts from what this phone already remembers for it.
  useEffect(() => {
    asked.current = new Set();
    pending.current = new Set();
    serverCannot.current = false;
    setCache({});
    if (language === 'en') return;
    getLocal(storageKey(language))
      .then((raw) => {
        const saved = raw ? (JSON.parse(raw) as Record<string, string>) : {};
        Object.keys(saved).forEach((text) => asked.current.add(text));
        setCache(saved);
      })
      .catch(() => undefined);
  }, [language]);

  const flush = useCallback(async () => {
    const texts = [...pending.current].slice(0, BATCH_SIZE);
    texts.forEach((text) => pending.current.delete(text));
    if (texts.length === 0 || language === 'en' || serverCannot.current) return;
    try {
      const result = await api<{ translations: string[]; enabled: boolean }>('/translate', { method: 'POST', body: { language, texts } });
      if (!result.enabled) {
        serverCannot.current = true;
        return;
      }
      setCache((current) => {
        const next = { ...current };
        texts.forEach((text, index) => { next[text] = result.translations[index] ?? text; });
        setLocal(storageKey(language), JSON.stringify(next)).catch(() => undefined);
        return next;
      });
    } catch {
      // Not signed in, offline or the service is down: the original text stays on screen.
    }
    if (pending.current.size > 0) timer.current = setTimeout(() => void flush(), WAIT_MS);
  }, [language]);

  const ask = useCallback((text: string) => {
    if (language === 'en' || serverCannot.current || asked.current.has(text)) return;
    asked.current.add(text);
    pending.current.add(text);
    clearTimeout(timer.current);
    // Many texts appear together (a whole product list), so they are sent in one request.
    timer.current = setTimeout(() => void flush(), WAIT_MS);
  }, [language, flush]);

  const value = useMemo(() => ({ language, cache, ask }), [language, cache, ask]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

// Use it where data text is shown:  const name = useContent(product.name);
export function useContent(text: string | null | undefined): string {
  const { language, cache, ask } = useContext(ContentContext);
  useEffect(() => {
    if (text) ask(text);
  }, [text, ask]);
  if (!text) return '';
  return language === 'en' ? text : cache[text] ?? text;
}
