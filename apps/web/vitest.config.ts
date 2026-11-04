import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Tests live next to what they test. Adding a test file anywhere under src/ is
// enough. There is no list to remember to update.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  esbuild: { jsx: 'automatic' },
  test: { include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] },
});
