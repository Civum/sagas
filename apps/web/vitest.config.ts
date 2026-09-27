import { defineConfig } from 'vitest/config';

// Tests live next to what they test. Adding a test file anywhere under src/ is
// enough. There is no list to remember to update.
export default defineConfig({
  test: { include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] },
});
