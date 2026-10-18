// After an order is delivered, the customer rates the store, the delivery and each product, and can add up to 3 photos.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '@/components/text';
import { ContentText } from '@/components/content-text';
import { Button, Card, Field } from '@/components/ui';
import { StarRating } from '@/components/star-rating';
import { useToast } from '@/components/toast';
import { errorMessage } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { colors, radius, space, text } from '@/theme/theme';
import { useOrderRating, useRateOrder } from './shop-api';
import { OrderPhotoPicker } from './order-photo-picker';

const WORDS = ['', 'Poor', 'Could be better', 'Okay', 'Good', 'Excellent'];

interface Item { product_id: string; name: string }

export function RateOrderCard({ orderId, wasDelivery, items }: { orderId: string; wasDelivery: boolean; items: Item[] }) {
  const existing = useOrderRating(orderId, true);
  const rate = useRateOrder(orderId);
  const toast = useToast();
  const t = useT();
  const [store, setStore] = useState(0);
  const [delivery, setDelivery] = useState(0);
  const [comment, setComment] = useState('');
  const [itemStars, setItemStars] = useState<Record<string, number>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // One row per product, even if the order had it in two sizes.
  const products = [...new Map(items.map((item) => [item.product_id, item])).values()];

  // While loading, or if ratings are not available on the server yet, show nothing instead of an error.
  if (existing.isLoading || existing.isError) return null;

  if (existing.data) {
    const given = existing.data;
    return (
      <Card title="Your rating" icon="star">
        <Row label="Store" stars={given.store_stars} />
        {given.delivery_stars ? <Row label="Delivery" stars={given.delivery_stars} /> : null}
        {products.filter((product) => given.item_stars?.[product.product_id]).map((product) => (
          <View key={product.product_id} style={styles.row}>
            <ContentText value={product.name} style={[text.muted, { flex: 1 }]} numberOfLines={1} />
            <StarRating value={given.item_stars![product.product_id]} size={16} />
          </View>
        ))}
        {given.comment ? <Text style={text.muted}>"{given.comment}"</Text> : null}
        {(given.photo_urls ?? []).length > 0 ? (
          <View style={styles.photos}>
            {given.photo_urls!.map((url) => <Image key={url} source={{ uri: url }} style={styles.photo} contentFit="cover" />)}
          </View>
        ) : null}
        <Text style={text.small}>Thanks for your feedback.</Text>
      </Card>
    );
  }

  function submit() {
    rate.mutate(
      {
        store_stars: store,
        ...(wasDelivery && delivery > 0 ? { delivery_stars: delivery } : {}),
        ...(comment.trim() ? { comment: comment.trim() } : {}),
        ...(photos.length > 0 ? { photo_urls: photos } : {}),
        ...(Object.keys(itemStars).length > 0 ? { item_stars: itemStars } : {})
      },
      {
        onSuccess: (result) => {
          const extrasLost = result.rating.extras_saved === false && (photos.length > 0 || Object.keys(itemStars).length > 0);
          toast(extrasLost ? t('Thanks for rating. Photos and product stars will appear after the next update.') : t('Thanks for rating'), 'success');
        },
        onError: (err) => toast(errorMessage(err), 'error')
      }
    );
  }

  return (
    <Card title="How was your order?" icon="star">
      <View style={styles.block}>
        <Text style={text.label}>The store</Text>
        <StarRating value={store} onChange={setStore} size={34} />
        {store > 0 ? <Text style={styles.word}>{WORDS[store]}</Text> : null}
      </View>
      {wasDelivery && (
        <View style={styles.block}>
          <Text style={text.label}>The delivery</Text>
          <StarRating value={delivery} onChange={setDelivery} size={34} />
        </View>
      )}

      {products.length > 0 && (
        <View style={styles.block}>
          <Text style={text.label}>Each product (optional)</Text>
          {products.map((product) => (
            <View key={product.product_id} style={styles.row}>
              <ContentText value={product.name} style={[text.body, { flex: 1 }]} numberOfLines={2} />
              <StarRating value={itemStars[product.product_id] ?? 0} onChange={(stars) => setItemStars((current) => ({ ...current, [product.product_id]: stars }))} size={22} />
            </View>
          ))}
        </View>
      )}

      <Field value={comment} onChangeText={setComment} placeholder="Add a comment (optional)" multiline maxLength={300} />

      <View style={styles.block}>
        <Text style={text.label}>Photos (optional, up to 3)</Text>
        <OrderPhotoPicker orderId={orderId} purpose="review" photos={photos} onChange={setPhotos} onBusyChange={setUploading} />
      </View>

      <Button icon="check" label="Submit rating" onPress={submit} loading={rate.isPending} disabled={store === 0 || uploading} />
    </Card>
  );
}

function Row({ label, stars }: { label: string; stars: number }) {
  return (
    <View style={styles.row}>
      <Text style={text.muted}>{label}</Text>
      <StarRating value={stars} size={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: space.sm },
  word: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  photo: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.borderSoft }
});
