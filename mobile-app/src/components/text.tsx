// Text in the website's font (Inter). Custom fonts ignore fontWeight on Android, so the weight picks the matching Inter file.
import { StyleSheet, Text as NativeText, TextInput as NativeTextInput, type TextInputProps, type TextProps, type TextStyle } from 'react-native';
import { forwardRef } from 'react';
import { useT } from '@/lib/i18n';

const INTER: Record<string, string> = {
  '400': 'Inter_400Regular',
  normal: 'Inter_400Regular',
  '500': 'Inter_500Medium',
  '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold',
  bold: 'Inter_700Bold',
  '800': 'Inter_800ExtraBold',
  '900': 'Inter_900Black'
};

export function inter(style: TextProps['style']): TextStyle | undefined {
  const flat = StyleSheet.flatten(style) ?? {};
  if (flat.fontFamily) return undefined; // e.g. monospace codes keep their own font
  return { fontFamily: INTER[String(flat.fontWeight ?? '400')] ?? INTER['400'], fontWeight: 'normal' };
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
