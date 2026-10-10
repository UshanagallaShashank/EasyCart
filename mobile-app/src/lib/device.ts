// Phone features: current GPS position and taking or choosing photos (returned as small JPEG data URLs).
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export async function currentPosition(): Promise<{ latitude: number; longitude: number }> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Location permission was denied. Allow it in your phone settings.');
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { latitude: Number(position.coords.latitude.toFixed(6)), longitude: Number(position.coords.longitude.toFixed(6)) };
}

async function assetToDataUrl(asset: ImagePicker.ImagePickerAsset): Promise<string | null> {
  if (asset.base64) {
    return `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;
  }
  if (asset.uri?.startsWith('data:')) {
    return asset.uri;
  }
  if (typeof fetch !== 'undefined' && asset.uri) {
    try {
      const res = await fetch(asset.uri);
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }
  return null;
}

// Photos are scaled down on the phone (quality 0.5, up to ~1600px) so uploads stay small on mobile data.
export async function takePhoto(source: 'camera' | 'library' = 'camera'): Promise<string | null> {
  const photos = await pickPhotos(source);
  return photos[0] ?? null;
}

// Allows picking multiple photos at once from the photo library (or single photo from camera).
export async function pickPhotos(source: 'camera' | 'library' = 'library'): Promise<string[]> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.5,
    base64: true,
    allowsEditing: false,
    allowsMultipleSelection: source === 'library'
  };
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new Error('Camera permission was denied. Allow it in your phone settings.');
  }
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets) return [];
  const urls: string[] = [];
  for (const asset of result.assets) {
    const dataUrl = await assetToDataUrl(asset);
    if (dataUrl) urls.push(dataUrl);
  }
  return urls;
}
