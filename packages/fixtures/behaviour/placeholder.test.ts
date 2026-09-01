/**
 * Runs the scoring rules against the placeholder in `src/weight.ts`.
 *
 * The placeholder is throwaway arithmetic and it still has to obey the rules,
 * which is the point: the rules are about the problem, not about any particular
 * answer to it. When the intelligence layer replaces the scorer, it runs this
 * same suite against the replacement and the rules do not move.
 */

import { classifyConfidence, computeWeight } from '../src/weight';
import type { Scorer } from './scoring-contract';
import { runScoringRules } from './scoring-contract';

const placeholder: Scorer = {
  weight: computeWeight,
  confidence: classifyConfidence,
};

runScoringRules('fixture placeholder', placeholder);
