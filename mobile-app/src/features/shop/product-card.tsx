// One product in the grid: photo, name, price and a quick add button.
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { fileUrl } from '@/lib/api';
import { price } from '@/lib/format';
import { colors, radius, shadow, space } from '@/theme/theme';
import type { Product } from '@/types/catalog';
import { useShop } from './shop-context';
import { useToast } from '@/components/toast';

export function productStock(product: Product) {
  return product.variants.length > 0 ? product.variants.reduce((sum, v) => sum + v.stock, 0) : product.stock_quantity;
}

export function ProductCard({ product, width }: { product: Product; width: number }) {
  const { add } = useShop();
  const toast = useToast();
  const image = fileUrl(product.images[0]);
  const stock = productStock(product);
  const needsChoice = product.variants.length > 0;

  function quickAdd() {
    if (needsChoice) return router.push(`/shop/product/${product.id}`);
    add({ product_id: product.id, name: product.name, price: product.price, quantity: 1, image, max: product.stock_quantity });
    toast(`${product.name} added to cart`, 'success');
  }

  return (
    <Pressable onPress={() => router.push(`/shop/product/${product.id}`)} style={[styles.card, { width }]} accessibilityRole="button" accessibilityLabel={product.name}>
      <View style={styles.imageWrap}>
        {image ? <Image source={{ uri: image }} style={styles.image} /> : <Feather name="image" size={28} color={colors.textFaint} />}
        {stock <= 0 && <Text style={styles.soldOut}>Out of stock</Text>}
      </View>
      <View style={{ padding: space.md, gap: 4, flex: 1 }}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.bottom}>
          <Text style={styles.price}>{price(product.price)}</Text>
          {stock > 0 && (
            <Pressable onPress={quickAdd} hitSlop={8} style={styles.add} accessibilityLabel={`Add ${product.name}`}>
              <Feather name={needsChoice ? 'chevron-right' : 'plus'} size={18} color={colors.white} />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadow },
  imageWrap: { aspectRatio: 1, backgroundColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  soldOut: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(15,23,42,0.75)', color: colors.white, fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, overflow: 'hidden' },
  name: { fontSize: 14, fontWeight: '600', color: colors.text, minHeight: 36 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  price: { fontSize: 15, fontWeight: '700', color: colors.text },
  add: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }
});
