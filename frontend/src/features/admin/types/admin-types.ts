// Types mirroring the backend admin wire format exactly.
export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  created_at: string;
  is_published: boolean;
  owner_email: string | null;
  owner_username: string | null;
}
