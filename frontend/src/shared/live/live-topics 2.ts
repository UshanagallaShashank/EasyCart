// Which cached screens to refresh for each kind of change the server announces.
// Only these prefixes are refreshed, so forms being typed into (store settings, rider profile) are never reset.
import type { QueryKey } from '@tanstack/react-query';

export type LiveTopic = 'order' | 'rider' | 'settlement';

const ORDER_KEYS: QueryKey[] = [
  ['orders'], ['my-orders'], ['store-deliveries'], ['store-settlements'], ['customers'], ['products'], ['notifications'],
  ['rider', 'home'], ['rider', 'order'], ['rider', 'history'], ['rider', 'earnings'], ['rider', 'settlements'],
  ['admin', 'deliveries'], ['admin', 'riders'], ['admin', 'rider'], ['admin', 'stats'], ['admin', 'notifications']
];

export const KEYS_BY_TOPIC: Record<LiveTopic, QueryKey[]> = {
  order: ORDER_KEYS,
  rider: [['rider', 'me'], ['rider', 'home'], ['riders-nearby'], ['admin', 'riders'], ['admin', 'rider'], ['admin', 'notifications']],
  settlement: [['rider', 'earnings'], ['rider', 'settlements'], ['store-settlements'], ['admin', 'rider'], ['admin', 'riders']]
};
