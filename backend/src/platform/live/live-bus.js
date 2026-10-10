// Pushes "something changed" messages to open browser tabs over Server-Sent Events.
// Each tab listens on a few channels (its store, its customer account, its rider account, or all admins).
// Messages only name what changed, never the data itself; the page then re-reads it through the normal, permission-checked API.
//
// This bus lives in one server process. When the API runs on several servers, replace `deliver_local`
// with a shared channel (Redis pub/sub or Postgres LISTEN/NOTIFY) that calls it on every server.
const subscribers = new Map(); // channel -> Set of response streams

export function subscribe(channels, res) {
  for (const channel of channels) {
    if (!subscribers.has(channel)) subscribers.set(channel, new Set());
    subscribers.get(channel).add(res);
  }
  return () => {
    for (const channel of channels) {
      const set = subscribers.get(channel);
      set?.delete(res);
      if (set?.size === 0) subscribers.delete(channel);
    }
  };
}

function deliver_local(channels, message) {
  const line = `data: ${JSON.stringify(message)}\n\n`;
  const sent = new Set();
  for (const channel of channels) {
    for (const res of subscribers.get(channel) ?? []) {
      if (sent.has(res)) continue;
      sent.add(res);
      res.write(line);
    }
  }
}

// topic: what kind of thing changed ("order", "rider", "settlement"); id: which one.
// patch (optional): a few harmless facts about the change, so screens can update at once without asking the server again.
export function publish(channels, topic, id, patch = null) {
  const targets = [...new Set(channels.filter(Boolean))];
  if (targets.length === 0) return;
  try {
    const message = { topic, id: id ?? null, at: Date.now() };
    if (patch) message.patch = patch;
    deliver_local(targets, message);
  } catch (err) {
    // A live message is a convenience; never let it break the request that caused it.
    console.warn('Live update failed:', err?.message || err);
  }
}

export const channel = {
  tenant: (id) => (id ? `tenant:${id}` : null),
  customer: (id) => (id ? `customer:${id}` : null),
  rider: (id) => (id ? `rider:${id}` : null),
  admins: 'admins'
};

// The few order facts that every person who can see an order may also see. Never the delivery code, the address or the items.
const PATCH_FIELDS = ['status', 'fulfillment_status', 'payment_status', 'rider_offer_status'];

export function order_patch(order) {
  const patch = {};
  for (const field of PATCH_FIELDS) {
    if (order[field] !== undefined) patch[field] = order[field];
  }
  return patch;
}

// Everyone who can see an order: its store, its customer, its rider (and the rider it just left), and admins.
export function publish_order_change(order, previous_rider_id = null) {
  if (!order) return;
  publish([channel.tenant(order.tenant_id), channel.customer(order.customer_id), channel.rider(order.rider_id), channel.rider(previous_rider_id), channel.admins], 'order', order.id, order_patch(order));
}

export function publish_rider_change(rider) {
  if (!rider) return;
  publish([channel.rider(rider.id), channel.admins], 'rider', rider.id);
}

export function count_subscribers() {
  return [...subscribers.values()].reduce((total, set) => total + set.size, 0);
}
