import { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TextInput } from '@/components/text';
import { router } from 'expo-router';
import { Icon, type IconName } from '@/components/icon';
import { PressScale } from '@/components/motion';
import { Button, EmptyState, Loading, Notice, Pills, Screen } from '@/components/ui';
import { ShopSwitcher } from '@/features/shop/shop-switcher';
import { ProfileMenu } from '@/components/profile-menu';
import { NotificationButton } from '@/components/notification-button';
import { FloatingCartBar } from '@/components/floating-cart-bar';
import { useAddresses } from '@/features/shop/addresses';
import { checkDeliveryRange } from '@/lib/delivery-radius';
import { useShop } from '@/features/shop/shop-context';
import { useCategories, useProducts, useStore } from '@/features/shop/shop-api';
import { ProductCard } from '@/features/shop/product-card';
import { ApiError, errorMessage } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { accentAt, accents, colors, radius, space } from '@/theme/theme';

const CATEGORY_ICONS: IconName[] = ['tags', 'gift', 'heart', 'sparkles', 'box', 'zap', 'store'];

// One round, coloured category button. The active one gets a coloured ring.
function CategoryTile({ label, icon, accent, active, onPress }: { label: string; icon: IconName; accent: { fg: string; bg: string }; active: boolean; onPress(): void }) {
  return (
    <PressScale onPress={onPress} style={styles.tile} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <View style={[styles.tileIcon, { backgroundColor: accent.bg }, active && { borderColor: accent.fg, borderWidth: 2 }]}>
        <Icon name={icon} size={22} color={accent.fg} />
      </View>
      <Text style={[styles.tileLabel, active && { color: accent.fg, fontWeight: '800' }]} numberOfLines={1}>{label}</Text>
    </PressScale>
  );
}

export default function ShopHome() {
  const { slug } = useShop();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const store = useStore(slug);
  const categories = useCategories(slug);
  const products = useProducts(slug, search.trim(), category);
  const { width } = useWindowDimensions();
  const { active: activeAddress } = useAddresses();
  const insets = useSafeAreaInsets();

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
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
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
            <ShopSwitcher name={store.data?.name ?? 'Shop'} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <NotificationButton />
              <ProfileMenu />
            </View>
          </View>

          {range && !range.isEligible && <Notice tone="warning" icon="alert-triangle">{range.message}. Pickup is still available at checkout.</Notice>}
          <LinearGradient colors={['#0369a1', '#0284c7', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroCircleBig} />
            <View style={styles.heroCircleSmall} />
            <Text style={styles.heroTag}>{activeAddress ? `Delivering to ${activeAddress.zip}` : 'Local store, delivered'}</Text>
            <Text style={styles.heroTitle}>Fresh picks,{'\n'}delivered to your door.</Text>
            <Text style={styles.heroBody}>Fresh products from your neighbourhood store.</Text>
            <PressScale style={styles.shopNowBtn} onPress={() => setCategory('')} accessibilityRole="button">
              <Text style={styles.shopNowText}>Shop now</Text>
              <Icon name="arrow-right" size={14} color={colors.primaryDark} />
            </PressScale>
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
            <CategoryTile label="All" icon="grid" accent={accents.sky} active={category === ''} onPress={() => setCategory('')} />
            {(categories.data ?? []).map((cat, index) => (
              <CategoryTile
                key={cat.id}
                label={cat.name}
                icon={CATEGORY_ICONS[index % CATEGORY_ICONS.length]}
                accent={accentAt(index + 1)}
                active={category === cat.id}
                onPress={() => setCategory(category === cat.id ? '' : cat.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Index 2: Products Grid */}
        <View style={{ marginTop: space.xs }}>
          {products.isLoading ? <Loading /> : count === 0 ? (
            <EmptyState icon="search" message={search ? `No products match "${search}".` : 'This shop has no products yet.'} />
          ) : (
            <View style={styles.grid}>
              {products.data!.map((product, index) => <ProductCard key={product.id} product={product} width={cardWidth} index={index} />)}
            </View>
          )}
        </View>
      </Screen>

      <FloatingCartBar />
    </View>
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
  hero: { borderRadius: radius.xl, padding: space.xl, gap: 8, overflow: 'hidden', minHeight: 170 },
  heroCircleBig: { position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.12)' },
  heroCircleSmall: { position: 'absolute', right: 50, bottom: -30, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.10)' },
  heroTag: { alignSelf: 'flex-start', color: '#ffffff', fontSize: 11, fontWeight: '700', letterSpacing: 0.4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, overflow: 'hidden' },
  heroTitle: { color: '#ffffff', fontSize: 26, lineHeight: 30, fontWeight: '900', letterSpacing: -0.7 },
  heroBody: { color: '#e0f2fe', fontSize: 13, lineHeight: 18 },
  shopNowBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 10, marginTop: 6 },
  shopNowText: { color: colors.primaryDark, fontSize: 14, fontWeight: '800' },
  featuresScroll: { flexDirection: 'row', gap: space.sm, paddingRight: space.xs },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: '#e8edf3', paddingHorizontal: 12, paddingVertical: 10, minWidth: 135, flexShrink: 0 },
  featureIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 12, fontWeight: '700', color: colors.text },
  featureText: { fontSize: 10, color: colors.textMuted },
  stickyCategoriesContainer: { backgroundColor: colors.bg, paddingVertical: 4, gap: space.xs, zIndex: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  seeAllText: { fontSize: 13, fontWeight: '700', color: '#0284c7' },
  categoryList: { flexDirection: 'row', gap: space.md, paddingRight: space.xs, paddingVertical: 4 },
  tile: { width: 68, alignItems: 'center', gap: 6 },
  tileIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  tileLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textAlign: 'center' },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  categoryPillActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  categoryName: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  categoryNameActive: { color: colors.white, fontWeight: '800' },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, height: 50, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: space.lg, marginVertical: 4 },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, height: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md }
});
