import type { ClaimState } from '@sagas/contracts';

/**
 * How well supported one claim is.
 *
 * TODO: subtle. A historian should be able to skim a paragraph and see which
 * parts are well backed without the page looking like a dashboard. Colour
 * gradients, margin marks, something revealed on hover. Not badges.
 *
 * Careful with two things:
 *
 * - `affirmations.length` is not corroboration. `independentLineageCount` is.
 *   A claim can have one affirmation and zero independent lines, because the
 *   person agreeing is from the same family as the author. Showing "1
 *   affirmation" next to "single source" without explaining it reads as a bug.
 * - Contested is not wrong. It usually means the claim matters.
 *
 * Conformance case: affirmation-without-independence.
 */
export function ConfidenceIndicator({ claim }: { claim: ClaimState }) {
  return (
    <span>
      TODO: {claim.confidence}, {claim.independentLineageCount} independent line(s)
    </span>
  );
}
