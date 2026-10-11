// Rider profile: status, contact, vehicle, base location (GPS or map), language and documents.
import { useState } from 'react';
import { Image, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Avatar, Badge, Button, Card, InfoRow, Loading, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { useConfirmedSignOut } from '@/components/confirm';
import { riderCalls, useMyRider, useRiderAction } from '@/features/rider/rider-api';
import { ApplicationStatus } from '@/features/rider/application-status';
import { EditDetailsCard } from '@/features/rider/edit-details-card';
import { MapPicker } from '@/components/map-picker';
import { LanguagePicker } from '@/components/language-picker';
import { readCurrentPosition, type Coords } from '@/lib/location';
import { errorMessage, fileUrl } from '@/lib/api';
import { dateTime } from '@/lib/format';
import { RIDER_STATUS, VEHICLE_LABELS } from '@/lib/delivery-labels';
import { colors, radius, space, text } from '@/theme/theme';

export default function RiderProfile() {
  const { data: rider, isLoading } = useMyRider();
  const pin = useRiderAction(riderCalls.setBaseLocation);
  const toast = useToast();
  const logout = useConfirmedSignOut();
  // Where the map opens, and the spot the rider has picked on it but not saved yet.
  const [mapStart, setMapStart] = useState<Coords | null>(null);
  const [picked, setPicked] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  if (isLoading || !rider) return <Loading />;
  const status = RIDER_STATUS[rider.status];
  const pinned = rider.latitude !== null && rider.longitude !== null;

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
          <Avatar name={rider.full_name} photoUrl={rider.photo_url} size={56} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={text.heading}>{rider.full_name}</Text>
            <Text style={text.small}>{rider.email} · {rider.phone_number}</Text>
            <Badge tone={status.tone} label={status.label} />
          </View>
        </View>
      </Card>
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
