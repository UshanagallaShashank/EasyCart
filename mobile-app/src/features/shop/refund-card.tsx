// On a paid order that is delivered or cancelled: ask for money back, and see what the store decided.
// The server checks every rule again; this card only hides the button when asking would be refused anyway.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { Badge, Button, Card, Field, Pills } from '@/components/ui';
import { useToast } from '@/components/toast';
import { errorMessage } from '@/lib/api';
import { price } from '@/lib/format';
import { useT } from '@/lib/i18n';
import { colors, radius, space, text } from '@/theme/theme';
import type { Order } from '@/types/order';
import { REFUND_REASON_LABELS, REFUND_STATUS, type RefundReason } from '@/types/refund';
import { useOrderRefunds, useRequestRefund } from './shop-api';
import { OrderPhotoPicker } from './order-photo-picker';

const WINDOW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const REASONS: RefundReason[] = ['damaged', 'missing', 'wrong_item', 'quality', 'other'];

export function RefundCard({ order }: { order: Order }) {
  const paid = order.payment_status === 'paid';
  const refunds = useOrderRefunds(order.id, paid);
  const request = useRequestRefund(order.id);
  const toast = useToast();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState<RefundReason>(order.status === 'cancelled' ? 'other' : 'damaged');
  const [details, setDetails] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  if (!paid || refunds.isLoading || refunds.isError) return null;

  const list = refunds.data ?? [];
  const used = list.filter((refund) => refund.status === 'refunded' || refund.status === 'requested').reduce((sum, refund) => sum + Number(refund.amount), 0);
  const left = Math.max(0, Math.round((Number(order.total) - used) * 100) / 100);
  const closed = order.status === 'fulfilled' || order.status === 'cancelled';
  const waiting = list.some((refund) => refund.status === 'requested');
  const since = new Date(order.delivered_at ?? order.updated_at ?? order.created_at).getTime();
  const inTime = Date.now() - since <= WINDOW_DAYS * DAY_MS;
  const canAsk = closed && !waiting && left > 0 && inTime;

  if (list.length === 0 && !canAsk) return null;

  function send() {
    const wanted = amount.trim() === '' ? left : Number(amount);
    if (!(wanted > 0) || wanted > left) {
      toast(t('Enter an amount up to {amount}', { amount: price(left) }), 'error');
      return;
    }
    request.mutate(
      { amount: wanted, reason, ...(details.trim() ? { details: details.trim() } : {}), ...(photos.length ? { photo_urls: photos } : {}) },
      {
        onSuccess: () => { toast(t('Refund request sent to the store'), 'success'); setOpen(false); setAmount(''); setDetails(''); setPhotos([]); },
        onError: (err) => toast(errorMessage(err), 'error')
      }
    );
  }

  return (
    <Card title="Refund" icon="rotate-ccw">
      {list.map((refund) => (
        <View key={refund.id} style={styles.refund}>
          <View style={styles.top}>
            <Text style={styles.amount}>{price(refund.amount)}</Text>
            <Badge tone={REFUND_STATUS[refund.status].tone} label={REFUND_STATUS[refund.status].label} />
          </View>
          <Text style={text.small}>{t(REFUND_REASON_LABELS[refund.reason])}{refund.method === 'online' ? ` · ${t('Back to your card or UPI')}` : refund.method === 'cash' ? ` · ${t('Cash from the store')}` : ''}</Text>
          {refund.decision_note ? <Text style={text.muted}>"{refund.decision_note}"</Text> : null}
        </View>
      ))}

      {canAsk && !open ? <Button variant="outline" icon="rotate-ccw" label="Ask for a refund" onPress={() => setOpen(true)} /> : null}

      {open ? (
        <View style={{ gap: space.md }}>
          <Field label="Amount" hint={t('Up to {amount}', { amount: price(left) })} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder={String(left)} />
          <View style={{ gap: 6 }}>
            <Text style={text.label}>What went wrong?</Text>
            <Pills<RefundReason> value={reason} onChange={setReason} options={REASONS.map((value) => ({ value, label: REFUND_REASON_LABELS[value] }))} />
          </View>
          <Field value={details} onChangeText={setDetails} placeholder="Tell the store more (optional)" multiline maxLength={300} />
          <View style={{ gap: 6 }}>
            <Text style={text.label}>Photos (optional, up to 3)</Text>
            <OrderPhotoPicker orderId={order.id} purpose="refund" photos={photos} onChange={setPhotos} onBusyChange={setUploading} />
          </View>
          <View style={styles.buttons}>
            <View style={{ flex: 1 }}><Button variant="outline" label="Cancel" onPress={() => setOpen(false)} /></View>
            <View style={{ flex: 2 }}><Button icon="send" label="Send request" onPress={send} loading={request.isPending} disabled={uploading} /></View>
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  refund: { gap: 4, backgroundColor: colors.bg, borderRadius: radius.md, padding: space.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amount: { fontSize: 16, fontWeight: '800', color: colors.text },
  buttons: { flexDirection: 'row', gap: space.sm }
});
