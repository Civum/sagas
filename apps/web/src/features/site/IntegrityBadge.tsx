/**
 * How well documented a place is.
 *
 * ---
 *
 * THIS IS THE WORKED EXAMPLE. Most components in here are one line and a TODO.
 * This one is finished, so that "how do I start" has an answer you can read
 * instead of a paragraph you have to interpret.
 *
 * What to copy: the shape. A pure function holding the judgment, separated from
 * the markup so it can be tested without rendering anything. Props in, no data
 * fetching. An explicit decision about what the hardest case should look like.
 *
 * What NOT to copy: the styling. Grey boxes and system fonts are a placeholder.
 * The design system is your deliverable and nothing here is a suggestion about
 * what it should be. Replace all of it.
 *
 * ---
 *
 * THE HARD PART, WHICH IS THE LOW END
 *
 * A place with three claims and no corroboration scores about 23 out of 100.
 * That is not a broken site. It is a real place with a thin record, and it is
 * the state most places will be in for a long time.
 *
 * So there is no red, and no empty progress bar sitting next to a full one.
 * A colour scale from red to green would tell a contributor that the thing
 * their family just added is failing, when what it actually is, is early.
 *
 * Acceptance case: sparse-site-is-not-empty-site.
 *
 * Docs worth having open:
 *   Tailwind utilities      https://tailwindcss.com/docs/utility-first
 *   Accessible names        https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/
 *   Contrast (WCAG 2.1 AA)  https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
 */

import type { IntegrityScore } from '@sagas/contracts';

export interface IntegrityBand {
  /** What to call it. Never a grade, never a pass or fail. */
  label: string;
  /** One line saying what would thicken the record. */
  invitation: string;
  /** 0-1, for how much of the meter is filled. */
  fill: number;
}

/**
 * The judgment, as a pure function.
 *
 * It is separate from the component on purpose. This is the part with an
 * opinion in it, so it is the part worth testing, and testing it does not
 * require rendering anything. See `IntegrityBadge.test.ts`.
 */
export function bandFor(overall: number): IntegrityBand {
  const fill = Math.max(0, Math.min(100, overall)) / 100;

  if (overall < 35) {
    return {
      label: 'Thin record',
      invitation: 'A few accounts, mostly from one family. More would help.',
      fill,
    };
  }
  if (overall < 65) {
    return {
      label: 'Growing record',
      invitation: 'Several families have contributed. Gaps remain.',
      fill,
    };
  }
  if (overall < 85) {
    return {
      label: 'Well documented',
      invitation: 'Corroborated across families and source types.',
      fill,
    };
  }
  return {
    label: 'Richly documented',
    invitation: 'Deep, corroborated, and argued over.',
    fill,
  };
}

export function IntegrityBadge({ integrity }: { integrity: IntegrityScore }) {
  const band = bandFor(integrity.overall);

  return (
    <div className="max-w-sm">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-neutral-800">{band.label}</span>
        {/*
          The number is secondary and deliberately quiet. A big score encourages
          people to treat it as a target, and it is a description of the record
          rather than a rating of anyone's contribution.
        */}
        <span className="text-xs tabular-nums text-neutral-500">{integrity.overall}/100</span>
      </div>

      {/*
        role="img" with a label, because the bar means something and a screen
        reader would otherwise announce two empty divs. Not a progressbar role:
        this is not tracking progress towards a goal, and saying so would imply
        the goal exists.
      */}
      <div
        role="img"
        aria-label={`${band.label}, ${integrity.overall} out of 100`}
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200"
      >
        <div
          className="h-full rounded-full bg-neutral-500"
          style={{ width: `${band.fill * 100}%` }}
        />
      </div>

      <p className="mt-1.5 text-xs text-neutral-600">{band.invitation}</p>

      {/*
        The counts behind the score. Shown because a single number invites
        arguments about the number, and the parts are what somebody can actually
        do something about.
      */}
      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
        <div className="flex gap-1">
          <dt>accounts</dt>
          <dd className="tabular-nums text-neutral-700">{integrity.totalClaims}</dd>
        </div>
        <div className="flex gap-1">
          <dt>families</dt>
          <dd className="tabular-nums text-neutral-700">{integrity.lineageDiversity}</dd>
        </div>
        <div className="flex gap-1">
          <dt>dated</dt>
          <dd className="tabular-nums text-neutral-700">{integrity.datedClaims}</dd>
        </div>
        {integrity.awaitingTranslation > 0 && (
          <div className="flex gap-1">
            <dt>awaiting translation</dt>
            <dd className="tabular-nums text-neutral-700">{integrity.awaitingTranslation}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
