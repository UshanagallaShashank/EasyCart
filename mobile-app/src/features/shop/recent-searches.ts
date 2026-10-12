// The last few things this shopper searched for, kept on the phone so the search panel can offer them again.
import { useCallback, useEffect, useState } from 'react';
import { getLocal, setLocal } from '@/lib/storage';

const KEY = 'recent-searches';
const MAX_RECENT = 6;

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    getLocal(KEY).then((saved) => setRecent(saved ? JSON.parse(saved) : [])).catch(() => undefined);
  }, []);

  const remember = useCallback((words: string) => {
    const clean = words.trim();
    if (clean.length < 2) return;
    setRecent((current) => {
      const next = [clean, ...current.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, MAX_RECENT);
      void setLocal(KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    void setLocal(KEY, '[]').catch(() => undefined);
  }, []);

  return { recent, remember, clear };
}
