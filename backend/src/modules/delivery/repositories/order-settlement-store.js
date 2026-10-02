// In-memory & DB-backed store for order-level delivery payment settlements.
// Tracks whether a delivery partner has remitted cash to the store and received ride fees.
import { find_all_settlements } from './settlement-repository.js';

/**
 * @typedef {Object} OrderSettlementRecord
 * @property {string} order_id
 * @property {string} [tenant_id]
 * @property {string} [rider_id]
 * @property {boolean} is_settled
 * @property {string} settled_at
 * @property {string} [settled_by] - 'store_owner' | 'rider' | 'platform_admin'
 * @property {'cash' | 'upi' | string} [method]
 * @property {string} [note]
 * @property {number} [cash_collected]
 * @property {number} [store_amount]
 * @property {number} [rider_earning]
 */

/** @type {Map<string, OrderSettlementRecord>} */
const settlement_cache = new Map();
let initialized = false;

// Extracts [order:xxx|tenant:yyy|mode:zzz] tags from settlement notes
export function parse_settlement_note(note) {
  if (!note || typeof note !== 'string') return null;
  const match = note.match(/\[order:([a-zA-Z0-9_-]+)(?:\|tenant:([a-zA-Z0-9_-]+))?(?:\|mode:([a-zA-Z0-9_-]+))?\]/);
  if (!match) return null;
  return {
    order_id: match[1],
    tenant_id: match[2] || null,
    method: match[3] || 'cash'
  };
}

async function ensure_initialized() {
  if (initialized) return;
  try {
    const all = await find_all_settlements();
    for (const row of all) {
      const parsed = parse_settlement_note(row.note);
      if (parsed) {
        const existing = settlement_cache.get(parsed.order_id);
        settlement_cache.set(parsed.order_id, {
          order_id: parsed.order_id,
          tenant_id: parsed.tenant_id || existing?.tenant_id || null,
          rider_id: row.rider_id || existing?.rider_id || null,
          is_settled: true,
          settled_at: row.created_at,
          settled_by: existing?.settled_by || (row.note.includes('rider') ? 'rider' : 'store_owner'),
          method: parsed.method || existing?.method || 'cash',
          note: row.note
        });
      }
    }
  } catch (err) {
    // Non-fatal if DB is temporarily unreachable during unit tests
    console.warn('Could not pre-populate settlement cache from DB:', err.message);
  } finally {
    initialized = true;
  }
}

export async function get_order_settlement(order_id) {
  await ensure_initialized();
  let existing = settlement_cache.get(order_id);
  if (existing) return existing;
  try {
    const all = await find_all_settlements();
    for (const row of all) {
      const parsed = parse_settlement_note(row.note);
      if (parsed && parsed.order_id === order_id) {
        existing = {
          order_id: parsed.order_id,
          tenant_id: parsed.tenant_id || null,
          rider_id: row.rider_id || null,
          is_settled: true,
          settled_at: row.created_at,
          settled_by: row.note.includes('rider') ? 'rider' : 'store_owner',
          method: parsed.method || 'cash',
          note: row.note
        };
        settlement_cache.set(order_id, existing);
        return existing;
      }
    }
  } catch {
    // Non-fatal
  }
  return null;
}

export async function set_order_settlement(order_id, record) {
  await ensure_initialized();
  settlement_cache.set(order_id, {
    order_id,
    is_settled: true,
    settled_at: record.settled_at || new Date().toISOString(),
    ...record
  });
  return settlement_cache.get(order_id);
}

export async function get_settlements_for_tenant(tenant_id) {
  await ensure_initialized();
  const list = [];
  for (const item of settlement_cache.values()) {
    if (item.tenant_id === tenant_id) {
      list.push(item);
    }
  }
  return list;
}

export async function get_settlements_for_rider(rider_id) {
  await ensure_initialized();
  const list = [];
  for (const item of settlement_cache.values()) {
    if (item.rider_id === rider_id) {
      list.push(item);
    }
  }
  return list;
}

// Reset helper for tests
export function _clear_settlement_cache() {
  settlement_cache.clear();
  initialized = true;
}
