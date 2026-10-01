// Tailwind classes for each admin menu color: icon tile, active gradient, and sub-entry dot.
export const MENU_COLORS: Record<string, { tile: string; active: string; dot: string }> = {
  violet: { tile: 'bg-violet-100 text-violet-600', active: 'from-violet-500 to-fuchsia-500', dot: 'bg-violet-500' },
  sky: { tile: 'bg-sky-100 text-sky-600', active: 'from-sky-500 to-cyan-500', dot: 'bg-sky-500' },
  pink: { tile: 'bg-pink-100 text-pink-600', active: 'from-pink-500 to-rose-500', dot: 'bg-pink-500' },
  amber: { tile: 'bg-amber-100 text-amber-600', active: 'from-amber-500 to-orange-500', dot: 'bg-amber-500' }
};
