// Rider profile: status, contact, vehicle, base location and documents.
import { Image, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Avatar, Badge, Button, Card, InfoRow, Loading, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { riderCalls, useMyRider, useRiderAction } from '@/features/rider/rider-api';
import { ApplicationStatus } from '@/features/rider/application-status';
import { currentPosition } from '@/lib/device';
import { errorMessage, fileUrl } from '@/lib/api';
import { dateTime } from '@/lib/format';
import { RIDER_STATUS, VEHICLE_LABELS } from '@/lib/delivery-labels';
import { radius, space, text } from '@/theme/theme';

export default function RiderProfile() {
  const { data: rider, isLoading } = useMyRider();
  const pin = useRiderAction(riderCalls.setBaseLocation);
  const toast = useToast();
  if (isLoading || !rider) return <Loading />;
  const status = RIDER_STATUS[rider.status];

  async function pinLocation() {
    try { pin.mutate(await currentPosition(), { onSuccess: () => toast('Location pinned', 'success') }); } catch (err) { toast(errorMessage(err), 'error'); }
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
        <InfoRow label="Base location" value={rider.latitude !== null ? `Pinned ${dateTime(rider.location_updated_at)}` : 'Not pinned'} />
        <Button small variant="outline" icon="map-pin" label={rider.latitude !== null ? 'Update location' : 'Pin my location'} onPress={pinLocation} loading={pin.isPending} />
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
    </Screen>
  );
}
