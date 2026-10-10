import { Router } from 'express';
import { authenticate } from '../../platform/shared/authenticate.js';
import { resolve_tenant } from '../../platform/shared/resolve-tenant.js';
import { require_role } from '../../platform/shared/require-role.js';
import { THEME_IDS } from './theme-catalog.js';
import { get_theme_settings, set_store_color_theme, update_theme_settings } from './theme-service.js';

export const theme_router = Router();

function handler(work) {
  return async (req, res, next) => {
    try {
      res.status(200).json(await work(req));
    } catch (err) {
      next(err);
    }
  };
}

// Public: every theme there is, which ones are switched on, and the platform default.
theme_router.get('/themes', handler(async () => ({ catalog: THEME_IDS, ...(await get_theme_settings()) })));
theme_router.put('/admin/themes', authenticate, require_role('platform_admin'), handler(async (req) => update_theme_settings(req.body)));
theme_router.put('/stores/me/color-theme', authenticate, resolve_tenant, require_role('tenant_owner'), handler(async (req) => set_store_color_theme(req.tenant_id, req.body)));
