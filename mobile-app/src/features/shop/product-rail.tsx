// A titled row of products that scrolls sideways, used for "Your favourites", "Almost gone" and similar shelves.
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { colors, space } from '@/theme/theme';
import type { Product } from '@/types/catalog';
import { ProductCard, type CardActions } from './product-card';

const CARD_WIDTH = 120;

export function ProductRail({ title, subtitle, products, actions }: { actions: CardActions; title: string; subtitle?: string; products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <View style={styles.rail}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {products.map((product, index) => <ProductCard key={product.id} product={product} width={CARD_WIDTH} index={index} line={actions.lineFor(product.id)} rating={actions.ratingFor(product.id)} onAdd={actions.onAdd} onSetQuantity={actions.onSetQuantity} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { gap: space.md },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: colors.textMuted },
  row: { flexDirection: 'row', gap: space.md, paddingRight: space.lg, paddingBottom: 4 }
});
