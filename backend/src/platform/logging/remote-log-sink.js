// Collects log entries and sends them in batches to an outside log service (any service that takes a JSON array with a
// Bearer token, such as Better Stack's free plan). Pure: the address, token and network are handed in, so it is easy to test.
const MAX_BATCH = 50;
const MAX_WAITING = 1000;

export function create_log_sink({ url, token, http = fetch, flush_ms = 5000 }) {
  const enabled = Boolean(url && token);
  let waiting = [];
  let timer = null;

  async function flush() {
    if (timer) clearTimeout(timer);
    timer = null;
    if (waiting.length === 0) return;
    const batch = waiting;
    waiting = [];
    try {
      await http(url, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(batch) });
    } catch {
      // The log service being away must never break the server; these entries are simply dropped.
    }
  }

  function add(entry) {
    if (!enabled) return;
    waiting.push(entry);
    if (waiting.length > MAX_WAITING) waiting = waiting.slice(-MAX_WAITING);
    if (waiting.length >= MAX_BATCH) void flush();
    else if (!timer) timer = setTimeout(() => void flush(), flush_ms);
    timer?.unref?.();
  }

  return { enabled, add, flush, waiting_count: () => waiting.length };
}
