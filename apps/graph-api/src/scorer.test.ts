/**
 * Your scorer, checked against the rules.
 *
 * This is the first task, and it is deliberately the same shape as
 * `packages/fixtures/behaviour/placeholder.test.ts`, which does the same thing
 * for the throwaway arithmetic the fixtures ship with.
 *
 *   pnpm --filter @sagas/graph-api test
 *
 * Ten rules run against whatever you put in `ours`. They will fail loudly
 * to begin with, and each failure names the thing it thinks you got wrong.
 * Make them pass, then read your own implementation and work out why it is
 * still not good enough. That gap is the project.
 *
 * The rules are in `packages/fixtures/behaviour/scoring-contract.ts` and they
 * are worth reading before you write a line of this.
 */
import type { Scorer } from '@sagas/fixtures/behaviour';
import { runScoringRules } from '@sagas/fixtures/behaviour';

const ours: Scorer = {
  weight: (_input) => {
    // Replace this. Nothing about the author is available to you here, on
    // purpose. See "Why the author is missing from `ScoringInput`" in the
    // start guide.
    throw new Error('not implemented');
  },

  confidence: (_input) => {
    throw new Error('not implemented');
  },
};

runScoringRules('graph-api', ours);
