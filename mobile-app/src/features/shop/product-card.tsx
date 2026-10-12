// One product in the grid: an inset rounded photo, name, price, and a wide ADD button that turns into a quantity stepper.
import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { FadeIn, PressScale } from '@/components/motion';
import { FavouriteButton } from './favourite-button';
import { Text } from '@/components/text';
import { fileUrl } from '@/lib/api';
import { price } from '@/lib/format';
import { accents, colors, radius, shadow, space } from '@/theme/theme';
import type { Product } from '@/types/catalog';
import { useShop, type CartLine } from './shop-context';
import { useProductRatings, type StarSummary } from './shop-api';
import { useToast } from '@/components/toast';
import { useT, useContent } from '@/lib/i18n';
import { useBrand } from '@/lib/brand';

export function productStock(product: Product) {
  return product.variants.length > 0 ? product.variants.reduce((sum, v) => sum + v.stock, 0) : product.stock_quantity;
}

// The cart behaviour every card shares. Cards get these as props instead of reading the cart themselves,
// so tapping ADD redraws only that one card and not the whole shop.
export interface CardActions {
  lineFor(productId: string): CartLine | undefined;
  ratingFor(productId: string): StarSummary | undefined;
  onAdd(product: Product): void;
  onSetQuantity(productId: string, quantity: number): void;
}

export function useCardActions(): CardActions {
  const { slug, lines, add, setQuantity } = useShop();
  const toast = useToast();
  const t = useT();
  const productRatings = useProductRatings(slug);
  const ratingFor = useCallback((productId: string) => productRatings.data?.[productId], [productRatings.data]);
  // Only plain products (no options) can be added from the card, so only their lines matter here.
  const plainLines = useMemo(() => new Map(lines.filter((line) => !line.variant_label).map((line) => [line.product_id, line])), [lines]);
  const lineFor = useCallback((productId: string) => plainLines.get(productId), [plainLines]);

  const onAdd = useCallback((product: Product) => {
    add({ product_id: product.id, name: product.name, price: product.price, quantity: 1, image: fileUrl(product.images[0]), max: product.stock_quantity });
    toast(t('{name} added to cart', { name: product.name }), 'success');
  }, [add, toast, t]);

  const onSetQuantity = useCallback((productId: string, quantity: number) => setQuantity(productId, undefined, quantity), [setQuantity]);

  return useMemo(() => ({ lineFor, ratingFor, onAdd, onSetQuantity }), [lineFor, ratingFor, onAdd, onSetQuantity]);
}

function ProductCardView({ product, width, index = 0, line, rating, onAdd, onSetQuantity }: { product: Product; width: number; index?: number; line?: CartLine; rating?: StarSummary; onAdd(product: Product): void; onSetQuantity(productId: string, quantity: number): void }) {
  const t = useT();
  const brand = useBrand();
  const name = useContent(product.name);
  const image = fileUrl(product.images[0]);
  const stock = productStock(product);
  const needsChoice = product.variants.length > 0;
  const fewLeft = stock > 0 && stock <= (product.low_stock_threshold ?? 5);
  // Items with options are chosen on the product page, so only plain products get the in-card stepper.
  const inCart = needsChoice ? undefined : line;
  const from = needsChoice ? Math.min(...product.variants.map((v) => v.price)) : product.price;

  function quickAdd(event?: any) {
    event?.stopPropagation?.();
    if (needsChoice) return router.push(`/shop/product/${product.id}`);
    onAdd(product);
  }

  return (
    <FadeIn index={index} style={{ width }}>
      <PressScale onPress={() => router.push(`/shop/product/${product.id}`)} style={styles.card} accessibilityLabel={product.name}>
        <View style={styles.imageWrap}>
          {image ? <Image source={{ uri: image }} style={styles.image} contentFit="cover" transition={150} cachePolicy="memory-disk" recyclingKey={product.id} /> : <Icon name="image" size={28} color={colors.textFaint} />}
          <View style={styles.heart}><FavouriteButton productId={product.id} size={30} /></View>
          {stock <= 0 ? (
            <View style={[styles.badge, { backgroundColor: 'rgba(15,23,42,0.85)' }]}><Text style={[styles.badgeText, { color: colors.white }]}>{t('Sold out')}</Text></View>
          ) : fewLeft ? (
            <View style={[styles.badge, { backgroundColor: colors.warningSoft }]}><Text style={[styles.badgeText, { color: colors.warning }]}>{t('Only {n} left', { n: stock })}</Text></View>
          ) : null}

          {/* Plus / Stepper on top right corner touching edges */}
          {stock > 0 && (
            <View style={styles.topRightAction}>
              {inCart ? (
                <View style={[styles.stepper, { backgroundColor: brand.primary }]}>
                  <PressScale onPress={(e) => { e?.stopPropagation?.(); onSetQuantity(product.id, inCart.quantity - 1); }} style={styles.stepButton} accessibilityLabel={`Remove one ${product.name}`}>
                    <Icon name={inCart.quantity === 1 ? 'trash-2' : 'minus'} size={14} color={colors.white} strokeWidth={2.5} />
                  </PressScale>
                  <Text style={styles.qty}>{inCart.quantity}</Text>
                  <PressScale onPress={(e) => { e?.stopPropagation?.(); onSetQuantity(product.id, inCart.quantity + 1); }} disabled={inCart.quantity >= inCart.max} style={[styles.stepButton, inCart.quantity >= inCart.max && { opacity: 0.4 }]} accessibilityLabel={`Add one more ${product.name}`}>
                    <Icon name="plus" size={14} color={colors.white} strokeWidth={2.5} />
                  </PressScale>
                </View>
              ) : (
                <PressScale
                  onPress={quickAdd}
                  style={styles.add}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${product.name}`}
                >
                  <Icon name="plus" size={18} color={brand.primary} strokeWidth={2.8} />
                </PressScale>
              )}
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          <View style={styles.metaRow}>
            {rating && rating.count > 0 && rating.average !== null ? (
              <View style={styles.rating}>
                <Icon name="star" size={11} color={accents.amber.fg} fill={accents.amber.fg} />
                <Text style={styles.ratingText}>{rating.average.toFixed(1)}</Text>
              </View>
            ) : null}
            <Text style={styles.meta} numberOfLines={1}>{needsChoice ? t(product.variants.length === 1 ? '{n} option' : '{n} options', { n: product.variants.length }) : ' '}</Text>
          </View>
          <Text style={styles.price} numberOfLines={1}>{needsChoice ? <Text style={styles.from}>{t('From')} </Text> : null}{price(from)}</Text>
        </View>
      </PressScale>
    </FadeIn>
  );
}

// memo: the card is redrawn only when its own product, size or cart line changes.
export const ProductCard = memo(ProductCardView);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, padding: 8, ...shadow },
  imageWrap: { aspectRatio: 1, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  heart: { position: 'absolute', top: 6, left: 6, zIndex: 2 },
  topRightAction: { position: 'absolute', top: 0, right: 0, zIndex: 2 },
  badge: { position: 'absolute', left: 6, bottom: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: '700' },
  body: { paddingHorizontal: 4, paddingTop: 10, paddingBottom: 6, gap: 2 },
  name: { fontSize: 14, fontWeight: '700', color: colors.text, minHeight: 36, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: accents.amber.bg, borderRadius: radius.pill, paddingHorizontal: 6, paddingVertical: 1 },
  ratingText: { fontSize: 11, fontWeight: '800', color: '#92400e' },
  meta: { fontSize: 11, color: colors.textMuted, flexShrink: 1 },
  from: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  price: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 2, marginBottom: 2 },
  add: {
    width: 36,
    height: 36,
    borderTopRightRadius: radius.md,
    borderBottomLeftRadius: radius.md,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: -1, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3
  },
  stepper: {
    height: 36,
    borderTopRightRadius: radius.md,
    borderBottomLeftRadius: radius.md,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: -1, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3
  },
  stepButton: { width: 28, height: 36, alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 13, fontWeight: '800', color: colors.white, paddingHorizontal: 4 }
});
