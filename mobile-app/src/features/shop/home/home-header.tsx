// The top of the shop home: a block in the shop's colours with how fast delivery is, where it goes (tap to change),
// the shop's rating and its current offer.
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/motion';
import { NotificationButton } from '@/components/notification-button';
import { ProfileMenu } from '@/components/profile-menu';
import { useBrand } from '@/lib/brand';
import { useT } from '@/lib/i18n';
import { glow, radius, space } from '@/theme/theme';
import { ShopSwitcher } from '../shop-switcher';

export function HomeHeader({ shopName, logoUrl, eta, addressLabel, rating, offer }: {
  shopName: string;
  logoUrl: string | null;
  eta: { low: number; high: number } | null;
  addressLabel: string | null;
  rating: { average: number; count: number } | null;
  offer: string | null;
}) {
  const brand = useBrand();
  const t = useT();
  return (
    <LinearGradient colors={brand.mesh} locations={[0, 0.45, 0.8, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.block, glow(brand.glow)]}>
      <View style={styles.glowCircle} />
      <View style={styles.top}>
        <View style={{ flexShrink: 1 }}><ShopSwitcher name={shopName} logoUrl={logoUrl} light /></View>
        <View style={styles.actions}><NotificationButton /><ProfileMenu /></View>
      </View>
      <Text style={styles.eta}>{eta ? t('Delivery in {low}–{high} min', { low: eta.low, high: eta.high }) : t('Delivered from your local shop')}</Text>
      <PressScale onPress={() => router.push('/shop/addresses')} style={styles.address} accessibilityRole="button" accessibilityLabel="Change delivery address">
        <Icon name="map-pin" size={14} color="rgba(255,255,255,0.9)" />
        <Text style={styles.addressText} numberOfLines={1}>{addressLabel ?? t('Add a delivery address')}</Text>
        <Icon name="chevron-down" size={14} color="rgba(255,255,255,0.9)" />
      </PressScale>
      {(rating || offer) && (
        <View style={styles.chips}>
          {rating && (
            <View style={styles.chip}>
              <Icon name="star" size={12} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.chipText}>{rating.average.toFixed(1)} · {t('{count} ratings', { count: rating.count })}</Text>
            </View>
          )}
          {offer && (
            <View style={[styles.chip, { flexShrink: 1 }]}>
              <Icon name="gift" size={12} color="#ffffff" />
              <Text style={styles.chipText} numberOfLines={1}>{offer}</Text>
            </View>
          )}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  block: { borderRadius: radius.xl, padding: space.lg, paddingTop: space.md, gap: 6, overflow: 'hidden' },
  glowCircle: { position: 'absolute', right: -50, top: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.12)' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eta: { fontSize: 24, fontWeight: '800', color: '#ffffff', letterSpacing: -0.6, marginTop: 4 },
  address: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', maxWidth: '100%' },
  addressText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.92)', flexShrink: 1 },
  chips: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 12, fontWeight: '700', color: '#ffffff', flexShrink: 1 }
});
