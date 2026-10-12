// Rider profile: status, contact, vehicle, base location (GPS or map), language and documents.
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Avatar, Badge, Button, Card, Field, InfoRow, Loading, Screen } from '@/components/ui';
import { Icon } from '@/components/icon';
import { useToast } from '@/components/toast';
import { useConfirmedSignOut } from '@/components/confirm';
import { useSession } from '@/lib/session';
import { pickPhotos } from '@/lib/device';
import { api, errorMessage, fileUrl } from '@/lib/api';
import { riderCalls, useMyRider, useRiderAction } from '@/features/rider/rider-api';
import { useQueryClient } from '@tanstack/react-query';
import { ApplicationStatus } from '@/features/rider/application-status';
import { EditDetailsCard } from '@/features/rider/edit-details-card';
import { MapPicker } from '@/components/map-picker';
import { LanguagePicker } from '@/components/language-picker';
import { readCurrentPosition, type Coords } from '@/lib/location';
import { dateTime } from '@/lib/format';
import { RIDER_STATUS, VEHICLE_LABELS } from '@/lib/delivery-labels';
import { colors, radius, space, text } from '@/theme/theme';

export default function RiderProfile() {
  const { user, updateUser } = useSession();
  const queryClient = useQueryClient();
  const { data: rider, isLoading } = useMyRider();
  const pin = useRiderAction(riderCalls.setBaseLocation);
  const toast = useToast();
  const logout = useConfirmedSignOut();

  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Edit user profile state
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone_number: user?.phone_number ?? ''
  });

  // Where the map opens, and the spot the rider has picked on it but not saved yet.
  const [mapStart, setMapStart] = useState<Coords | null>(null);
  const [picked, setPicked] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);

  if (isLoading || !rider) return <Loading />;
  const status = RIDER_STATUS[rider.status];
  const pinned = rider.latitude !== null && rider.longitude !== null;

  async function handlePickPhoto(source: 'camera' | 'library') {
    try {
      setUploadingPhoto(true);
      const picked = await pickPhotos(source);
      if (picked.length === 0) return;
      const fileData = picked[0];

      // Upload using universal avatar endpoint
      const res = await api<{ url: string; user: any }>('/profile/avatar', {
        method: 'POST',
        body: { file: fileData }
      });
      await updateUser({ avatar_url: res.url });
      await queryClient.invalidateQueries({ queryKey: ['rider'] });
      toast('Profile photo updated successfully', 'success');
    } catch (err) {
      toast(errorMessage(err, 'Failed to update photo'), 'error');
    } finally {
      setUploadingPhoto(false);
    }
  }

  function choosePhotoSource() {
    Alert.alert(
      'Update Profile Photo',
      'Choose an option to update your photo:',
      [
        { text: 'Take Photo', onPress: () => void handlePickPhoto('camera') },
        { text: 'Choose from Gallery', onPress: () => void handlePickPhoto('library') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }

  function startEditingProfile() {
    setProfileForm({
      username: user?.username ?? '',
      email: user?.email ?? rider?.email ?? '',
      phone_number: user?.phone_number ?? rider?.phone_number ?? ''
    });
    setEditingProfile(true);
  }

  async function handleSaveProfile() {
    if (!profileForm.username.trim()) {
      toast('Username is required', 'error');
      return;
    }
    if (!profileForm.email.trim()) {
      toast('Email is required', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await api<{ user: any }>('/profile', {
        method: 'PATCH',
        body: {
          username: profileForm.username.trim(),
          email: profileForm.email.trim(),
          phone_number: profileForm.phone_number.trim()
        }
      });
      await updateUser({
        username: res.user.username,
        email: res.user.email,
        phone_number: res.user.phone_number
      });
      await queryClient.invalidateQueries({ queryKey: ['rider'] });
      setEditingProfile(false);
      toast('Profile details updated successfully', 'success');
    } catch (err) {
      toast(errorMessage(err, 'Failed to save profile'), 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  function savePin(coords: Coords) {
    pin.mutate(coords, {
      onSuccess: () => { setPicked(null); toast('Location pinned', 'success'); },
      onError: (err) => toast(errorMessage(err), 'error')
    });
  }

  async function useMyLocation() {
    setLocating(true);
    try {
      const coords = await readCurrentPosition();
      setMapStart(coords);
      savePin(coords);
    } catch (err) {
      toast(errorMessage(err, 'We could not find your location'), 'error');
    } finally {
      setLocating(false);
    }
  }

  // Opens the map at the saved pin, or at the rider's current spot when nothing is pinned yet.
  async function openMap() {
    if (rider!.latitude !== null && rider!.longitude !== null) {
      setMapStart({ latitude: rider!.latitude, longitude: rider!.longitude });
      return;
    }
    await useMyLocation();
  }

  return (
    <Screen>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ position: 'relative' }}>
            <Avatar name={rider.full_name || user?.username || 'Rider'} photoUrl={rider.photo_url || user?.avatar_url} size={58} />
            {uploadingPhoto ? (
              <View style={{ position: 'absolute', inset: 0, borderRadius: 29, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color={colors.white} size="small" />
              </View>
            ) : (
              <Pressable
                onPress={choosePhotoSource}
                accessibilityLabel="Change profile photo"
                hitSlop={8}
                style={{
                  position: 'absolute',
                  right: -2,
                  bottom: -2,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  borderWidth: 1.5,
                  borderColor: colors.card,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name="camera" size={12} color={colors.white} />
              </Pressable>
            )}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={text.heading}>{rider.full_name}</Text>
            <Text style={text.small}>{user?.email || rider.email} · {user?.phone_number || rider.phone_number}</Text>
            <Badge tone={status.tone} label={status.label} />
          </View>
        </View>
      </Card>

      {/* Account Details Card (Username, Email, Phone) */}
      {!editingProfile ? (
        <Card title="Account Details" icon="user">
          <InfoRow label="Username" value={user?.username || '—'} />
          <InfoRow label="Email" value={user?.email || rider.email || '—'} />
          <InfoRow label="Phone" value={user?.phone_number || rider.phone_number || '—'} />
          <Button small variant="outline" icon="edit-3" label="Edit account details" onPress={startEditingProfile} />
        </Card>
      ) : (
        <Card title="Edit Account Details" icon="edit-3">
          <Field
            label="Username"
            value={profileForm.username}
            onChangeText={(val) => setProfileForm((prev) => ({ ...prev, username: val }))}
            placeholder="Username"
            autoCapitalize="none"
          />
          <Field
            label="Email"
            value={profileForm.email}
            onChangeText={(val) => setProfileForm((prev) => ({ ...prev, email: val }))}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Email address"
          />
          <Field
            label="Phone Number"
            value={profileForm.phone_number}
            onChangeText={(val) => setProfileForm((prev) => ({ ...prev, phone_number: val }))}
            keyboardType="phone-pad"
            placeholder="Phone number"
          />
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.xs }}>
            <View style={{ flex: 1 }}>
              <Button variant="outline" label="Cancel" onPress={() => setEditingProfile(false)} disabled={savingProfile} />
            </View>
            <View style={{ flex: 1 }}>
              <Button icon="save" label="Save" onPress={handleSaveProfile} loading={savingProfile} />
            </View>
          </View>
        </Card>
      )}

      {rider.status !== 'approved' && <ApplicationStatus rider={rider} />}
      {(rider.status === 'draft' || rider.status === 'rejected') && <Button icon="edit-3" label="Edit application" onPress={() => router.push('/rider/application')} />}

      <Card title="Vehicle and area" icon="truck">
        <InfoRow label="Vehicle" value={rider.vehicle_type ? VEHICLE_LABELS[rider.vehicle_type] : '—'} />
        <InfoRow label="Number plate" value={rider.vehicle_number || '—'} />
        <InfoRow label="Licence valid until" value={rider.license_expiry || '—'} />
        <InfoRow label="Area" value={[rider.area, rider.city, rider.pincode].filter(Boolean).join(', ') || '—'} />
      </Card>

      {rider.status !== 'draft' && rider.status !== 'rejected' && <EditDetailsCard rider={rider} />}

      <Card title="Base location" icon="map-pin" right={<Badge tone={pinned ? 'success' : 'warning'} label={pinned ? 'Pinned' : 'Not pinned'} />}>
        <Text style={text.muted}>Delivery offers come from shops near this spot. Stand where you usually start and tap the button, or drop the pin on the map.</Text>
        {pinned ? <InfoRow label="Last updated" value={dateTime(rider.location_updated_at)} /> : null}
        <Button small variant={pinned ? 'outline' : 'primary'} icon="navigation" label={locating ? 'Finding you…' : 'Use my current location'} onPress={() => void useMyLocation()} loading={locating || (pin.isPending && !picked)} />
        {mapStart ? (
          <View style={{ gap: space.sm }}>
            <MapPicker center={mapStart} onPick={setPicked} height={240} />
            <Text style={[text.small, { color: colors.textMuted }]}>Tap the map or drag the pin to the exact spot, then save it.</Text>
            {picked ? <Button small icon="save" label="Save this spot" onPress={() => savePin(picked)} loading={pin.isPending} /> : null}
          </View>
        ) : (
          <Button small variant="ghost" icon="map" label="Pick on the map" onPress={() => void openMap()} />
        )}
      </Card>

      <Card title="Language" icon="sparkles">
        <LanguagePicker />
      </Card>

      <Card title="Documents" icon="file-text">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {rider.documents.map((doc) => (
            <View key={`${doc.kind}-${doc.index ?? 0}`} style={{ width: '31%', gap: 4 }}>
              {doc.type === 'image' && doc.url ? <Image source={{ uri: fileUrl(doc.url)! }} style={{ width: '100%', aspectRatio: 1, borderRadius: radius.md }} /> : <View style={{ width: '100%', aspectRatio: 1, borderRadius: radius.md, backgroundColor: '#fff1f2', alignItems: 'center', justifyContent: 'center' }}><Text style={text.small}>PDF</Text></View>}
              <Text style={text.small} numberOfLines={2}>{doc.title}</Text>
            </View>
          ))}
        </View>
        {rider.documents.length === 0 && <Text style={text.small}>No documents yet.</Text>}
      </Card>

      <Button variant="danger" icon="log-out" label="Log out" onPress={() => void logout()} />
    </Screen>
  );
}
