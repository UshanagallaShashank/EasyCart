// "More" for the admin: the rest of the website's admin pages, plus the account and log out.
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/text';
import { Icon, type IconName } from '@/components/icon';
import { Avatar, Button, Screen, SectionTitle } from '@/components/ui';
import { useSession } from '@/lib/session';
import { colors, radius, shadow, space, text } from '@/theme/theme';

const ITEMS: { icon: IconName; title: string; subtitle: string; href: '/admin/users' | '/admin/sales' | '/admin/growth'; fg: string; bg: string }[] = [
  { icon: 'users', title: 'Users', subtitle: 'Store owners, customers, delivery partners, admins', href: '/admin/users', fg: '#7c3aed', bg: '#ede9fe' },
  { icon: 'dollar-sign', title: 'Sales', subtitle: 'Orders and revenue, day by day', href: '/admin/sales', fg: '#059669', bg: '#d1fae5' },
  { icon: 'sparkles', title: 'Growth', subtitle: 'New stores and people joining', href: '/admin/growth', fg: '#d97706', bg: '#fef3c7' }
];

export default function AdminMore() {
  const { user, signOut } = useSession();
  return (
    <Screen>
      <View style={styles.account}>
        <Avatar name={user?.username ?? '?'} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={text.heading} numberOfLines={1}>{user?.username}</Text>
          <Text style={text.small} numberOfLines={1}>{user?.email} · Platform admin</Text>
        </View>
      </View>

      <SectionTitle>Insights and people</SectionTitle>
      {ITEMS.map((item) => (
        <Pressable key={item.href} accessibilityRole="button" onPress={() => router.push(item.href)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
          <View style={[styles.icon, { backgroundColor: item.bg }]}><Icon name={item.icon} size={20} color={item.fg} /></View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={text.small}>{item.subtitle}</Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.textFaint} />
        </Pressable>
      ))}

      <Button variant="danger" icon="log-out" label="Log out" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  account: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: '#e8edf3', padding: space.lg, ...shadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: '#e8edf3', padding: space.lg, ...shadow },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: colors.text }
});
