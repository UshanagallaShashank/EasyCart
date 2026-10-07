import { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TextInput } from '@/components/text';
import { router } from 'expo-router';
import { Icon, type IconName } from '@/components/icon';
import { Button, EmptyState, Loading, Notice, PageHeader, Pills, Screen } from '@/components/ui';
import { BrandTitle } from '@/components/nav';
import { ProfileMenu } from '@/components/profile-menu';
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

  const scrollY = useRef(new Animated.Value(0)).current;

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [0, -25],
    extrapolate: 'clamp'
  });

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
    <Screen
      onRefresh={() => { void store.refetch(); void products.refetch(); }}
      refreshing={products.isRefetching}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
      stickyHeaderIndices={[1]}
    >
      {/* Index 0: Top Header Logo + Hero Banner + Features (fades out smoothly on scroll down) */}
      <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroTranslateY }], gap: space.md }}>
        <View style={styles.topHeader}>
          <BrandTitle>{store.data?.name ?? 'Shop'}</BrandTitle>
          <ProfileMenu />
        </View>

        {range && !range.isEligible && <Notice tone="warning" icon="alert-triangle">{range.message}. Pickup is still available at checkout.</Notice>}
        <LinearGradient colors={['#e0f2fe', '#e0f4ff', '#dbeafe']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Text style={styles.heroTitle}>Fresh picks,{'\n'}delivered to your door.</Text>
          <Text style={styles.heroBody}>Fresh products from your neighbourhood store.</Text>
          <Pressable style={styles.shopNowBtn}>
            <Text style={styles.shopNowText}>Shop now</Text>
            <Icon name="arrow-right" size={14} color="#ffffff" />
          </Pressable>
        </LinearGradient>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuresScroll}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: f.bg }]}><Icon name={f.icon} size={15} color={f.fg} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle} numberOfLines={1}>{f.title}</Text>
                <Text style={styles.featureText} numberOfLines={1}>{f.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Index 1: Sticky Header with Search Bar + Categories */}
      <View style={styles.stickyCategoriesContainer}>
        <View style={styles.search}>
          <Icon name="search" size={17} color={colors.textFaint} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search products" placeholderTextColor={colors.textFaint} style={styles.searchInput} returnKeyType="search" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Pressable onPress={() => setCategory('')}>
            <Text style={styles.seeAllText}>See all →</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          <Pressable
            onPress={() => setCategory('')}
            style={[styles.categoryPill, category === '' && styles.categoryPillActive]}
          >
            <Text style={[styles.categoryName, category === '' && styles.categoryNameActive]}>
              All
            </Text>
          </Pressable>
          {(categories.data ?? []).map((cat) => {
            const isActive = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(isActive ? '' : cat.id)}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
              >
                <Text style={[styles.categoryName, isActive && styles.categoryNameActive]}>
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Index 2: Products Grid */}
      <View style={{ marginTop: space.xs }}>
        {products.isLoading ? <Loading /> : count === 0 ? (
          <EmptyState icon="search" message={search ? `No products match "${search}".` : 'This shop has no products yet.'} />
        ) : (
          <View style={styles.grid}>
            {products.data!.map((product) => <ProductCard key={product.id} product={product} width={cardWidth} />)}
          </View>
        )}
      </View>
    </Screen>
  );
}

// The website's three promises under the banner.
const FEATURES: { icon: IconName; title: string; text: string; fg: string; bg: string }[] = [
  { icon: 'truck', title: 'Fast delivery', text: 'Straight from store', fg: '#059669', bg: '#ecfdf5' },
  { icon: 'shield-check', title: 'Safe checkout', text: 'Code-verified', fg: '#0284c7', bg: '#f0f9ff' },
  { icon: 'award', title: 'Quality', text: 'Hand-picked', fg: '#9333ea', bg: '#faf5ff' }
];

const styles = StyleSheet.create({
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: space.xs },
  hero: { borderRadius: radius.lg, padding: space.md, gap: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#bae6fd' },
  heroTitle: { color: '#0f172a', fontSize: 20, lineHeight: 24, fontWeight: '800', letterSpacing: -0.5 },
  heroBody: { color: '#334155', fontSize: 13, lineHeight: 17 },
  shopNowBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#0284c7', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7, marginTop: 2 },
  shopNowText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  featuresScroll: { flexDirection: 'row', gap: space.sm, paddingRight: space.xs },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: '#e8edf3', paddingHorizontal: 12, paddingVertical: 10, minWidth: 135, flexShrink: 0 },
  featureIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 12, fontWeight: '700', color: colors.text },
  featureText: { fontSize: 10, color: colors.textMuted },
  stickyCategoriesContainer: { backgroundColor: colors.bg, paddingVertical: 4, gap: space.xs, zIndex: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  seeAllText: { fontSize: 13, fontWeight: '700', color: '#0284c7' },
  categoryList: { flexDirection: 'row', gap: space.xs, paddingRight: space.xs, paddingVertical: 4 },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  categoryPillActive: { borderColor: '#0284c7', backgroundColor: '#f0f9ff' },
  categoryName: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  categoryNameActive: { color: '#0284c7', fontWeight: '800' },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, height: 50, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: space.lg, marginVertical: 4 },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, height: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md }
});
