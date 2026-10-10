import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from '@/components/text';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Icon } from '@/components/icon';
import { FadeIn, PressScale } from '@/components/motion';
import { FavouriteButton } from '@/features/shop/favourite-button';
import { Button, EmptyState, Loading, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { useShop } from '@/features/shop/shop-context';
import { useProduct } from '@/features/shop/shop-api';
import { fileUrl } from '@/lib/api';
import { price } from '@/lib/format';
import { colors, radius, space, text } from '@/theme/theme';
import { FloatingCartBar } from '@/components/floating-cart-bar';

const PHOTO_HEIGHT = 300;

export default function ProductScreen() {
  const { id, variant: queryVariant } = useLocalSearchParams<{ id: string; variant?: string }>();
  const { slug, add, lines, subtotal, setQuantity: updateCartQuantity, markViewed } = useShop();
  const toast = useToast();
  const { data: product, isLoading } = useProduct(slug, id);
  const [variantLabel, setVariantLabel] = useState<string | undefined>(queryVariant);
  const [quantity, setQuantity] = useState(1);
  const [photo, setPhoto] = useState(0);
  const pagerRef = useRef<ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();

  useEffect(() => {
    setVariantLabel(queryVariant);
    setQuantity(1);
    setPhoto(0);
    pagerRef.current?.scrollTo({ x: 0, animated: false });
  }, [id, queryVariant]);

  useEffect(() => {
    if (product) markViewed(product.id);
  }, [product?.id]);

  // Width of the photo container within Screen column (padding 16 on each side)
  const cardWidth = Math.max(280, Math.min(windowWidth - 32, 680));

  useEffect(() => {
    if (product && product.variants.length > 0 && !variantLabel) {
      const selected = queryVariant ? product.variants.find((v) => v.label === queryVariant) : undefined;
      const defaultVariant = selected ?? product.variants.find((v) => v.stock > 0) ?? product.variants[0];
      if (defaultVariant) {
        setVariantLabel(defaultVariant.label);
      }
    }
  }, [product, variantLabel, queryVariant]);

  const existingCartLine = lines.find(
    (l) => l.product_id === product?.id && (l.variant_label ?? '') === (variantLabel ?? '')
  );

  useEffect(() => {
    if (existingCartLine) {
      setQuantity(existingCartLine.quantity);
    }
  }, [existingCartLine?.quantity, variantLabel]);

  if (isLoading) return <Loading />;
  if (!product) return <Screen><EmptyState message="This product is no longer available." /></Screen>;

  const variant = product.variants.find((v) => v.label === variantLabel);
  const needsVariant = product.variants.length > 0 && !variant;
  const unitPrice = variant?.price ?? product.price;
  const stock = variant ? variant.stock : product.variants.length > 0 ? 0 : product.stock_quantity;
  const images = product.images.map((img) => fileUrl(img)).filter(Boolean) as string[];

  const stockLook = stock <= 0
    ? { label: 'Out of stock', fg: colors.danger, bg: colors.dangerSoft, border: '#fecdd3', dot: colors.danger }
    : stock <= product.low_stock_threshold
      ? { label: `Only ${stock} left`, fg: colors.warning, bg: colors.warningSoft, border: '#fde68a', dot: '#f59e0b' }
      : { label: 'In Stock', fg: colors.success, bg: colors.successSoft, border: '#a7f3d0', dot: '#10b981' };

  function handleAddToCart() {
    if (!product) return;
    if (__DEV__) console.log(`[cart] tapped add: ${product.name}, option=${variant?.label ?? 'none'}, stock=${stock}, quantity=${quantity}`);
    add({ product_id: product.id, variant_label: variant?.label, name: product.name, price: unitPrice, quantity, image: images[0] ?? null, max: stock });
    toast(`${product.name}${variant?.label ? ` (${variant.label})` : ''} added to cart`, 'success');
  }

  // Once the item is in the cart, the stepper changes the cart straight away.
  function changeCartQuantity(next: number) {
    if (!product || !existingCartLine) return;
    updateCartQuantity(product.id, variant?.label, Math.min(stock, next));
  }

  function handleThumbnailPress(index: number) {
    setPhoto(index);
    pagerRef.current?.scrollTo({ x: index * cardWidth, animated: true });
  }

  const footer = existingCartLine ? (
    <View style={styles.footerRow}>
      <View style={styles.stepper}>
        <PressScale onPress={() => changeCartQuantity(existingCartLine.quantity - 1)} style={styles.stepButton} accessibilityLabel={existingCartLine.quantity === 1 ? 'Remove from cart' : 'Less'}>
          <Icon name={existingCartLine.quantity === 1 ? 'trash-2' : 'minus'} size={16} color={existingCartLine.quantity === 1 ? colors.danger : colors.primaryDark} />
        </PressScale>
        <Text style={styles.qty}>{existingCartLine.quantity}</Text>
        <PressScale onPress={() => changeCartQuantity(existingCartLine.quantity + 1)} disabled={existingCartLine.quantity >= stock} style={[styles.stepButton, existingCartLine.quantity >= stock && { opacity: 0.35 }]} accessibilityLabel="More">
          <Icon name="plus" size={16} color={colors.primaryDark} />
        </PressScale>
      </View>
      <View style={{ flex: 1 }}>
        <Button icon="shopping-cart" label={`View cart · ${price(subtotal)}`} onPress={() => router.navigate('/shop/cart')} />
      </View>
    </View>
  ) : (
    <Button variant="primary" icon="shopping-bag" label={needsVariant ? 'Choose an option' : stock <= 0 ? 'Out of stock' : `Add to cart · ${price(unitPrice * quantity)}`} onPress={handleAddToCart} disabled={needsVariant || stock <= 0} />
  );

  return (
    <Screen footer={footer}>
      <Stack.Screen options={{ title: product.name }} />

      {/* Flipkart-style 1-Image View with Carousel Paging */}
      <View style={[styles.photo, { width: cardWidth }]}>
        {images.length > 1 ? (
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth}
            snapToAlignment="start"
            decelerationRate="fast"
            style={{ width: cardWidth, height: PHOTO_HEIGHT }}
            contentContainerStyle={{ width: cardWidth * images.length, height: PHOTO_HEIGHT }}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
              if (newIndex >= 0 && newIndex < images.length) {
                setPhoto(newIndex);
              }
            }}
            scrollEventThrottle={16}
          >
            {images.map((uri, idx) => (
              <View
                key={`${uri}-${idx}`}
                style={{
                  width: cardWidth,
                  height: PHOTO_HEIGHT,
                  flexShrink: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 14
                }}
              >
                <Image
                  source={{ uri }}
                  style={{ width: cardWidth - 28, height: PHOTO_HEIGHT - 28 }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
        ) : images[0] ? (
          <View style={{ width: cardWidth, height: PHOTO_HEIGHT, alignItems: 'center', justifyContent: 'center', padding: 14 }}>
            <Image source={{ uri: images[0] }} style={{ width: cardWidth - 28, height: PHOTO_HEIGHT - 28 }} resizeMode="contain" />
          </View>
        ) : (
          <View style={{ width: cardWidth, height: PHOTO_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="image" size={36} color={colors.textFaint} />
          </View>
        )}

        <View style={styles.heart}><FavouriteButton productId={product.id} size={38} /></View>

        {/* Previous arrow button (Flipkart style) */}
        {images.length > 1 && photo > 0 && (
          <Pressable
            onPress={() => handleThumbnailPress(photo - 1)}
            style={styles.navBtnLeft}
            hitSlop={8}
            accessibilityLabel="Previous image"
          >
            <Icon name="chevron-left" size={18} color="#1e293b" />
          </Pressable>
        )}

        {/* Next arrow button (Flipkart style) */}
        {images.length > 1 && photo < images.length - 1 && (
          <Pressable
            onPress={() => handleThumbnailPress(photo + 1)}
            style={styles.navBtnRight}
            hitSlop={8}
            accessibilityLabel="Next image"
          >
            <Icon name="chevron-right" size={18} color="#1e293b" />
          </Pressable>
        )}

        {/* Counter badge (Flipkart style: 1 / 2) */}
        {images.length > 1 && (
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{photo + 1} / {images.length}</Text>
          </View>
        )}

        {/* Indicator dots (Flipkart style) */}
        {images.length > 1 && (
          <View style={styles.dotsRow}>
            {images.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, idx === photo && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Thumbnails row (Flipkart style) */}
      {images.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.xs }}>
          {images.map((uri, index) => {
            const active = index === photo;
            return (
              <Pressable
                key={`${uri}-${index}`}
                onPress={() => handleThumbnailPress(index)}
                style={[styles.thumb, active && styles.thumbActive]}
                accessibilityLabel={`View photo ${index + 1}`}
              >
                <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <FadeIn style={styles.details}>
        {!needsVariant && (
          <View style={[styles.stock, { backgroundColor: stockLook.bg, borderColor: stockLook.border }]}>
            <View style={[styles.stockDot, { backgroundColor: stockLook.dot }]} />
            <Text style={[styles.stockText, { color: stockLook.fg }]}>{stockLook.label}</Text>
          </View>
        )}
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>{price(unitPrice)}</Text>
        {product.description ? <Text style={styles.description}>{product.description}</Text> : null}
      </FadeIn>
      <View style={styles.divider} />

      {product.variants.length > 0 && (
        <View style={{ gap: space.xs }}>
          <Text style={text.heading}>Choose an option</Text>
          <View style={styles.variants}>
            {product.variants.map((v) => {
              const active = v.label === variantLabel;
              return (
                <PressScale key={v.label} disabled={v.stock <= 0} onPress={() => { setVariantLabel(v.label); setQuantity(1); }} style={[styles.variant, active && styles.variantActive, v.stock <= 0 && { opacity: 0.4 }]}>
                  <Text style={[styles.variantText, active && { color: colors.primaryDark }]}>{v.label}</Text>
                </PressScale>
              );
            })}
          </View>
        </View>
      )}

      {!needsVariant && stock > 0 && !existingCartLine && (
        <View style={styles.stepperRow}>
          <Text style={text.heading}>Quantity</Text>
          <View style={styles.stepper}>
            <PressScale onPress={() => setQuantity((q) => Math.max(1, q - 1))} style={styles.stepButton} accessibilityLabel="Less"><Icon name="minus" size={16} color={colors.primaryDark} /></PressScale>
            <Text style={styles.qty}>{quantity}</Text>
            <PressScale onPress={() => setQuantity((q) => Math.min(stock, q + 1))} style={styles.stepButton} accessibilityLabel="More"><Icon name="plus" size={16} color={colors.primaryDark} /></PressScale>
          </View>
        </View>
      )}

      <View style={styles.trust}>
        <View style={styles.trustRow}><Icon name="truck" size={16} color={colors.primary} /><Text style={styles.trustText}>Delivery or in-store pickup at checkout</Text></View>
        <View style={styles.trustRow}><Icon name="shield-check" size={16} color={colors.primary} /><Text style={styles.trustText}>Secure checkout, code-verified handover</Text></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: { height: PHOTO_HEIGHT, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.cardBorder, position: 'relative' },
  navBtnLeft: {
    position: 'absolute',
    left: 8,
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10
  },
  navBtnRight: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10
  },
  heart: { position: 'absolute', top: 10, right: 10, zIndex: 11 },
  counterBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(15, 23, 42, 0.75)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, zIndex: 10 },
  counterText: { fontSize: 11, fontWeight: '700', color: colors.white },
  dotsRow: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(148, 163, 184, 0.45)' },
  dotActive: { width: 14, backgroundColor: colors.primary, borderRadius: 3 },
  details: { gap: 6 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.4, lineHeight: 28 },
  stock: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  stockDot: { width: 6, height: 6, borderRadius: 3 },
  stockText: { fontSize: 11, fontWeight: '700' },
  price: { fontSize: 28, fontWeight: '900', color: colors.primaryDark, letterSpacing: -0.6 },
  description: { fontSize: 14, lineHeight: 21, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border },
  trust: { gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryTint },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trustText: { fontSize: 12, color: colors.textSoft, flex: 1 },
  thumb: { width: 52, height: 52, borderRadius: radius.sm, overflow: 'hidden', borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: colors.white, padding: 4 },
  thumbActive: { borderColor: colors.primary, borderWidth: 2 },
  variants: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  variant: { minWidth: 56, height: 36, paddingHorizontal: 12, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  variantActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  variantText: { fontSize: 13, fontWeight: '600', color: colors.text },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.primaryTint, borderRadius: radius.pill, backgroundColor: colors.primarySoft, paddingHorizontal: 4 },
  stepButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 20, textAlign: 'center', fontSize: 14, fontWeight: '700', color: colors.text }
});
