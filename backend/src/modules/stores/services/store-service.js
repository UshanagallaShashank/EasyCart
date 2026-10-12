// Business logic for store settings, publishing, and public lookup.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../platform/shared/app-error.js';
import { validate_store_settings_input } from '../store-schemas.js';
import { find_store_by_tenant_id, find_store_by_slug, find_published_stores, save_store, update_store } from '../repositories/store-repository.js';
import { distance_km } from '../../../platform/shared/distance.js';
import { find_all_store_stars } from '../../ratings/rating-repository.js';
import { summarize_store_ratings } from '../../ratings/rating-math.js';
import { find_tenant_by_id, find_all_tenants } from '../../tenants/repositories/tenant-repository.js';
import { upload_store_asset_to_supabase } from './store-storage-service.js';
import { read_request_details } from './store-request-document-service.js';

export async function create_store_for_tenant(tenant_id, name, slug) {
  return save_store({ id: randomUUID(), tenant_id, name, slug, is_published: false });
}

export async function get_own_store(tenant_id) {
  let store = await find_store_by_tenant_id(tenant_id);
  if (!store) {
    throw new AppError('Store not found', 404);
  }
  if (!store.address || !store.pincode) {
    try {
      const tenant = await find_tenant_by_id(tenant_id);
      if (tenant?.owner_id) {
        const details = await read_request_details(tenant.owner_id);
        if (details?.business_address) {
          const addr = details.business_address;
          const pin = addr.match(/\b\d{6}\b/)?.[0] || null;
          const updates = {};
          if (!store.address) {
            updates.address = addr;
            updates.business_address = addr;
            store.address = addr;
            store.business_address = addr;
          }
          if (!store.pincode && pin) {
            updates.pincode = pin;
            store.pincode = pin;
          }
          if (Object.keys(updates).length > 0) {
            await update_store(tenant_id, updates);
          }
        }
      }
    } catch (err) {
      console.error('Failed to populate store address from request details:', err);
    }
  }
  return store;
}

export async function update_store_settings(tenant_id, payload) {
  const parsed = validate_store_settings_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  const store = await find_store_by_tenant_id(tenant_id);
  if (!store) {
    throw new AppError('Store not found', 404);
  }
  return update_store(tenant_id, parsed.data);
}

export async function set_store_published(tenant_id, is_published) {
  const store = await find_store_by_tenant_id(tenant_id);
  if (!store) {
    throw new AppError('Store not found', 404);
  }
  return update_store(tenant_id, { is_published });
}

// Live shops around a point on the map, nearest first. Shops that have not pinned their location are left out.
export async function list_nearby_stores(lat, lng, limit = 30) {
  const [stores, tenants, star_rows] = await Promise.all([find_published_stores(), find_all_tenants(), find_all_store_stars()]);
  const ratings = summarize_store_ratings(star_rows);
  const suspended = new Set(tenants.filter((tenant) => tenant.status === 'suspended').map((tenant) => tenant.id));

  return stores
    .filter((store) => !suspended.has(store.tenant_id))
    .filter((store) => store.latitude !== null && store.latitude !== undefined && store.longitude !== null && store.longitude !== undefined)
    .map((store) => {
      const distance = distance_km(lat, lng, Number(store.latitude), Number(store.longitude));
      const radius = store.max_delivery_radius_km ?? 5;
      return {
        name: store.name,
        slug: store.slug,
        logo_url: store.logo_url ?? null,
        banner_url: store.banner_url ?? null,
        address: store.address ?? null,
        delivery_fee: store.delivery_fee,
        max_delivery_radius_km: radius,
        latitude: Number(store.latitude),
        longitude: Number(store.longitude),
        distance_km: Math.round(distance * 10) / 10,
        delivers_to_you: distance <= radius,
        rating_average: ratings.get(store.tenant_id)?.average ?? null,
        rating_count: ratings.get(store.tenant_id)?.count ?? 0
      };
    })
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, limit);
}

export async function get_public_store_by_slug(slug) {
  const store = await find_store_by_slug(slug);
  if (!store || !store.is_published) {
    throw new AppError('Store not found', 404);
  }
  const tenant = await find_tenant_by_id(store.tenant_id);
  if (!tenant || tenant.status === 'suspended') {
    throw new AppError('Store not found', 404);
  }
  return {
    name: store.name,
    slug: store.slug,
    logo_url: store.logo_url,
    banner_url: store.banner_url,
    theme: store.theme,
    delivery_fee: store.delivery_fee,
    free_delivery_above: store.free_delivery_above ?? null,
    max_delivery_radius_km: store.max_delivery_radius_km ?? 5,
    pincode: store.pincode ?? null,
    address: store.address ?? null,
    latitude: store.latitude ?? null,
    longitude: store.longitude ?? null,
    promotion_banner_text: store.promotion_banner_text,
    color_theme: store.color_theme ?? null
  };
}

export async function upload_store_image({ user_id, tenant_id, file, type }) {
  if (!file) {
    throw new AppError('Image file data is required', 400);
  }
  if (!user_id) {
    throw new AppError('User ID is required', 401);
  }
  const cleanType = type === 'banner' ? 'banner' : 'logo';
  return upload_store_asset_to_supabase({ user_id, file, type: cleanType });
}

