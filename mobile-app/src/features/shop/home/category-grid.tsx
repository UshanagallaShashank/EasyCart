// The shop's categories as a grid of soft coloured tiles (four to a row), "All" first. Tapping one filters the products.
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { Icon, type IconName } from '@/components/icon';
import { PressScale } from '@/components/motion';
import { accentAt, colors, radius, space } from '@/theme/theme';
import { useBrand } from '@/lib/brand';
import { selectFeedback } from '@/lib/feedback';
import { useT } from '@/lib/i18n';
import type { Category } from '@/types/catalog';

const ICONS: IconName[] = ['tags', 'gift', 'heart', 'sparkles', 'box', 'zap', 'store', 'package'];
const PER_ROW = 4;

export function CategoryGrid({ categories, value, onChange, width }: { categories: Category[]; value: string; onChange(id: string): void; width: number }) {
  const brand = useBrand();
  const t = useT();
  const tile = (width - space.md * (PER_ROW - 1)) / PER_ROW;
  const all = [{ id: '', name: t('All') }, ...categories];
  return (
    <View style={styles.grid}>
      {all.map((category, index) => {
        const active = category.id === value;
        const accent = index === 0 ? { fg: brand.primary, bg: brand.primaryTint } : accentAt(index);
        return (
          <PressScale key={category.id || 'all'} onPress={() => { selectFeedback(); onChange(active && category.id ? '' : category.id); }} style={{ width: tile, alignItems: 'center', gap: 6 }} accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={category.name}>
            <View style={[styles.tile, { width: tile, height: tile * 0.82, backgroundColor: accent.bg }, active && { borderColor: brand.primary }]}>
              <Icon name={index === 0 ? 'grid' : ICONS[(index - 1) % ICONS.length]} size={24} color={accent.fg} />
            </View>
            <Text style={[styles.label, active && { color: colors.text, fontWeight: '800' }]} numberOfLines={1}>{category.name}</Text>
          </PressScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  label: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textAlign: 'center' }
});
