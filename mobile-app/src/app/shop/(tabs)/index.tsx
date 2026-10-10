import { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TextInput } from '@/components/text';
import { router } from 'expo-router';
import { Icon, type IconName } from '@/components/icon';
import { PressScale, Skeleton } from '@/components/motion';
import { Button, EmptyState, Loading, Notice, Pills, Screen } from '@/components/ui';
import { ShopSwitcher } from '@/features/shop/shop-switcher';
import { useT } from '@/lib/i18n';
import { estimateDelivery } from '@/lib/eta';
import { ProfileMenu } from '@/components/profile-menu';
import { NotificationButton } from '@/components/notification-button';
import { FloatingCartBar } from '@/components/floating-cart-bar';
import { useAddresses } from '@/features/shop/addresses';
import { checkDeliveryRange } from '@/lib/delivery-radius';
import { useShop } from '@/features/shop/shop-context';
import { useCategories, useMyOrders, useProducts, useStore, useStoreReviews } from '@/features/shop/shop-api';
import { ReviewsStrip } from '@/features/shop/reviews-strip';
import { ProductCard, productStock, useCardActions } from '@/features/shop/product-card';
import { ProductRail } from '@/features/shop/product-rail';
import { ApiError, errorMessage, fileUrl } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { accentAt, accents, colors, radius, space } from '@/theme/theme';

const CATEGORY_ICONS: IconName[] = ['tags', 'gift', 'heart', 'sparkles', 'box', 'zap', 'store'];

// One round, coloured category button. The active one gets a coloured ring.
function CategoryTile({ label, icon, accent, active, onPress }: { label: string; icon: IconName; accent: { fg: string; bg: string }; active: boolean; onPress(): void }) {
  return (
    <PressScale onPress={onPress} style={styles.tile} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <View style={[styles.tileIcon, { backgroundColor: accent.bg }, active && { borderColor: accent.fg, borderWidth: 2 }]}>
        <Icon name={icon} size={24} color={accent.fg} />
      </View>
      <Text style={[styles.tileLabel, active && { color: accent.fg, fontWeight: '800' }]} numberOfLines={1}>{label}</Text>
    </PressScale>
  );
}

// Grey placeholder cards in the shape of real products, shown while the list loads.
function ProductGridSkeleton({ width }: { width: number }) {
  return (
    <View style={styles.grid}>
      {[0, 1, 2, 3, 4, 5].map((key) => (
        <View key={key} style={[styles.skeletonCard, { width }]}>
          <Skeleton height={width - 16} rounded={radius.md} />
          <Skeleton width="85%" height={14} />
          <Skeleton width="45%" height={16} />
          <Skeleton height={38} rounded={radius.pill} />
        </View>
      ))}
    </View>
  );
}

type View_ = 'all' | 'favourites' | 'rating' | 'low' | 'high';

export default function ShopHome() {
  const { slug, favourites, recent, location } = useShop();
  const { data: pastOrders } = useMyOrders();
  const cardActions = useCardActions();
  const t = useT();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View_>('all');
  const [category, setCategory] = useState('');
  const store = useStore(slug);
  const reviews = useStoreReviews(slug);
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
          message={offline ? errorMessage(store.error) : t('We could not open the shop "{slug}". It may be offline, or the shop code is wrong.', { slug })}
          action={offline ? <Button label="Try again" variant="outline" onPress={() => void store.refetch()} /> : <Button label="Choose another shop" variant="outline" onPress={() => router.push('/shop/account')} />}
        />
      </Screen>
    );
  }

  // The list the customer actually sees: favourites only, or sorted by price, on top of search and category.
  let shown = products.data ?? [];
  if (view === 'favourites') shown = shown.filter((product) => favourites.includes(product.id));
  if (view === 'low') shown = [...shown].sort((a, b) => a.price - b.price);
  if (view === 'high') shown = [...shown].sort((a, b) => b.price - a.price);
  // Best rated first; products nobody has rated yet go to the end.
  if (view === 'rating') shown = [...shown].sort((a, b) => (cardActions.ratingFor(b.id)?.average ?? -1) - (cardActions.ratingFor(a.id)?.average ?? -1));
  const count = shown.length;

  // Shelves above the grid, only while nobody is searching or filtering. Each one is worked out from data the app already has.
  const catalog = products.data ?? [];
  const showRails = !search.trim() && category === '' && view === 'all' && catalog.length > 0;
  const inStock = (product: (typeof catalog)[number]) => productStock(product) > 0;
  const orderedIds = [...(pastOrders ?? [])].filter((order) => order.status !== 'cancelled').sort((a, b) => b.created_at.localeCompare(a.created_at)).flatMap((order) => order.items.map((item) => item.product_id));
  const orderAgain = [...new Set(orderedIds)].map((id) => catalog.find((product) => product.id === id)).filter((product): product is (typeof catalog)[number] => Boolean(product) && inStock(product!)).slice(0, 8);
  const favouriteProducts = catalog.filter((product) => favourites.includes(product.id)).slice(0, 8);
  const recentlyViewed = recent.map((id) => catalog.find((product) => product.id === id)).filter((product): product is (typeof catalog)[number] => Boolean(product)).slice(0, 8);
  const almostGone = catalog.filter((product) => productStock(product) > 0 && productStock(product) <= (product.low_stock_threshold ?? 5)).slice(0, 8);
  const banner = fileUrl(store.data.banner_url);
  const range = activeAddress || location ? checkDeliveryRange(store.data, activeAddress?.zip ?? null, activeAddress?.latitude !== undefined && activeAddress?.longitude !== undefined ? { latitude: activeAddress.latitude, longitude: activeAddress.longitude } : location?.coords) : null;

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
            <ShopSwitcher name={store.data?.name ?? 'Shop'} logoUrl={fileUrl(store.data?.logo_url)} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <NotificationButton />
              <ProfileMenu />
            </View>
          </View>

          <PressScale style={styles.addressRow} onPress={() => router.push('/shop/addresses')} accessibilityRole="button" accessibilityLabel="Change delivery address">
            <View style={styles.addressIcon}><Icon name="map-pin" size={16} color={accents.green.fg} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>{t('Deliver to')}</Text>
              <Text style={styles.addressText} numberOfLines={1}>{activeAddress ? `${activeAddress.label} · ${activeAddress.zip}` : t('Add a delivery address')}</Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.textFaint} />
          </PressScale>

          {range && !range.isEligible && <Notice tone="warning" icon="alert-triangle">{range.message}. Pickup is still available at checkout.</Notice>}
          <View style={styles.hero}>
            {banner ? <Image source={{ uri: banner }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
            <LinearGradient
              colors={banner ? ['rgba(3,105,161,0.95)', 'rgba(2,132,199,0.88)'] : ['#0369a1', '#0284c7', '#0ea5e9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroCircleBig} />
            <View style={styles.heroCircleSmall} />
            <Text style={styles.heroTag}>{activeAddress ? t('Delivering to {zip}', { zip: activeAddress.zip }) : t('Local store, delivered')}{range?.isEligible ? ` · ${(() => { const eta = estimateDelivery(range.distanceKm); return t('{low}–{high} min', { low: eta.low, high: eta.high }); })()}` : ''}</Text>
            <Text style={styles.heroTitle} numberOfLines={2}>{t('Welcome to')}{'\n'}{store.data.name}</Text>
            <Text style={styles.heroBody} numberOfLines={2}>{store.data.address ? t('{address}. Delivered to your door.', { address: store.data.address }) : t('Fresh products from your neighbourhood store.')}</Text>
            {reviews.data && reviews.data.count > 0 && reviews.data.average !== null ? (
              <View style={styles.heroRating}>
                <Icon name="star" size={13} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.heroRatingText}>{t('{average} out of 5 · {count} ratings', { average: reviews.data.average.toFixed(1), count: reviews.data.count })}</Text>
              </View>
            ) : null}
            <PressScale style={styles.shopNowBtn} onPress={() => setCategory('')} accessibilityRole="button">
              <Text style={styles.shopNowText}>{t('Shop now')}</Text>
              <Icon name="arrow-right" size={14} color={colors.primaryDark} />
            </PressScale>
          </View>


          {store.data.promotion_banner_text ? (
            <View style={styles.promo}>
              <View style={styles.promoIcon}><Icon name="gift" size={18} color={accents.amber.fg} /></View>
              <Text style={styles.promoText} numberOfLines={2}>{store.data.promotion_banner_text}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* Index 1: Sticky Header with Search Bar + Categories */}
        <View style={styles.stickyCategoriesContainer}>
          <View style={styles.search}>
            <Icon name="search" size={16} color={colors.textFaint} />
            <TextInput value={search} onChangeText={setSearch} placeholder={t('Search products')} placeholderTextColor={colors.textFaint} style={styles.searchInput} returnKeyType="search" />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('Categories')}</Text>
            <Pressable onPress={() => setCategory('')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}><Text style={styles.seeAllText}>{t('See all')}</Text><Icon name="chevron-right" size={16} color={colors.primary} /></View>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            <CategoryTile label={t('All')} icon="grid" accent={accents.sky} active={category === ''} onPress={() => setCategory('')} />
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
        <View style={{ marginTop: space.xs, gap: space.md }}>
          {showRails && (
            <>
              <ProductRail actions={cardActions} title={t('Order again')} subtitle={t('From your past orders')} icon="refresh-cw" accent={accents.sky} products={orderAgain} />
              <ProductRail actions={cardActions} title={t('Your favourites')} icon="heart" accent={accents.rose} products={favouriteProducts} />
              <ProductRail actions={cardActions} title={t('Almost gone')} subtitle={t('Grab them before they sell out')} icon="zap" accent={accents.orange} products={almostGone} />
              <ProductRail actions={cardActions} title={t('Recently viewed')} icon="clock" accent={accents.violet} products={recentlyViewed} />
              <ReviewsStrip reviews={reviews.data} />
            </>
          )}
          {showRails && <Text style={styles.sectionTitle}>{t('All products')}</Text>}
          <Pills<View_>
            value={view}
            onChange={setView}
            options={[
              { value: 'all', label: t('All') },
              { value: 'favourites', label: t('Favourites'), count: favourites.length },
              { value: 'rating', label: t('Top rated') },
              { value: 'low', label: t('Price: low to high') },
              { value: 'high', label: t('Price: high to low') }
            ]}
          />
          {products.isLoading ? <ProductGridSkeleton width={cardWidth} /> : count === 0 ? (
            <EmptyState icon={view === 'favourites' ? 'heart' : 'search'} message={view === 'favourites' ? t('Tap the heart on a product to save it here.') : search ? t('No products match "{search}".', { search }) : t('This shop has no products yet.')} />
          ) : (
            <View style={styles.grid}>
              {shown.map((product, index) => <ProductCard key={product.id} product={product} width={cardWidth} index={index} line={cardActions.lineFor(product.id)} rating={cardActions.ratingFor(product.id)} onAdd={cardActions.onAdd} onSetQuantity={cardActions.onSetQuantity} />)}
            </View>
          )}
        </View>
      </Screen>

      <FloatingCartBar />
    </View>
  );
}


const styles = StyleSheet.create({
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, padding: space.md },
  addressIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: accents.green.bg, alignItems: 'center', justifyContent: 'center' },
  addressLabel: { fontSize: 11, fontWeight: '700', color: colors.textFaint, letterSpacing: 0.5, textTransform: 'uppercase' },
  addressText: { fontSize: 14, fontWeight: '700', color: colors.text },
  promo: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: accents.amber.bg, borderRadius: radius.lg, padding: space.md },
  promoIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  promoText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#92400e' },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: space.xs },
  hero: { borderRadius: radius.xl, padding: space.xl, gap: 8, overflow: 'hidden', minHeight: 170 },
  heroCircleBig: { position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.12)' },
  heroCircleSmall: { position: 'absolute', right: 50, bottom: -30, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.10)' },
  heroTag: { alignSelf: 'flex-start', color: '#ffffff', fontSize: 11, fontWeight: '700', letterSpacing: 0.4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, overflow: 'hidden' },
  heroTitle: { color: '#ffffff', fontSize: 26, lineHeight: 30, fontWeight: '900', letterSpacing: -0.7 },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  heroRatingText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  heroBody: { color: '#e0f2fe', fontSize: 13, lineHeight: 18 },
  shopNowBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 10, marginTop: 6 },
  shopNowText: { color: colors.primaryDark, fontSize: 14, fontWeight: '800' },
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  skeletonCard: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, padding: 8, gap: 10 }
});
