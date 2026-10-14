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

  return (
    <aside className="space-y-3 rounded border border-amber-200 bg-amber-50/50 p-3" aria-label="Disputed details">
      {contested.map(({ detail, disputes, competingValues }) => (
        <section key={detail.id} className="space-y-2">
          <h3 className="text-sm font-semibold">Different readings of {detail.kind}</h3>
          <p className="text-sm">The claim says “{detail.excerpt}”. Other readings and reasons remain attached:</p>
          <ul className="space-y-2 text-sm">
            {competingValues.map((reading) => (
              <li key={reading.value} className="border-l-2 border-amber-300 pl-3">
                <p className="font-medium">{reading.value}</p>
                <p className="text-neutral-600">Given by {reading.contributorIds.join(', ')}</p>
              </li>
            ))}
          </ul>
          <ul className="space-y-2 text-sm">
            {disputes.map((dispute) => (
              <li key={dispute.id} className="border-l-2 border-neutral-300 pl-3">
                <p>{dispute.reasoning}</p>
                {dispute.proposedValue && <p className="text-neutral-600">Proposed reading: {dispute.proposedValue}</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}
