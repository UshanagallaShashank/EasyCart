import { decide_refund, list_all_refunds, list_my_refunds, list_order_refunds, list_store_refunds, refund_cancelled_order, request_refund } from './refund-service.js';

// Every handler is the same shape: run the service and send back what it returns.
function handler(work, status = 200) {
  return async (req, res, next) => {
    try {
      res.status(status).json(await work(req));
    } catch (err) {
      next(err);
    }
  };
}

export const handle_request_refund = handler(async (req) => ({ refund: await request_refund(req.user.id, req.params.id, req.body) }), 201);
export const handle_order_refunds = handler(async (req) => ({ refunds: await list_order_refunds(req.user.id, req.params.id) }));
export const handle_my_refunds = handler(async (req) => ({ refunds: await list_my_refunds(req.user.id) }));
export const handle_store_refunds = handler(async (req) => ({ refunds: await list_store_refunds(req.tenant_id) }));
export const handle_decide_refund = handler(async (req) => ({ refund: await decide_refund(req.tenant_id, req.user.id, req.params.id, req.body) }));
export const handle_refund_cancelled_order = handler(async (req) => ({ refund: await refund_cancelled_order(req.tenant_id, req.user.id, req.params.id, req.body) }));
export const handle_admin_refunds = handler(async () => ({ refunds: await list_all_refunds() }));
