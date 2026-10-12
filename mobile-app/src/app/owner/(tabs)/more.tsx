// "More": everything else the website's dashboard has, as one grouped menu, plus the account and log out.
import { router } from 'expo-router';
import { Button, Screen, SectionTitle } from '@/components/ui';
import { AccountCard, MenuList, type MenuItem } from '@/components/menu-list';
import { useSession } from '@/lib/session';
import { useConfirmedSignOut } from '@/components/confirm';
import { accents } from '@/theme/theme';

const ITEMS: MenuItem[] = [
  { icon: 'wallet', title: 'Earnings', subtitle: 'What you keep after the platform fee', color: accents.green.fg, onPress: () => router.push('/owner/earnings') },
  { icon: 'rotate-ccw', title: 'Refunds', subtitle: 'Money-back requests from customers', color: accents.rose.fg, onPress: () => router.push('/owner/refunds') },
  { icon: 'users', title: 'Customers', subtitle: 'Who has ordered, and how much', color: accents.violet.fg, onPress: () => router.push('/owner/customers') },
  { icon: 'ticket', title: 'Coupons', subtitle: 'Discount codes for your shoppers', color: accents.amber.fg, onPress: () => router.push('/owner/coupons') },
  { icon: 'tags', title: 'Categories', subtitle: 'Group your products', color: accents.sky.fg, onPress: () => router.push('/owner/categories') },
  { icon: 'store', title: 'Store settings', subtitle: 'Name, delivery fee, announcement, publish', color: accents.teal.fg, onPress: () => router.push('/owner/store-settings') }
];

export default function OwnerMore() {
  const { user } = useSession();
  const logout = useConfirmedSignOut();
  return (
    <Screen>
      <AccountCard name={user?.username ?? '?'} detail={user?.email ?? ''} />
      <SectionTitle>Manage your store</SectionTitle>
      <MenuList items={ITEMS} />
      <Button variant="danger" icon="log-out" label="Log out" onPress={() => void logout()} />
    </Screen>
  );
}
