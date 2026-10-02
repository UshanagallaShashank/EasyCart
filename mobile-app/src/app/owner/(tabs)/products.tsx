// Store products with stock, and quick stock changes.
import { Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Badge, Button, EmptyState, Loading, Notice, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { ownerCalls, useOwnerAction, useOwnerProducts } from '@/features/owner/owner-api';
import { errorMessage, fileUrl } from '@/lib/api';
import { price } from '@/lib/format';
import { colors, radius, shadow, space, text } from '@/theme/theme';

export default function OwnerProducts() {
  const { data, isLoading, refetch, isRefetching } = useOwnerProducts();
  const adjust = useOwnerAction(ownerCalls.adjustStock);
  const toast = useToast();
  if (isLoading) return <Loading />;
  const change = (id: string, delta: number) => adjust.mutate({ id, delta }, { onError: (e) => toast(errorMessage(e), 'error') });

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <Notice icon="info">Add or edit products on the website. Here you can check stock and change it quickly.</Notice>
      {(data?.length ?? 0) === 0 ? <EmptyState icon="box" message="No products yet." /> : data!.map((product) => {
        const image = fileUrl(product.images[0]);
        const low = product.stock_quantity <= product.low_stock_threshold;
        return (
          <View key={product.id} style={styles.row}>
            <View style={styles.thumb}>{image ? <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} /> : <Feather name="image" size={18} color={colors.textFaint} />}</View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={text.heading} numberOfLines={1}>{product.name}</Text>
              <Text style={text.small}>{price(product.price)}{product.variants.length ? ` · ${product.variants.length} options` : ''}</Text>
              <View style={{ flexDirection: 'row', gap: space.sm }}>
                <Badge tone={product.stock_quantity <= 0 ? 'danger' : low ? 'warning' : 'success'} label={`${product.stock_quantity} in stock`} />
                {!product.is_active && <Badge label="Hidden" />}
              </View>
            </View>
            <View style={{ gap: 6 }}>
              <Button small variant="outline" icon="plus" label="1" onPress={() => change(product.id, 1)} />
              <Button small variant="outline" icon="minus" label="1" disabled={product.stock_quantity <= 0} onPress={() => change(product.id, -1)} />
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.md, ...shadow },
  thumb: { width: 56, height: 56, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' }
});
