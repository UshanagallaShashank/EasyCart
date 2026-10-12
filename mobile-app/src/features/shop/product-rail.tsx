// A titled row of products that scrolls sideways, used for "Order again", "Your favourites" and similar shelves on the home.
import { ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Icon, type IconName } from '@/components/icon';
import { PressScale } from '@/components/motion';
import { Text } from '@/components/text';
import { fileUrl } from '@/lib/api';
import { price } from '@/lib/format';
import { useContent } from '@/lib/i18n';
import { colors, radius, shadow, space } from '@/theme/theme';
import type { Product } from '@/types/catalog';
import { ProductCard, type CardActions } from './product-card';

const CARD_WIDTH = 156;
const COMPACT_CARD_WIDTH = 108;

function CompactProductCard({ product, width }: { product: Product; width: number }) {
  const name = useContent(product.name);
  const image = fileUrl(product.images?.[0]);
  const minPrice = product.variants && product.variants.length > 0
    ? Math.min(...product.variants.map((v) => v.price))
    : product.price;

  return (
    <PressScale
      onPress={() => router.push(`/shop/product/${product.id}`)}
      style={[styles.compactCard, { width }]}
      accessibilityLabel={product.name}
    >
      <View style={styles.compactImageWrap}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.compactImage}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
            recyclingKey={product.id}
          />
        ) : (
          <Icon name="image" size={24} color={colors.textFaint} />
        )}
      </View>
      <View style={styles.compactBody}>
        <Text style={styles.compactName} numberOfLines={1} ellipsizeMode="tail">
          {name}
        </Text>
        <Text style={styles.compactPrice} numberOfLines={1}>
          {price(minPrice)}
        </Text>
      </View>
    </PressScale>
  );
}

export function ProductRail({ title, subtitle, icon, accent, products, actions, compact = false }: {
  actions: CardActions;
  title: string;
  subtitle?: string;
  icon: IconName;
  accent: { fg: string; bg: string };
  products: Product[];
  compact?: boolean;
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
        {products.map((product, index) =>
          compact ? (
            <CompactProductCard key={product.id} product={product} width={COMPACT_CARD_WIDTH} />
          ) : (
            <ProductCard
              key={product.id}
              product={product}
              width={CARD_WIDTH}
              index={index}
              line={actions.lineFor(product.id)}
              rating={actions.ratingFor(product.id)}
              onAdd={actions.onAdd}
              onSetQuantity={actions.onSetQuantity}
            />
          )
        )}
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
  row: { flexDirection: 'row', gap: space.md, paddingRight: space.lg, paddingBottom: 4 },
  compactCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 6,
    ...shadow
  },
  compactImageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  compactImage: {
    width: '100%',
    height: '100%'
  },
  compactBody: {
    paddingTop: 6,
    paddingHorizontal: 2,
    gap: 2
  },
  compactName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 16
  },
  compactPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text
  }
});
