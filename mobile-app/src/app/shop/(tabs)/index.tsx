// The shop: store banner, search, categories and products in a grid that adapts to the screen width.
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, EmptyState, Loading, Notice, Pills, Screen } from '@/components/ui';
import { useShop } from '@/features/shop/shop-context';
import { useCategories, useProducts, useStore } from '@/features/shop/shop-api';
import { ProductCard } from '@/features/shop/product-card';
import { ApiError, errorMessage, fileUrl } from '@/lib/api';
import { price } from '@/lib/format';
import { colors, radius, space } from '@/theme/theme';

export default function ShopHome() {
  const { slug } = useShop();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const store = useStore(slug);
  const categories = useCategories(slug);
  const products = useProducts(slug, search.trim(), category);
  const { width } = useWindowDimensions();

  // 2 columns on phones, more on tablets; the page column is at most 720 wide.
  const contentWidth = Math.min(width, 720) - space.lg * 2;
  const columns = contentWidth >= 640 ? 4 : contentWidth >= 460 ? 3 : 2;
  const cardWidth = (contentWidth - space.md * (columns - 1)) / columns;

  if (store.isLoading) return <Loading />;
  // Status 0 means the server could not be reached at all (no network, or wrong server address).
  const offline = store.error instanceof ApiError && store.error.status === 0;
  if (store.isError || !store.data) {
    return (
      <Screen>
        <EmptyState
          icon={offline ? 'wifi-off' : 'shopping-bag'}
          message={offline ? errorMessage(store.error) : `We could not open the shop "${slug}". It may be offline, or the shop code is wrong.`}
          action={offline ? <Button label="Try again" variant="outline" onPress={() => void store.refetch()} /> : <Button label="Choose another shop" variant="outline" onPress={() => router.push('/shop/account')} />}
        />
      </Screen>
    );
  }

  const logo = fileUrl(store.data.logo_url);
  return (
    <Screen onRefresh={() => { void store.refetch(); void products.refetch(); }} refreshing={products.isRefetching}>
      <View style={styles.hero}>
        {logo ? <Image source={{ uri: logo }} style={styles.logo} /> : <View style={[styles.logo, styles.logoFallback]}><Text style={styles.logoLetter}>{store.data.name.charAt(0)}</Text></View>}
        <View style={{ flex: 1 }}>
          <Text style={styles.storeName} numberOfLines={1}>{store.data.name}</Text>
          <Text style={styles.storeMeta}>Delivery {store.data.delivery_fee > 0 ? price(store.data.delivery_fee) : 'free'} · Cash on delivery</Text>
        </View>
      </View>
      {store.data.promotion_banner_text ? <Notice icon="gift" tone="warning">{store.data.promotion_banner_text}</Notice> : null}

      <View style={styles.search}>
        <Feather name="search" size={16} color={colors.textFaint} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Search products" placeholderTextColor={colors.textFaint} style={styles.searchInput} returnKeyType="search" />
      </View>
      {(categories.data?.length ?? 0) > 0 && (
        <Pills options={[{ value: '', label: 'All' }, ...categories.data!.map((c) => ({ value: c.id, label: c.name }))]} value={category} onChange={setCategory} />
      )}

      {products.isLoading ? <Loading /> : (products.data?.length ?? 0) === 0 ? (
        <EmptyState icon="search" message={search ? `No products match "${search}".` : 'This shop has no products yet.'} />
      ) : (
        <View style={styles.grid}>
          {products.data!.map((product) => <ProductCard key={product.id} product={product} width={cardWidth} />)}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.primary, borderRadius: radius.lg, padding: space.lg },
  logo: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.white },
  logoFallback: { alignItems: 'center', justifyContent: 'center' },
  logoLetter: { fontSize: 22, fontWeight: '800', color: colors.primary },
  storeName: { fontSize: 20, fontWeight: '800', color: colors.white },
  storeMeta: { fontSize: 12, color: '#e0f2fe', marginTop: 2 },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, height: 46, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: space.md },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, height: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md }
});
