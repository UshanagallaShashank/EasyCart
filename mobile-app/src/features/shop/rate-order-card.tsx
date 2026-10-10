// After an order is delivered, the customer rates the store (and the delivery, if a rider brought it).
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { Button, Card, Field } from '@/components/ui';
import { StarRating } from '@/components/star-rating';
import { useToast } from '@/components/toast';
import { errorMessage } from '@/lib/api';
import { colors, space, text } from '@/theme/theme';
import { useOrderRating, useRateOrder } from './shop-api';

const WORDS = ['', 'Poor', 'Could be better', 'Okay', 'Good', 'Excellent'];

export function RateOrderCard({ orderId, wasDelivery }: { orderId: string; wasDelivery: boolean }) {
  const existing = useOrderRating(orderId, true);
  const rate = useRateOrder(orderId);
  const toast = useToast();
  const [store, setStore] = useState(0);
  const [delivery, setDelivery] = useState(0);
  const [comment, setComment] = useState('');

  // While loading, or if ratings are not available on the server yet, show nothing instead of an error.
  if (existing.isLoading || existing.isError) return null;

  if (existing.data) {
    return (
      <Card title="Your rating" icon="star">
        <Row label="Store" stars={existing.data.store_stars} />
        {existing.data.delivery_stars ? <Row label="Delivery" stars={existing.data.delivery_stars} /> : null}
        {existing.data.comment ? <Text style={text.muted}>"{existing.data.comment}"</Text> : null}
        <Text style={text.small}>Thanks for your feedback.</Text>
      </Card>
    );
  }

  function submit() {
    rate.mutate(
      { store_stars: store, ...(wasDelivery && delivery > 0 ? { delivery_stars: delivery } : {}), ...(comment.trim() ? { comment: comment.trim() } : {}) },
      { onSuccess: () => toast('Thanks for rating', 'success'), onError: (err) => toast(errorMessage(err), 'error') }
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
      <Field value={comment} onChangeText={setComment} placeholder="Add a comment (optional)" multiline maxLength={300} />
      <Button icon="check" label="Submit rating" onPress={submit} loading={rate.isPending} disabled={store === 0} />
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }
});
