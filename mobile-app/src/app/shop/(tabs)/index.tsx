// The shop: store banner, search, categories and products in a grid that adapts to the screen width.
import { useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, TextInput } from '@/components/text';
import { router } from 'expo-router';
import { Icon, type IconName } from '@/components/icon';
import { Button, EmptyState, Loading, Notice, PageHeader, Pills } from '@/components/ui';
import { useAddresses } from '@/features/shop/addresses';
import { checkDeliveryRange } from '@/lib/delivery-radius';
import { useShop } from '@/features/shop/shop-context';
import { useCategories, useProducts, useStore } from '@/features/shop/shop-api';
import { ProductCard } from '@/features/shop/product-card';
import { ApiError, errorMessage } from '@/lib/api';
import { colors, radius, space } from '@/theme/theme';

import { NotificationButton } from '@/components/notification-button';
import { ProfileMenu } from '@/components/profile-menu';
import { FloatingCartBar } from '@/components/floating-cart-bar';

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

  // 2 columns on phones, more on tablets; the page column is at most 720 wide.
  const contentWidth = Math.min(width, 720) - space.lg * 2;
  const columns = contentWidth >= 640 ? 4 : contentWidth >= 460 ? 3 : 2;
  const cardWidth = (contentWidth - space.md * (columns - 1)) / columns;

  if (store.isLoading) return <Loading />;
  // Status 0 means the server could not be reached at all (no network, or wrong server address).
  const offline = store.error instanceof ApiError && store.error.status === 0;
  if (store.isError || !store.data) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <EmptyState
          icon={offline ? 'wifi-off' : 'shopping-bag'}
          message={offline ? errorMessage(store.error) : `We could not open the shop "${slug}". It may be offline, or the shop code is wrong.`}
          action={offline ? <Button label="Try again" variant="outline" onPress={() => void store.refetch()} /> : <Button label="Choose another shop" variant="outline" onPress={() => router.push('/shop/account')} />}
        />
      </View>
    );
  }

  const count = products.data?.length ?? 0;
  const range = activeAddress ? checkDeliveryRange(store.data, activeAddress.zip) : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        stickyHeaderIndices={[1]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={products.isRefetching}
            onRefresh={() => {
              void store.refetch();
              void products.refetch();
            }}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Child 0: Slim Collapsible Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../../../assets/logo-mark.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle} numberOfLines={1}>
              {store.data.name}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <NotificationButton />
            <ProfileMenu />
          </View>
        </View>

        {/* Child 1: Sticky Search Bar (sticks when scrolled up) */}
        <View style={styles.stickySearchWrap}>
          <View style={styles.searchBar}>
            <Icon name="search" size={17} color="#0284c7" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search products, grocery, essentials..."
              placeholderTextColor="#94a3b8"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} hitSlop={10}>
                <Icon name="x" size={16} color="#64748b" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Child 2: Main Scrollable Page Content */}
        <View style={styles.pageContent}>
          {range && !range.isEligible && (
            <Notice tone="warning" icon="alert-triangle">
              {range.message}. Pickup is still available at checkout.
            </Notice>
          )}

          <LinearGradient
            colors={['#e0f2fe', '#e0f4ff', '#dbeafe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
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
                <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                  <Icon name={f.icon} size={17} color={f.fg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle} numberOfLines={1}>{f.title}</Text>
                  <Text style={styles.featureText} numberOfLines={2}>{f.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <PageHeader
            title="Shop all"
            subtitle={products.isLoading ? 'Loading products…' : `${count} product${count === 1 ? '' : 's'}`}
          />

          {(categories.data?.length ?? 0) > 0 && (
            <Pills
              options={[{ value: '', label: 'All' }, ...categories.data!.map((c) => ({ value: c.id, label: c.name }))]}
              value={category}
              onChange={setCategory}
            />
          )}

          {products.isLoading ? (
            <Loading />
          ) : count === 0 ? (
            <EmptyState
              icon="search"
              message={search ? `No products match "${search}".` : 'This shop has no products yet.'}
            />
          ) : (
            <View style={styles.grid}>
              {products.data!.map((product) => (
                <ProductCard key={product.id} product={product} width={cardWidth} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating BigBasket-style Cart Pill at bottom center */}
      <FloatingCartBar />
    </View>
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
  root: {
    flex: 1,
    backgroundColor: colors.bg
  },
  scrollContent: {
    paddingBottom: 90
  },
  header: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    marginBottom: 6
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  logo: {
    width: 30,
    height: 30
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  stickySearchWrap: {
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    zIndex: 10
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    height: '100%'
  },
  pageContent: {
    paddingHorizontal: 16,
    gap: space.lg
  },
  hero: {
    borderRadius: radius.lg,
    padding: space.md,
    gap: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#bae6fd'
  },
  heroTitle: {
    color: '#0f172a',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  heroBody: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 17
  },
  shopNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#0284c7',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 2
  },
  shopNowText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm
  },
  feature: {
    flexGrow: 1,
    flexBasis: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#e8edf3',
    padding: space.md
  },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  featureText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md
  }
});
