// The sign-in look: a colourful gradient top with the logo and title, and a white panel rising over it with the form.
import { type ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './text';
import { colors, space } from '@/theme/theme';
import { LanguagePicker } from './language-picker';
import { SoftFields } from './ui';

const AURORA = ['#312e81', '#4f46e5', '#0284c7', '#06b6d4'] as const;

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={AURORA} locations={[0, 0.35, 0.7, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.top} />
      <View style={styles.glow} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.head}>
              <View style={styles.logoTile}><Image source={require('../../assets/easy-cart-icon.png')} style={styles.logo} resizeMode="contain" /></View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
              <View style={{ marginTop: space.lg }}><LanguagePicker compact /></View>
            </View>
            <View style={styles.sheet}>
              <View style={styles.column}>
                <SoftFields><View style={{ gap: space.md }}>{children}</View></SoftFields>
                {footer && <View style={{ alignItems: 'center', gap: space.sm }}>{footer}</View>}
                <Text style={styles.copy}>EasyCart © 2026</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },
  glow: { position: 'absolute', top: -80, right: -60, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.12)' },
  scroll: { flexGrow: 1 },
  head: { alignItems: 'center', gap: 6, paddingHorizontal: space.xl, paddingTop: space.xxl, paddingBottom: space.xxl * 1.5 },
  logoTile: { width: 84, height: 84, borderRadius: 26, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: space.md, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  logo: { width: 70, height: 60 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6, color: colors.white, textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  sheet: { flexGrow: 1, backgroundColor: colors.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: space.xl, paddingTop: space.xxl, paddingBottom: space.xxl },
  column: { width: '100%', maxWidth: 440, alignSelf: 'center', gap: space.xl },
  copy: { textAlign: 'center', fontSize: 11, color: colors.textFaint }
});
