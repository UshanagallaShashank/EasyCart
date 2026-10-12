// One product in the grid, grocery-app style: the photo (or initials tile) with an ADD pill on its corner that turns
// into a quantity stepper, then the price, the name and small details (rating, options, few left).
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
import { ProductPlaceholder } from '@/components/product-placeholder';

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

  const soldOut = stock <= 0;
  return (
    <FadeIn index={index} style={{ width }}>
      <PressScale onPress={() => router.push(`/shop/product/${product.id}`)} accessibilityLabel={product.name}>
        <View style={[styles.imageWrap, soldOut && { opacity: 0.55 }]}>
          {image ? <Image source={{ uri: image }} style={styles.image} contentFit="cover" transition={150} cachePolicy="memory-disk" recyclingKey={product.id} /> : <ProductPlaceholder name={product.name} />}
          <View style={styles.heart}><FavouriteButton productId={product.id} size={28} /></View>
        </View>

        {/* The ADD pill sits over the photo's corner, like the big grocery apps, so it is always under the thumb. */}
        <View style={styles.actionSlot}>
          {soldOut ? (
            <View style={[styles.action, styles.soldOut]}><Text style={styles.soldOutText}>{t('Sold out')}</Text></View>
          ) : inCart ? (
            <View style={[styles.action, styles.stepper, { backgroundColor: brand.primary, borderColor: brand.primary }]}>
              <PressScale onPress={(e) => { e?.stopPropagation?.(); onSetQuantity(product.id, inCart.quantity - 1); }} style={styles.stepButton} accessibilityLabel={`Remove one ${product.name}`}>
                <Icon name={inCart.quantity === 1 ? 'trash-2' : 'minus'} size={14} color={colors.white} strokeWidth={2.6} />
              </PressScale>
              <Text style={styles.qty}>{inCart.quantity}</Text>
              <PressScale onPress={(e) => { e?.stopPropagation?.(); onSetQuantity(product.id, inCart.quantity + 1); }} disabled={inCart.quantity >= inCart.max} style={[styles.stepButton, inCart.quantity >= inCart.max && { opacity: 0.4 }]} accessibilityLabel={`Add one more ${product.name}`}>
                <Icon name="plus" size={14} color={colors.white} strokeWidth={2.6} />
              </PressScale>
            </View>
          ) : (
            <PressScale onPress={quickAdd} style={[styles.action, styles.add, { borderColor: brand.primary }]} accessibilityRole="button" accessibilityLabel={`Add ${product.name}`}>
              <Text style={[styles.addText, { color: brand.primary }]}>{t('ADD')}</Text>
            </PressScale>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.price} numberOfLines={1}>{needsChoice ? <Text style={styles.from}>{t('From')} </Text> : null}{price(from)}</Text>
          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          <View style={styles.metaRow}>
            {rating && rating.count > 0 && rating.average !== null ? (
              <View style={styles.rating}>
                <Icon name="star" size={10} color={accents.amber.fg} fill={accents.amber.fg} />
                <Text style={styles.ratingText}>{rating.average.toFixed(1)}</Text>
              </View>
            ) : null}
            {fewLeft ? <Text style={styles.fewLeft} numberOfLines={1}>{t('Only {n} left', { n: stock })}</Text> : needsChoice ? <Text style={styles.meta} numberOfLines={1}>{t(product.variants.length === 1 ? '{n} option' : '{n} options', { n: product.variants.length })}</Text> : null}
          </View>
        </View>
      </PressScale>
    </FadeIn>
  );
}

// memo: the card is redrawn only when its own product, size or cart line changes.
export const ProductCard = memo(ProductCardView);

const styles = StyleSheet.create({
  imageWrap: { aspectRatio: 1, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  heart: { position: 'absolute', top: 5, right: 5, zIndex: 2 },
  actionSlot: { alignItems: 'flex-end', marginTop: -18, marginRight: 6, zIndex: 3 },
  action: { height: 34, minWidth: 72, borderRadius: radius.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, paddingHorizontal: 10, backgroundColor: colors.white, shadowColor: '#0f1222', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  add: { backgroundColor: colors.white },
  addText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.4 },
  stepper: { justifyContent: 'space-between', paddingHorizontal: 0, minWidth: 84 },
  stepButton: { width: 28, height: 32, alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 14, fontWeight: '800', color: colors.white },
  soldOut: { borderColor: colors.border, backgroundColor: colors.card, shadowOpacity: 0, elevation: 0 },
  soldOutText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  body: { paddingHorizontal: 2, paddingTop: 4, gap: 2 },
  price: { fontSize: 15, fontWeight: '800', color: colors.text },
  from: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  name: { fontSize: 13, fontWeight: '600', color: colors.textSoft, minHeight: 34, lineHeight: 17 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 16 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: accents.amber.bg, borderRadius: radius.pill, paddingHorizontal: 5, paddingVertical: 1 },
  ratingText: { fontSize: 10, fontWeight: '800', color: '#92400e' },
  meta: { fontSize: 11, color: colors.textMuted, flexShrink: 1 },
  fewLeft: { fontSize: 11, fontWeight: '700', color: colors.warning, flexShrink: 1 }
});
