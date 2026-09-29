import type { ClaimState } from '@sagas/contracts';

/**
 * Where people disagree about part of a claim.
 *
 * TODO: show every reading with its support. "Two people say 1914, one says
 * 1922, each with their reasoning." Both readings stay visible with their
 * reasoning attached, and neither is marked as the answer.
 *
 * Two things to get right:
 *
 * - Only the contested detail is contested. If the date is disputed and the
 *   address isn't, the address must still read as solid. Marking the whole
 *   claim as contested throws away the thing that makes this useful.
 * - `count` is how many contributors gave a reading. It is not a vote. Lead
 *   with the reasoning, and if the number shows at all, it must not read as a
 *   tally.
 *
 * Acceptance criteria: one-detail-disputed-others-not,
 * competing-readings-shown-together.
 */
export function DetailDisputes({ claim }: { claim: ClaimState }) {
  const contested = claim.detailStatuses.filter((e) => e.disputes.length > 0);
  if (contested.length === 0) return null;

  return <div>TODO: {contested.length} contested detail(s), readings with their support</div>;
}
