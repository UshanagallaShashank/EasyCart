// Raises the default test timeout since tests hit a real database over the network.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 15000,
    // The tests set up store owners through the direct sign-up, which is closed everywhere else.
    env: { ALLOW_DIRECT_STORE_SIGNUP: 'true' }
  }
});
