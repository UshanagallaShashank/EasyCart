import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { colors, radius, shadow, space } from '@/theme/theme';

export function NotificationButton() {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel="Notifications"
        hitSlop={8}
        style={styles.bellButton}
      >
        <Icon name="bell" size={20} color={colors.text} />
        <View style={styles.badgeDot} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.card, { top: insets.top + 48 }]}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="bell" size={17} color={colors.primary} />
                <Text style={styles.title}>Notifications</Text>
              </View>
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <Icon name="x" size={18} color="#64748b" />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.item}>
              <View style={styles.iconCircle}>
                <Icon name="sparkles" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.itemTitle}>Welcome to EasyCart!</Text>
                <Text style={styles.itemBody}>
                  Explore fresh groceries and products from your local store with instant delivery.
                </Text>
              </View>
            </View>

            <View style={styles.item}>
              <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4' }]}>
                <Icon name="check-circle" size={16} color="#16a34a" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.itemTitle}>All caught up!</Text>
                <Text style={styles.itemBody}>
                  You have no pending order alerts.
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  badgeDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0284c7',
    borderWidth: 1,
    borderColor: '#ffffff'
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.1)'
  },
  card: {
    position: 'absolute',
    right: 16,
    width: 290,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: space.md,
    gap: space.sm,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 2
  },
  item: {
    flexDirection: 'row',
    gap: 10,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f8fafc'
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  itemBody: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16
  }
});
