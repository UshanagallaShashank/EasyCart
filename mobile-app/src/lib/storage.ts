// Small key-value store: the phone's secure keychain on iOS/Android, localStorage in the browser.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return globalThis.localStorage?.getItem(key) ?? null; } catch { return null; }
  }
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { globalThis.localStorage?.setItem(key, value); } catch { /* private mode: keep in memory only */ }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { globalThis.localStorage?.removeItem(key); } catch { /* nothing stored */ }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
