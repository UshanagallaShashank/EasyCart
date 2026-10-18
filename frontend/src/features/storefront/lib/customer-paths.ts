// Every customer page lives under its shop's address: /<shop>/customer/...
// Build those addresses here, so no page ever links to a bare /customer/... path.

function withRedirect(path: string, redirectTo?: string | null): string {
  return redirectTo ? `${path}?redirect=${encodeURIComponent(redirectTo)}` : path;
}

export function customerLoginPath(slug: string, redirectTo?: string | null): string {
  return withRedirect(`/${slug}/customer/login`, redirectTo);
}

export function customerRegisterPath(slug: string, redirectTo?: string | null): string {
  return withRedirect(`/${slug}/customer/register`, redirectTo);
}

export function customerOrdersPath(slug: string): string {
  return `/${slug}/customer/orders`;
}

export function customerOrderPath(slug: string, orderId: string): string {
  return `/${slug}/customer/orders/${orderId}`;
}

export function customerStoreRequestPath(slug: string): string {
  return `/${slug}/customer/store-request`;
}

const LAST_STORE_KEY = 'last_store_slug';

// Remembers the shop being browsed, for this tab and for later visits in this browser.
export function rememberStoreSlug(slug: string): void {
  sessionStorage.setItem(LAST_STORE_KEY, slug);
  localStorage.setItem(LAST_STORE_KEY, slug);
}

// The last shop this visitor opened (this tab first, then earlier visits), or null if they have never opened one.
export function getLastStoreSlug(): string | null {
  return sessionStorage.getItem(LAST_STORE_KEY) ?? localStorage.getItem(LAST_STORE_KEY);
}
