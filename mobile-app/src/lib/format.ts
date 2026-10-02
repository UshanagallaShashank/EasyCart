// Display helpers shared by every screen.
const PRICE = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function price(value: number | null | undefined) {
  return `Rs. ${PRICE.format(Number(value ?? 0))}`;
}

export function shortId(id: string) {
  return `#${id.slice(0, 8)}`;
}

export function dateTime(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export function date(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function distance(km: number | null | undefined) {
  if (km === null || km === undefined) return 'Distance unknown';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function label(value: string) {
  const text = value.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
