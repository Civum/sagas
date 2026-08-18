/**
 * CONFORMANCE CASES
 * =================
 *
 * The contract is not the JSON. The contract is this list.
 *
 * Each case names a situation the record can actually be in, points at the
 * fixture data that puts it in that situation, and states what a consumer has
 * to do about it. A renderer that satisfies all of these will not be surprised
 * by real data; one that satisfies only the happy path will be.
 *
 * These are deliberately awkward. A fixture that is only a realistic curve —
 * sparse site grows into rich site — quietly tells both teams that the hard
 * cases don't exist. Every case with no coverage here is a design decision
 * made by omission, so when you find one we missed, that is a PR worth
 * opening.
 *
 * How to use this from your own code:
 *
 *   import { CONFORMANCE_CASES, loadState } from '@sagas/fixtures/conformance';
 *
 *   for (const c of CONFORMANCE_CASES) {
 *     const state = loadState(c.stateId);
 *     // render it, or feed it to your API, and assert c.requirement holds
 *   }
 */

export type Severity = 'must' | 'should';

export interface ConformanceCase {
  id: string;
  /** Which derived state exhibits this. */
  stateId: 't0' | 't1' | 't2' | 't3';
  /** The claim or entity to look at, when the case is about a specific one. */
  subject?: string;
  /** What is true of the data. */
  situation: string;
  /** What a consumer must do about it. */
  requirement: string;
  severity: Severity;
}

export const CONFORMANCE_CASES: ConformanceCase[] = [
  {
    id: 'sparse-site-is-not-empty-site',
    stateId: 't0',
    situation:
      'Three claims, one contributor, one family line, no affirmations. Every claim is single-source and low weight.',
    requirement:
      'A sparse site must be visually distinguishable from a site with no data at all, and must not read as an error state. Integrity 23/100 is a real site with a thin record, not a broken one.',
    severity: 'must',
  },
  {
    id: 'affirmation-without-independence',
    stateId: 't1',
    subject: 'cl-boarding',
    situation:
      "The account has one affirmation, from a contributor who shares the author's family line. independentLineageCount is 0.",
    requirement:
      'Do not present an affirmation count as corroboration. This claim carries an affirmation and is still single_source, and the interface must not contradict that. Showing "1 affirmation" next to "single source" without explanation will read as a bug to a historian.',
    severity: 'must',
  },
  {
    id: 'account-outside-the-graph',
    stateId: 't1',
    subject: 'cl-domingo',
    situation:
      'An account submitted in Euskara with no English rendering yet. awaitingTranslation is true, weight is 0, text is empty, sourceLanguageText holds the original, elements is an empty array.',
    requirement:
      'Render it. It is pinned on the map and readable in the original, with an indicator that a rendering is needed. Do not skip claims with empty text, do not crash on an empty elements array, and do not sort it off the end of the page as though weight 0 meant worthless.',
    severity: 'must',
  },
  {
    id: 'one-element-disputed-others-not',
    stateId: 't2',
    subject: 'cl-boarding',
    situation:
      'Three disputes target the date element. The place, person, and event elements on the same claim have none.',
    requirement:
      'Contest the date and only the date. Marking the whole claim as disputed discards the granularity that makes this useful — the location is corroborated and must still read as corroborated.',
    severity: 'must',
  },
  {
    id: 'competing-readings-ordered-by-independence',
    stateId: 't2',
    subject: 'cl-boarding',
    situation:
      'competingValues holds "1914" supported by two distinct family lines and "1922" supported by one, ordered strongest first.',
    requirement:
      'Show both, with their support. Do not pick a winner, do not hide the minority reading behind an interaction, and do not present this as a vote tally. The count is distinct family lines, not people — label it accordingly.',
    severity: 'must',
  },
  {
    id: 'rendering-arrives',
    stateId: 't2',
    subject: 'cl-domingo',
    situation:
      'The same claim that was awaitingTranslation at t1 now has a rendering, weight above zero, and an unchanged sourceLanguageText.',
    requirement:
      'The transition must be legible in the version timeline as a specific contribution, not as the claim silently appearing. The original text must remain reachable after rendering.',
    severity: 'must',
  },
  {
    id: 'coexisting-renderings',
    stateId: 't3',
    subject: 'cl-domingo',
    situation:
      'Two English renderings of one account, independently attributed, plus a preserved objection that the first loses a meaning present in the original.',
    requirement:
      'Neither rendering is authoritative. Do not choose one silently, do not present the objection as resolved, and do not require the reader to know Euskara to see that a disagreement exists.',
    severity: 'must',
  },
  {
    id: 'reconciliation-candidate',
    stateId: 't3',
    subject: 'cl-prelot-both',
    situation:
      'An extension asserts that two previously competing readings were both true of different parts of the same lot. The original dispute edges still exist and are not marked resolved.',
    requirement:
      'The record must not silently collapse. Detecting reconciliation is a future capability; until then, a consumer must render an unresolved dispute alongside a claim that appears to answer it without asserting that it has been settled.',
    severity: 'should',
  },
  {
    id: 'unresolved-cross-site-reference',
    stateId: 't3',
    situation:
      'Two reference edges point at places ("the Center", "men still came") that do not exist as sites in the archive. resolved is false and toSiteId is undefined.',
    requirement:
      'An unresolved reference must not render as a broken link or a dead navigation target. It is a marker for future community resolution and should read as one.',
    severity: 'must',
  },
  {
    id: 'passover-signals-are-not-ratings',
    stateId: 't3',
    situation:
      "Claims carry counts of sounds_right, dont_know, and dont_care. The pre-1900 claim has accumulated dont_know rather than affirmations.",
    requirement:
      'These are routing signals, not quality scores. Do not aggregate them into a rating, and do not let a high dont_know count read to the contributor as their account being rejected.',
    severity: 'must',
  },
  {
    id: 'every-claim-traces-to-a-contributor',
    stateId: 't3',
    situation:
      'Every claim carries contributorId, createdAt, and sourceType, and every contributor carries fictional: true.',
    requirement:
      'Attribution is never optional and never anonymous in this model. Any view that shows claim text must be able to reach its source. The fictional flag must survive into anything user-visible during development.',
    severity: 'must',
  },
];

export const MUST_CASES = CONFORMANCE_CASES.filter((c) => c.severity === 'must');

/**
 * Cases we know are NOT yet covered by fixture data. Listed so that the gap is
 * explicit rather than implied. Each of these is a real situation the record
 * can be in, and until a fixture exercises it, both teams are free to get it
 * wrong until integration.
 *
 * Adding coverage for any of these is a welcome PR.
 */
export const KNOWN_GAPS = [
  'A site with only untranslated accounts — nothing in the graph at all.',
  'A claim contested by a dozen contributors across many lines.',
  'A claim with an empty elements array that is NOT awaiting translation.',
  'An account long enough to break a reading layout.',
  'A contributor who has been vouched for but has contributed nothing yet.',
  'A site with exactly one claim and no contributors beyond its author.',
  'Two sites close enough together to collide as map markers.',
  'A claim whose only affirmations come from contributors who joined the same day.',
] as const;
