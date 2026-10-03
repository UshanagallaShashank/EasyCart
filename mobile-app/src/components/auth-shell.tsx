// The website's sign-in look: a floating white card on a soft sky background.
import { type ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, space } from '@/theme/theme';

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.blobTop} />
          <View style={styles.blobBottom} />
          <View style={styles.card}>
            <View style={styles.logoTile}><Image source={require('../../assets/easy-cart-icon.png')} style={styles.logo} resizeMode="contain" /></View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={{ gap: space.md, marginTop: space.sm }}>{children}</View>
          </View>
          {footer && <View style={{ marginTop: space.lg, alignItems: 'center', gap: space.sm }}>{footer}</View>}
          <Text style={styles.copy}>EasyCart © 2026</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef7fd' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: space.xl, overflow: 'hidden' },
  blobTop: { position: 'absolute', top: -80, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: '#bae6fd', opacity: 0.45 },
  blobBottom: { position: 'absolute', bottom: -60, left: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: '#e0f2fe', opacity: 0.8 },
  card: { width: '100%', maxWidth: 400, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 24, borderWidth: 1, borderColor: colors.white, padding: space.xxl, shadowColor: '#0284c7', shadowOpacity: 0.15, shadowRadius: 30, shadowOffset: { width: 0, height: 16 }, elevation: 4 },
  logoTile: { width: 104, height: 92, alignSelf: 'center', marginBottom: space.md, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#0284c7', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  logo: { width: 90, height: 74 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  copy: { textAlign: 'center', fontSize: 11, color: colors.textFaint, marginTop: space.xl, borderRadius: radius.sm }
});
