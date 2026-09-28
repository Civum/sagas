/**
 * How well supported one claim is.
 *
 * ---
 *
 * WORKED EXAMPLE, like IntegrityBadge. Structure is the lesson, styling is a
 * placeholder to replace.
 *
 * ---
 *
 * THE IDEA THIS COMPONENT EXISTS TO PROTECT
 *
 * An affirmation is not corroboration.
 *
 * A claim can have five affirmations and zero independent support, because
 * agreeing is not bringing anything. Support comes from somebody else putting a
 * record of their own behind the claim. Five people saying "sounds right" is
 * five reactions to one source.
 *
 * So this never shows an affirmation count on its own. Showing "5 agree" next
 * to "single source" reads as a bug to anyone who thinks about evidence, and
 * showing "5 agree" without the qualifier is worse, because it is a lie that
 * looks like data.
 *
 * `cl-afterhours` at t3 is the case: two affirmations, zero independent
 * sources, still single_source. Open `pnpm inspect --state t3 cl-afterhours`
 * and look.
 *
 * Acceptance case: affirmation-without-independence.
 *
 * A NOTE ON "CONTESTED"
 *
 * Contested is not wrong. It usually means the claim matters enough that
 * somebody bothered to argue. Nothing here should make it look like a failure,
 * which is why there is no red.
 *
 * TODO for whoever takes this further: the version a historian actually wants is
 * subtler than a label. Something you can skim a paragraph and see, without the
 * page looking like a dashboard. Margin marks, a weight in the type, something
 * on hover. This is the honest version, not the finished one.
 */

import type { ClaimState } from '@sagas/contracts';

const LABELS: Record<ClaimState['confidence'], string> = {
  single_source: 'One source',
  corroborated: 'Corroborated',
  well_corroborated: 'Well corroborated',
  contested: 'Contested',
};

/**
 * How support should be described, given the two numbers that matter.
 *
 * Pure, and separated from the markup so the rule can be tested without
 * rendering. The rule is the whole point of the component.
 */
export function supportSummary(independentRecordCount: number, affirmationCount: number): string {
  if (independentRecordCount === 0 && affirmationCount === 0) {
    return 'No one else has spoken to this yet';
  }
  if (independentRecordCount === 0) {
    // The dangerous case. People agreed, and nobody brought anything.
    return affirmationCount === 1
      ? '1 person agrees, with no independent record yet'
      : `${affirmationCount} people agree, with no independent record yet`;
  }
  const records = independentRecordCount === 1 ? '1 other record' : `${independentRecordCount} other records`;
  return `Backed by ${records}`;
}

export function ConfidenceIndicator({ claim }: { claim: ClaimState }) {
  if (claim.claim.awaitingTranslation) {
    return (
      <p className="text-xs text-neutral-600">
        Not yet rendered into English. Nothing can corroborate it until somebody does.
      </p>
    );
  }

  const summary = supportSummary(claim.independentRecordCount, claim.affirmations.length);

  return (
    <p className="flex flex-wrap items-baseline gap-x-2 text-xs">
      <span className="font-medium text-neutral-800">{LABELS[claim.confidence]}</span>
      <span className="text-neutral-400" aria-hidden="true">
        ·
      </span>
      <span className="text-neutral-600">{summary}</span>
    </p>
  );
}
