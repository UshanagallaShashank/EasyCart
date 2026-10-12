// Add up to a few photos to an order (for a rating or a refund): take one, pick from the gallery, or remove one.
// Each photo is uploaded as soon as it is chosen, so sending the form afterwards is quick.
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/icon';
import { useToast } from '@/components/toast';
import { errorMessage } from '@/lib/api';
import { pickPhotos } from '@/lib/device';
import { colors, radius, space } from '@/theme/theme';
import { uploadOrderPhoto } from './shop-api';
import { useBrand } from '@/lib/brand';

export function OrderPhotoPicker({ orderId, purpose, photos, onChange, onBusyChange, max = 3 }: {
  orderId: string;
  purpose: 'review' | 'refund';
  photos: string[];
  onChange(next: string[]): void;
  onBusyChange?(busy: boolean): void;
  max?: number;
}) {
  const brand = useBrand();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  function setBusy(busy: boolean) {
    setUploading(busy);
    onBusyChange?.(busy);
  }

  async function add(source: 'camera' | 'library') {
    try {
      const picked = (await pickPhotos(source)).slice(0, max - photos.length);
      if (picked.length === 0) return;
      setBusy(true);
      let current = photos;
      for (const file of picked) {
        const url = await uploadOrderPhoto(orderId, purpose, file);
        current = [...current, url].slice(0, max);
        onChange(current);
      }
    } catch (err) {
      toast(errorMessage(err, 'Could not add the photo'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.photos}>
      {photos.map((url) => (
        <View key={url}>
          <Image source={{ uri: url }} style={styles.photo} contentFit="cover" />
          <Pressable onPress={() => onChange(photos.filter((item) => item !== url))} style={styles.remove} hitSlop={8} accessibilityLabel="Remove photo">
            <Icon name="x" size={12} color={colors.white} strokeWidth={3} />
          </Pressable>
        </View>
      ))}
      {uploading ? <View style={[styles.photo, [styles.adding, { borderColor: brand.primaryTint, backgroundColor: brand.primarySoft }]]}><ActivityIndicator color={brand.primary} /></View> : null}
      {!uploading && photos.length < max ? (
        <>
          <Pressable onPress={() => void add('camera')} style={[styles.photo, [styles.adding, { borderColor: brand.primaryTint, backgroundColor: brand.primarySoft }]]} accessibilityLabel="Take a photo">
            <Icon name="camera" size={22} color={brand.primary} />
          </Pressable>
          <Pressable onPress={() => void add('library')} style={[styles.photo, [styles.adding, { borderColor: brand.primaryTint, backgroundColor: brand.primarySoft }]]} accessibilityLabel="Choose a photo">
            <Icon name="image" size={22} color={brand.primary} />
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  photo: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.borderSoft },
  adding: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primaryTint, backgroundColor: colors.primarySoft },
  remove: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white }
});
