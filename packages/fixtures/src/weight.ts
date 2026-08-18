/**
 * PLACEHOLDER WEIGHT MODEL — NOT THE REAL PROPAGATION ENGINE
 * ==========================================================
 *
 * This exists only so fixture claims have an ordering and a confidence label
 * for the experience layer to render. It is arithmetic, not research.
 *
 * Designing the real weight propagation algorithm is UofI's semester-1
 * deliverable. Do not treat anything in this file as a specification, a
 * baseline to beat, or an opinion about how confidence should work. It will be
 * deleted.
 *
 * The one property worth preserving is that affirmations are counted by
 * distinct family line rather than by headcount, so three cousins do not
 * outweigh three unrelated households. That is a constraint on the problem,
 * not a proposed solution to it.
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
