// A titled row of products that scrolls sideways, used for "Order again", "Your favourites" and similar shelves on the home.
import { ScrollView, StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '@/components/icon';
import { Text } from '@/components/text';
import { colors, space } from '@/theme/theme';
import type { Product } from '@/types/catalog';
import { ProductCard, type CardActions } from './product-card';

const CARD_WIDTH = 156;

export function ProductRail({ title, subtitle, icon, accent, products, actions }: {
  actions: CardActions;
  title: string;
  subtitle?: string;
  icon: IconName;
  accent: { fg: string; bg: string };
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <View style={styles.rail}>
      <View style={styles.header}>
        <View style={[styles.bubble, { backgroundColor: accent.bg }]}><Icon name={icon} size={18} color={accent.fg} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {products.map((product, index) => <ProductCard key={product.id} product={product} width={CARD_WIDTH} index={index} line={actions.lineFor(product.id)} onAdd={actions.onAdd} onSetQuantity={actions.onSetQuantity} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { gap: space.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bubble: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: colors.textMuted },
  row: { flexDirection: 'row', gap: space.md, paddingRight: space.lg, paddingBottom: 4 }
});
