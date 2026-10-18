// "Shops near you": the customer's current location (or a pin they drop on the map) decides which shops they see.
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { MapPicker } from '@/components/map-picker';
import { PressScale } from '@/components/motion';
import { Badge, Button, Card, EmptyState, Loading, Notice, Pills, Screen } from '@/components/ui';
import { useNearbyShops } from '@/features/shop/shop-api';
import { useShop } from '@/features/shop/shop-context';
import { errorMessage, fileUrl } from '@/lib/api';
import { readCurrentPosition, type Coords } from '@/lib/location';
import { estimateDelivery } from '@/lib/eta';
import { price } from '@/lib/format';
import { accents, colors, radius, space, text } from '@/theme/theme';
import { useT } from '@/lib/i18n';

export default function NearbyShops() {
  const { slug, setSlug, location, setLocation } = useShop();
  const t = useT();
  const [locating, setLocating] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [order, setOrder] = useState<'near' | 'rating'>('near');
  // Where the map starts. It only moves when we find the phone again, never while a pin is being dragged.
  const [mapStart, setMapStart] = useState<Coords | null>(location?.coords ?? null);
  const shops = useNearbyShops(location?.coords ?? null);

  async function findMe() {
    setLocating(true);
    setProblem(null);
    try {
      const coords = await readCurrentPosition();
      setLocation({ coords, source: 'gps' });
      setMapStart(coords);
    } catch (err) {
      setProblem(errorMessage(err, 'We could not find your location'));
    } finally {
      setLocating(false);
    }
  }

  // The first time here, find the customer without making them press anything.
  useEffect(() => {
    if (!location) void findMe();
  }, []);

  function open(shopSlug: string) {
    if (shopSlug !== slug) setSlug(shopSlug);
    router.navigate('/shop');
  }

  // Nearest first (as the server sends them), or best rated first with unrated shops last.
  const list = order === 'rating'
    ? [...(shops.data ?? [])].sort((a, b) => (b.rating_average ?? -1) - (a.rating_average ?? -1))
    : shops.data ?? [];

  return (
    <Screen onRefresh={() => void shops.refetch()} refreshing={shops.isRefetching}>
      <Card title={t('Where are you?')} icon="map-pin">
        <Text style={text.muted}>
          {location ? (location.source === 'gps' ? 'Using your current location.' : 'Using the spot you picked on the map.') : 'Share your location to see shops close to you.'}
        </Text>
        <Button small variant="outline" icon="navigation" label={locating ? 'Finding you…' : t('Use my current location')} onPress={() => void findMe()} loading={locating} />
        {problem ? <Notice tone="warning" icon="alert-triangle">{problem}</Notice> : null}
      </Card>

      {location && mapStart ? (
        <View style={{ gap: space.sm }}>
          <MapPicker center={mapStart} onPick={(coords) => setLocation({ coords, source: 'map' })} shops={list} />
          <Text style={text.small}>Tap the map or drag the pin to choose where you are. Blue dots are shops.</Text>
        </View>
      ) : null}

      {location ? (
        <>
          <Text style={styles.heading}>{t('Shops near you')}</Text>
          <Pills<'near' | 'rating'> value={order} onChange={setOrder} options={[{ value: 'near', label: t('Nearest') }, { value: 'rating', label: t('Top rated') }]} />
          {shops.isLoading ? <Loading /> : list.length === 0 ? (
            <EmptyState icon="store" message="No shops near this spot yet. Try moving the pin, or ask your local shop to join." />
          ) : list.map((shop) => {
            const logo = fileUrl(shop.logo_url);
            return (
              <PressScale key={shop.slug} onPress={() => open(shop.slug)} style={styles.row} accessibilityRole="button" accessibilityLabel={`Open ${shop.name}`}>
                {logo ? <Image source={{ uri: logo }} style={styles.logo} /> : <View style={styles.logo}><Icon name="store" size={22} color={colors.primary} /></View>}
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.name} numberOfLines={1}>{shop.name}</Text>
                    {shop.slug === slug ? <Badge tone="primary" label="Open now" /> : null}
                  </View>
                  <View style={styles.titleRow}>
                    {shop.rating_count > 0 && shop.rating_average !== null ? (
                      <View style={[styles.chip, { backgroundColor: accents.amber.bg, flexDirection: 'row', alignItems: 'center', gap: 3 }]}>
                        <Icon name="star" size={11} color={accents.amber.fg} fill={accents.amber.fg} />
                        <Text style={[styles.chipText, { color: '#92400e' }]}>{shop.rating_average.toFixed(1)} ({shop.rating_count})</Text>
                      </View>
                    ) : <Text style={text.small}>{t('New shop')}</Text>}
                  </View>
                  {shop.address ? <Text style={text.small} numberOfLines={1}>{shop.address}</Text> : null}
                  <View style={styles.chips}>
                    <View style={[styles.chip, { backgroundColor: accents.sky.bg }]}><Text style={[styles.chipText, { color: accents.sky.fg }]}>{shop.distance_km} km</Text></View>
                    <View style={[styles.chip, { backgroundColor: shop.delivers_to_you ? accents.green.bg : accents.amber.bg }]}>
                      <Text style={[styles.chipText, { color: shop.delivers_to_you ? accents.green.fg : accents.amber.fg }]}>{shop.delivers_to_you ? t('Delivers to you') : t('Pickup only')}</Text>
                    </View>
                    {shop.delivers_to_you ? (() => {
                      const eta = estimateDelivery(shop.distance_km);
                      return (
                        <View style={[styles.chip, { backgroundColor: eta.fast ? accents.orange.bg : accents.sky.bg, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                          {eta.fast ? <Icon name="zap" size={12} color={accents.orange.fg} /> : <Icon name="clock" size={12} color={accents.sky.fg} />}
                          <Text style={[styles.chipText, { color: eta.fast ? accents.orange.fg : accents.sky.fg }]}>{t('{low}–{high} min', { low: eta.low, high: eta.high })}</Text>
                        </View>
                      );
                    })() : null}
                    {shop.delivers_to_you ? <Text style={text.small}>{shop.delivery_fee > 0 ? t('Delivery {fee}', { fee: price(shop.delivery_fee) }) : t('Free delivery')}</Text> : null}
                  </View>
                </View>
                <Icon name="chevron-right" size={18} color={colors.textFaint} />
              </PressScale>
            );
          })}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, padding: space.md },
  logo: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  name: { fontSize: 16, fontWeight: '800', color: colors.text, flexShrink: 1 },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  chip: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontSize: 11, fontWeight: '700' }
});
