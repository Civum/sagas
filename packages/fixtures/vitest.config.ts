import { defineConfig } from 'vitest/config';

// Three kinds of test live here and all three have to run.
//
//   test/         invariants over the reducer and the derived states
//   acceptance/   the fixture data really has the shapes it claims to
//   behaviour/    the old count-based scoring rules, being replaced
//   scoring/      the graph the scorer reads, and the builder for its cases
//
// A new folder of tests that nobody added here is a folder of tests that
// silently never runs, and CI will still be green.
export default defineConfig({
  test: {
    include: [
      'test/**/*.test.ts',
      'acceptance/**/*.test.ts',
      'behaviour/**/*.test.ts',
      'scoring/**/*.test.ts',
    ],
  },
});
