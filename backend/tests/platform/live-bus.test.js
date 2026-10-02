import { describe, it, expect } from 'vitest';
import { subscribe, publish, publish_order_change, channel } from '../../src/platform/live/live-bus.js';

function fake_stream() {
  const lines = [];
  return { lines, write: (line) => lines.push(line) };
}

describe('live bus', () => {
  it('sends a message once to each tab listening on any of the channels', () => {
    const store_tab = fake_stream();
    const admin_tab = fake_stream();
    const stop_store = subscribe([channel.tenant('t1')], store_tab);
    const stop_admin = subscribe([channel.admins, channel.tenant('t1')], admin_tab);

    publish_order_change({ id: 'o1', tenant_id: 't1', customer_id: 'c1', rider_id: null });
    expect(store_tab.lines).toHaveLength(1);
    expect(admin_tab.lines).toHaveLength(1);
    expect(JSON.parse(store_tab.lines[0].slice(6))).toMatchObject({ topic: 'order', id: 'o1' });

    stop_store();
    stop_admin();
    publish([channel.tenant('t1')], 'order', 'o2');
    expect(store_tab.lines).toHaveLength(1);
  });

  it('does not reach other stores', () => {
    const other = fake_stream();
    const stop = subscribe([channel.tenant('t2')], other);
    publish_order_change({ id: 'o1', tenant_id: 't1', customer_id: 'c1' });
    expect(other.lines).toHaveLength(0);
    stop();
  });

  it('tells the rider an order was taken from', () => {
    const old_rider = fake_stream();
    const stop = subscribe([channel.rider('r1')], old_rider);
    publish_order_change({ id: 'o1', tenant_id: 't1', customer_id: 'c1', rider_id: 'r2' }, 'r1');
    expect(old_rider.lines).toHaveLength(1);
    stop();
  });
});
