// The sign-in look, grocery-app style: a fresh green top with floating grocery tiles, the logo and a tagline,
// and a white panel rising over it with the page's title and form.
import { type ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './text';
import { Icon, type IconName } from './icon';
import { colors, space } from '@/theme/theme';
import { LanguagePicker } from './language-picker';
import { SoftFields } from './ui';

const FRESH = ['#064e3b', '#047857', '#10b981'] as const;

// Little tiles scattered over the green top. Left positions are in percent so they spread on any screen width.
const TILES: { icon: IconName; bg: string; fg: string; left: `${number}%`; top: number; turn: string }[] = [
  { icon: 'shopping-bag', bg: '#fef3c7', fg: '#d97706', left: '6%', top: 70, turn: '-10deg' },
  { icon: 'heart', bg: '#ffe4e6', fg: '#e11d48', left: '80%', top: 60, turn: '12deg' },
  { icon: 'zap', bg: '#e0f2fe', fg: '#0284c7', left: '84%', top: 170, turn: '-8deg' },
  { icon: 'gift', bg: '#ede9fe', fg: '#7c3aed', left: '4%', top: 180, turn: '9deg' }
];

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={FRESH} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.top} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.head}>
              {TILES.map((tile) => (
                <View key={tile.icon} style={[styles.tile, { left: tile.left, top: tile.top, backgroundColor: tile.bg, transform: [{ rotate: tile.turn }] }]}>
                  <Icon name={tile.icon} size={20} color={tile.fg} />
                </View>
              ))}
              <LanguagePicker compact />
              <View style={styles.logoTile}><Image source={require('../../assets/easy-cart-icon.png')} style={styles.logo} resizeMode="contain" /></View>
              <Text style={styles.tagline}>Groceries & essentials,{'\n'}delivered fast</Text>
              <Text style={styles.taglineSmall}>From the shops in your neighbourhood</Text>
            </View>
            <View style={styles.sheet}>
              <View style={styles.column}>
                <View style={{ gap: 4 }}>
                  <Text style={styles.title}>{title}</Text>
                  <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
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
  top: { position: 'absolute', top: 0, left: 0, right: 0, height: 480 },
  scroll: { flexGrow: 1 },
  head: { alignItems: 'center', gap: 8, paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.xxl * 1.5 },
  tile: { position: 'absolute', width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  logoTile: { width: 76, height: 76, borderRadius: 24, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginTop: space.xl, marginBottom: space.sm, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  logo: { width: 62, height: 54 },
  tagline: { fontSize: 26, lineHeight: 31, fontWeight: '800', letterSpacing: -0.6, color: colors.white, textAlign: 'center' },
  taglineSmall: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  sheet: { flexGrow: 1, backgroundColor: colors.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: space.xl, paddingTop: space.xxl, paddingBottom: space.xxl },
  column: { width: '100%', maxWidth: 440, alignSelf: 'center', gap: space.xl },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted },
  copy: { textAlign: 'center', fontSize: 11, color: colors.textFaint }
});
