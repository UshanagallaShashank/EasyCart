// The web app's look in one place: sky accents on slate, soft rounded cards. Every screen uses these tokens.
export const colors = {
  bg: '#f8fafc', // slate-50
  card: '#ffffff',
  border: '#e2e8f0', // slate-200
  borderSoft: '#f1f5f9', // slate-100
  text: '#0f172a', // slate-900
  textSoft: '#334155', // slate-700
  textMuted: '#64748b', // slate-500
  textFaint: '#94a3b8', // slate-400
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
  white: '#ffffff'
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;
export const radius = { sm: 10, md: 14, lg: 20, xl: 24, pill: 999 } as const;

export const text = {
  title: { fontSize: 26, fontWeight: '900' as const, color: colors.text, letterSpacing: -0.7 },
  heading: { fontSize: 16, fontWeight: '700' as const, color: colors.text, letterSpacing: -0.2 },
  body: { fontSize: 14, color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted },
  small: { fontSize: 12, color: colors.textMuted },
  label: { fontSize: 11, fontWeight: '700' as const, color: colors.textFaint, letterSpacing: 0.6, textTransform: 'uppercase' as const }
};

export const shadow = {
  shadowColor: '#0f172a',
  shadowOpacity: 0.06,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2
} as const;

export type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary';

export const toneColors: Record<Tone, { fg: string; bg: string }> = {
  success: { fg: colors.success, bg: colors.successSoft },
  warning: { fg: colors.warning, bg: colors.warningSoft },
  danger: { fg: colors.danger, bg: colors.dangerSoft },
  neutral: { fg: '#334155', bg: colors.borderSoft },
  primary: { fg: colors.primaryDark, bg: colors.primaryTint }
};
