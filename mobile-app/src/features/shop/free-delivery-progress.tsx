// "Add Rs. 120 more for free delivery" with a bar that fills up, or a green "Free delivery unlocked" once there.
// Only shows when the shop offers free delivery above an amount and charges for delivery.
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { useBrand } from '@/lib/brand';
import { useT } from '@/lib/i18n';
import { price } from '@/lib/format';
import { colors, radius, space } from '@/theme/theme';

export function FreeDeliveryProgress({ subtotal, fee, freeAbove }: { subtotal: number; fee: number; freeAbove: number | null | undefined }) {
  const brand = useBrand();
  const t = useT();
  if (!freeAbove || freeAbove <= 0 || fee <= 0) return null;
  const unlocked = subtotal >= freeAbove;
  const share = Math.min(1, subtotal / freeAbove);
  return (
    <View style={[styles.box, unlocked && { backgroundColor: colors.successSoft }]} accessibilityLabel={unlocked ? 'Free delivery unlocked' : `Add ${price(freeAbove - subtotal)} more for free delivery`}>
      <View style={styles.row}>
        <Icon name={unlocked ? 'check-circle' : 'truck'} size={18} color={unlocked ? colors.success : brand.primary} />
        <Text style={[styles.text, unlocked && { color: colors.success }]}>
          {unlocked ? t('Free delivery unlocked! You save {fee}', { fee: price(fee) }) : t('Add {amount} more for free delivery', { amount: price(freeAbove - subtotal) })}
        </Text>
      </View>
      {!unlocked && (
        <View style={styles.track}>
          <LinearGradient colors={[brand.mesh[1], brand.mesh[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fill, { width: `${Math.max(6, share * 100)}%` }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: space.sm, backgroundColor: colors.card, borderRadius: radius.lg, padding: space.md, paddingHorizontal: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  text: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.text },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.white, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 }
});
