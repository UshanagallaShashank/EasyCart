// Gathers everything a platform admin sees about one store: tenant, storefront, owner, and activity.
import { AppError } from '../../../platform/shared/app-error.js';
import { find_tenant_by_id } from '../../tenants/repositories/tenant-repository.js';
import { find_store_by_tenant_id } from '../../stores/repositories/store-repository.js';
import { find_user_by_id } from '../../users/repositories/user-repository.js';
import { find_products_by_tenant } from '../../products/repositories/product-repository.js';
import { find_orders_by_tenant } from '../../orders/repositories/order-query-repository.js';
import { summarize_tenant_activity } from './summarize-tenant-activity.js';
import { create_signed_document_url, read_request_details } from '../../stores/services/store-request-document-service.js';

export async function get_tenant_detail(tenant_id) {
  const tenant = await find_tenant_by_id(tenant_id);
  if (!tenant) throw new AppError('Tenant not found', 404);

  const [store, owner, products, orders, request_details] = await Promise.all([
    find_store_by_tenant_id(tenant.id),
    find_user_by_id(tenant.owner_id),
    find_products_by_tenant(tenant.id),
    find_orders_by_tenant(tenant.id),
    tenant.owner_id ? read_request_details(tenant.owner_id) : Promise.resolve(null)
  ]);

  const [id_proof_url, business_proof_url] = request_details
    ? await Promise.all([
        create_signed_document_url(request_details.id_proof_path),
        create_signed_document_url(request_details.business_proof_path)
      ])
    : [null, null];

  const documents = [];
  if (id_proof_url && request_details?.id_proof_path) {
    const fileName = request_details.id_proof_path.split('/').pop() || 'id-proof';
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    documents.push({
      id: 'id-proof',
      title: 'ID Proof',
      file_name: fileName,
      url: id_proof_url,
      path: request_details.id_proof_path,
      type: isPdf ? 'pdf' : 'image'
    });
  }

  if (business_proof_url && request_details?.business_proof_path) {
    const fileName = request_details.business_proof_path.split('/').pop() || 'business-proof';
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    documents.push({
      id: 'business-proof',
      title: 'Business Proof',
      file_name: fileName,
      url: business_proof_url,
      path: request_details.business_proof_path,
      type: isPdf ? 'pdf' : 'image'
    });
  }

  const verification = (request_details || documents.length > 0)
    ? {
        business_address: request_details?.business_address ?? null,
        id_proof_url,
        business_proof_url,
        documents
      }
    : null;

  return {
    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, status: tenant.status, created_at: tenant.created_at },
    store: store ? { name: store.name, logo_url: store.logo_url ?? null, banner_url: store.banner_url ?? null, is_published: Boolean(store.is_published), delivery_fee: store.delivery_fee ?? 0, promotion_banner_text: store.promotion_banner_text ?? null } : null,
    owner: owner ? { username: owner.username, email: owner.email, phone_number: owner.phone_number } : null,
    business_address: request_details?.business_address ?? null,
    id_proof_url,
    business_proof_url,
    documents,
    verification,
    activity: summarize_tenant_activity(products ?? [], orders ?? [])
  };
}
