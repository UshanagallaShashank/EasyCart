// Shared navigation styling (white header, sky accents) and the guard that keeps each role in its own area.
import { type ReactNode } from 'react';
import { Pressable, type ColorValue } from 'react-native';
import { Redirect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme/theme';
import { homeForRole, useSession } from '@/lib/session';
import { useLiveUpdates } from '@/lib/live';
import type { Role } from '@/types/catalog';
import { Loading, type IconName } from './ui';

export const stackOptions = {
  headerStyle: { backgroundColor: colors.card },
  headerShadowVisible: false,
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.text, fontWeight: '700' as const, fontSize: 17 },
  contentStyle: { backgroundColor: colors.bg },
  headerBackButtonDisplayMode: 'minimal' as const
};

export const tabOptions = {
  ...stackOptions,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const, lineHeight: 15 },
  // A little room under the labels for phones without a home-bar gap.
  tabBarItemStyle: { paddingTop: 4, paddingBottom: 6 },
  sceneStyle: { backgroundColor: colors.bg }
};

export function tabIcon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => <Feather name={name} size={size - 2} color={color as string} />;
}

export function SignOutButton() {
  const { signOut } = useSession();
  return (
    <Pressable onPress={() => void signOut()} accessibilityLabel="Log out" hitSlop={10} style={{ paddingHorizontal: 16 }}>
      <Feather name="log-out" size={20} color={colors.textMuted} />
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
