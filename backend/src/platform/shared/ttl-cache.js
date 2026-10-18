// Tiny in-memory cache: keeps a loader's result for a while and shares one in-flight load between callers.
export function create_ttl_cache(load, ttl_ms) {
  let value = null;
  let loaded_at = 0;
  let pending = null;

  function get_cached() {
    if (value !== null && Date.now() - loaded_at < ttl_ms) return Promise.resolve(value);
    pending ??= load().then((result) => {
      value = result;
      loaded_at = Date.now();
      return result;
    }).finally(() => { pending = null; });
    return pending;
  }

  function clear_cached() {
    value = null;
    loaded_at = 0;
  }

  return { get: get_cached, clear: clear_cached };
}
