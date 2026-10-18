// Text from the shop's data (a product name) shown in the shopper's language, for places where a hook cannot be used (lists).
import type { TextProps } from 'react-native';
import { Text } from './text';
import { useContent } from '@/lib/i18n';

export function ContentText({ value, ...props }: TextProps & { value: string }) {
  return <Text {...props}>{useContent(value)}</Text>;
}
