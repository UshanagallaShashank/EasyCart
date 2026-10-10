// Tells screens how big the phone is, so layouts can fit small phones, big phones and tablets.
import { useWindowDimensions } from 'react-native';

export type ScreenSize = 'small' | 'normal' | 'tablet';

export function useScreen() {
  const { width } = useWindowDimensions();

  let size: ScreenSize = 'normal';
  if (width < 360) size = 'small';
  if (width >= 700) size = 'tablet';

  // Page edge padding: tighter on small phones, roomier on tablets.
  let pagePadding = 16;
  if (size === 'small') pagePadding = 12;
  if (size === 'tablet') pagePadding = 24;

  // How many product cards fit side by side.
  let gridColumns = 2;
  if (size === 'tablet') gridColumns = 3;

  return { width, size, pagePadding, gridColumns, isSmall: size === 'small', isTablet: size === 'tablet' };
}
