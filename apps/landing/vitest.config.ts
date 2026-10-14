import { defineConfig } from 'vitest/config';

// Tests live next to what they test, as in apps/web.
export default defineConfig({
  test: { include: ['src/**/*.test.ts'], testTimeout: 30_000 },
});
