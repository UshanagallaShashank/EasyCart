// Thin request handlers for every delivery endpoint: each one calls a service and sends back its result.
import * as application from '../services/rider-application-service.js';
import * as status from '../services/rider-status-service.js';
import * as rider_delivery from '../services/rider-delivery-service.js';
import * as handover from '../services/handover-service.js';
import * as admin from '../services/admin-rider-service.js';

// Wraps a service call so errors reach the shared error handler.
function respond(run, status_code = 200) {
  return async (req, res, next) => {
    try {
      res.status(status_code).json(await run(req));
    } catch (err) {
      next(err);
    }
  };
}

// Rider account and application
export const handle_rider_register = respond(async (req) => ({ message: 'Delivery partner account created', ...(await application.register_rider(req.body)) }), 201);
export const handle_get_my_rider = respond(async (req) => ({ rider: await application.get_my_rider(req.user.id) }));
export const handle_update_my_profile = respond(async (req) => ({ rider: await application.update_my_profile(req.user.id, req.body) }));
export const handle_set_my_base_location = respond(async (req) => ({ rider: await application.set_my_base_location(req.user.id, req.body) }));
export const handle_upload_my_document = respond(async (req) => ({ rider: await application.upload_my_document(req.user.id, req.body) }));
export const handle_remove_my_other_document = respond(async (req) => ({ rider: await application.remove_my_other_document(req.user.id, Number(req.params.index)) }));
export const handle_submit_my_application = respond(async (req) => ({ rider: await application.submit_my_application(req.user.id) }));

// Rider on the road
export const handle_set_my_online = respond(async (req) => ({ rider: await status.set_my_online(req.user.id, req.body) }));
export const handle_update_my_location = respond(async (req) => status.update_my_location(req.user.id, req.body));
export const handle_get_rider_home = respond(async (req) => rider_delivery.get_rider_home(req.user.id));
export const handle_get_rider_order = respond(async (req) => ({ order: await rider_delivery.get_rider_order(req.user.id, req.params.id) }));
export const handle_list_rider_history = respond(async (req) => ({ orders: await rider_delivery.list_rider_history(req.user.id) }));
export const handle_get_rider_earnings = respond(async (req) => rider_delivery.get_rider_earnings(req.user.id));
export const handle_accept_offer = respond(async (req) => ({ order: await rider_delivery.accept_offer(req.user.id, req.params.id) }));
export const handle_decline_offer = respond(async (req) => rider_delivery.decline_offer(req.user.id, req.params.id));
export const handle_confirm_pickup = respond(async (req) => ({ order: await rider_delivery.confirm_pickup(req.user.id, req.params.id, req.body) }));
export const handle_complete_delivery = respond(async (req) => ({ order: await rider_delivery.complete_delivery(req.user.id, req.params.id, req.body) }));

// Store owner
export const handle_get_store_order_delivery = respond(async (req) => ({ delivery: await handover.get_store_order_delivery(req.tenant_id, req.params.id) }));
export const handle_request_rider = respond(async (req) => ({ delivery: await handover.request_rider(req.tenant_id, req.params.id) }));
export const handle_cancel_rider_request = respond(async (req) => ({ delivery: await handover.cancel_rider_request(req.tenant_id, req.params.id) }));
export const handle_reissue_pickup_code = respond(async (req) => ({ delivery: await handover.reissue_pickup_code(req.tenant_id, req.params.id) }));
export const handle_reissue_delivery_code = respond(async (req) => ({ delivery: await handover.reissue_delivery_code(req.tenant_id, req.params.id) }));
export const handle_list_riders_near_store = respond(async (req) => handover.list_riders_near_store(req.tenant_id));
export const handle_list_store_deliveries = respond(async (req) => ({ deliveries: await handover.list_store_deliveries(req.tenant_id) }));

// Customer
export const handle_get_customer_order_delivery = respond(async (req) => ({ delivery: await handover.get_customer_order_delivery(req.user.id, req.params.id) }));

// Platform admin
export const handle_admin_list_riders = respond(async (req) => admin.list_riders_for_admin({ near_tenant_id: req.query.near || undefined }));
export const handle_admin_get_rider = respond(async (req) => admin.get_rider_for_admin(req.params.id));
export const handle_admin_approve_rider = respond(async (req) => admin.approve_rider(req.params.id, req.body));
export const handle_admin_reject_rider = respond(async (req) => admin.reject_rider(req.params.id, req.body));
export const handle_admin_suspend_rider = respond(async (req) => admin.suspend_rider(req.params.id, req.body));
export const handle_admin_reactivate_rider = respond(async (req) => admin.reactivate_rider(req.params.id));
export const handle_admin_record_settlement = respond(async (req) => admin.record_settlement(req.params.id, req.user.id, req.body));
export const handle_admin_list_deliveries = respond(async () => ({ deliveries: await admin.list_deliveries_for_admin() }));
