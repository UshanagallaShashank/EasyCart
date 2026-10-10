// Account: who is signed in, quick shortcuts, which shop is open, and switching shops.
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { Avatar, Button, Card, Field, MenuRow, Screen } from '@/components/ui';
import { CustomerSupportModal } from '@/components/customer-support-modal';
import { FadeIn } from '@/components/motion';
import { useShop } from '@/features/shop/shop-context';
import { useMyOrders, useMyStores } from '@/features/shop/shop-api';
import { useSession } from '@/lib/session';
import { useConfirmedSignOut } from '@/components/confirm';
import { accents, colors, radius, space, text } from '@/theme/theme';
import { LanguagePicker } from '@/components/language-picker';
import { useT } from '@/lib/i18n';

export default function AccountScreen() {
  const { user } = useSession();
  const logout = useConfirmedSignOut();
  const t = useT();
  const { slug, setSlug } = useShop();
  const { data: stores } = useMyStores();
  const { data: orders } = useMyOrders();
  const [code, setCode] = useState('');
  const [supportOpen, setSupportOpen] = useState(false);

  const orderCount = (orders ?? []).filter((order) => order.status !== 'cancelled').length;

  function open(next: string) {
    setSlug(next);
    router.navigate('/shop');
  }

  return (
    <Screen>
      <FadeIn>
        <LinearGradient colors={['#0369a1', '#0284c7', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.profile}>
          <View style={styles.circle} />
          <Avatar name={user?.username ?? '?'} size={60} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.name} numberOfLines={1}>{user?.username}</Text>
            <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
            <Text style={styles.stat}>{orderCount} {orderCount === 1 ? 'order' : 'orders'} placed</Text>
          </View>
        </LinearGradient>
      </FadeIn>

      <MenuRow icon="clipboard" fg={accents.sky.fg} bg={accents.sky.bg} title={t('My orders')} subtitle="Track, reorder and see what you saved" onPress={() => router.navigate('/shop/orders')} />
      <MenuRow icon="map-pin" fg={accents.green.fg} bg={accents.green.bg} title={t('Delivery addresses')} subtitle="Home, work and other places you order to" onPress={() => router.push('/shop/addresses')} />
      <MenuRow icon="headphones" fg={accents.violet.fg} bg={accents.violet.bg} title={t('Customer support')} subtitle="Helpline, live assistance & FAQs" onPress={() => setSupportOpen(true)} />

      <Card title={t('Language')} icon="sparkles">
        <LanguagePicker />
      </Card>

      <Card title={t('Shops')} icon="shopping-bag">
        <View style={styles.openNow}>
          <Icon name="check-circle" size={16} color={colors.primary} />
          <Text style={text.small}>{t('Open now')}: <Text style={{ fontWeight: '700', color: colors.text }}>{slug}</Text></Text>
        </View>
        {(stores ?? []).filter((s) => s.slug !== slug).map((store) => (
          <Pressable key={store.slug} onPress={() => open(store.slug)} style={styles.shopRow}>
            <Text style={text.body}>{store.name}</Text>
            <Icon name="chevron-right" size={18} color={colors.textFaint} />
          </Pressable>
        ))}
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}><Field label={t('Open a shop by its code')} value={code} onChangeText={setCode} autoCapitalize="none" placeholder="e.g. green-leaf-market" /></View>
          <Button small label="Open" onPress={() => open(code)} disabled={!code.trim()} />
        </View>
      </Card>

      <Button variant="danger" icon="log-out" label={t('Log out')} onPress={() => void logout()} />

      <CustomerSupportModal visible={supportOpen} onClose={() => setSupportOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: space.lg, borderRadius: radius.xl, padding: space.xl, overflow: 'hidden' },
  circle: { position: 'absolute', right: -30, top: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.12)' },
  name: { fontSize: 20, fontWeight: '800', color: colors.white, letterSpacing: -0.4 },
  email: { fontSize: 13, color: '#e0f2fe' },
  stat: { fontSize: 12, fontWeight: '700', color: colors.white, marginTop: 4 },
  openNow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  shopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }
});
