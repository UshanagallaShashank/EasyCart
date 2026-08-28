// Business logic for reading tenant information.
import { AppError } from '../../../platform/shared/app-error.js';
import { find_tenant_by_owner_id } from '../repositories/tenant-repository.js';

export async function get_tenant_by_owner(owner_id) {
  const tenant = await find_tenant_by_owner_id(owner_id);
  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }
  return tenant;
}
