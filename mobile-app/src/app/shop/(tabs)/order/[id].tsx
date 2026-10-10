// One order for the customer. For a delivery: where it is, the secret code to give the rider, and who is coming.
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/components/icon';
import { Badge, Button, Card, EmptyState, InfoRow, Loading, Notice, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { useConfirm } from '@/components/confirm';
import { useT } from '@/lib/i18n';
import { ContentText } from '@/components/content-text';
import { ORDER_STATUS, useMyDelivery, useMyOrder } from '@/features/shop/shop-api';
import { useReorder } from '@/features/shop/reorder';
import { RateOrderCard } from '@/features/shop/rate-order-card';
import { RefundCard } from '@/features/shop/refund-card';
import { DeliverySteps, PICKUP_STEPS, ProgressTimeline, ProofPhoto, RiderCard, openMap } from '@/features/delivery/delivery-parts';
import { api, errorMessage } from '@/lib/api';
import { date, price, shortId } from '@/lib/format';
import { colors, radius, space, text } from '@/theme/theme';

// Which pickup step the order is on, from its status.
function pickupStep(status: string, fulfilment: string) {
  if (status === 'fulfilled' || fulfilment === 'picked_up') return 3;
  if (fulfilment === 'ready_for_pickup') return 2;
  if (status === 'confirmed') return 1;
  return 0;
}

export default function CustomerOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, refetch, isRefetching } = useMyOrder(id);
  const isDelivery = order?.fulfillment_method === 'delivery' && order.status !== 'cancelled';
  const { data: delivery } = useMyDelivery(id, Boolean(isDelivery));
  const queryClient = useQueryClient();
  const toast = useToast();
  const reorder = useReorder();
  const askConfirm = useConfirm();
  const t = useT();

  const cancel = useMutation({
    mutationFn: () => api(`/my-orders/${id}/cancel`, { method: 'PATCH' }),
    onSuccess: () => { toast('Order cancelled', 'success'); void queryClient.invalidateQueries({ queryKey: ['my-orders'] }); },
    onError: (err) => toast(errorMessage(err), 'error')
  });

  if (isLoading) return <Loading />;
  if (!order) return <Screen><EmptyState message="We could not find this order." /></Screen>;
  const status = ORDER_STATUS[order.status];
  const canCancel = order.status === 'pending' && order.fulfillment_status === 'not_started';
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <Stack.Screen options={{ title: t('Order {id}', { id: shortId(order.id) }) }} />
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon name={order.status === 'cancelled' ? 'x-circle' : order.fulfillment_method === 'delivery' ? 'truck' : 'shopping-bag'} size={26} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.heroId}>{shortId(order.id)}</Text>
          <Text style={text.small}>{t('Placed {date}', { date: date(order.created_at) })}</Text>
          <Badge tone={status.tone} label={status.label} />
        </View>
        <Text style={styles.heroTotal}>{price(order.total)}</Text>
      </View>

      {isDelivery && delivery && (
        <Card title="Where is my order?" icon="truck">
          <DeliverySteps stage={delivery.stage} offer={delivery.rider_offer_status} />
          {delivery.delivery_code && (
            <View style={styles.code}>
              <Text style={styles.codeLabel}>YOUR DELIVERY CODE</Text>
              <Text style={styles.codeValue}>{delivery.delivery_code}</Text>
              <Text style={styles.codeHint}>Share it only after you have your order in hand. Never share it on a call.</Text>
            </View>
          )}
          {delivery.delivery_locked && <Notice tone="danger" icon="alert-triangle">Your code was entered wrong too many times, so it is locked. The store will give you a new one.</Notice>}
          {delivery.rider && <RiderCard rider={delivery.rider} caption={delivery.stage === 'delivered' ? 'Delivered by' : 'Your delivery partner'} />}
          {delivery.rider && delivery.stage !== 'delivered' && <Text style={text.small}>Check the name, photo and number plate match the person at your door.</Text>}
          {delivery.stage === 'delivered' && <ProofPhoto url={delivery.proof_photo_url} cash={delivery.cash_collected} />}
          <View style={styles.address}>
            <Text style={text.label}>Delivering to</Text>
            <Text style={text.body}>{order.delivery_address}</Text>
          </View>
        </Card>
      )}

      {order.fulfillment_method === 'pickup' && order.status !== 'cancelled' && (
        <Card title="Order progress" icon="shopping-bag">
          <ProgressTimeline steps={PICKUP_STEPS} current={pickupStep(order.status, order.fulfillment_status)} finished={order.status === 'fulfilled'} />
        </Card>
      )}

      {!isDelivery && (
        <Notice icon={order.status === 'cancelled' ? 'x-circle' : 'shopping-bag'} tone={order.status === 'cancelled' ? 'danger' : 'primary'}>
          {order.status === 'cancelled' ? 'This order was cancelled. Nothing to pay.' : 'Pick up at the store. Pay in cash when you collect it.'}
        </Notice>
      )}

      <Card title="Items">
        {order.items.map((item, index) => (
          <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}>
            <View style={{ flex: 1 }}>
              <ContentText value={item.name} style={text.body} numberOfLines={2} />
              <Text style={text.small}>{item.variant_label ? `${item.variant_label} · ` : ''}{price(item.price)} × {item.quantity}</Text>
            </View>
            <Text style={[text.body, { fontWeight: '600' }]}>{price(item.price * item.quantity)}</Text>
          </View>
        ))}
      </Card>

      <Card title="Summary">
        <InfoRow label="Items" value={price(subtotal)} />
        {order.discount_amount > 0 && <InfoRow label={t('Coupon {code}', { code: order.coupon_code ?? '' })} value={`-${price(order.discount_amount)}`} tone="success" />}
        {order.delivery_fee > 0 && <InfoRow label="Delivery fee" value={price(order.delivery_fee)} />}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: space.sm }}><InfoRow label="Total" value={price(order.total)} strong /></View>
        <Text style={text.small}>{t(order.payment_method === 'online' ? (order.payment_status === 'paid' ? 'Paid online' : order.status === 'cancelled' ? 'Online payment · Nothing to pay' : 'Online payment · Waiting for payment') : order.payment_status === 'paid' ? 'Cash on delivery · Paid' : order.status === 'cancelled' ? 'Cash on delivery · Nothing to pay' : 'Cash on delivery · Pay when you receive it')}</Text>
      </Card>

      {order.payment_method === 'online' && order.payment_status === 'unpaid' && order.status !== 'cancelled' && (
        <Button icon="credit-card" label={`${t('Pay now')} · ${price(order.total)}`} onPress={() => router.push(`/shop/pay?id=${order.id}`)} />
      )}

      <RefundCard order={order} />

      {order.status === 'fulfilled' && <RateOrderCard orderId={order.id} wasDelivery={order.fulfillment_method === 'delivery'} items={order.items} />}

      {order.status !== 'cancelled' && <Button variant="outline" icon="refresh-cw" label="Order again" onPress={() => reorder(order)} />}
      {canCancel && <Button variant="danger" icon="x-circle" label="Cancel order" loading={cancel.isPending} onPress={async () => { if (await askConfirm({ title: t('Cancel this order?'), message: 'The store has not started on it yet, so you can still cancel.', confirmLabel: t('Yes, cancel order'), cancelLabel: t('Keep my order'), icon: 'x-circle' })) cancel.mutate(); }} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.cardBorder, padding: space.lg },
  heroIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  heroId: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  heroTotal: { fontSize: 20, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  code: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: space.lg, alignItems: 'center', gap: 4 },
  codeLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: '#e0f2fe' },
  codeValue: { fontSize: 38, fontWeight: '800', letterSpacing: 8, color: colors.white, fontFamily: 'monospace' },
  codeHint: { fontSize: 11, color: '#e0f2fe', textAlign: 'center' },
  address: { gap: 4, borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: space.md }
});
