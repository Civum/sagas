import type { ClaimState } from '@sagas/contracts';

/**
 * Where people disagree about part of a claim.
 *
 * TODO: show every reading with its support. "Two family lines say 1914, one
 * says 1922." Both readings stay visible with the reasoning attached, and
 * neither is marked as the answer.
 *
 * Two things to get right:
 *
 * - Only the contested element is contested. If the date is disputed and the
 *   address isn't, the address must still read as solid. Marking the whole
 *   claim as contested throws away the thing that makes this useful.
 * - `count` is distinct family lines, not people. Label it that way or a reader
 *   will assume it's a vote tally.
 *
 * Acceptance criterions: one-element-disputed-others-not,
 * competing-readings-ordered-by-independence.
 */
export function ElementDisputes({ claim }: { claim: ClaimState }) {
  const contested = claim.elementStatuses.filter((e) => e.disputes.length > 0);
  if (contested.length === 0) return null;

  return <div>TODO: {contested.length} contested element(s), readings with their support</div>;
}
