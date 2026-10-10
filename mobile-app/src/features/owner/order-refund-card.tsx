// On the owner's order page: refunds for this order, and one tap to refund a paid order the store cancelled.
import { View } from 'react-native';
import { Text } from '@/components/text';
import { Badge, Button, Card } from '@/components/ui';
import { useConfirm } from '@/components/confirm';
import { useToast } from '@/components/toast';
import { errorMessage } from '@/lib/api';
import { price } from '@/lib/format';
import { space, text } from '@/theme/theme';
import type { Order } from '@/types/order';
import { REFUND_REASON_LABELS, REFUND_STATUS } from '@/types/refund';
import { refundCalls, useRefreshingAction, useStoreRefunds } from './owner-api';

export function OrderRefundCard({ order }: { order: Order }) {
  const refunds = useStoreRefunds();
  const refundNow = useRefreshingAction(refundCalls.refundCancelled, ['refunds', 'orders']);
  const confirm = useConfirm();
  const toast = useToast();
  if (refunds.isError || order.payment_status !== 'paid') return null;

  const mine = (refunds.data ?? []).filter((refund) => refund.order_id === order.id);
  const refunded = mine.filter((refund) => refund.status === 'refunded').reduce((sum, refund) => sum + Number(refund.amount), 0);
  const left = Math.max(0, Number(order.total) - refunded);
  const waiting = mine.some((refund) => refund.status === 'requested');
  const canRefundCancelled = order.status === 'cancelled' && left > 0 && !waiting;
  if (mine.length === 0 && !canRefundCancelled) return null;

  async function refund() {
    const online = order.payment_method === 'online';
    const yes = await confirm({
      title: `Refund ${price(left)}?`,
      message: online ? 'The money goes back to the customer\'s card or UPI through the payment company.' : `Hand ${price(left)} in cash back to the customer, then confirm here.`,
      confirmLabel: 'Refund', cancelLabel: 'Not now', tone: 'primary', icon: 'rotate-ccw'
    });
    if (!yes) return;
    refundNow.mutate({ orderId: order.id }, { onSuccess: () => toast('Refund done', 'success'), onError: (err) => toast(errorMessage(err), 'error') });
  }

  return (
    <Card title="Refunds" icon="rotate-ccw">
      {mine.map((item) => (
        <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
          <Text style={text.body}>{price(item.amount)} · {REFUND_REASON_LABELS[item.reason]}</Text>
          <Badge tone={REFUND_STATUS[item.status].tone} label={REFUND_STATUS[item.status].label} />
        </View>
      ))}
      {canRefundCancelled ? (
        <>
          <Text style={text.muted}>This order was cancelled after the customer paid {price(left)}.</Text>
          <Button icon="rotate-ccw" label={`Refund the customer ${price(left)}`} onPress={() => void refund()} loading={refundNow.isPending} />
        </>
      ) : null}
    </Card>
  );
}
