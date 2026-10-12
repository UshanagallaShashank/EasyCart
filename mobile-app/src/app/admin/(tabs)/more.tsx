// "More" for the admin: the rest of the website's admin pages as one grouped menu, plus the account and log out.
import { router } from 'expo-router';
import { Button, Screen, SectionTitle } from '@/components/ui';
import { AccountCard, MenuList, type MenuItem } from '@/components/menu-list';
import { useSession } from '@/lib/session';
import { useConfirmedSignOut } from '@/components/confirm';
import { accents } from '@/theme/theme';

const MONEY: MenuItem[] = [
  { icon: 'wallet', title: 'Earnings', subtitle: 'Commission, rider pay and what each shop owes', color: accents.green.fg, onPress: () => router.push('/admin/earnings') },
  { icon: 'dollar-sign', title: 'Sales', subtitle: 'Orders and revenue, day by day', color: accents.teal.fg, onPress: () => router.push('/admin/sales') },
  { icon: 'rotate-ccw', title: 'Refunds', subtitle: 'Money-back requests across all shops', color: accents.rose.fg, onPress: () => router.push('/admin/refunds') }
];

const PLATFORM: MenuItem[] = [
  { icon: 'users', title: 'Users', subtitle: 'Store owners, customers, delivery partners, admins', color: accents.violet.fg, onPress: () => router.push('/admin/users') },
  { icon: 'sparkles', title: 'Growth', subtitle: 'New stores and people joining', color: accents.amber.fg, onPress: () => router.push('/admin/growth') },
  { icon: 'sparkles', title: 'Shop themes', subtitle: 'Colours owners can pick for their shop', color: accents.pink.fg, onPress: () => router.push('/admin/themes') },
  { icon: 'activity', title: 'System status', subtitle: 'Server uptime, answer time and outages', color: accents.sky.fg, onPress: () => router.push('/admin/status') }
];

export default function AdminMore() {
  const { user } = useSession();
  const logout = useConfirmedSignOut();
  return (
    <Screen>
      <AccountCard name={user?.username ?? '?'} detail={`${user?.email ?? ''} · Platform admin`} />
      <SectionTitle>Money</SectionTitle>
      <MenuList items={MONEY} />
      <SectionTitle>Platform</SectionTitle>
      <MenuList items={PLATFORM} />
      <Button variant="danger" icon="log-out" label="Log out" onPress={() => void logout()} />
    </Screen>
  );
}
