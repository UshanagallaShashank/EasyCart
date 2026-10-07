// Shared navigation styling (white header with the EasyCart logo, sky accents) and the guard that keeps each role in its own area.
import { type ReactNode } from 'react';
import { Image, Pressable, View, type ColorValue } from 'react-native';
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/theme';
import { homeForRole, useSession } from '@/lib/session';
import { useLiveUpdates } from '@/lib/live';
import type { Role } from '@/types/catalog';
import { Icon, type IconName } from './icon';
import { Text } from './text';
import { Loading } from './ui';

export const stackOptions = {
  headerStyle: { backgroundColor: colors.card },
  headerShadowVisible: false,
  headerTintColor: colors.text,
  headerTitleStyle: { color: colors.text, fontFamily: 'Inter_700Bold', fontSize: 17 },
  contentStyle: { backgroundColor: colors.bg },
  headerBackButtonDisplayMode: 'minimal' as const
};

// Logo + page name, matching specs: Logo 30px, Brand text 20px, slim header height 48px.
export function BrandTitle({ children }: { children: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 48 }}>
      <Image source={require('../../assets/logo-mark.png')} style={{ width: 30, height: 30 }} resizeMode="contain" />
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.4 }} numberOfLines={1}>{children}</Text>
    </View>
  );
}

// Bottom tabs sized for the phone's home-bar area so labels are never cut off.
export function useTabOptions() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);
  return {
    ...stackOptions,
    headerTitleAlign: 'left' as const,
    headerTitle: ({ children }: { children: string }) => <BrandTitle>{children}</BrandTitle>,
    headerStyle: { backgroundColor: colors.card, height: 48, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textFaint,
    tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 64 + bottom, paddingTop: 6, paddingBottom: bottom },
    tabBarLabelStyle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', lineHeight: 16, marginTop: 2 },
    sceneStyle: { backgroundColor: colors.bg }
  };
}

export function tabIcon(name: IconName) {
  return ({ color, focused }: { color: ColorValue; focused: boolean; size: number }) => (
    <View style={{ paddingHorizontal: 14, paddingVertical: 2, borderRadius: 999, backgroundColor: focused ? colors.primarySoft : 'transparent' }}>
      <Icon name={name} size={21} color={color} strokeWidth={focused ? 2.3 : 2} />
    </View>
  );
}

export function SignOutButton() {
  const { signOut } = useSession();
  return (
    <Pressable onPress={() => void signOut()} accessibilityLabel="Log out" hitSlop={10} style={{ marginRight: 16, width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="log-out" size={17} color={colors.textMuted} />
    </Pressable>
  );
}

// Only the given role may open this area; anyone else goes to their own home (or to sign in).
export function RoleGate({ role, children }: { role: Role; children: ReactNode }) {
  const { user, isReady } = useSession();
  useLiveUpdates(Boolean(user && user.role === role));
  if (!isReady) return <Loading />;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== role) return <Redirect href={homeForRole(user.role)} />;
  return <>{children}</>;
}
