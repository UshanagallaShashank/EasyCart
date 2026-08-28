// Types mirroring the backend store wire format exactly.
export interface Store {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  theme: 'default' | 'light' | 'dark';
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreSettingsPayload {
  name?: string;
  logo_url?: string;
  banner_url?: string;
  theme?: 'default' | 'light' | 'dark';
}
