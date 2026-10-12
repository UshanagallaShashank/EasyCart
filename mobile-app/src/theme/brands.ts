// The colour themes a shop can pick, plus the fixed looks of the rider and admin areas. A theme changes the brand
// colour (buttons, banner, tab bar, prices) and its multi-colour gradient; the rest of the app keeps calm greys
// and white cards, so every shop still feels like the same easy app.
export type ThemeId = 'sky' | 'emerald' | 'sunset' | 'violet' | 'rose' | 'teal';
export type RoleLookId = 'electric' | 'cosmos';

export interface Brand {
  id: ThemeId | RoleLookId;
  name: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  primaryTint: string;
  // Dark to light in one colour family, for small swatches and buttons.
  gradient: [string, string, string];
  // Several colours blending into each other, for banners and hero cards.
  mesh: [string, string, string, string];
  // The soft coloured shadow under gradient buttons and banners.
  glow: string;
}

export const BRANDS: Record<ThemeId, Brand> = {
  sky: { id: 'sky', name: 'Sky', primary: '#0284c7', primaryDark: '#0369a1', primarySoft: '#f0f9ff', primaryTint: '#e0f2fe', gradient: ['#0369a1', '#0284c7', '#0ea5e9'], mesh: ['#1e40af', '#0284c7', '#06b6d4', '#2dd4bf'], glow: '#0284c7' },
  emerald: { id: 'emerald', name: 'Emerald', primary: '#059669', primaryDark: '#047857', primarySoft: '#ecfdf5', primaryTint: '#d1fae5', gradient: ['#047857', '#059669', '#10b981'], mesh: ['#065f46', '#059669', '#14b8a6', '#84cc16'], glow: '#059669' },
  sunset: { id: 'sunset', name: 'Sunset', primary: '#ea580c', primaryDark: '#c2410c', primarySoft: '#fff7ed', primaryTint: '#ffedd5', gradient: ['#c2410c', '#ea580c', '#f97316'], mesh: ['#be123c', '#ea580c', '#f59e0b', '#facc15'], glow: '#ea580c' },
  violet: { id: 'violet', name: 'Violet', primary: '#7c3aed', primaryDark: '#6d28d9', primarySoft: '#f5f3ff', primaryTint: '#ede9fe', gradient: ['#6d28d9', '#7c3aed', '#8b5cf6'], mesh: ['#4338ca', '#7c3aed', '#c026d3', '#f472b6'], glow: '#7c3aed' },
  rose: { id: 'rose', name: 'Rose', primary: '#e11d48', primaryDark: '#be123c', primarySoft: '#fff1f2', primaryTint: '#ffe4e6', gradient: ['#be123c', '#e11d48', '#f43f5e'], mesh: ['#9d174d', '#e11d48', '#f43f5e', '#fb923c'], glow: '#e11d48' },
  teal: { id: 'teal', name: 'Teal', primary: '#0d9488', primaryDark: '#0f766e', primarySoft: '#f0fdfa', primaryTint: '#ccfbf1', gradient: ['#0f766e', '#0d9488', '#14b8a6'], mesh: ['#134e4a', '#0d9488', '#06b6d4', '#6366f1'], glow: '#0d9488' }
};

// Delivery partners and admins are not in a shop, so each area has its own look and is easy to tell apart.
export const ROLE_LOOKS: Record<RoleLookId, Brand> = {
  electric: { id: 'electric', name: 'Electric', primary: '#4f46e5', primaryDark: '#4338ca', primarySoft: '#eef2ff', primaryTint: '#e0e7ff', gradient: ['#4338ca', '#4f46e5', '#6366f1'], mesh: ['#312e81', '#4f46e5', '#0ea5e9', '#22d3ee'], glow: '#4f46e5' },
  cosmos: { id: 'cosmos', name: 'Cosmos', primary: '#9333ea', primaryDark: '#7e22ce', primarySoft: '#faf5ff', primaryTint: '#f3e8ff', gradient: ['#6b21a8', '#9333ea', '#a855f7'], mesh: ['#1e1b4b', '#6b21a8', '#db2777', '#f59e0b'], glow: '#9333ea' }
};

export const THEME_IDS = Object.keys(BRANDS) as ThemeId[];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && value in BRANDS;
}

// "#0284c7" with 0.9 becomes "rgba(2,132,199,0.9)", for colour laid over a photo.
export function withAlpha(hex: string, alpha: number): string {
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  return `rgba(${red},${green},${blue},${alpha})`;
}
