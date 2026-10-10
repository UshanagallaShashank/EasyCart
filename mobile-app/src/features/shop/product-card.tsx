// One product in the grid, drawn like the website's card: photo with a stock badge, name, price and a round add button.
import { Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { FadeIn, PressScale } from '@/components/motion';
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
        {image ? <Image source={{ uri: image }} style={styles.image} /> : <Icon name="image" size={28} color={colors.textFaint} />}
        {stock <= 0 ? (
          <View style={[styles.badge, { backgroundColor: 'rgba(15,23,42,0.85)' }]}><View style={[styles.dot, { backgroundColor: '#cbd5e1' }]} /><Text style={[styles.badgeText, { color: colors.white }]}>Sold out</Text></View>
        ) : fewLeft ? (
          <View style={[styles.badge, { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1 }]}><View style={[styles.dot, { backgroundColor: '#f59e0b' }]} /><Text style={[styles.badgeText, { color: colors.warning }]}>Only {stock} left</Text></View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.bottom}>
          <View style={{ flexShrink: 1 }}>
            {needsChoice && <Text style={styles.from}>From</Text>}
            <Text style={styles.price} numberOfLines={1}>{price(from)}</Text>
          </View>
          {stock > 0 && (inCart ? (
            <View style={styles.miniStepper}>
              <PressScale onPress={() => setQuantity(product.id, undefined, inCart.quantity - 1)} style={styles.miniButton} accessibilityLabel={`Remove one ${product.name}`}>
                <Icon name={inCart.quantity === 1 ? 'trash-2' : 'minus'} size={15} color={colors.white} strokeWidth={2.5} />
              </PressScale>
              <Text style={styles.miniQty}>{inCart.quantity}</Text>
              <PressScale onPress={() => setQuantity(product.id, undefined, inCart.quantity + 1)} disabled={inCart.quantity >= inCart.max} style={[styles.miniButton, inCart.quantity >= inCart.max && { opacity: 0.35 }]} accessibilityLabel={`Add one more ${product.name}`}>
                <Icon name="plus" size={15} color={colors.white} strokeWidth={2.5} />
              </PressScale>
            </View>
          ) : (
            <PressScale onPress={quickAdd} hitSlop={8} style={styles.add} accessibilityLabel={`Add ${product.name}`}>
              <Icon name={needsChoice ? 'chevron-right' : 'plus'} size={18} color={colors.white} strokeWidth={2.5} />
            </PressScale>
          ))}
        </View>
      </View>
    </PressScale>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: '#e8edf3', overflow: 'hidden', ...shadow },
  imageWrap: { aspectRatio: 1, backgroundColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  body: { padding: space.md, paddingTop: space.md, gap: 6, flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: colors.text, minHeight: 38, lineHeight: 19 },
  bottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, marginTop: 'auto' },
  from: { fontSize: 11, color: colors.textMuted },
  price: { fontSize: 15, fontWeight: '800', color: colors.text },
  miniStepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.text, borderRadius: radius.pill },
  miniButton: { width: 32, height: 36, alignItems: 'center', justifyContent: 'center' },
  miniQty: { minWidth: 18, textAlign: 'center', fontSize: 14, fontWeight: '800', color: colors.white },
  add: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' }
});
