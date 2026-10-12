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
import { useAppConfig, useStore } from '@/features/shop/shop-api';
import { api, errorMessage } from '@/lib/api';
import { price } from '@/lib/format';
import { colors, radius, space, text } from '@/theme/theme';
import { useT } from '@/lib/i18n';
import { useBrand } from '@/lib/brand';
import { estimateDelivery } from '@/lib/eta';
import type { Order } from '@/types/order';

type Method = 'delivery' | 'pickup';

export default function CheckoutScreen() {
  const { slug, lines, subtotal, clear, location } = useShop();
  const { data: store } = useStore(slug);
  const toast = useToast();
  const t = useT();
  const brand = useBrand();
  const chosen = { borderColor: brand.primary, backgroundColor: brand.primarySoft };
  const [method, setMethod] = useState<Method>('delivery');
  const config = useAppConfig();
  const [payWith, setPayWith] = useState<'cash_on_delivery' | 'online'>('cash_on_delivery');
  // If the server has switched online payment off, never send "online", whatever was chosen earlier.
  const paymentChoice = config.data?.online_payments ? payWith : 'cash_on_delivery';
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
    mutationFn: () => {
      if (isOutOfRange) {
        throw new Error(range?.message ?? 'Selected address is outside the delivery range. Please choose Pick up or change your address.');
      }
      return api<{ order: Order }>(`/stores/${slug}/checkout`, {
        method: 'POST',
        body: {
          items: lines.map((line) => ({ product_id: line.product_id, variant_label: line.variant_label, quantity: line.quantity })),
          payment_method: paymentChoice,
          fulfillment_method: method,
          ...(method === 'delivery' && address ? { delivery_address: addressText(address) } : {}),
          ...(discount ? { coupon_code: discount.code } : {})
        }
      });
    },
    onSuccess: ({ order }) => {
      clear();
      toast('Order placed', 'success');
      // Online orders go straight to payment; cash orders to the celebration.
      router.replace(paymentChoice === 'online' ? `/shop/pay?id=${order.id}` : `/shop/order-placed?id=${order.id}`);
    },
    onError: (err) => toast(errorMessage(err, 'Could not place the order'), 'error')
  });

  const range = method === 'delivery' && address && store ? checkDeliveryRange(store, address.zip, address.latitude !== undefined && address.longitude !== undefined ? { latitude: address.latitude, longitude: address.longitude } : location?.coords) : null;
  const isOutOfRange = method === 'delivery' && Boolean(range && !range.isEligible);
  const ready = lines.length > 0 && (method === 'pickup' || (Boolean(address) && !isOutOfRange));

  if (lines.length === 0) {
    return <Screen><EmptyState icon="shopping-cart" message="Your cart is empty, so there is nothing to check out." action={<Button label="Browse products" variant="outline" onPress={() => router.navigate('/shop')} />} /></Screen>;
  }

  const placeOrderLabel = isOutOfRange
    ? t('Outside delivery range')
    : `${t(paymentChoice === 'online' ? 'Place order & pay' : 'Place order')} · ${price(total)}`;

  return (
    <Screen
      footer={
        <View style={{ gap: space.xs }}>
          {isOutOfRange && (
            <Notice tone="danger" icon="alert-triangle">
              {t('Cannot deliver to this location. Please choose Pick up or switch to an address within {km} km.', { km: range?.maxRadiusKm ?? 5 })}
            </Notice>
          )}
          <Button
            icon={isOutOfRange ? 'alert-triangle' : 'check'}
            label={placeOrderLabel}
            onPress={() => {
              if (isOutOfRange) {
                toast(range?.message ?? 'Address is outside delivery range. Switch to Pick up or change address.', 'error');
                return;
              }
              placeOrder.mutate();
            }}
            loading={placeOrder.isPending}
            disabled={!ready}
            variant={isOutOfRange ? 'outline' : 'primary'}
          />
        </View>
      }
    >
      <Card title={t('How do you want it?')}>
        <View style={styles.methods}>
          {(['delivery', 'pickup'] as Method[]).map((option) => (
            <PressScale key={option} onPress={() => setMethod(option)} style={[styles.method, method === option && chosen]} accessibilityState={{ selected: method === option }}>
              <View style={[styles.methodIcon, method === option && { backgroundColor: brand.primaryTint }]}>
                <Icon name={option === 'delivery' ? 'truck' : 'shopping-bag'} size={20} color={method === option ? brand.primary : colors.textMuted} />
              </View>
              <Text style={[styles.methodText, method === option && { color: brand.primaryDark }]}>{option === 'delivery' ? t('Delivery') : t('Pick up')}</Text>
              <Text style={text.small}>{option === 'delivery' ? (store?.delivery_fee ? price(store.delivery_fee) : t('Free')) : t('Free')}</Text>
            </PressScale>
          ))}
        </View>
        {method === 'delivery' ? (
          <>
            {address ? (
              <View style={[styles.addressBox, { backgroundColor: brand.primarySoft, borderColor: brand.primaryTint }]}>
                <View style={[styles.addressIcon, { backgroundColor: brand.primaryTint }]}><Icon name="map-pin" size={18} color={brand.primary} /></View>
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
            {range && <Notice tone={range.isEligible ? 'success' : 'danger'} icon={range.isEligible ? 'truck' : 'alert-triangle'}>{range.message}</Notice>}
            {range?.isEligible ? (() => {
              const eta = estimateDelivery(range.distanceKm);
              return <Notice tone="primary" icon={eta.fast ? 'zap' : 'clock'}>{t('Estimated delivery')}: {t('{low}–{high} min', { low: eta.low, high: eta.high })}</Notice>;
            })() : null}
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

      {config.data?.online_payments ? (
        <Card title={t('How will you pay?')}>
          <View style={styles.methods}>
            {(['cash_on_delivery', 'online'] as const).map((option) => (
              <PressScale key={option} onPress={() => setPayWith(option)} style={[styles.method, paymentChoice === option && chosen]} accessibilityState={{ selected: paymentChoice === option }}>
                <View style={[styles.methodIcon, paymentChoice === option && { backgroundColor: brand.primaryTint }]}>
                  <Icon name={option === 'online' ? 'credit-card' : 'wallet'} size={20} color={paymentChoice === option ? brand.primary : colors.textMuted} />
                </View>
                <Text style={[styles.methodText, paymentChoice === option && { color: brand.primaryDark }]}>{option === 'online' ? t('Pay online') : t('Cash on delivery')}</Text>
              </PressScale>
            ))}
          </View>
        </Card>
      ) : null}

      <Card title={t('Bill')}>
        <InfoRow label={t('Items')} value={price(subtotal)} />
        {discount && <InfoRow label={t('Coupon {code}', { code: discount.code })} value={`-${price(discount.amount)}`} tone="success" />}
        {method === 'delivery' && <InfoRow label={t('Delivery fee')} value={price(fee)} />}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: space.sm }}><InfoRow label={t('Total')} value={price(total)} strong /></View>
        <Text style={text.small}>{paymentChoice === 'online' ? t('You will pay online right after placing the order.') : t('Pay in cash when you receive your order.')}</Text>
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
