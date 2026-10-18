// "Profile": Store owner profile, details, edit details, logo/avatar upload, and quick navigation.
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Text } from '@/components/text';
import { Icon, type IconName } from '@/components/icon';
import { Avatar, Badge, Button, Card, Field, InfoRow, Screen, SectionTitle } from '@/components/ui';
import { useToast } from '@/components/toast';
import { useSession } from '@/lib/session';
import { useConfirmedSignOut } from '@/components/confirm';
import { manageCalls, useOwnStore } from '@/features/owner/owner-api';
import { pickPhotos } from '@/lib/device';
import { errorMessage } from '@/lib/api';
import { colors, radius, shadow, space, text } from '@/theme/theme';

const ITEMS: { icon: IconName; title: string; subtitle: string; href: '/owner/earnings' | '/owner/refunds' | '/owner/customers' | '/owner/coupons' | '/owner/categories' | '/owner/store-settings'; fg: string; bg: string }[] = [
  { icon: 'wallet', title: 'Earnings', subtitle: 'What you keep after the platform fee', href: '/owner/earnings', fg: '#059669', bg: '#d1fae5' },
  { icon: 'rotate-ccw', title: 'Refunds', subtitle: 'Money-back requests from customers', href: '/owner/refunds', fg: '#e11d48', bg: '#ffe4e6' },
  { icon: 'users', title: 'Customers', subtitle: 'Who has ordered, and how much', href: '/owner/customers', fg: '#7c3aed', bg: '#ede9fe' },
  { icon: 'ticket', title: 'Coupons', subtitle: 'Discount codes for your shoppers', href: '/owner/coupons', fg: '#d97706', bg: '#fef3c7' },
  { icon: 'tags', title: 'Categories', subtitle: 'Group your products', href: '/owner/categories', fg: '#0284c7', bg: '#e0f2fe' },
  { icon: 'store', title: 'Store settings', subtitle: 'Name, delivery fee, announcement, publish', href: '/owner/store-settings', fg: '#059669', bg: '#d1fae5' }
];

export default function OwnerMore() {
  const { user, updateUser } = useSession();
  const { data: store, refetch: refetchStore } = useOwnStore();
  const queryClient = useQueryClient();
  const toast = useToast();
  const logout = useConfirmedSignOut();

  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  const [form, setForm] = useState({
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone_number: user?.phone_number ?? ''
  });

  const displayName = store?.name || user?.username || 'Store Owner';

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

      // Upload store logo
      const { url } = await manageCalls.uploadStoreLogo(fileData);
      // Save logo_url to store and user avatar
      await manageCalls.saveStore({ logo_url: url });
      await manageCalls.updateProfile({ avatar_url: url } as any).catch(() => {});
      await updateUser({ avatar_url: url });
      await queryClient.invalidateQueries({ queryKey: ['store'] });
      await refetchStore();
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
      const result = await manageCalls.updateProfile({
        username: form.username.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim()
      });
      await updateUser({
        username: result.user.username,
        email: result.user.email,
        phone_number: result.user.phone_number
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
      {/* Account Hero Card with Avatar & Image Upload */}
      <View style={styles.accountCard}>
        <View style={styles.avatarContainer}>
          <Avatar name={displayName} photoUrl={store?.logo_url} size={68} />
          {uploadingImage ? (
            <View style={styles.avatarLoadingOverlay}>
              <ActivityIndicator color={colors.white} size="small" />
            </View>
          ) : (
            <Pressable
              onPress={chooseImageSource}
              accessibilityLabel="Change profile image"
              hitSlop={8}
              style={styles.editAvatarBadge}
            >
              <Icon name="camera" size={14} color={colors.white} />
            </Pressable>
          )}
        </View>

        <View style={{ flex: 1, gap: 3 }}>
          <Text style={styles.accountName} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.accountEmail} numberOfLines={1}>{user?.email}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Badge tone="primary" label="Store Owner" />
            {store?.is_published && <Badge tone="success" label="Published" />}
          </View>
        </View>
      </View>

      {/* Account Details / Edit Card */}
      {!editing ? (
        <Card title="Account Details" icon="user" right={
          <Button small variant="outline" icon="edit-3" label="Edit" onPress={startEditing} />
        }>
          <InfoRow label="Username" value={user?.username || '—'} />
          <InfoRow label="Email" value={user?.email || '—'} />
          <InfoRow label="Phone number" value={user?.phone_number || '—'} />
          {store?.name ? <InfoRow label="Store Name" value={store.name} /> : null}
          {store?.slug ? <InfoRow label="Store Link" value={store.slug} /> : null}
          {store?.address ? <InfoRow label="Store Address" value={[store.address, store.pincode].filter(Boolean).join(', ')} /> : null}
        </Card>
      ) : (
        <Card title="Edit Account Details" icon="edit-3">
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

      {/* Store Navigation Items */}
      <SectionTitle>Manage your store</SectionTitle>
      {ITEMS.map((item) => (
        <Pressable
          key={item.href}
          accessibilityRole="button"
          onPress={() => router.push(item.href)}
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
        >
          <View style={[styles.icon, { backgroundColor: item.bg }]}>
            <Icon name={item.icon} size={20} color={item.fg} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={text.small}>{item.subtitle}</Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.textFaint} />
        </Pressable>
      ))}

      <Button variant="danger" icon="log-out" label="Log out" onPress={() => void logout()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: space.lg,
    ...shadow
  },
  avatarContainer: {
    position: 'relative'
  },
  editAvatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 34,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  accountName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3
  },
  accountEmail: {
    fontSize: 13,
    color: colors.textMuted
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: space.lg,
    ...shadow
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  }
});
