// Little buzzes that confirm a tap, a success or a problem. Phones only: the web has no vibration motor to use.
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const CAN_BUZZ = Platform.OS !== 'web';

export function tapFeedback() {
  if (CAN_BUZZ) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

export function selectFeedback() {
  if (CAN_BUZZ) void Haptics.selectionAsync().catch(() => undefined);
}

export function successFeedback() {
  if (CAN_BUZZ) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

export function errorFeedback() {
  if (CAN_BUZZ) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
}
