import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { useShop } from '@/features/shop/shop-context';

export function FloatingCartBar() {
  const { lines } = useShop();
  const insets = useSafeAreaInsets();

  const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);

  if (totalItems <= 0) return null;

  const previewItems = lines.slice(0, 2);

  return (
    <View
      style={[
        styles.outerWrap,
        { bottom: Math.max(insets.bottom, 14) + 10 }
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        style={({ pressed }) => [
          styles.pill,
          pressed && styles.pillPressed
        ]}
        onPress={() => router.navigate('/shop/cart')}
        accessibilityLabel={`View cart, ${totalItems} items`}
      >
        {/* Overlapping circular product thumbnails */}
        <View style={styles.thumbnailsWrap}>
          {previewItems.map((item, index) => (
            <View
              key={`${item.product_id}-${index}`}
              style={[
                styles.thumbnailCircle,
                index > 0 && styles.thumbnailOverlap
              ]}
            >
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.thumbnailImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Icon name="shopping-bag" size={16} color="#0284c7" />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* View cart text & item count */}
        <View style={styles.textWrap}>
          <Text style={styles.title}>View cart</Text>
          <Text style={styles.subtitle}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Right chevron arrow */}
        <View style={styles.arrowWrap}>
          <Icon name="chevron-right" size={20} color="#ffffff" strokeWidth={2.8} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999
  },
  pill: {
    backgroundColor: '#0284c7',
    borderRadius: 999,
    paddingVertical: 5,
    paddingLeft: 6,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8
  },
  pillPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }]
  },
  thumbnailsWrap: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  thumbnailCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
    zIndex: 1
  },
  thumbnailOverlap: {
    marginLeft: -16,
    zIndex: 2
  },
  thumbnailImg: {
    width: '100%',
    height: '100%'
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textWrap: {
    gap: 1
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#e0f2fe'
  },
  arrowWrap: {
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
