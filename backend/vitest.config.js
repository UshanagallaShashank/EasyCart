// Raises the default test timeout since tests hit a real database over the network.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 15000
  }
});
