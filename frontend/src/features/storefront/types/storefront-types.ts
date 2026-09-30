// Public store shape returned by GET /stores/:slug (a filtered subset of Store).
import type { Store } from '@/features/stores/types/store-types';

export type PublicStore = Pick<Store, 'name' | 'slug' | 'logo_url' | 'banner_url' | 'theme' | 'delivery_fee' | 'promotion_banner_text'>;
