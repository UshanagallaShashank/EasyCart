// Unit tests for the small shared cache used by admin endpoints.
import { describe, it, expect, vi } from 'vitest';
import { create_ttl_cache } from '../../../src/platform/shared/ttl-cache.js';

describe('create_ttl_cache', () => {
  it('shares one in-flight load between concurrent callers', async () => {
    const load = vi.fn(async () => 42);
    const cache = create_ttl_cache(load, 1000);
    expect(await Promise.all([cache.get(), cache.get(), cache.get()])).toEqual([42, 42, 42]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('reloads after clear and after the time limit', async () => {
    vi.useFakeTimers();
    const load = vi.fn(async () => 'x');
    const cache = create_ttl_cache(load, 1000);
    await cache.get();
    cache.clear();
    await cache.get();
    vi.advanceTimersByTime(1001);
    await cache.get();
    expect(load).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it('does not keep a failed load', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce('ok');
    const cache = create_ttl_cache(load, 1000);
    await expect(cache.get()).rejects.toThrow('down');
    expect(await cache.get()).toBe('ok');
  });
});
