// What the shopper sees while the search box is open and empty: their recent searches and what is popular here,
// so most searches take one tap. Typing shows matching products straight away (the home's grid does that part).
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { colors, radius, space } from '@/theme/theme';
import { useT } from '@/lib/i18n';
import type { Product } from '@/types/catalog';

const POPULAR_COUNT = 6;

export function SmartSearchPanel({ recent, products, onPick, onClear }: { recent: string[]; products: Product[]; onPick(words: string): void; onClear(): void }) {
  const t = useT();
  const popular = products.filter((product) => product.is_active).slice(0, POPULAR_COUNT);
  return (
    <View style={{ gap: space.lg }}>
      {recent.length > 0 && (
        <View style={{ gap: space.sm }}>
          <View style={styles.head}>
            <Text style={styles.title}>{t('Recent searches')}</Text>
            <Pressable onPress={onClear} hitSlop={8} accessibilityRole="button"><Text style={styles.clear}>{t('Clear')}</Text></Pressable>
          </View>
          <View style={styles.chips}>
            {recent.map((words) => (
              <Pressable key={words} onPress={() => onPick(words)} style={styles.chip} accessibilityRole="button" accessibilityLabel={`Search ${words}`}>
                <Icon name="clock" size={13} color={colors.textMuted} />
                <Text style={styles.chipText}>{words}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
      {popular.length > 0 && (
        <View style={{ gap: space.sm }}>
          <Text style={styles.title}>{t('Popular in this shop')}</Text>
          <View style={styles.chips}>
            {popular.map((product) => (
              <Pressable key={product.id} onPress={() => onPick(product.name)} style={styles.chip} accessibilityRole="button" accessibilityLabel={`Search ${product.name}`}>
                <Icon name="zap" size={13} color={colors.warning} />
                <Text style={styles.chipText} numberOfLines={1}>{product.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '800', color: colors.text },
  clear: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '100%', backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textSoft, flexShrink: 1 }
});
