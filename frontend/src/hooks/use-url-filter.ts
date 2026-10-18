// Keeps one list filter in the URL (?key=value) so sidebar sub-links, reloads, and back/forward all agree.
import { useSearchParams } from 'react-router-dom';

export function useUrlFilter<T extends string>(key: string, allowed: readonly T[], fallback: T): [T, (next: T) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get(key) as T | null;
  const value = raw && allowed.includes(raw) ? raw : fallback;

  function set_value(next: T) {
    const updated = new URLSearchParams(params);
    if (next === fallback) updated.delete(key);
    else updated.set(key, next);
    setParams(updated, { replace: true });
  }

  return [value, set_value];
}
