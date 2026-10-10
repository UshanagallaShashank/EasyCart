// Store products with stock, search, filters and quick stock changes.
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/motion';
import { Badge, Button, EmptyState, Field, Loading, Pills, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { ownerCalls, useOwnerAction, useOwnerProducts } from '@/features/owner/owner-api';
import { errorMessage, fileUrl } from '@/lib/api';
import { price } from '@/lib/format';
import { colors, radius, space, text } from '@/theme/theme';

type Filter = 'all' | 'low' | 'out' | 'hidden';

export default function OwnerProducts() {
  const { data, isLoading, refetch, isRefetching } = useOwnerProducts();
  const adjust = useOwnerAction(ownerCalls.adjustStock);
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  if (isLoading) return <Loading />;

  const products = data ?? [];
  const isOut = (stock: number) => stock <= 0;
  const isLow = (stock: number, threshold: number) => stock > 0 && stock <= threshold;
  const counts = {
    all: products.length,
    low: products.filter((p) => isLow(p.stock_quantity, p.low_stock_threshold)).length,
    out: products.filter((p) => isOut(p.stock_quantity)).length,
    hidden: products.filter((p) => !p.is_active).length
  };

  const shown = products.filter((product) => {
    if (search.trim() && !product.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    if (filter === 'low') return isLow(product.stock_quantity, product.low_stock_threshold);
    if (filter === 'out') return isOut(product.stock_quantity);
    if (filter === 'hidden') return !product.is_active;
    return true;
  });

  const change = (id: string, delta: number) => adjust.mutate({ id, delta }, { onError: (e) => toast(errorMessage(e), 'error') });

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <Button icon="plus" label="Add product" onPress={() => router.push('/owner/product/new')} />
      <Field icon="search" value={search} onChangeText={setSearch} placeholder="Search your products" returnKeyType="search" />
      <Pills<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All', count: counts.all },
          { value: 'low', label: 'Low stock', count: counts.low },
          { value: 'out', label: 'Out of stock', count: counts.out },
          { value: 'hidden', label: 'Hidden', count: counts.hidden }
        ]}
      />

      {shown.length === 0 ? <EmptyState icon="box" message={products.length === 0 ? 'No products yet.' : 'No products match.'} /> : shown.map((product) => {
        const image = fileUrl(product.images[0]);
        const stock = product.stock_quantity;
        const tone = isOut(stock) ? 'danger' : isLow(stock, product.low_stock_threshold) ? 'warning' : 'success';
        const note = isOut(stock) ? 'Out of stock' : isLow(stock, product.low_stock_threshold) ? 'Low stock' : 'In stock';
        return (
          <View key={product.id} style={styles.row}>
            <Pressable accessibilityRole="button" onPress={() => router.push(`/owner/product/${product.id}`)} style={styles.open}>
              <View style={styles.thumb}>{image ? <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} /> : <Icon name="image" size={18} color={colors.textFaint} />}</View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={text.heading} numberOfLines={1}>{product.name}</Text>
                <Text style={text.small}>{price(product.price)}{product.variants.length ? ` · ${product.variants.length} ${product.variants.length === 1 ? 'option' : 'options'}` : ''}</Text>
                <View style={{ flexDirection: 'row', gap: space.sm }}>
                  <Badge tone={tone} label={note} />
                  {!product.is_active && <Badge label="Hidden" />}
                </View>
              </View>
            </Pressable>

            <View style={styles.stockBox}>
              <Text style={styles.stockLabel}>Stock</Text>
              <View style={styles.stepper}>
                <PressScale onPress={() => change(product.id, -1)} disabled={stock <= 0} style={[styles.stepButton, stock <= 0 && { opacity: 0.3 }]} accessibilityLabel={`Reduce stock of ${product.name}`}>
                  <Icon name="minus" size={16} color={colors.primaryDark} />
                </PressScale>
                <Text style={styles.stockQty}>{stock}</Text>
                <PressScale onPress={() => change(product.id, 1)} style={styles.stepButton} accessibilityLabel={`Increase stock of ${product.name}`}>
                  <Icon name="plus" size={16} color={colors.primaryDark} />
                </PressScale>
              </View>
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  open: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.md },
  thumb: { width: 56, height: 56, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' },
  stockBox: { alignItems: 'center', gap: 4 },
  stockLabel: { fontSize: 10, fontWeight: '700', color: colors.textFaint, letterSpacing: 0.6, textTransform: 'uppercase' },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.pill, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryTint },
  stepButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stockQty: { minWidth: 30, textAlign: 'center', fontSize: 14, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] }
});
