// Short-lived shared copies of platform-wide data, so admin pages loading together hit the database once.
import { create_ttl_cache } from '../../../platform/shared/ttl-cache.js';
import { find_all_orders_for_stats } from '../../orders/repositories/order-stats-repository.js';

const ADMIN_CACHE_TTL_MS = 30_000;

export const orders_snapshot = create_ttl_cache(find_all_orders_for_stats, ADMIN_CACHE_TTL_MS);
export const ADMIN_STATS_TTL_MS = ADMIN_CACHE_TTL_MS;
