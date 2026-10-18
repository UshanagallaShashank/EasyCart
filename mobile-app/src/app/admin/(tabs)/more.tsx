// "Profile" for the admin: the rest of the website's admin pages, plus editable details and avatar.
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/text';
import { Icon, type IconName } from '@/components/icon';
import { Avatar, Badge, Button, Card, Field, InfoRow, Screen, SectionTitle } from '@/components/ui';
import { useToast } from '@/components/toast';
import { useSession } from '@/lib/session';
import { useConfirmedSignOut } from '@/components/confirm';
import { pickPhotos } from '@/lib/device';
import { api, errorMessage } from '@/lib/api';
import { colors, radius, shadow, space, text } from '@/theme/theme';

const ITEMS: { icon: IconName; title: string; subtitle: string; href: '/admin/earnings' | '/admin/refunds' | '/admin/themes' | '/admin/users' | '/admin/sales' | '/admin/growth'; fg: string; bg: string }[] = [
  { icon: 'wallet', title: 'Earnings', subtitle: 'Commission, rider pay and what each shop owes', href: '/admin/earnings', fg: '#059669', bg: '#d1fae5' },
  { icon: 'rotate-ccw', title: 'Refunds', subtitle: 'Money-back requests across all shops', href: '/admin/refunds', fg: '#e11d48', bg: '#ffe4e6' },
  { icon: 'sparkles', title: 'Shop themes', subtitle: 'Colours owners can pick for their shop', href: '/admin/themes', fg: '#7c3aed', bg: '#ede9fe' },
  { icon: 'users', title: 'Users', subtitle: 'Store owners, customers, delivery partners, admins', href: '/admin/users', fg: '#7c3aed', bg: '#ede9fe' },
  { icon: 'dollar-sign', title: 'Sales', subtitle: 'Orders and revenue, day by day', href: '/admin/sales', fg: '#059669', bg: '#d1fae5' },
  { icon: 'sparkles', title: 'Growth', subtitle: 'New stores and people joining', href: '/admin/growth', fg: '#d97706', bg: '#fef3c7' }
];

export default function AdminMore() {
  const { user, updateUser } = useSession();
  const logout = useConfirmedSignOut();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  const [form, setForm] = useState({
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone_number: user?.phone_number ?? ''
  });

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
      <View style={styles.accountCard}>
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
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            <Badge tone="primary" label="Platform admin" />
          </View>
        </View>
      </View>

      {/* Account Details & Edit Card */}
      {!editing ? (
        <Card title="Admin Details" icon="user" right={
          <Button small variant="outline" icon="edit-3" label="Edit" onPress={startEditing} />
        }>
          <InfoRow label="Username" value={user?.username || '—'} />
          <InfoRow label="Email" value={user?.email || '—'} />
          <InfoRow label="Phone number" value={user?.phone_number || '—'} />
          <InfoRow label="Role" value="Platform Admin" />
        </Card>
      ) : (
        <Card title="Edit Details" icon="edit-3">
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

      <SectionTitle>Insights and people</SectionTitle>
      {ITEMS.map((item) => (
        <Pressable key={item.href} accessibilityRole="button" onPress={() => router.push(item.href)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
          <View style={[styles.icon, { backgroundColor: item.bg }]}><Icon name={item.icon} size={20} color={item.fg} /></View>
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
  avatarWrap: { position: 'relative' },
  avatarCameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3
  },
  avatarLoading: {
    position: 'absolute',
    inset: 0,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3
  },
  email: {
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
