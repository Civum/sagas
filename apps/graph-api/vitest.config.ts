import { defineConfig } from 'vitest/config';

// Any file ending .test.ts under src/ runs. If you put tests somewhere else,
// add that folder here, because a folder of tests nobody added is a folder of
// tests that silently never runs while the checks stay green. That has happened
// in this repository before.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
