import { Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { RoleGate, stackOptions } from '@/components/nav';
import { ShopProvider } from '@/features/shop/shop-context';
import { Icon } from '@/components/icon';
import { colors } from '@/theme/theme';

function HeaderBack() {
  return (
    <Pressable
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.navigate('/shop');
        }
      }}
      hitSlop={12}
      accessibilityLabel="Back to shop"
      style={{ marginLeft: 16, padding: 4 }}
    >
      <Icon name="arrow-left" size={22} color={colors.text} />
    </Pressable>
  );
}

export default function ShopLayout() {
  return (
    <RoleGate role="customer">
      <ShopProvider>
        <Stack screenOptions={stackOptions}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ title: 'Product', headerLeft: () => <HeaderBack /> }} />
          <Stack.Screen name="checkout" options={{ title: 'Checkout', headerLeft: () => <HeaderBack /> }} />
          <Stack.Screen name="addresses" options={{ title: 'Delivery addresses', headerLeft: () => <HeaderBack /> }} />
          <Stack.Screen name="order/[id]" options={{ title: 'Order', headerLeft: () => <HeaderBack /> }} />
          <Stack.Screen name="store-request" options={{ title: 'Request a store', headerLeft: () => <HeaderBack /> }} />
        </Stack>
      </ShopProvider>
    </RoleGate>
  );
}
