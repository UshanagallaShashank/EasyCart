import { Pressable, View } from 'react-native';
import { Tabs, router } from 'expo-router';
import { BrandTitle, useTabOptions } from '@/components/nav';
import { ProfileMenu } from '@/components/profile-menu';
import { NotificationButton } from '@/components/notification-button';
import { Icon } from '@/components/icon';
import { useShop } from '@/features/shop/shop-context';
import { useStore } from '@/features/shop/shop-api';
import { colors } from '@/theme/theme';

function HeaderBack() {
  return (
    <Pressable
      onPress={() => router.navigate('/shop')}
      hitSlop={12}
      accessibilityLabel="Back to shop"
      style={{ marginLeft: 16, padding: 4 }}
    >
      <Icon name="arrow-left" size={22} color={colors.text} />
    </Pressable>
  );
}

function HeaderRightActions() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 16 }}>
      <NotificationButton />
      <ProfileMenu />
    </View>
  );
}

export default function ShopTabs() {
  const tabOptions = useTabOptions();
  const { slug } = useShop();
  const store = useStore(slug);

  return (
    <Tabs
      screenOptions={{
        ...tabOptions,
        tabBarStyle: { display: 'none' },
        headerRight: () => <HeaderRightActions />
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop',
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          headerLeft: () => <HeaderBack />
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'My orders',
          headerLeft: () => <HeaderBack />
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          headerLeft: () => <HeaderBack />
        }}
      />
    </Tabs>
  );
}
