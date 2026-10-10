import { describe, it, expect } from 'vitest';
import { chunk_array } from '../../../src/platform/shared/chunk-array.js';

describe('chunk_array', () => {
  it('splits an array into chunks of the given size', () => {
    const result = chunk_array([1, 2, 3, 4, 5], 2);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns a single chunk when the array is smaller than the chunk size', () => {
    const result = chunk_array([1, 2], 100);
    expect(result).toEqual([[1, 2]]);
  });

  it('returns an empty array for an empty input', () => {
    expect(chunk_array([], 100)).toEqual([]);
  });

  it('handles an array whose length is an exact multiple of the chunk size', () => {
    const result = chunk_array([1, 2, 3, 4], 2);
    expect(result).toEqual([[1, 2], [3, 4]]);
  });
});
