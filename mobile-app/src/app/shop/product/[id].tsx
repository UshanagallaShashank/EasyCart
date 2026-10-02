// One product: photos, size/colour, stock, quantity and add to cart.
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Badge, Button, EmptyState, Loading, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { useShop } from '@/features/shop/shop-context';
import { useProduct } from '@/features/shop/shop-api';
import { fileUrl } from '@/lib/api';
import { price } from '@/lib/format';
import { colors, radius, space, text } from '@/theme/theme';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { slug, add } = useShop();
  const toast = useToast();
  const { data: product, isLoading } = useProduct(slug, id);
  const [variantLabel, setVariantLabel] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [photo, setPhoto] = useState(0);

  if (isLoading) return <Loading />;
  if (!product) return <Screen><EmptyState message="This product is no longer available." /></Screen>;

  const variant = product.variants.find((v) => v.label === variantLabel);
  const needsVariant = product.variants.length > 0 && !variant;
  const unitPrice = variant?.price ?? product.price;
  const stock = variant ? variant.stock : product.variants.length > 0 ? 0 : product.stock_quantity;
  const images = product.images.map((img) => fileUrl(img)).filter(Boolean) as string[];

  function addToCart() {
    add({ product_id: product!.id, variant_label: variant?.label, name: product!.name, price: unitPrice, quantity, image: images[0] ?? null, max: stock });
    toast(`${product!.name} added to cart`, 'success');
    router.back();
  }

  return (
    <Screen footer={<Button icon="shopping-cart" label={needsVariant ? 'Choose an option' : stock <= 0 ? 'Out of stock' : `Add ${quantity} · ${price(unitPrice * quantity)}`} onPress={addToCart} disabled={needsVariant || stock <= 0} />}>
      <Stack.Screen options={{ title: product.name }} />
      <View style={styles.photo}>
        {images[photo] ? <Image source={{ uri: images[photo] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <Feather name="image" size={40} color={colors.textFaint} />}
      </View>
      {images.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
          {images.map((uri, index) => (
            <Pressable key={uri} onPress={() => setPhoto(index)} style={[styles.thumb, index === photo && { borderColor: colors.primary }]}><Image source={{ uri }} style={{ width: '100%', height: '100%' }} /></Pressable>
          ))}
        </ScrollView>
      )}

      <View style={{ gap: 6 }}>
        <Text style={text.title}>{product.name}</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.primaryDark }}>{price(unitPrice)}</Text>
        {!needsVariant && <Badge tone={stock <= 0 ? 'danger' : stock <= product.low_stock_threshold ? 'warning' : 'success'} label={stock <= 0 ? 'Out of stock' : stock <= product.low_stock_threshold ? `Only ${stock} left` : 'In stock'} />}
      </View>

      {product.variants.length > 0 && (
        <View style={{ gap: space.sm }}>
          <Text style={text.heading}>Choose an option</Text>
          <View style={styles.variants}>
            {product.variants.map((v) => {
              const active = v.label === variantLabel;
              return (
                <Pressable key={v.label} disabled={v.stock <= 0} onPress={() => { setVariantLabel(v.label); setQuantity(1); }} style={[styles.variant, active && styles.variantActive, v.stock <= 0 && { opacity: 0.4 }]}>
                  <Text style={[styles.variantText, active && { color: colors.primaryDark }]}>{v.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {!needsVariant && stock > 0 && (
        <View style={styles.stepperRow}>
          <Text style={text.heading}>Quantity</Text>
          <View style={styles.stepper}>
            <Pressable onPress={() => setQuantity((q) => Math.max(1, q - 1))} style={styles.stepButton} accessibilityLabel="Less"><Feather name="minus" size={16} color={colors.text} /></Pressable>
            <Text style={styles.qty}>{quantity}</Text>
            <Pressable onPress={() => setQuantity((q) => Math.min(stock, q + 1))} style={styles.stepButton} accessibilityLabel="More"><Feather name="plus" size={16} color={colors.text} /></Pressable>
          </View>
        </View>
      )}

      {product.description ? <Text style={[text.body, { color: '#334155', lineHeight: 21 }]}>{product.description}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: { aspectRatio: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 60, height: 60, borderRadius: radius.md, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  variants: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  variant: { minWidth: 56, height: 40, paddingHorizontal: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  variantActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  variantText: { fontSize: 14, fontWeight: '600', color: colors.text },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.white },
  stepButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 24, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text }
});
