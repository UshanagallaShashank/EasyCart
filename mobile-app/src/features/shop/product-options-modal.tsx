// Bottom sheet popup for choosing a product variant/option when a product has multiple options.
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/motion';
import { Text } from '@/components/text';
import { fileUrl } from '@/lib/api';
import { useBrand } from '@/lib/brand';
import { price } from '@/lib/format';
import { useContent, useT } from '@/lib/i18n';
import { colors, radius, shadow, space } from '@/theme/theme';
import type { Product, ProductVariant } from '@/types/catalog';
import type { CartLine } from './shop-context';

export interface ProductOptionsModalProps {
  visible: boolean;
  onClose(): void;
  product: Product;
  lines: CartLine[];
  onAdd(product: Product, variant: ProductVariant): void;
  onSetQuantity(productId: string, quantity: number, variantLabel: string): void;
}

export function ProductOptionsModal({
  visible,
  onClose,
  product,
  lines,
  onAdd,
  onSetQuantity
}: ProductOptionsModalProps) {
  const t = useT();
  const brand = useBrand();
  const name = useContent(product.name);
  const image = fileUrl(product.images?.[0]);

  const totalCartQty = lines.reduce((sum, l) => sum + l.quantity, 0);
  const itemTotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissOverlay} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Header handle */}
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          {/* Product Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={styles.headerImage}
                  contentFit="cover"
                  transition={120}
                />
              ) : (
                <View style={styles.headerImagePlaceholder}>
                  <Icon name="package" size={22} color={colors.textFaint} />
                </View>
              )}
              <View style={styles.headerTextWrap}>
                <Text style={styles.title} numberOfLines={2}>
                  {name}
                </Text>
                <Text style={styles.subtitle}>
                  {t('Choose an option')}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={10}
              accessibilityLabel={t('Close')}
            >
              <Icon name="x" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Variants list */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {product.variants.map((v) => {
              const line = lines.find((l) => (l.variant_label ?? '') === v.label);
              const qty = line?.quantity ?? 0;
              const isOut = v.stock <= 0;
              const isFew = !isOut && v.stock <= (product.low_stock_threshold ?? 5);

              return (
                <View key={v.label} style={styles.variantRow}>
                  <View style={styles.variantDetails}>
                    <Text style={[styles.variantLabel, isOut && styles.variantMuted]}>
                      {v.label}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={[styles.variantPrice, isOut && styles.variantMuted]}>
                        {price(v.price)}
                      </Text>
                      {isOut ? (
                        <View style={styles.outBadge}>
                          <Text style={styles.outBadgeText}>{t('Out of stock')}</Text>
                        </View>
                      ) : isFew ? (
                        <View style={styles.fewBadge}>
                          <Text style={styles.fewBadgeText}>
                            {t('Only {n} left', { n: v.stock })}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.actionWrap}>
                    {isOut ? (
                      <View style={styles.soldOutBtn}>
                        <Text style={styles.soldOutText}>{t('Sold out')}</Text>
                      </View>
                    ) : qty > 0 ? (
                      <View style={[styles.modalStepper, { borderColor: brand.primary }]}>
                        <PressScale
                          onPress={() => onSetQuantity(product.id, qty - 1, v.label)}
                          style={styles.modalStepBtn}
                          accessibilityLabel={`Remove one ${v.label}`}
                        >
                          <Icon
                            name="minus"
                            size={14}
                            color={brand.primaryDark || brand.primary}
                            strokeWidth={2.8}
                          />
                        </PressScale>
                        <Text style={[styles.modalQtyText, { color: brand.primaryDark || brand.primary }]}>{qty}</Text>
                        <PressScale
                          onPress={() => onSetQuantity(product.id, qty + 1, v.label)}
                          disabled={qty >= v.stock}
                          style={[styles.modalStepBtn, qty >= v.stock && { opacity: 0.4 }]}
                          accessibilityLabel={`Add one more ${v.label}`}
                        >
                          <Icon name="plus" size={14} color={brand.primaryDark || brand.primary} strokeWidth={2.8} />
                        </PressScale>
                      </View>
                    ) : (
                      <PressScale
                        onPress={() => onAdd(product, v)}
                        style={[
                          styles.addBtn,
                          {
                            borderColor: brand.primary,
                            backgroundColor: brand.primarySoft || colors.primarySoft
                          }
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Add ${v.label}`}
                      >
                        <Icon name="plus" size={14} color={brand.primaryDark || colors.primaryDark} strokeWidth={2.8} />
                        <Text style={[styles.addBtnText, { color: brand.primaryDark || colors.primaryDark }]}>
                          {t('ADD')}
                        </Text>
                      </PressScale>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer with Item Total and Done button */}
          <View style={styles.footer}>
            {totalCartQty > 0 ? (
              <View style={styles.footerRow}>
                <View style={styles.footerTotalWrap}>
                  <Text style={styles.footerTotalLabel}>{t('Item total')}</Text>
                  <Text style={styles.footerTotalAmount}>{price(itemTotal)}</Text>
                </View>
                <PressScale
                  onPress={onClose}
                  style={[styles.doneBtn, styles.doneBtnSide, { backgroundColor: brand.primary }]}
                  accessibilityRole="button"
                >
                  <Text style={styles.doneBtnText}>{t('Done')}</Text>
                </PressScale>
              </View>
            ) : (
              <PressScale
                onPress={onClose}
                style={[styles.doneBtn, { backgroundColor: brand.primary }]}
                accessibilityRole="button"
              >
                <Text style={styles.doneBtnText}>{t('Done')}</Text>
              </PressScale>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end'
  },
  dismissOverlay: {
    flex: 1
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
    ...shadow
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 10
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8
  },
  headerImage: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.borderSoft
  },
  headerImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTextWrap: {
    flex: 1,
    gap: 2
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
    lineHeight: 20
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500'
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 4
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder
  },
  variantDetails: {
    flex: 1,
    gap: 4,
    paddingRight: 12
  },
  variantLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text
  },
  variantMuted: {
    color: colors.textFaint
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  variantPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text
  },
  outBadge: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill
  },
  outBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger
  },
  fewBadge: {
    backgroundColor: colors.warningSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill
  },
  fewBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.warning
  },
  actionWrap: {
    minWidth: 84,
    alignItems: 'flex-end'
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center'
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  modalStepper: {
    height: 34,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  modalStepBtn: {
    width: 28,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalQtyText: {
    fontSize: 13,
    fontWeight: '800',
    paddingHorizontal: 6
  },
  soldOutBtn: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  soldOutText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textFaint
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  footerTotalWrap: {
    flex: 1,
    gap: 2
  },
  footerTotalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  footerTotalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3
  },
  doneBtn: {
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2
  },
  doneBtnSide: {
    minWidth: 130,
    paddingHorizontal: 24
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white
  }
});
