// Which colour themes owners may pick (chosen by the platform admin), and each store's pick.
import { z } from 'zod';
import { AppError } from '../../platform/shared/app-error.js';
import { update_store_color_theme } from '../stores/repositories/store-repository.js';
import { THEME_IDS, clean_theme_settings } from './theme-catalog.js';
import { read_setting, write_setting } from './settings-repository.js';

const SETTING_KEY = 'themes';

export async function get_theme_settings() {
  return clean_theme_settings(await read_setting(SETTING_KEY));
}

const settings_schema = z.object({
  enabled: z.array(z.enum(THEME_IDS)).min(1, 'Switch on at least one theme'),
  default: z.enum(THEME_IDS)
});

export async function update_theme_settings(payload) {
  const parsed = settings_schema.safeParse(payload);
  if (!parsed.success) throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  if (!parsed.data.enabled.includes(parsed.data.default)) throw new AppError('The default theme must be one of the switched-on themes', 400);
  const settings = clean_theme_settings(parsed.data);
  await write_setting(SETTING_KEY, settings);
  return settings;
}

const pick_schema = z.object({ color_theme: z.enum(THEME_IDS).nullable() });

// An owner picks one of the themes the admin switched on (or null to use the platform default).
export async function set_store_color_theme(tenant_id, payload) {
  const parsed = pick_schema.safeParse(payload);
  if (!parsed.success) throw new AppError('Pick one of the available themes', 400);
  const { color_theme } = parsed.data;
  if (color_theme) {
    const settings = await get_theme_settings();
    if (!settings.enabled.includes(color_theme)) throw new AppError('This theme is not available right now', 400);
  }
  await update_store_color_theme(tenant_id, color_theme);
  return { color_theme };
}
