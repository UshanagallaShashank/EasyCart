// "What customers say": recent comments and photos from people who rated this shop (no names are shown).
import { ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { StarRating } from '@/components/star-rating';
import { date } from '@/lib/format';
import { useT } from '@/lib/i18n';
import { accents, colors, radius, space } from '@/theme/theme';
import type { StoreReviews } from './shop-api';

export function ReviewsStrip({ reviews }: { reviews: StoreReviews | undefined }) {
  const t = useT();
  if (!reviews || reviews.recent.length === 0 || reviews.average === null) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.bubble}><Icon name="star" size={18} color={accents.amber.fg} fill={accents.amber.fg} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>What customers say</Text>
          <Text style={styles.subtitle}>{t('{average} out of 5 · {count} ratings', { average: reviews.average.toFixed(1), count: reviews.count })}</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {reviews.recent.map((review, index) => (
          <View key={`${review.created_at}-${index}`} style={styles.card}>
            <View style={styles.cardTop}>
              <StarRating value={review.store_stars} size={14} />
              <Text style={styles.date}>{date(review.created_at)}</Text>
            </View>
            {review.comment ? <Text style={styles.comment} numberOfLines={4}>{review.comment}</Text> : null}
            {review.photo_urls.length > 0 ? (
              <View style={styles.photos}>
                {review.photo_urls.map((url) => <Image key={url} source={{ uri: url }} style={styles.photo} contentFit="cover" cachePolicy="memory-disk" />)}
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bubble: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: accents.amber.bg },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: colors.textMuted },
  row: { flexDirection: 'row', gap: space.md, paddingRight: space.lg, paddingBottom: 4 },
  card: { width: 240, gap: space.sm, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, padding: space.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { fontSize: 11, color: colors.textFaint },
  comment: { fontSize: 13, lineHeight: 18, color: colors.textSoft },
  photos: { flexDirection: 'row', gap: 6 },
  photo: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.borderSoft }
});
