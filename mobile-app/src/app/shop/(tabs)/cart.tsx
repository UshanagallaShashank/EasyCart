// The cart for the current shop.
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { Button, Card, EmptyState, InfoRow, Screen } from '@/components/ui';
import { useShop } from '@/features/shop/shop-context';
import { price } from '@/lib/format';
import { colors, radius, space, text } from '@/theme/theme';

export default function CartScreen() {
  const { lines, subtotal, count, setQuantity } = useShop();

  if (lines.length === 0) {
    return <Screen><EmptyState icon="shopping-cart" message="Your cart is empty." action={<Button label="Browse products" variant="outline" onPress={() => router.navigate('/shop')} />} /></Screen>;
  }

  return (
    <Screen footer={<Button icon="arrow-right" label={`Checkout · ${price(subtotal)}`} onPress={() => router.push('/shop/checkout')} />}>
      <Card title={`${count} ${count === 1 ? 'product' : 'products'} in cart`}>
        {lines.map((line) => (
          <View key={`${line.product_id}-${line.variant_label ?? ''}`} style={styles.line}>
            <Pressable
              style={styles.productPressable}
              onPress={() => router.push({ pathname: '/shop/product/[id]', params: { id: line.product_id, variant: line.variant_label ?? '' } })}
            >
              <View style={styles.thumb}>
                {line.image ? <Image source={{ uri: line.image }} style={{ width: '100%', height: '100%' }} /> : <Icon name="image" size={18} color={colors.textFaint} />}
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={text.heading} numberOfLines={2}>{line.name}</Text>
                {line.variant_label ? (
                  <View style={styles.variantBadge}>
                    <Text style={styles.variantBadgeText}>Option: {line.variant_label}</Text>
                  </View>
                ) : null}
                <Text style={text.small}>{price(line.price)} each</Text>
              </View>
            </Pressable>

            <View style={styles.rightCol}>
              <View style={styles.topRight}>
                <Text style={[text.heading, { fontVariant: ['tabular-nums'] }]}>{price(line.price * line.quantity)}</Text>
                <Pressable
                  onPress={() => setQuantity(line.product_id, line.variant_label, 0)}
                  style={styles.deleteButton}
                  accessibilityLabel="Remove item"
                >
                  <Icon name="trash-2" size={16} color={colors.danger} />
                </Pressable>
              </View>
              <View style={styles.stepper}>
                <Pressable onPress={() => setQuantity(line.product_id, line.variant_label, line.quantity - 1)} style={styles.stepButton} accessibilityLabel="Less">
                  <Icon name={line.quantity === 1 ? 'trash-2' : 'minus'} size={14} color={line.quantity === 1 ? colors.danger : colors.text} />
                </Pressable>
                <Text style={styles.qty}>{line.quantity}</Text>
                <Pressable onPress={() => setQuantity(line.product_id, line.variant_label, line.quantity + 1)} disabled={line.quantity >= line.max} style={[styles.stepButton, line.quantity >= line.max && { opacity: 0.3 }]} accessibilityLabel="More">
                  <Icon name="plus" size={14} color={colors.text} />
                </Pressable>
              </View>
            </View>
          </View>
        ))}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: space.md }}>
          <InfoRow label="Subtotal" value={price(subtotal)} strong />
          <Text style={text.small}>Delivery fee and coupon are added at checkout.</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', gap: space.sm, alignItems: 'center', justifyContent: 'space-between' },
  productPressable: { flex: 1, flexDirection: 'row', gap: space.md, alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' },
  variantBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryTint },
  variantBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primaryDark },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  deleteButton: { padding: 4, borderRadius: radius.sm, backgroundColor: colors.dangerSoft },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.white },
  stepButton: { width: 30, height: 28, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 20, textAlign: 'center', fontWeight: '700', fontSize: 13, color: colors.text }
});
