// The shop the customer is browsing and their cart for it. Both are remembered on the phone.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { getLocal as getItem, setLocal as setItem } from '@/lib/storage';
import type { MyLocation } from '@/lib/location';

export interface CartLine {
  product_id: string;
  variant_label?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  max: number;
}

interface ShopState {
  slug: string;
  setSlug(slug: string): void;
  lines: CartLine[];
  count: number;
  subtotal: number;
  add(line: CartLine): void;
  setQuantity(product_id: string, variant_label: string | undefined, quantity: number): void;
  clear(): void;
  favourites: string[];
  toggleFavourite(product_id: string): void;
  recent: string[];
  markViewed(product_id: string): void;
  location: MyLocation | null;
  setLocation(next: MyLocation): void;
}

const DEFAULT_STORE = process.env.EXPO_PUBLIC_DEFAULT_STORE ?? 'green-leaf-market';
const SLUG_KEY = 'easycart.shop';
const cartKey = (slug: string) => `easycart.cart.${slug}`;
const favouritesKey = (slug: string) => `easycart.favourites.${slug}`;
const recentKey = (slug: string) => `easycart.recent.${slug}`;
const RECENT_LIMIT = 10;
const LOCATION_KEY = 'easycart.location';
const same = (line: CartLine, id: string, variant?: string) => line.product_id === id && (line.variant_label ?? '') === (variant ?? '');

// Shows in the Expo terminal while developing.
function log(message: string) {
  if (__DEV__) console.log(`[cart] ${message}`);
}

// Favourites kept on the phone, merged with the server's list when the server answers.
async function loadFavourites(slug: string): Promise<string[]> {
  let onPhone: string[] = [];
  try {
    const raw = await getItem(favouritesKey(slug));
    onPhone = raw ? JSON.parse(raw) : [];
  } catch {
    onPhone = [];
  }

  try {
    const { product_ids } = await api<{ product_ids: string[] }>(`/stores/${slug}/favourites`);
    const merged = [...new Set([...product_ids, ...onPhone])];
    // Favourites saved before the server knew about them get sent up now.
    const missingOnServer = onPhone.filter((id) => !product_ids.includes(id));
    missingOnServer.forEach((id) => api(`/stores/${slug}/favourites/${id}`, { method: 'PUT' }).catch(() => undefined));
    void setItem(favouritesKey(slug), JSON.stringify(merged)).catch(() => undefined);
    return merged;
  } catch (err) {
    log(`favourites: using the phone copy (${String(err)})`);
    return onPhone;
  }
}

const ShopContext = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [slug, setSlugState] = useState(DEFAULT_STORE);
  const [lines, setLines] = useState<CartLine[]>([]);
  // The newest cart, readable at any moment. The cart buttons use it so they never need to be rebuilt, which keeps product cards from redrawing.
  const linesRef = useRef<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [location, setLocationState] = useState<MyLocation | null>(null);

  useEffect(() => {
    getItem(SLUG_KEY).then((saved) => saved && setSlugState(saved)).finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    getItem(cartKey(slug))
      .then((raw) => {
        const saved = raw ? JSON.parse(raw) : [];
        log(`loaded ${saved.length} saved line(s) for shop "${slug}"`);
        linesRef.current = saved;
        setLines(saved);
      })
      .catch((err) => { log(`could not read the saved cart: ${String(err)}`); linesRef.current = []; setLines([]); });
  }, [slug, loaded]);

  // Where the customer is does not depend on which shop is open, so it is loaded once.
  useEffect(() => {
    getItem(LOCATION_KEY).then((raw) => raw && setLocationState(JSON.parse(raw))).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    loadFavourites(slug).then(setFavourites);
    getItem(recentKey(slug)).then((raw) => setRecent(raw ? JSON.parse(raw) : [])).catch(() => setRecent([]));
  }, [slug, loaded]);

  const save = useCallback((next: CartLine[]) => {
    linesRef.current = next;
    setLines(next);
    log(`cart for "${slug}" now has ${next.length} line(s), ${next.reduce((sum, line) => sum + line.quantity, 0)} item(s)`);
    // The phone's secure storage has a size limit, so a failure here is logged instead of lost.
    setItem(cartKey(slug), JSON.stringify(next)).catch((err) => log(`could not save the cart: ${String(err)}`));
  }, [slug]);

  const add = useCallback((line: CartLine) => {
    log(`add ${line.name}${line.variant_label ? ` (${line.variant_label})` : ''} x${line.quantity}, max ${line.max}`);
    const current = linesRef.current;
    const existing = current.find((l) => same(l, line.product_id, line.variant_label));
    save(existing
      ? current.map((l) => (l === existing ? { ...l, quantity: Math.min(l.max, l.quantity + line.quantity) } : l))
      : [...current, line]);
  }, [save]);

  const setQuantity = useCallback((id: string, variant: string | undefined, quantity: number) => {
    const current = linesRef.current;
    save(quantity <= 0 ? current.filter((l) => !same(l, id, variant)) : current.map((l) => (same(l, id, variant) ? { ...l, quantity: Math.min(l.max, quantity) } : l)));
  }, [save]);

  const clear = useCallback(() => save([]), [save]);

  const value = useMemo<ShopState>(() => ({
    slug,
    setSlug: (next) => {
      const clean = next.trim().toLowerCase();
      setSlugState(clean);
      void setItem(SLUG_KEY, clean);
    },
    lines,
    count: lines.length,
    subtotal: lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
    add,
    setQuantity,
    clear,
    location,
    setLocation: (next) => {
      setLocationState(next);
      setItem(LOCATION_KEY, JSON.stringify(next)).catch(() => undefined);
    },
    recent,
    markViewed: (product_id) => {
      // Newest first, no repeats, and only the last few are kept.
      const next = [product_id, ...recent.filter((id) => id !== product_id)].slice(0, RECENT_LIMIT);
      if (next.join() === recent.join()) return;
      setRecent(next);
      setItem(recentKey(slug), JSON.stringify(next)).catch(() => undefined);
    },
    favourites,
    toggleFavourite: (product_id) => {
      const next = favourites.includes(product_id) ? favourites.filter((id) => id !== product_id) : [...favourites, product_id];
      setFavourites(next);
      setItem(favouritesKey(slug), JSON.stringify(next)).catch(() => undefined);
      // Also tell the server so the list follows the customer to other phones. If it fails, the phone copy still works.
      const path = `/stores/${slug}/favourites/${product_id}`;
      api(path, { method: favourites.includes(product_id) ? 'DELETE' : 'PUT' }).catch((err) => log(`could not sync favourite: ${String(err)}`));
    }
  }), [slug, lines, add, setQuantity, clear, favourites, recent, location]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside ShopProvider');
  return ctx;
}
