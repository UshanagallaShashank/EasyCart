// Checks that theme settings always make sense. No database is used.
import { describe, expect, it } from 'vitest';
import { THEME_IDS, clean_theme_settings } from '../../../src/modules/themes/theme-catalog.js';

describe('clean_theme_settings', () => {
  it('switches every theme on, with sky as default, when nothing is saved', () => {
    expect(clean_theme_settings(null)).toEqual({ enabled: THEME_IDS, default: 'sky' });
  });

  it('keeps a valid choice as it is', () => {
    expect(clean_theme_settings({ enabled: ['emerald', 'sunset'], default: 'sunset' })).toEqual({ enabled: ['emerald', 'sunset'], default: 'sunset' });
  });

  it('drops unknown themes and repeats', () => {
    expect(clean_theme_settings({ enabled: ['emerald', 'neon', 'emerald'], default: 'emerald' })).toEqual({ enabled: ['emerald'], default: 'emerald' });
  });

  it('picks a switched-on default when the saved default is off or unknown', () => {
    expect(clean_theme_settings({ enabled: ['violet', 'rose'], default: 'sky' }).default).toBe('violet');
    expect(clean_theme_settings({ enabled: ['sky', 'rose'], default: 'nope' }).default).toBe('sky');
  });

  it('never ends up with no themes at all', () => {
    expect(clean_theme_settings({ enabled: [], default: 'sky' }).enabled).toEqual(THEME_IDS);
    expect(clean_theme_settings({ enabled: ['nope'] }).enabled).toEqual(THEME_IDS);
  });
});
