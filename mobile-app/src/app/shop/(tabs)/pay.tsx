// Pay for an order online. A test payment while developing, Razorpay for real money; the server decides which.
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text } from '@/components/text';
import { RazorpayCheckout } from '@/components/razorpay-checkout';
import { Button, Card, EmptyState, HeroHeader, Loading, Notice, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { useMyOrder, type StartedPayment } from '@/features/shop/shop-api';
import { api, errorMessage } from '@/lib/api';
import { price, shortId } from '@/lib/format';
import { useT } from '@/lib/i18n';
import { space, text } from '@/theme/theme';

function Pay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: order, isLoading } = useMyOrder(id);
  const [payment, setPayment] = useState<StartedPayment | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const start = useMutation({
    mutationFn: () => api<{ payment: StartedPayment }>(`/my-orders/${id}/pay/start`, { method: 'POST' }),
    onSuccess: ({ payment: started }) => { setProblem(null); setPayment(started); },
    onError: (err) => setProblem(errorMessage(err))
  });

  const confirm = useMutation({
    mutationFn: (body: Record<string, unknown>) => api(`/my-orders/${id}/pay/confirm`, { method: 'POST', body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      router.replace(`/shop/order-placed?id=${id}`);
    },
    onError: (err) => { setPayment(null); setProblem(errorMessage(err)); }
  });

  // Start as soon as the order is known to be waiting for payment.
  const waiting = order?.payment_method === 'online' && order.payment_status === 'unpaid' && order.status !== 'cancelled';
  useEffect(() => {
    if (waiting && !payment && !start.isPending && !problem) start.mutate();
  }, [waiting]);

  if (isLoading) return <Loading />;
  if (!order) return <Screen><EmptyState message="We could not find this order." /></Screen>;

  function payLater() {
    router.replace(`/shop/order/${id}`);
  }

  if (!waiting) {
    return (
      <Screen>
        <EmptyState icon="check-circle" message={order.payment_status === 'paid' ? 'This order is already paid.' : 'There is nothing to pay for this order.'} action={<Button label="View order" variant="outline" onPress={payLater} />} />
      </Screen>
    );
  }

  return (
    <Screen>
      <HeroHeader title={price(order.total)} subtitle={`${t('Order')} ${shortId(order.id)}`} icon="credit-card" />

      {problem ? (
        <Card>
          <Notice tone="danger" icon="alert-triangle">{problem}</Notice>
          <Button icon="refresh-cw" label="Try again" onPress={() => { setProblem(null); start.mutate(); }} loading={start.isPending} />
        </Card>
      ) : null}

      {start.isPending || confirm.isPending ? <Loading /> : null}

      {payment?.provider === 'mock' && !confirm.isPending ? (
        <Card title="Test payment" icon="credit-card">
          <Notice icon="info">This is a test payment. No real money moves. Real payments need the payment provider switched on in the server settings.</Notice>
          <Button icon="check" label={`${t('Pay')} ${price(order.total)} (${t('test')})`} onPress={() => confirm.mutate({ approve: true, reference: payment.reference })} />
        </Card>
      ) : null}

      {payment?.provider === 'razorpay' && !confirm.isPending ? (
        <RazorpayCheckout
          keyId={payment.key_id}
          orderId={payment.razorpay_order_id}
          amount={payment.amount}
          onSuccess={(result) => confirm.mutate({ ...result })}
          onFailed={(message) => { toast(message, 'error'); setPayment(null); setProblem(message); }}
          onDismissed={() => { setPayment(null); setProblem(t('The payment was not completed.')); }}
        />
      ) : null}

      <View style={styles.later}>
        <Text style={text.small}>You can also pay later from your order page.</Text>
        <Button variant="outline" label="Pay later" onPress={payLater} />
      </View>
    </Screen>
  );
}

// A new order starts a fresh payment, because the page stays mounted between orders.
export default function PayPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Pay key={id} />;
}

const styles = StyleSheet.create({
  later: { gap: space.sm }
});
