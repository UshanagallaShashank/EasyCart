// Checkout: pickup or delivery, address, coupon, and the final bill.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/motion';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, EmptyState, Field, InfoRow, Notice, Screen } from '@/components/ui';
import { addressLocation, addressText, useAddresses } from '@/features/shop/addresses';
import { checkDeliveryRange } from '@/lib/delivery-radius';
import { useToast } from '@/components/toast';
import { useShop } from '@/features/shop/shop-context';
import { useStore } from '@/features/shop/shop-api';
import { api, errorMessage } from '@/lib/api';
import { price } from '@/lib/format';
import { colors, radius, space, text } from '@/theme/theme';
import { useT } from '@/lib/i18n';
import type { Order } from '@/types/order';

type Method = 'delivery' | 'pickup';

export default function CheckoutScreen() {
  const { slug, lines, subtotal, clear, location } = useShop();
  const { data: store } = useStore(slug);
  const toast = useToast();
  const t = useT();
  const [method, setMethod] = useState<Method>('delivery');
  const { active: address } = useAddresses();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState<{ code: string; amount: number } | null>(null);

  const fee = method === 'delivery' ? store?.delivery_fee ?? 0 : 0;
  const total = Math.max(0, subtotal - (discount?.amount ?? 0)) + fee;

  const applyCoupon = useMutation({
    mutationFn: async () => (await api<{ coupon: { discount_type: 'percent' | 'fixed'; discount_value: number; code: string } }>(`/stores/${slug}/coupons/validate`, { method: 'POST', body: { code: coupon.trim() } })).coupon,
    onSuccess: (result) => {
      const amount = result.discount_type === 'percent' ? (subtotal * result.discount_value) / 100 : result.discount_value;
      setDiscount({ code: result.code ?? coupon.trim().toUpperCase(), amount: Math.min(subtotal, amount) });
      toast('Coupon applied', 'success');
    },
    onError: (err) => { setDiscount(null); toast(errorMessage(err, 'Coupon not valid'), 'error'); }
  });

  const placeOrder = useMutation({
    mutationFn: () => api<{ order: Order }>(`/stores/${slug}/checkout`, {
      method: 'POST',
      body: {
        items: lines.map((line) => ({ product_id: line.product_id, variant_label: line.variant_label, quantity: line.quantity })),
        payment_method: 'cash_on_delivery',
        fulfillment_method: method,
        ...(method === 'delivery' && address ? { delivery_address: addressText(address) } : {}),
        ...(discount ? { coupon_code: discount.code } : {})
      }
    }),
    onSuccess: ({ order }) => {
      clear();
      toast('Order placed', 'success');
      router.replace(`/shop/order-placed?id=${order.id}`);
    },
    onError: (err) => toast(errorMessage(err, 'Could not place the order'), 'error')
  });

  const ready = lines.length > 0 && (method === 'pickup' || Boolean(address));
  const range = method === 'delivery' && address && store ? checkDeliveryRange(store, address.zip, address.latitude !== undefined && address.longitude !== undefined ? { latitude: address.latitude, longitude: address.longitude } : location?.coords) : null;
  if (lines.length === 0) {
    return <Screen><EmptyState icon="shopping-cart" message="Your cart is empty, so there is nothing to check out." action={<Button label="Browse products" variant="outline" onPress={() => router.navigate('/shop')} />} /></Screen>;
  }

  return (
    <Screen footer={<Button icon="check" label={`${t('Place order')} · ${price(total)}`} onPress={() => placeOrder.mutate()} loading={placeOrder.isPending} disabled={!ready} />}>
      <Card title={t('How do you want it?')}>
        <View style={styles.methods}>
          {(['delivery', 'pickup'] as Method[]).map((option) => (
            <PressScale key={option} onPress={() => setMethod(option)} style={[styles.method, method === option && styles.methodActive]} accessibilityState={{ selected: method === option }}>
              <View style={[styles.methodIcon, method === option && { backgroundColor: colors.primaryTint }]}>
                <Icon name={option === 'delivery' ? 'truck' : 'shopping-bag'} size={20} color={method === option ? colors.primary : colors.textMuted} />
              </View>
              <Text style={[styles.methodText, method === option && { color: colors.primaryDark }]}>{option === 'delivery' ? t('Delivery') : t('Pick up')}</Text>
              <Text style={text.small}>{option === 'delivery' ? (store?.delivery_fee ? price(store.delivery_fee) : t('Free')) : t('Free')}</Text>
            </PressScale>
          ))}
        </View>
        {method === 'delivery' ? (
          <>
            {address ? (
              <View style={styles.addressBox}>
                <View style={styles.addressIcon}><Icon name="map-pin" size={18} color={colors.primary} /></View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={text.heading} numberOfLines={1}>{address.recipientName} · {address.label}</Text>
                  <Text style={text.muted}>{addressLocation(address)}</Text>
                  <Text style={text.small}>Ph: {address.phone}</Text>
                </View>
                <Button small variant="outline" label={t('Change')} onPress={() => router.push('/shop/addresses')} />
              </View>
            ) : (
              <>
                <Notice icon="map-pin">Add a delivery address to continue.</Notice>
                <Button icon="plus" label={t('Add delivery address')} onPress={() => router.push('/shop/addresses')} />
              </>
            )}
            {range && <Notice tone={range.isEligible ? 'success' : 'warning'} icon={range.isEligible ? 'truck' : 'alert-triangle'}>{range.message}</Notice>}
          </>
        ) : (
          <Notice icon="shopping-bag">Pick up at {store?.name ?? 'the store'}{store?.address ? `, ${store.address}` : ''}. We will tell you when it is ready.</Notice>
        )}
      </Card>

      <Card title={t('Coupon')}>
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}><Field label="Code" value={coupon} onChangeText={setCoupon} autoCapitalize="characters" placeholder="e.g. WELCOME10" /></View>
          <Button small variant="outline" label={t('Apply')} onPress={() => applyCoupon.mutate()} loading={applyCoupon.isPending} disabled={!coupon.trim()} />
        </View>
        {discount && (
          <View style={styles.applied}>
            <Icon name="check-circle" size={18} color={colors.success} />
            <Text style={[text.muted, { flex: 1, color: colors.success, fontWeight: '700' }]}>{t('You save {amount} with {code}', { amount: price(discount.amount), code: discount.code })}</Text>
            <Button small variant="ghost" label={t('Remove')} onPress={() => { setDiscount(null); setCoupon(''); }} />
          </View>
        )}
      </Card>

      <Card title={t('Bill')}>
        <InfoRow label={t('Items')} value={price(subtotal)} />
        {discount && <InfoRow label={t('Coupon {code}', { code: discount.code })} value={`-${price(discount.amount)}`} tone="success" />}
        {method === 'delivery' && <InfoRow label={t('Delivery fee')} value={price(fee)} />}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: space.sm }}><InfoRow label={t('Total')} value={price(total)} strong /></View>
        <Text style={text.small}>{t('Pay in cash when you receive your order.')}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addressBox: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.primarySoft, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primaryTint, padding: space.md },
  addressIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  methods: { flexDirection: 'row', gap: space.sm },
  method: { flex: 1, alignItems: 'center', gap: 6, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  methodActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  methodIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' },
  methodText: { fontSize: 14, fontWeight: '700', color: colors.text },
  applied: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.successSoft, borderRadius: radius.md, padding: space.md }
});
