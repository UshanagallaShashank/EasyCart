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
      <Card title={`${count} ${count === 1 ? 'item' : 'items'}`}>
        {lines.map((line) => (
          <View key={`${line.product_id}-${line.variant_label ?? ''}`} style={styles.line}>
            <View style={styles.thumb}>{line.image ? <Image source={{ uri: line.image }} style={{ width: '100%', height: '100%' }} /> : <Icon name="image" size={18} color={colors.textFaint} />}</View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={text.heading} numberOfLines={2}>{line.name}</Text>
              <Text style={text.small}>{line.variant_label ? `${line.variant_label} · ` : ''}{price(line.price)}</Text>
              <View style={styles.stepper}>
                <Pressable onPress={() => setQuantity(line.product_id, line.variant_label, line.quantity - 1)} style={styles.stepButton} accessibilityLabel="Less"><Icon name={line.quantity === 1 ? 'trash-2' : 'minus'} size={15} color={line.quantity === 1 ? colors.danger : colors.text} /></Pressable>
                <Text style={styles.qty}>{line.quantity}</Text>
                <Pressable onPress={() => setQuantity(line.product_id, line.variant_label, line.quantity + 1)} disabled={line.quantity >= line.max} style={[styles.stepButton, line.quantity >= line.max && { opacity: 0.3 }]} accessibilityLabel="More"><Icon name="plus" size={15} color={colors.text} /></Pressable>
              </View>
            </View>
            <Text style={[text.heading, { fontVariant: ['tabular-nums'] }]}>{price(line.price * line.quantity)}</Text>
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
  line: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  thumb: { width: 60, height: 60, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 4, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.white },
  stepButton: { width: 34, height: 32, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 22, textAlign: 'center', fontWeight: '700', color: colors.text }
});
