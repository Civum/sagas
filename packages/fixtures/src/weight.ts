/**
 * A stand-in for scoring claims. This is not the real thing.
 *
 * It exists so claims have some order to display in and something to label
 * them with. It's simple arithmetic, picked to be obviously provisional.
 *
 * Working out how confidence should actually be calculated is a whole
 * deliverable for one of the teams. Don't treat this as a spec, a baseline to
 * beat, or an opinion. It gets deleted.
 *
 * Two things in here are worth keeping, because they are rules about the
 * problem rather than proposed answers to it:
 *
 *   Edges are the strong signals. An extension pushes a claim up, a dispute
 *   pushes it down, and a resolution (not in the contract yet) would push both
 *   branches it reconciles up. So a claim's standing moves in both directions
 *   over time rather than only accumulating.
 *
 *   Passovers are the soft signals. Affirmation (`sounds_right`), `dont_know`
 *   and `dont_care` matter most for what gets suggested to whom. Here an
 *   affirmation adds only a small, capped nudge, and it never counts as
 *   independent support.
 */

export const WEIGHT_MODEL_VERSION = 'fixture-placeholder-v1';

import type { SourceType } from '@sagas/contracts';

const SOURCE_BASE: Record<SourceType, number> = {
  firsthand: 3,
  family_oral: 2,
  community_oral: 2,
  documentary: 3,
  academic: 3,
  institutional: 3,
};

export interface WeightInputs {
  sourceType: SourceType;
  /** Distinct records other contributors brought to back this claim. See `claimState` in the contract. */
  independentRecordCount: number;
  /** Raw affirmation headcount, used only for a small diminishing bonus. */
  affirmationCount: number;
  extensionCount: number;
  /** Disputes against any detail of this claim. */
  disputeCount: number;
  /** Distinct source types across this claim and its extensions. */
  sourceTypeDiversity: number;
  awaitingTranslation: boolean;
}

export function computeWeight(i: WeightInputs): number {
  if (i.awaitingTranslation) return 0; // outside the graph until rendered

  const base = SOURCE_BASE[i.sourceType];
  const independence = i.independentRecordCount * 2;
  const volume = Math.min(i.affirmationCount, 6) * 0.25; // deliberately weak
  const enrichment = Math.min(i.extensionCount, 4) * 0.75;
  const diversity = Math.max(0, i.sourceTypeDiversity - 1) * 1.5;
  const contest = i.disputeCount * 1.25;

  return Math.max(0, base + independence + volume + enrichment + diversity - contest);
}

export type Confidence = 'single_source' | 'corroborated' | 'well_corroborated' | 'contested';

export function classifyConfidence(i: {
  independentRecordCount: number;
  disputeCount: number;
  awaitingTranslation: boolean;
}): Confidence {
  if (i.disputeCount > 0) return 'contested';
  if (i.independentRecordCount >= 3) return 'well_corroborated';
  if (i.independentRecordCount >= 1) return 'corroborated';
  return 'single_source';
}
