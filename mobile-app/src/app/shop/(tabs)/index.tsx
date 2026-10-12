// The shop home, grocery-app style: a coloured header with delivery time and address, a search box that stays at the top
// (with recent and popular searches), category tiles, "Your usuals", shelves, and a dense product grid.
import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, TextInput } from '@/components/text';
import { Icon } from '@/components/icon';
import { Skeleton } from '@/components/motion';
import { Button, EmptyState, Loading, Notice, Pills, Screen } from '@/components/ui';
import { FloatingCartBar } from '@/components/floating-cart-bar';
import { useT } from '@/lib/i18n';
import { estimateDelivery } from '@/lib/eta';
import { checkDeliveryRange } from '@/lib/delivery-radius';
import { ApiError, errorMessage, fileUrl } from '@/lib/api';
import { useAddresses } from '@/features/shop/addresses';
import { useShop } from '@/features/shop/shop-context';
import { useCategories, useMyOrders, useProducts, useStore, useStoreReviews } from '@/features/shop/shop-api';
import { ReviewsStrip } from '@/features/shop/reviews-strip';
import { ProductCard, productStock, useCardActions } from '@/features/shop/product-card';
import { ProductRail } from '@/features/shop/product-rail';
import { HomeHeader } from '@/features/shop/home/home-header';
import { CategoryGrid } from '@/features/shop/home/category-grid';
import { YourUsuals } from '@/features/shop/home/your-usuals';
import { SmartSearchPanel } from '@/features/shop/home/smart-search';
import { useRecentSearches } from '@/features/shop/recent-searches';
import { colors, radius, space } from '@/theme/theme';

type Sort = 'all' | 'favourites' | 'rating' | 'low' | 'high';

// Grey placeholder cards in the shape of real products, shown while the list loads.
function ProductGridSkeleton({ width }: { width: number }) {
  return (
    <View style={styles.grid}>
      {[0, 1, 2, 3, 4, 5].map((key) => (
        <View key={key} style={{ width, gap: 8 }}>
          <Skeleton height={width} rounded={radius.md} />
          <Skeleton width="50%" height={14} />
          <Skeleton width="85%" height={12} />
        </View>
      ))}
    </View>
  );
}

export default function ShopHome() {
  const { slug, favourites, recent: recentlyViewedIds, location } = useShop();
  const { data: pastOrders } = useMyOrders();
  const cardActions = useCardActions();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [sort, setSort] = useState<Sort>('all');
  const [category, setCategory] = useState('');
  const store = useStore(slug);
  const reviews = useStoreReviews(slug);
  const categories = useCategories(slug);
  const products = useProducts(slug, search.trim(), category);
  const everything = useProducts(slug, '', '');
  const { active: activeAddress } = useAddresses();
  const searches = useRecentSearches();

  // Three cards a row on phones (two on very small ones), more on tablets; the page column is at most 720 wide.
  const contentWidth = Math.min(width, 720) - space.lg * 2;
  const columns = contentWidth >= 640 ? 5 : contentWidth >= 460 ? 4 : contentWidth >= 320 ? 3 : 2;
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

  // The list the shopper sees: search and category first, then favourites only or a sort order on top.
  let shown = products.data ?? [];
  if (sort === 'favourites') shown = shown.filter((product) => favourites.includes(product.id));
  if (sort === 'low') shown = [...shown].sort((a, b) => a.price - b.price);
  if (sort === 'high') shown = [...shown].sort((a, b) => b.price - a.price);
  // Best rated first; products nobody has rated yet go to the end.
  if (sort === 'rating') shown = [...shown].sort((a, b) => (cardActions.ratingFor(b.id)?.average ?? -1) - (cardActions.ratingFor(a.id)?.average ?? -1));

  const catalog = everything.data ?? [];
  const typed = search.trim() !== '';
  const showShelves = !searching && !typed && category === '' && sort === 'all' && catalog.length > 0;
  const favouriteProducts = catalog.filter((product) => favourites.includes(product.id)).slice(0, 8);
  const recentlyViewed = recentlyViewedIds.map((id) => catalog.find((product) => product.id === id)).filter((product): product is (typeof catalog)[number] => Boolean(product)).slice(0, 8);
  const almostGone = catalog.filter((product) => productStock(product) > 0 && productStock(product) <= (product.low_stock_threshold ?? 5)).slice(0, 8);
  const point = activeAddress?.latitude !== undefined && activeAddress?.longitude !== undefined ? { latitude: activeAddress.latitude, longitude: activeAddress.longitude } : location?.coords;
  const range = activeAddress || location ? checkDeliveryRange(store.data, activeAddress?.zip ?? null, point) : null;
  const eta = range?.isEligible ? estimateDelivery(range.distanceKm) : null;
  const rating = reviews.data && reviews.data.count > 0 && reviews.data.average !== null ? { average: reviews.data.average, count: reviews.data.count } : null;

  function closeSearch() {
    searches.remember(search);
    setSearching(false);
  }

  function pickSearch(words: string) {
    setSearch(words);
    searches.remember(words);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Screen onRefresh={() => { void store.refetch(); void products.refetch(); }} refreshing={products.isRefetching} stickyHeaderIndices={[1]}>
        <View style={{ gap: space.md }}>
          <HomeHeader
            shopName={store.data.name}
            logoUrl={fileUrl(store.data.logo_url)}
            eta={eta}
            addressLabel={activeAddress ? `${activeAddress.label} · ${activeAddress.zip}` : null}
            rating={rating}
            offer={store.data.promotion_banner_text ?? null}
          />
          {range && !range.isEligible && <Notice tone="warning" icon="alert-triangle">{range.message}. Pickup is still available at checkout.</Notice>}
        </View>

        {/* Stays at the top while scrolling. */}
        <View style={styles.searchBar}>
          <View style={styles.search}>
            <Icon name="search" size={17} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearching(true)}
              onSubmitEditing={closeSearch}
              placeholder={t('Search for milk, fruits, snacks…')}
              placeholderTextColor={colors.textFaint}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {typed && <Pressable onPress={() => setSearch('')} hitSlop={10} accessibilityLabel="Clear search"><Icon name="x-circle" size={18} color={colors.textFaint} /></Pressable>}
          </View>
          {searching && <Pressable onPress={() => { setSearch(''); closeSearch(); }} hitSlop={8} accessibilityRole="button"><Text style={styles.cancel}>{t('Cancel')}</Text></Pressable>}
        </View>

        <View style={{ gap: space.xl, marginTop: space.md }}>
          {searching && !typed ? (
            <SmartSearchPanel recent={searches.recent} products={catalog} onPick={pickSearch} onClear={searches.clear} />
          ) : (
            <>
              {!searching && <CategoryGrid categories={categories.data ?? []} value={category} onChange={setCategory} width={contentWidth} />}
              {showShelves && (
                <>
                  <YourUsuals orders={pastOrders ?? []} catalog={catalog} actions={cardActions} />
                  <ProductRail actions={cardActions} title={t('Your favourites')} products={favouriteProducts} />
                  <ProductRail actions={cardActions} title={t('Almost gone')} subtitle={t('Grab them before they sell out')} products={almostGone} />
                  <ProductRail actions={cardActions} title={t('Recently viewed')} products={recentlyViewed} />
                  <ReviewsStrip reviews={reviews.data} />
                </>
              )}
              <View style={{ gap: space.md }}>
                <Text style={styles.sectionTitle}>{typed ? t(shown.length === 1 ? '{n} result for "{search}"' : '{n} results for "{search}"', { n: shown.length, search: search.trim() }) : t('All products')}</Text>
                {!typed && (
                  <Pills<Sort>
                    value={sort}
                    onChange={setSort}
                    options={[
                      { value: 'all', label: t('All') },
                      { value: 'favourites', label: t('Favourites'), count: favourites.length },
                      { value: 'rating', label: t('Top rated') },
                      { value: 'low', label: t('Price: low to high') },
                      { value: 'high', label: t('Price: high to low') }
                    ]}
                  />
                )}
                {products.isLoading ? <ProductGridSkeleton width={cardWidth} /> : shown.length === 0 ? (
                  <EmptyState icon={sort === 'favourites' ? 'heart' : 'search'} message={sort === 'favourites' ? t('Tap the heart on a product to save it here.') : typed ? t('No products match "{search}".', { search: search.trim() }) : t('This shop has no products yet.')} />
                ) : (
                  <View style={styles.grid}>
                    {shown.map((product, index) => <ProductCard key={product.id} product={product} width={cardWidth} index={index} line={cardActions.lineFor(product.id)} rating={cardActions.ratingFor(product.id)} onAdd={cardActions.onAdd} onSetQuantity={cardActions.onSetQuantity} />)}
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </Screen>

      <FloatingCartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.bg, paddingVertical: space.sm, marginTop: space.sm, zIndex: 10 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, height: 50, borderRadius: radius.pill, backgroundColor: colors.card, paddingHorizontal: space.lg },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, height: '100%' },
  cancel: { fontSize: 14, fontWeight: '700', color: colors.textSoft },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, rowGap: space.lg }
});
