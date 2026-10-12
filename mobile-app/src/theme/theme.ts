// The app's look in one place: white pages, soft grey-filled cards with no borders or heavy shadows,
// and the shop's colour for the things you act on. Every screen uses these tokens.
export const colors = {
  bg: '#ffffff', // the page
  card: '#f5f6fa', // soft fill that sets a card apart from the page
  border: '#e6e8f0', // inputs and outline buttons
  cardBorder: '#f5f6fa', // same as the card, so cards have no visible edge
  borderSoft: '#eceef4', // dividers inside cards
  text: '#0f1222',
  textSoft: '#383e56',
  textMuted: '#6a7086',
  textFaint: '#a1a6b8',
  primary: '#0284c7', // sky-600
  primaryDark: '#0369a1', // sky-700
  primarySoft: '#f0f9ff', // sky-50
  primaryTint: '#e0f2fe', // sky-100
  success: '#059669', // emerald-600
  successSoft: '#ecfdf5',
  warning: '#b45309', // amber-700
  warningSoft: '#fffbeb',
  danger: '#e11d48', // rose-600
  dangerSoft: '#fff1f2',
  white: '#ffffff',
  ink: '#11131f' // the floating tab bar
} as const;

// Supporting colours for icon bubbles, category tiles and menus. Each is a strong colour (fg) on its soft tint (bg).
export const accents = {
  sky: { fg: '#0284c7', bg: '#e0f2fe', grad: ['#38bdf8', '#6366f1'] as [string, string] },
  green: { fg: '#059669', bg: '#d1fae5', grad: ['#34d399', '#06b6d4'] as [string, string] },
  amber: { fg: '#d97706', bg: '#fef3c7', grad: ['#fbbf24', '#f97316'] as [string, string] },
  violet: { fg: '#7c3aed', bg: '#ede9fe', grad: ['#a78bfa', '#ec4899'] as [string, string] },
  rose: { fg: '#e11d48', bg: '#ffe4e6', grad: ['#fb7185', '#f97316'] as [string, string] },
  orange: { fg: '#ea580c', bg: '#ffedd5', grad: ['#fb923c', '#f43f5e'] as [string, string] },
  pink: { fg: '#db2777', bg: '#fce7f3', grad: ['#f472b6', '#8b5cf6'] as [string, string] },
  teal: { fg: '#0d9488', bg: '#ccfbf1', grad: ['#2dd4bf', '#3b82f6'] as [string, string] }
} as const;

// Handy when a list needs one colour per row: accentAt(index) cycles through them.
const ACCENT_LIST = Object.values(accents);
export const accentAt = (index: number) => ACCENT_LIST[index % ACCENT_LIST.length];

// Icons use these sizes only, so they look the same on every screen.
export const iconSize = { xs: 14, sm: 16, md: 18, lg: 20, xl: 24 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;
export const radius = { sm: 12, md: 16, lg: 20, xl: 26, pill: 999 } as const;

export const text = {
  title: { fontSize: 28, fontWeight: '800' as const, color: colors.text, letterSpacing: -0.8 },
  heading: { fontSize: 16, fontWeight: '700' as const, color: colors.text, letterSpacing: -0.3 },
  body: { fontSize: 14, color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted },
  small: { fontSize: 12, color: colors.textMuted },
  label: { fontSize: 11, fontWeight: '700' as const, color: colors.textFaint, letterSpacing: 0.6, textTransform: 'uppercase' as const }
};

// Cards are told apart by their fill, so the everyday shadow is barely there.
export const shadow = {
  shadowColor: '#1e2a55',
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 0 },
  elevation: 0
} as const;

// A coloured glow under gradient buttons and banners, e.g. glow(brand.glow).
export function glow(color: string) {
  return { shadowColor: color, shadowOpacity: 0.32, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 } as const;
}

export type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary';

export const toneColors: Record<Tone, { fg: string; bg: string }> = {
  success: { fg: colors.success, bg: colors.successSoft },
  warning: { fg: colors.warning, bg: colors.warningSoft },
  danger: { fg: colors.danger, bg: colors.dangerSoft },
  neutral: { fg: '#334155', bg: colors.borderSoft },
  primary: { fg: colors.primaryDark, bg: colors.primaryTint }
};
