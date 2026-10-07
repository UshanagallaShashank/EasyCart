// The shop: store banner, search, categories and products in a grid that adapts to the screen width.
import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TextInput } from '@/components/text';
import { router } from 'expo-router';
import { Icon, type IconName } from '@/components/icon';
import { Button, EmptyState, Loading, Notice, PageHeader, Pills, Screen } from '@/components/ui';
import { useAddresses } from '@/features/shop/addresses';
import { checkDeliveryRange } from '@/lib/delivery-radius';
import { useShop } from '@/features/shop/shop-context';
import { useCategories, useProducts, useStore } from '@/features/shop/shop-api';
import { ProductCard } from '@/features/shop/product-card';
import { ApiError, errorMessage } from '@/lib/api';
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
  const { active: activeAddress } = useAddresses();

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

  const count = products.data?.length ?? 0;
  const range = activeAddress ? checkDeliveryRange(store.data, activeAddress.zip) : null;
  return (
    <Screen onRefresh={() => { void store.refetch(); void products.refetch(); }} refreshing={products.isRefetching}>
      {range && !range.isEligible && <Notice tone="warning" icon="alert-triangle">{range.message}. Pickup is still available at checkout.</Notice>}
      <LinearGradient colors={['#e0f2fe', '#e0f4ff', '#dbeafe']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroTitle}>Fresh picks,{'\n'}delivered to your door.</Text>
        <Text style={styles.heroBody}>Fresh products from your neighbourhood store.</Text>
        <Pressable style={styles.shopNowBtn}>
          <Text style={styles.shopNowText}>Shop now</Text>
          <Icon name="arrow-right" size={14} color="#ffffff" />
        </Pressable>
      </LinearGradient>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: f.bg }]}><Icon name={f.icon} size={17} color={f.fg} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle} numberOfLines={1}>{f.title}</Text>
              <Text style={styles.featureText} numberOfLines={2}>{f.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <PageHeader title="Shop all" subtitle={products.isLoading ? 'Loading products…' : `${count} product${count === 1 ? '' : 's'}`} />
      <View style={styles.search}>
        <Icon name="search" size={17} color={colors.textFaint} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Search products" placeholderTextColor={colors.textFaint} style={styles.searchInput} returnKeyType="search" />
      </View>
      {(categories.data?.length ?? 0) > 0 && (
        <Pills options={[{ value: '', label: 'All' }, ...categories.data!.map((c) => ({ value: c.id, label: c.name }))]} value={category} onChange={setCategory} />
      )}

      {products.isLoading ? <Loading /> : count === 0 ? (
        <EmptyState icon="search" message={search ? `No products match "${search}".` : 'This shop has no products yet.'} />
      ) : (
        <View style={styles.grid}>
          {products.data!.map((product) => <ProductCard key={product.id} product={product} width={cardWidth} />)}
        </View>
      )}
    </Screen>
  );
}

// The website's four promises under the banner.
const FEATURES: { icon: IconName; title: string; text: string; fg: string; bg: string }[] = [
  { icon: 'truck', title: 'Fast delivery', text: 'Straight from the store', fg: '#059669', bg: '#ecfdf5' },
  { icon: 'shield-check', title: 'Safe checkout', text: 'Code-verified handover', fg: '#0284c7', bg: '#f0f9ff' },
  { icon: 'award', title: 'Quality', text: 'Hand-picked products', fg: '#9333ea', bg: '#faf5ff' },
  { icon: 'headphones', title: 'Support', text: 'Always ready to help', fg: '#ea580c', bg: '#fff7ed' }
];

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: space.md, gap: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#bae6fd' },
  heroTitle: { color: '#0f172a', fontSize: 20, lineHeight: 24, fontWeight: '800', letterSpacing: -0.5 },
  heroBody: { color: '#334155', fontSize: 13, lineHeight: 17 },
  shopNowBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#0284c7', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7, marginTop: 2 },
  shopNowText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  feature: { flexGrow: 1, flexBasis: '45%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: '#e8edf3', padding: space.md },
  featureIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  featureText: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, height: 50, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: space.lg },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, height: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md }
});
