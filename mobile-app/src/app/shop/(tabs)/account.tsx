// Account: who is signed in, edit details, upload profile image, quick shortcuts, which shop is open, and switching shops.
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { Avatar, Button, Card, Field, InfoRow, MenuRow, Screen } from '@/components/ui';
import { CustomerSupportModal } from '@/components/customer-support-modal';
import { FadeIn } from '@/components/motion';
import { useToast } from '@/components/toast';
import { useShop } from '@/features/shop/shop-context';
import { useMyOrders, useMyStores } from '@/features/shop/shop-api';
import { useSession } from '@/lib/session';
import { useConfirmedSignOut } from '@/components/confirm';
import { accents, colors, radius, space, text } from '@/theme/theme';
import { LanguagePicker } from '@/components/language-picker';
import { useT } from '@/lib/i18n';
import { useBrand } from '@/lib/brand';
import { pickPhotos } from '@/lib/device';
import { api, errorMessage } from '@/lib/api';

export default function AccountScreen() {
  const { user, updateUser } = useSession();
  const logout = useConfirmedSignOut();
  const toast = useToast();
  const t = useT();
  const brand = useBrand();
  const { slug, setSlug } = useShop();
  const { data: stores } = useMyStores();
  const { data: orders } = useMyOrders();
  const [code, setCode] = useState('');
  const [supportOpen, setSupportOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  const [form, setForm] = useState({
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone_number: user?.phone_number ?? ''
  });

  const orderCount = (orders ?? []).filter((order) => order.status !== 'cancelled').length;

  function open(next: string) {
    setSlug(next);
    router.navigate('/shop');
  }

  function startEditing() {
    setForm({
      username: user?.username ?? '',
      email: user?.email ?? '',
      phone_number: user?.phone_number ?? ''
    });
    setEditing(true);
  }

  async function handlePickImage(source: 'camera' | 'library') {
    try {
      setUploadingImage(true);
      const picked = await pickPhotos(source);
      if (picked.length === 0) return;
      const fileData = picked[0];

      const res = await api<{ url: string; user: any }>('/profile/avatar', {
        method: 'POST',
        body: { file: fileData }
      });
      await updateUser({ avatar_url: res.url });
      toast('Profile image updated successfully', 'success');
    } catch (err) {
      toast(errorMessage(err, 'Failed to update profile image'), 'error');
    } finally {
      setUploadingImage(false);
    }
  }

  function chooseImageSource() {
    Alert.alert(
      'Update Profile Image',
      'Choose an option to update your photo:',
      [
        { text: 'Take Photo', onPress: () => void handlePickImage('camera') },
        { text: 'Choose from Gallery', onPress: () => void handlePickImage('library') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }

  async function handleSaveDetails() {
    if (!form.username.trim()) {
      toast('Username is required', 'error');
      return;
    }
    if (!form.email.trim()) {
      toast('Email is required', 'error');
      return;
    }
    setSavingDetails(true);
    try {
      const res = await api<{ user: any }>('/profile', {
        method: 'PATCH',
        body: {
          username: form.username.trim(),
          email: form.email.trim(),
          phone_number: form.phone_number.trim()
        }
      });
      await updateUser({
        username: res.user.username,
        email: res.user.email,
        phone_number: res.user.phone_number
      });
      setEditing(false);
      toast('Profile details updated successfully', 'success');
    } catch (err) {
      toast(errorMessage(err, 'Failed to save details'), 'error');
    } finally {
      setSavingDetails(false);
    }
  }

  return (
    <Screen>
      <FadeIn>
        <LinearGradient colors={brand.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.profile}>
          <View style={styles.circle} />
          <View style={styles.avatarWrap}>
            <Avatar name={user?.username ?? '?'} photoUrl={user?.avatar_url} size={64} />
            {uploadingImage ? (
              <View style={styles.avatarLoading}>
                <ActivityIndicator color={colors.white} size="small" />
              </View>
            ) : (
              <Pressable
                onPress={chooseImageSource}
                accessibilityLabel="Change profile image"
                hitSlop={8}
                style={styles.avatarCameraBadge}
              >
                <Icon name="camera" size={13} color={colors.white} />
              </Pressable>
            )}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.name} numberOfLines={1}>{user?.username}</Text>
            <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
            <Text style={styles.stat}>{orderCount} {orderCount === 1 ? 'order' : 'orders'} placed</Text>
          </View>
        </LinearGradient>
      </FadeIn>

      {/* Profile Details & Inline Edit */}
      {!editing ? (
        <Card title={t('My details')} icon="user" right={
          <Button small variant="outline" icon="edit-3" label="Edit" onPress={startEditing} />
        }>
          <InfoRow label="Username" value={user?.username || '—'} />
          <InfoRow label="Email" value={user?.email || '—'} />
          <InfoRow label="Phone number" value={user?.phone_number || '—'} />
        </Card>
      ) : (
        <Card title={t('Edit my details')} icon="edit-3">
          <Field
            label="Username"
            value={form.username}
            onChangeText={(v) => setForm((curr) => ({ ...curr, username: v }))}
            placeholder="Your username"
            autoCapitalize="none"
          />
          <Field
            label="Email Address"
            value={form.email}
            onChangeText={(v) => setForm((curr) => ({ ...curr, email: v }))}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Phone Number"
            value={form.phone_number}
            onChangeText={(v) => setForm((curr) => ({ ...curr, phone_number: v }))}
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
          />

          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <Button
                variant="outline"
                label="Cancel"
                onPress={() => setEditing(false)}
                disabled={savingDetails}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                icon="save"
                label="Save"
                onPress={() => void handleSaveDetails()}
                loading={savingDetails}
              />
            </View>
          </View>
        </Card>
      )}

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
  shopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  avatarWrap: { position: 'relative' },
  avatarCameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarLoading: {
    position: 'absolute',
    inset: 0,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
