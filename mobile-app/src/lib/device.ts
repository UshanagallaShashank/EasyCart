// Phone features: current GPS position and taking or choosing a photo (returned as a small JPEG data URL).
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export async function currentPosition(): Promise<{ latitude: number; longitude: number }> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Location permission was denied. Allow it in your phone settings.');
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { latitude: Number(position.coords.latitude.toFixed(6)), longitude: Number(position.coords.longitude.toFixed(6)) };
}

// Photos are scaled down on the phone (quality 0.5, up to ~1600px) so uploads stay small on mobile data.
export async function takePhoto(source: 'camera' | 'library' = 'camera'): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.5, base64: true, allowsEditing: false };
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new Error('Camera permission was denied. Allow it in your phone settings.');
  }
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;
  if (asset.base64) return `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;
  return asset.uri.startsWith('data:') ? asset.uri : null;
}
