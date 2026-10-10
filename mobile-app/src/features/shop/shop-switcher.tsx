// Lets a customer who shops at several stores jump between them from the top of the home screen.
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn as FadeInView, SlideInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/motion';
import { BrandTitle } from '@/components/nav';
import { Text } from '@/components/text';
import { fileUrl } from '@/lib/api';
import { colors, radius, shadow, space, text } from '@/theme/theme';
import { useMyStores } from './shop-api';
import { useShop } from './shop-context';

export function ShopSwitcher({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const { slug, setSlug } = useShop();
  const { data: stores } = useMyStores();

  function choose(next: string) {
    setOpen(false);
    if (next !== slug) setSlug(next);
  }

  function enterCode() {
    setOpen(false);
    router.push('/shop/account');
  }

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.trigger} accessibilityRole="button" accessibilityLabel="Switch shop">
        <BrandTitle>{name}</BrandTitle>
        <Icon name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Animated.View entering={FadeInView.duration(120)} style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel="Close" />
          <Animated.View entering={SlideInDown.duration(200)} style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={text.heading}>Your shops</Text>
            <Text style={text.small}>Each shop keeps its own cart.</Text>

            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: space.sm }}>
              {(stores ?? []).length === 0 && <Text style={text.muted}>Shops you order from will show up here.</Text>}
              {(stores ?? []).map((store) => {
                const active = store.slug === slug;
                const logo = fileUrl(store.logo_url);
                return (
                  <PressScale key={store.slug} onPress={() => choose(store.slug)} style={[styles.row, active && styles.rowActive]} accessibilityRole="button">
                    {logo ? <Image source={{ uri: logo }} style={styles.logo} /> : <View style={styles.logo}><Icon name="store" size={20} color={colors.primary} /></View>}
                    <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
                    {active && <Icon name="check-circle" size={20} color={colors.primary} />}
                  </PressScale>
                );
              })}
            </ScrollView>

            <PressScale onPress={enterCode} style={styles.addRow} accessibilityRole="button">
              <Icon name="plus" size={18} color={colors.primary} />
              <Text style={styles.addText}>Open another shop by its code</Text>
            </PressScale>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space.xl, paddingBottom: space.xxl * 1.5, gap: space.md, ...shadow },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  rowActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  logo: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  storeName: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  addRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, height: 48, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  addText: { fontSize: 14, fontWeight: '700', color: colors.primary }
});
