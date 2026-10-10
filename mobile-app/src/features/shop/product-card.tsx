// One product in the grid: an inset rounded photo, name, price, and a wide ADD button that turns into a quantity stepper.
import { Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { FadeIn, PressScale } from '@/components/motion';
import { FavouriteButton } from './favourite-button';
import { Text } from '@/components/text';
import { fileUrl } from '@/lib/api';
import { price } from '@/lib/format';
import { colors, radius, shadow, space } from '@/theme/theme';
import type { Product } from '@/types/catalog';
import { useShop } from './shop-context';
import { useToast } from '@/components/toast';

export function productStock(product: Product) {
  return product.variants.length > 0 ? product.variants.reduce((sum, v) => sum + v.stock, 0) : product.stock_quantity;
}

export function ProductCard({ product, width, index = 0 }: { product: Product; width: number; index?: number }) {
  const { add, lines, setQuantity } = useShop();
  const toast = useToast();
  const image = fileUrl(product.images[0]);
  const stock = productStock(product);
  const needsChoice = product.variants.length > 0;
  const fewLeft = stock > 0 && stock <= (product.low_stock_threshold ?? 5);
  // Items with options are chosen on the product page, so only plain products get the in-card stepper.
  const inCart = needsChoice ? undefined : lines.find((line) => line.product_id === product.id && !line.variant_label);
  const from = needsChoice ? Math.min(...product.variants.map((v) => v.price)) : product.price;

  function quickAdd() {
    if (needsChoice) return router.push(`/shop/product/${product.id}`);
    add({ product_id: product.id, name: product.name, price: product.price, quantity: 1, image, max: product.stock_quantity });
    toast(`${product.name} added to cart`, 'success');
  }

  return (
    <FadeIn index={index} style={{ width }}>
      <PressScale onPress={() => router.push(`/shop/product/${product.id}`)} style={styles.card} accessibilityRole="button" accessibilityLabel={product.name}>
        <View style={styles.imageWrap}>
          {image ? <Image source={{ uri: image }} style={styles.image} resizeMode="cover" /> : <Icon name="image" size={28} color={colors.textFaint} />}
          <View style={styles.heart}><FavouriteButton productId={product.id} size={30} /></View>
          {stock <= 0 ? (
            <View style={[styles.badge, { backgroundColor: 'rgba(15,23,42,0.85)' }]}><Text style={[styles.badgeText, { color: colors.white }]}>Sold out</Text></View>
          ) : fewLeft ? (
            <View style={[styles.badge, { backgroundColor: colors.warningSoft }]}><Text style={[styles.badgeText, { color: colors.warning }]}>Only {stock} left</Text></View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.meta} numberOfLines={1}>{needsChoice ? `${product.variants.length} ${product.variants.length === 1 ? 'option' : 'options'}` : ' '}</Text>
          <Text style={styles.price} numberOfLines={1}>{needsChoice ? <Text style={styles.from}>From </Text> : null}{price(from)}</Text>

          {stock <= 0 ? (
            <View style={[styles.action, styles.soldOut]}><Text style={styles.soldOutText}>Sold out</Text></View>
          ) : inCart ? (
            <View style={[styles.action, styles.stepper]}>
              <PressScale onPress={() => setQuantity(product.id, undefined, inCart.quantity - 1)} style={styles.stepButton} accessibilityLabel={`Remove one ${product.name}`}>
                <Icon name={inCart.quantity === 1 ? 'trash-2' : 'minus'} size={16} color={colors.white} strokeWidth={2.5} />
              </PressScale>
              <Text style={styles.qty}>{inCart.quantity}</Text>
              <PressScale onPress={() => setQuantity(product.id, undefined, inCart.quantity + 1)} disabled={inCart.quantity >= inCart.max} style={[styles.stepButton, inCart.quantity >= inCart.max && { opacity: 0.4 }]} accessibilityLabel={`Add one more ${product.name}`}>
                <Icon name="plus" size={16} color={colors.white} strokeWidth={2.5} />
              </PressScale>
            </View>
          ) : (
            <PressScale onPress={quickAdd} style={[styles.action, styles.add]} accessibilityRole="button" accessibilityLabel={`Add ${product.name}`}>
              <Text style={styles.addText}>ADD</Text>
              <Icon name="plus" size={14} color={colors.primary} strokeWidth={3} />
            </PressScale>
          )}
        </View>
      </PressScale>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, padding: 8, ...shadow },
  imageWrap: { aspectRatio: 1, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  heart: { position: 'absolute', top: 6, right: 6, zIndex: 2 },
  badge: { position: 'absolute', left: 6, bottom: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: '700' },
  body: { paddingHorizontal: 4, paddingTop: 10, paddingBottom: 2, gap: 2 },
  name: { fontSize: 14, fontWeight: '700', color: colors.text, minHeight: 36, lineHeight: 18 },
  meta: { fontSize: 11, color: colors.textMuted },
  from: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  price: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 2, marginBottom: 8 },
  action: { height: 38, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  add: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primarySoft },
  addText: { fontSize: 13, fontWeight: '800', color: colors.primary, letterSpacing: 0.6 },
  stepper: { backgroundColor: colors.primary, justifyContent: 'space-between', paddingHorizontal: 4 },
  stepButton: { width: 40, height: 38, alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 15, fontWeight: '800', color: colors.white },
  soldOut: { backgroundColor: colors.borderSoft },
  soldOutText: { fontSize: 12, fontWeight: '700', color: colors.textFaint }
});
