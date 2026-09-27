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
 * One thing in here is worth keeping: agreement is counted by family line, not
 * by number of people. Three cousins backing each other up is one source, not
 * three. That's a rule about the problem, not a proposed answer to it.
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
  /** Distinct family lines among affirmers. Contributors with no lineage each count as their own. */
  independentLineageCount: number;
  /** Raw affirmation headcount, used only for a small diminishing bonus. */
  affirmationCount: number;
  extensionCount: number;
  /** Disputes against any element of this claim. */
  disputeCount: number;
  /** Distinct source types across this claim and its extensions. */
  sourceTypeDiversity: number;
  awaitingTranslation: boolean;
}

export function computeWeight(i: WeightInputs): number {
  if (i.awaitingTranslation) return 0; // outside the graph until rendered

  const base = SOURCE_BASE[i.sourceType];
  const independence = i.independentLineageCount * 2;
  const volume = Math.min(i.affirmationCount, 6) * 0.25; // deliberately weak
  const enrichment = Math.min(i.extensionCount, 4) * 0.75;
  const diversity = Math.max(0, i.sourceTypeDiversity - 1) * 1.5;
  const contest = i.disputeCount * 1.25;

  return Math.max(0, base + independence + volume + enrichment + diversity - contest);
}

export type Confidence = 'single_source' | 'corroborated' | 'well_corroborated' | 'contested';

export function classifyConfidence(i: {
  independentLineageCount: number;
  disputeCount: number;
  awaitingTranslation: boolean;
}): Confidence {
  if (i.disputeCount > 0) return 'contested';
  if (i.independentLineageCount >= 3) return 'well_corroborated';
  if (i.independentLineageCount >= 1) return 'corroborated';
  return 'single_source';
}
