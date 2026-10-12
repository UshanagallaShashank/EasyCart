// The shop's colour theme for the screens inside it. The platform admin decides which themes owners may pick;
// a shop whose theme was switched off falls back to the platform default.
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import { BRANDS, ROLE_LOOKS, isThemeId, type Brand, type RoleLookId, type ThemeId } from '@/theme/brands';

export interface ThemeSettings {
  catalog: ThemeId[];
  enabled: ThemeId[];
  default: ThemeId;
}

export function useThemeSettings() {
  return useQuery({ queryKey: ['themes'], queryFn: () => api<ThemeSettings>('/themes'), staleTime: 10 * 60_000, refetchInterval: false });
}

const BrandContext = createContext<Brand>(BRANDS.sky);

export function BrandProvider({ themeId, children }: { themeId: string | null | undefined; children: ReactNode }) {
  const { data: settings } = useThemeSettings();
  const brand = useMemo(() => {
    const allowed = settings?.enabled ?? [];
    if (isThemeId(themeId) && (allowed.length === 0 || allowed.includes(themeId))) return BRANDS[themeId];
    if (settings && isThemeId(settings.default)) return BRANDS[settings.default];
    return BRANDS.sky;
  }, [themeId, settings]);
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

// Rider and admin screens are not inside a shop, so they wear their area's own fixed look.
export function RoleLookProvider({ look, children }: { look: RoleLookId; children: ReactNode }) {
  return <BrandContext.Provider value={ROLE_LOOKS[look]}>{children}</BrandContext.Provider>;
}

export function useBrand(): Brand {
  return useContext(BrandContext);
}
