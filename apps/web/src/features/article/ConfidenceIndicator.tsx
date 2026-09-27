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
 * everyone who agreed is from the same family as the person who said it. The
 * model counts by family line for exactly this reason: three cousins are one
 * source.
 *
 * So this never shows an affirmation count on its own. Showing "5 agree" next
 * to "single source" reads as a bug to anyone who thinks about evidence, and
 * showing "5 agree" without the qualifier is worse, because it is a lie that
 * looks like data.
 *
 * `cl-boarding` at t1 is the case: one affirmation, zero independent lines,
 * still single_source. Open `pnpm inspect --state t1 cl-boarding` and look.
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
export function supportSummary(independentLineageCount: number, affirmationCount: number): string {
  if (independentLineageCount === 0 && affirmationCount === 0) {
    return 'No one else has spoken to this yet';
  }
  if (independentLineageCount === 0) {
    // The dangerous case. People agreed, and none of them are independent.
    return affirmationCount === 1
      ? '1 person agrees, from the same family as the author'
      : `${affirmationCount} people agree, all from the author's family`;
  }
  const families = independentLineageCount === 1 ? '1 other family' : `${independentLineageCount} other families`;
  return `Backed by ${families}`;
}

export function ConfidenceIndicator({ claim }: { claim: ClaimState }) {
  if (claim.claim.awaitingTranslation) {
    return (
      <p className="text-xs text-neutral-600">
        Not yet rendered into English. Nothing can corroborate it until somebody does.
      </p>
    );
  }

  const summary = supportSummary(claim.independentLineageCount, claim.affirmations.length);

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
