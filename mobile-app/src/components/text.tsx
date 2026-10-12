// Text in the app's font (Plus Jakarta Sans). Custom fonts ignore fontWeight on Android, so the weight picks the matching font file.
import { StyleSheet, Text as NativeText, TextInput as NativeTextInput, type TextInputProps, type TextProps, type TextStyle } from 'react-native';
import { forwardRef } from 'react';
import { useT } from '@/lib/i18n';

const FONT: Record<string, string> = {
  '400': 'PlusJakartaSans_400Regular',
  normal: 'PlusJakartaSans_400Regular',
  '500': 'PlusJakartaSans_500Medium',
  '600': 'PlusJakartaSans_600SemiBold',
  '700': 'PlusJakartaSans_700Bold',
  bold: 'PlusJakartaSans_700Bold',
  '800': 'PlusJakartaSans_800ExtraBold',
  '900': 'PlusJakartaSans_800ExtraBold'
};

export function inter(style: TextProps['style']): TextStyle | undefined {
  const flat = StyleSheet.flatten(style) ?? {};
  if (flat.fontFamily) return undefined; // e.g. monospace codes keep their own font
  return { fontFamily: FONT[String(flat.fontWeight ?? '400')] ?? FONT['400'], fontWeight: 'normal' };
}

// A plain string child is looked up in the translation table; anything not in it shows as written.
export function Text({ style, children, ...props }: TextProps) {
  const t = useT();
  return <NativeText {...props} style={[style, inter(style)]}>{typeof children === 'string' ? t(children) : children}</NativeText>;
}

export const TextInput = forwardRef<NativeTextInput, TextInputProps>(function TextInput({ style, placeholder, ...props }, ref) {
  const t = useT();
  return <NativeTextInput ref={ref} {...props} placeholder={placeholder === undefined ? undefined : t(placeholder)} style={[style, inter(style)]} />;
});
