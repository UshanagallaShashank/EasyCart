// Account: who is signed in, which shop is open, and switching shops.
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { Avatar, Button, Card, Field, Screen } from '@/components/ui';
import { useShop } from '@/features/shop/shop-context';
import { useMyStores } from '@/features/shop/shop-api';
import { useSession } from '@/lib/session';
import { colors, space, text } from '@/theme/theme';
import { CustomerSupportModal } from '@/components/customer-support-modal';

export default function AccountScreen() {
  const { user, signOut } = useSession();
  const { slug, setSlug } = useShop();
  const { data: stores } = useMyStores();
  const [code, setCode] = useState('');
  const [supportOpen, setSupportOpen] = useState(false);

  function open(next: string) {
    setSlug(next);
    router.navigate('/shop');
  }

  return (
    <Screen>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Avatar name={user?.username ?? '?'} />
          <View style={{ flex: 1 }}>
            <Text style={text.heading}>{user?.username}</Text>
            <Text style={text.small}>{user?.email}</Text>
          </View>
        </View>
      </Card>

      <Pressable onPress={() => router.push('/shop/addresses')} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: '#e8edf3', padding: space.lg }}>
        <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' }}><Icon name="map-pin" size={18} color={colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={text.heading}>Delivery addresses</Text>
          <Text style={text.small}>Home, work and other places you order to</Text>
        </View>
        <Icon name="chevron-right" size={18} color={colors.textFaint} />
      </Pressable>

      <Pressable onPress={() => setSupportOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: '#e8edf3', padding: space.lg }}>
        <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' }}><Icon name="headphones" size={18} color="#0284c7" /></View>
        <View style={{ flex: 1 }}>
          <Text style={text.heading}>Customer support</Text>
          <Text style={text.small}>Helpline, live assistance & FAQs</Text>
        </View>
        <Icon name="chevron-right" size={18} color={colors.textFaint} />
      </Pressable>

      <Card title="Shops" icon="shopping-bag">
        <Text style={text.small}>Open now: <Text style={{ fontWeight: '700', color: colors.text }}>{slug}</Text></Text>
        {(stores ?? []).filter((s) => s.slug !== slug).map((store) => (
          <Pressable key={store.slug} onPress={() => open(store.slug)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={text.body}>{store.name}</Text>
            <Icon name="chevron-right" size={18} color={colors.textFaint} />
          </Pressable>
        ))}
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}><Field label="Open a shop by its code" value={code} onChangeText={setCode} autoCapitalize="none" placeholder="e.g. green-leaf-market" /></View>
          <Button small label="Open" onPress={() => open(code)} disabled={!code.trim()} />
        </View>
      </Card>

      <Button variant="danger" icon="log-out" label="Log out" onPress={() => void signOut()} />

      <CustomerSupportModal visible={supportOpen} onClose={() => setSupportOpen(false)} />
    </Screen>
  );
}
