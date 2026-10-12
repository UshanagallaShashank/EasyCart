// "Your usuals": what this shopper buys most often here, worked out from their past orders, with one button
// that puts all of them in the cart at once.
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { Button } from '@/components/ui';
import { useToast } from '@/components/toast';
import { useT } from '@/lib/i18n';
import { fileUrl } from '@/lib/api';
import { colors, space } from '@/theme/theme';
import type { Order } from '@/types/order';
import type { Product } from '@/types/catalog';
import { useShop } from '../shop-context';
import { ProductCard, productStock, type CardActions } from '../product-card';

const MAX_USUALS = 8;
const CARD_WIDTH = 120;

// Products ordered most often first (counting each order once), only plain in-stock ones the shop still sells.
export function pickUsuals(orders: Order[], catalog: Product[]): Product[] {
  const times = new Map<string, number>();
  orders.filter((order) => order.status !== 'cancelled').forEach((order) => {
    new Set(order.items.map((item) => item.product_id)).forEach((id) => times.set(id, (times.get(id) ?? 0) + 1));
  });
  const ranked = [...times.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => catalog.find((product) => product.id === id));
  return ranked.filter((product): product is Product => Boolean(product) && productStock(product!) > 0 && product!.variants.length === 0).slice(0, MAX_USUALS);
}

export function YourUsuals({ orders, catalog, actions }: { orders: Order[]; catalog: Product[]; actions: CardActions }) {
  const { add, lines } = useShop();
  const toast = useToast();
  const t = useT();
  const usuals = pickUsuals(orders, catalog);
  if (usuals.length === 0) return null;
  const missing = usuals.filter((product) => !lines.some((line) => line.product_id === product.id && !line.variant_label));

  function addAll() {
    missing.forEach((product) => add({ product_id: product.id, name: product.name, price: product.price, quantity: 1, image: fileUrl(product.images[0]), max: product.stock_quantity }));
    toast(t(missing.length === 1 ? '{n} usual added to cart' : '{n} usuals added to cart', { n: missing.length }), 'success');
  }

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('Your usuals')}</Text>
          <Text style={styles.subtitle}>{t('What you buy most often here')}</Text>
        </View>
        {missing.length > 0 && <Button small icon="plus" label={t('Add all ({n})', { n: missing.length })} onPress={addAll} />}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {usuals.map((product, index) => <ProductCard key={product.id} product={product} width={CARD_WIDTH} index={index} line={actions.lineFor(product.id)} rating={actions.ratingFor(product.id)} onAdd={actions.onAdd} onSetQuantity={actions.onSetQuantity} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: colors.textMuted },
  row: { gap: space.md, paddingRight: space.lg }
});
