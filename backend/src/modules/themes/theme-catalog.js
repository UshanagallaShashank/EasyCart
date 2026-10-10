// The colour themes a shop can use in the app. The app draws each one; the server only needs their names.
// Pure, so it is easy to test.
export const THEME_IDS = ['sky', 'emerald', 'sunset', 'violet', 'rose', 'teal'];
export const DEFAULT_THEME = 'sky';

// Makes sure saved settings always make sense: only known themes, at least one switched on,
// and a default that is one of the switched-on themes.
export function clean_theme_settings(value) {
  const asked = Array.isArray(value?.enabled) ? value.enabled.filter((id) => THEME_IDS.includes(id)) : [];
  const enabled = asked.length > 0 ? [...new Set(asked)] : [...THEME_IDS];
  let default_theme = DEFAULT_THEME;
  if (enabled.includes(value?.default)) default_theme = value.default;
  else if (!enabled.includes(DEFAULT_THEME)) default_theme = enabled[0];
  return { enabled, default: default_theme };
}
