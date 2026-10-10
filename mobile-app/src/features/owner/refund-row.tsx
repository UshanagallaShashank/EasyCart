// One refund request in the owner's list: what was asked, why, the photos, and the buttons to decide.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Text } from '@/components/text';
import { Badge, Button, Field } from '@/components/ui';
import { useConfirm } from '@/components/confirm';
import { useToast } from '@/components/toast';
import { errorMessage } from '@/lib/api';
import { dateTime, price, shortId } from '@/lib/format';
import { colors, radius, space, text } from '@/theme/theme';
import { REFUND_REASON_LABELS, REFUND_STATUS } from '@/types/refund';
import { refundCalls, useRefreshingAction, type StoreRefund } from './owner-api';

export function RefundRow({ refund }: { refund: StoreRefund }) {
  const decide = useRefreshingAction(refundCalls.decide, ['refunds', 'orders']);
  const confirm = useConfirm();
  const toast = useToast();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const status = REFUND_STATUS[refund.status];
  const online = refund.method === 'online';

  async function approve(manual: boolean) {
    const message = manual
      ? 'Only choose this if you already sent the money back from your payment company dashboard.'
      : online
        ? 'The money goes back to the customer\'s card or UPI through the payment company.'
        : `Hand ${price(refund.amount)} in cash back to the customer, then confirm here.`;
    const yes = await confirm({ title: `Refund ${price(refund.amount)}?`, message, confirmLabel: manual ? 'Yes, I refunded it' : 'Refund', cancelLabel: 'Not now', tone: 'primary', icon: 'rotate-ccw' });
    if (!yes) return;
    decide.mutate({ id: refund.id, approve: true, manual }, { onSuccess: () => toast('Refund done', 'success'), onError: (err) => toast(errorMessage(err), 'error') });
  }

  function reject() {
    if (note.trim().length < 3) { toast('Tell the customer why (at least 3 letters)', 'error'); return; }
    decide.mutate({ id: refund.id, approve: false, note: note.trim() }, { onSuccess: () => { toast('Refund declined', 'success'); setRejecting(false); }, onError: (err) => toast(errorMessage(err), 'error') });
  }

  return (
    <View style={styles.row}>
      <View style={styles.top}>
        <Text style={styles.amount}>{price(refund.amount)}</Text>
        <Badge tone={status.tone} label={status.label} />
      </View>
      <Text style={text.small}>
        Order {shortId(refund.order_id)}{refund.order ? ` · ${refund.order.item_count} items · paid ${price(refund.order.total)} ${online ? 'online' : 'in cash'}` : ''} · {dateTime(refund.created_at)}
      </Text>
      <Text style={styles.reason}>{REFUND_REASON_LABELS[refund.reason]}</Text>
      {refund.details ? <Text style={text.muted}>"{refund.details}"</Text> : null}
      {refund.photo_urls.length > 0 ? (
        <View style={styles.photos}>
          {refund.photo_urls.map((url) => <Image key={url} source={{ uri: url }} style={styles.photo} contentFit="cover" />)}
        </View>
      ) : null}
      {refund.decision_note && refund.status !== 'requested' ? <Text style={text.small}>Your note: {refund.decision_note}</Text> : null}

      {refund.status === 'requested' && !rejecting ? (
        <View style={{ gap: space.sm }}>
          <View style={styles.buttons}>
            <View style={{ flex: 1 }}><Button variant="outline" label="Decline" onPress={() => setRejecting(true)} disabled={decide.isPending} /></View>
            <View style={{ flex: 1 }}><Button icon="check" label="Refund" onPress={() => void approve(false)} loading={decide.isPending} /></View>
          </View>
          {online ? <Button small variant="ghost" label="I refunded it myself" onPress={() => void approve(true)} disabled={decide.isPending} /> : null}
        </View>
      ) : null}

      {rejecting ? (
        <View style={{ gap: space.sm }}>
          <Field value={note} onChangeText={setNote} placeholder="Why not? The customer will see this." multiline maxLength={300} />
          <View style={styles.buttons}>
            <View style={{ flex: 1 }}><Button variant="outline" label="Back" onPress={() => setRejecting(false)} /></View>
            <View style={{ flex: 1 }}><Button variant="danger" label="Decline refund" onPress={reject} loading={decide.isPending} /></View>
          </View>
        </View>
      ) : null}

      <Button small variant="ghost" label="Open order" onPress={() => router.push(`/owner/order/${refund.order_id}`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: space.sm, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, padding: space.lg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amount: { fontSize: 20, fontWeight: '800', color: colors.text },
  reason: { fontSize: 14, fontWeight: '700', color: colors.text },
  photos: { flexDirection: 'row', gap: space.sm },
  photo: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.borderSoft },
  buttons: { flexDirection: 'row', gap: space.sm }
});
