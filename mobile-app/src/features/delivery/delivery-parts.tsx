// Delivery pieces shared by the customer, store and rider screens: progress steps, rider card, proof photo.
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Avatar } from '@/components/ui';
import { fileUrl } from '@/lib/api';
import { dateTime, price } from '@/lib/format';
import { VEHICLE_LABELS } from '@/lib/delivery-labels';
import { colors, radius, space, text } from '@/theme/theme';
import type { DeliveryStage, DeliveryTimeline, HandoverRider } from '@/types/delivery';

const STEPS = ['Packing', 'Finding rider', 'Rider picking up', 'Out for delivery', 'Delivered'];

function stepIndex(stage: DeliveryStage, offer: 'offered' | 'accepted' | null) {
  if (stage === 'delivered') return 4;
  if (stage === 'dispatched') return 3;
  if (stage === 'rider_assigned') return offer === 'accepted' ? 2 : 1;
  if (stage === 'ready_for_delivery') return 1;
  return 0;
}

export function DeliverySteps({ stage, offer }: { stage: DeliveryStage; offer: 'offered' | 'accepted' | null }) {
  const current = stepIndex(stage, offer);
  return (
    <View style={styles.steps}>
      {STEPS.map((step, index) => {
        const done = index < current || stage === 'delivered';
        const active = index === current && stage !== 'delivered';
        return (
          <View key={step} style={styles.step}>
            <View style={[styles.dot, done && styles.dotDone, active && styles.dotActive]}>
              {done ? <Feather name="check" size={12} color={colors.white} /> : <Text style={[styles.dotText, active && { color: colors.primary }]}>{index + 1}</Text>}
            </View>
            <Text style={[styles.stepText, (done || active) && { color: colors.text }]} numberOfLines={2}>{step}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function RiderCard({ rider, caption }: { rider: HandoverRider; caption: string }) {
  return (
    <View style={styles.rider}>
      <Avatar name={rider.full_name} photoUrl={rider.photo_url} />
      <View style={{ flex: 1 }}>
        <Text style={text.label}>{caption}</Text>
        <Text style={text.heading} numberOfLines={1}>{rider.full_name}</Text>
        <Text style={text.small}>{rider.vehicle_type ? VEHICLE_LABELS[rider.vehicle_type] : 'Vehicle'}{rider.vehicle_number ? ` · ${rider.vehicle_number}` : ''}</Text>
      </View>
      {rider.phone_number && (
        <Pressable onPress={() => Linking.openURL(`tel:${rider.phone_number}`)} style={styles.call} accessibilityLabel={`Call ${rider.full_name}`}>
          <Feather name="phone" size={18} color={colors.success} />
        </Pressable>
      )}
    </View>
  );
}

export function ProofPhoto({ url, cash }: { url: string | null; cash: number | null }) {
  const src = fileUrl(url);
  return (
    <View style={{ gap: space.sm }}>
      {src ? <Image source={{ uri: src }} style={styles.proof} /> : <Text style={text.small}>No delivery photo</Text>}
      {cash !== null && <Text style={text.small}>Cash collected by rider: <Text style={{ fontWeight: '700', color: colors.text }}>{price(cash)}</Text></Text>}
    </View>
  );
}

export function TimelineList({ timeline }: { timeline: DeliveryTimeline }) {
  const rows: [string, string | null][] = [
    ['Order placed', timeline.placed_at], ['Rider requested', timeline.ready_at], ['Rider accepted', timeline.accepted_at],
    ['Picked up', timeline.picked_up_at], ['Delivered', timeline.delivered_at]
  ];
  return (
    <View style={{ gap: 6 }}>
      {rows.filter(([, at]) => at).map(([name, at]) => (
        <View key={name} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={text.muted}>{name}</Text>
          <Text style={text.small}>{dateTime(at)}</Text>
        </View>
      ))}
    </View>
  );
}

export function openMap(point: { latitude: number | null; longitude: number | null } | null, address?: string | null) {
  const query = point && point.latitude !== null && point.longitude !== null ? `${point.latitude},${point.longitude}` : address ? encodeURIComponent(address) : null;
  if (query) void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
}

const styles = StyleSheet.create({
  steps: { flexDirection: 'row', justifyContent: 'space-between' },
  step: { flex: 1, alignItems: 'center', gap: 6 },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  dotText: { fontSize: 11, fontWeight: '700', color: colors.textFaint },
  stepText: { fontSize: 10.5, color: colors.textFaint, textAlign: 'center', fontWeight: '600' },
  rider: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, padding: space.md },
  call: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' },
  proof: { width: '100%', height: 200, borderRadius: radius.md, backgroundColor: colors.borderSoft }
});
