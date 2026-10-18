// Small key-value stores. The secure one (the phone's keychain, localStorage on the web) is for secrets like the sign-in session.
// Everything else (cart, addresses, favourites, location) uses the plain, fast one: the keychain is slow and holds only 2 KB per item.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// ---- Plain storage for things that are not secrets.

export async function getLocal(key: string): Promise<string | null> {
  const saved = await AsyncStorage.getItem(key);
  if (saved !== null) return saved;
  // Before this change these were kept in the keychain, so read the old copy once instead of losing it.
  try { return await getItem(key); } catch { return null; }
}

export async function setLocal(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}
