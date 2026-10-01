// Round initial badge for a customer, tinted consistently from their id.
const TINTS = ['bg-sky-100 text-sky-700', 'bg-violet-100 text-violet-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-800', 'bg-rose-100 text-rose-700'];

export function CustomerAvatar({ id, name }: { id: string; name: string }) {
  const tint = TINTS[[...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TINTS.length];
  return <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${tint}`}>{name.charAt(0).toUpperCase()}</span>;
}
