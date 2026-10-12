// The cart for the current shop. Lines slide in and out, and the quantity buttons give a little press feedback.
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { router, useIsFocused } from 'expo-router';
import { Text } from '@/components/text';
import { useConfirm } from '@/components/confirm';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/motion';
import { Button, Card, EmptyState, InfoRow, Screen } from '@/components/ui';
import { useShop, type CartLine } from '@/features/shop/shop-context';
import { price } from '@/lib/format';
import { colors, radius, shadow, space, text } from '@/theme/theme';
import { useT } from '@/lib/i18n';
import { ContentText } from '@/components/content-text';
import { ProductPlaceholder } from '@/components/product-placeholder';
import { CartSuggestions } from '@/features/shop/cart-suggestions';
import { FreeDeliveryProgress } from '@/features/shop/free-delivery-progress';
import { useStore } from '@/features/shop/shop-api';
import { useBrand } from '@/lib/brand';

function CartRow({ line }: { line: CartLine }) {
  const brand = useBrand();
  const { setQuantity } = useShop();
  const atMax = line.quantity >= line.max;
  const t = useT();
  // A row added while this tab is hidden would play its entry animation unseen and can stay invisible, so only animate when the tab is showing.
  const showing = useIsFocused();

  return (
    <Animated.View
      entering={showing ? FadeIn.duration(150) : undefined}
      exiting={FadeOut.duration(120)}
      layout={LinearTransition.duration(150)}
      style={styles.line}
    >
      <Pressable
        style={styles.productPressable}
        onPress={() => router.push({ pathname: '/shop/product/[id]', params: { id: line.product_id, variant: line.variant_label ?? '' } })}
      >
        <View style={styles.thumb}>
          {line.image ? <Image source={{ uri: line.image }} style={{ width: '100%', height: '100%' }} /> : <ProductPlaceholder name={line.name} size="sm" />}
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <ContentText value={line.name} style={text.heading} numberOfLines={2} />
          {line.variant_label ? (
            <View style={[styles.variantBadge, { backgroundColor: brand.primarySoft, borderColor: brand.primaryTint }]}>
              <Text style={[styles.variantBadgeText, { color: brand.primaryDark }]}>Option: {line.variant_label}</Text>
            </View>
          ) : null}
          <Text style={text.small}>{price(line.price)} each</Text>
        </View>
      </Pressable>

      <View style={styles.rightCol}>
        <Text style={styles.lineTotal}>{price(line.price * line.quantity)}</Text>
        <View style={[styles.stepper, { backgroundColor: brand.primarySoft, borderColor: brand.primaryTint }]}>
          <PressScale onPress={() => setQuantity(line.product_id, line.variant_label, line.quantity - 1)} style={styles.stepButton} accessibilityLabel={line.quantity === 1 ? 'Remove item' : 'Less'}>
            <Icon name={line.quantity === 1 ? 'trash-2' : 'minus'} size={16} color={line.quantity === 1 ? colors.danger : brand.primaryDark} />
          </PressScale>
          <Text style={styles.qty}>{line.quantity}</Text>
          <PressScale onPress={() => setQuantity(line.product_id, line.variant_label, line.quantity + 1)} disabled={atMax} style={[styles.stepButton, atMax && { opacity: 0.3 }]} accessibilityLabel="More">
            <Icon name="plus" size={16} color={brand.primaryDark} />
          </PressScale>
        </View>
        {atMax ? <Text style={styles.maxHint}>{t('Max available')}</Text> : null}
      </View>
    </Animated.View>
  );
}

export default function CartScreen() {
  const { lines, subtotal, count, clear, slug } = useShop();
  const { data: store } = useStore(slug);
  const askConfirm = useConfirm();
  const t = useT();

  if (lines.length === 0) {
    return <Screen><EmptyState icon="shopping-cart" message={t('Your cart is empty. Add something you like and it will show up here.')} action={<Button label={t('Browse products')} variant="outline" onPress={() => router.navigate('/shop')} />} /><CartSuggestions emptyCart /></Screen>;
  }

  return (
    <Screen footer={<Button icon="arrow-right" label={`${t('Checkout')} · ${price(subtotal)}`} onPress={() => router.push('/shop/checkout')} />}>
      <View style={styles.headerRow}>
        <Text style={text.heading}>{t(count === 1 ? '{count} product in your cart' : '{count} products in your cart', { count })}</Text>
        <Pressable onPress={async () => { if (await askConfirm({ title: t('Clear your cart?'), message: t(count === 1 ? 'All {count} product will be removed.' : 'All {count} products will be removed.', { count }), confirmLabel: t('Clear cart'), cancelLabel: t('Keep items'), icon: 'trash-2' })) clear(); }} hitSlop={10} accessibilityRole="button"><Text style={styles.clear}>{t('Clear cart')}</Text></Pressable>
      </View>

      <FreeDeliveryProgress subtotal={subtotal} fee={store?.delivery_fee ?? 0} freeAbove={store?.free_delivery_above} />

      <View style={{ gap: space.md }}>
        {lines.map((line) => <CartRow key={`${line.product_id}-${line.variant_label ?? ''}`} line={line} />)}
      </View>

      <Card>
        <InfoRow label={t('Subtotal')} value={price(subtotal)} strong />
        <Text style={text.small}>{t('Delivery fee and coupon are added at checkout.')}</Text>
      </Card>

      <CartSuggestions />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clear: { fontSize: 13, fontWeight: '700', color: colors.danger },
  line: { flexDirection: 'row', gap: space.sm, alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, padding: space.md, ...shadow },
  productPressable: { flex: 1, flexDirection: 'row', gap: space.md, alignItems: 'center' },
  thumb: { width: 64, height: 64, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' },
  variantBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryTint },
  variantBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primaryDark },
  rightCol: { alignItems: 'flex-end', gap: 8 },
  lineTotal: { fontSize: 15, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.pill, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryTint },
  stepButton: { width: 34, height: 32, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 22, textAlign: 'center', fontWeight: '800', fontSize: 14, color: colors.text },
  maxHint: { fontSize: 10, color: colors.textMuted }
});
