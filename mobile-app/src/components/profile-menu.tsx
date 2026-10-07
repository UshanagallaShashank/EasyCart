import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { Avatar } from '@/components/ui';
import { useSession } from '@/lib/session';
import { useShop } from '@/features/shop/shop-context';
import { colors, radius, shadow } from '@/theme/theme';

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useSession();
  const { count } = useShop();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel="Open profile menu"
        hitSlop={8}
        style={styles.trigger}
      >
        <Avatar name={user?.username ?? 'U'} size={34} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.menuCard, { top: insets.top + 48 }]}>
            {/* User name & email */}
            <View style={styles.userHeader}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.username ?? 'Customer'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email ?? ''}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* View profile */}
            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={() => {
                setOpen(false);
                router.navigate('/shop/account');
              }}
            >
              <Icon name="user" size={17} color="#0ea5e9" />
              <Text style={styles.itemLabel}>View profile</Text>
            </Pressable>

            {/* My orders */}
            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={() => {
                setOpen(false);
                router.navigate('/shop/orders');
              }}
            >
              <Icon name="package" size={17} color="#0ea5e9" />
              <Text style={styles.itemLabel}>My orders</Text>
            </Pressable>

            {/* My cart */}
            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={() => {
                setOpen(false);
                router.navigate('/shop/cart');
              }}
            >
              <Icon name="shopping-cart" size={17} color="#64748b" />
              <Text style={styles.itemLabel}>My cart</Text>
              {count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
            </Pressable>

            {/* Request to create a store */}
            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={() => {
                setOpen(false);
                router.push('/shop/store-request');
              }}
            >
              <Icon name="store" size={17} color="#f59e0b" />
              <Text style={styles.itemLabel}>Request to create a store</Text>
            </Pressable>

            <View style={styles.divider} />

            {/* Log out */}
            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={() => {
                setOpen(false);
                void signOut();
              }}
            >
              <Icon name="log-out" size={17} color="#ef4444" />
              <Text style={[styles.itemLabel, { color: '#ef4444', fontWeight: '600' }]}>Log out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    marginRight: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden'
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.08)'
  },
  menuCard: {
    position: 'absolute',
    right: 16,
    width: 236,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12
  },
  userHeader: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b'
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10
  },
  itemPressed: {
    backgroundColor: '#f8fafc'
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    flex: 1
  },
  badge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 999
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e'
  }
});
