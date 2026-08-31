/**
 * A list of awkward situations the data can be in, and what your code has to
 * do about each one.
 *
 * This list matters more than the JSON files. The JSON is one example of the
 * data. This is the set of cases your code has to survive.
 *
 * They're awkward on purpose. If the only test data is a site that starts
 * small and grows nicely, it's easy to build something that falls over the
 * first time a real record is messy. Every case listed here has fixture data
 * behind it, so you can load it and try.
 *
 * There's also a list of gaps at the bottom: situations nothing covers yet.
 * Those are cases we haven't decided on, so if you hit one, say so.
 *
 * Using it:
 *
 *   import { CONFORMANCE_CASES, loadState } from '@sagas/fixtures/conformance';
 *
 *   for (const c of CONFORMANCE_CASES) {
 *     const state = loadState(c.stateId);
 *     // render it, or feed it to your API, and check c.requirement holds
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
  {
    id: 'one-record-many-claims',
    stateId: 't0',
    subject: 'rec-001',
    situation:
      'One written record with no files at all. Two claims were read out of it, cl-boarding and cl-fronton, and both point back at it.',
    requirement:
      'A reader must be able to get from either claim to the thing it was read out of, and from the record to everything read out of it. A record with no media is the most common kind of contribution and must not render as an empty attachment list.',
    severity: 'must',
  },
  {
    id: 'record-is-a-bundle-not-a-file-type',
    stateId: 't2',
    subject: 'rec-005',
    situation:
      'One record holds an audio file, a typed summary in Euskara, and a note. Later it also has a transcript.',
    requirement:
      'Do not label a record with a single media type. It is a bundle and it can hold audio, text, and images at once. An interface that picks one icon and calls the record an "audio record" will misdescribe this one.',
    severity: 'must',
  },
  {
    id: 'transcript-is-not-a-translation',
    stateId: 't3',
    subject: 'rec-005',
    situation:
      'The record has one Euskara transcript of its audio, written by a person who is not the contributor, and two competing English renderings of the account.',
    requirement:
      'These are different things and must read as different things. The transcript says what the recording says. The renderings say what it means in English. Collapsing them loses the fact that a Euskara speaker has already verified the words and the disagreement is about meaning.',
    severity: 'must',
  },
  {
    id: 'embedded-location-contradicts-the-place',
    stateId: 't1',
    subject: 'rec-003',
    situation:
      "A photo's embedded coordinates put the camera in the middle of Grove Street, 55 metres from the building, with an accuracy of 65 metres. The record is attached to the building.",
    requirement:
      'Do not move the pin. The record belongs to the place it was attached to, and the embedded location is evidence about where the camera was, not about what the photo shows. If both are displayed, the difference must be legible rather than looking like a bug.',
    severity: 'must',
  },
  {
    id: 'media-still-processing-is-not-a-failure',
    stateId: 't3',
    subject: 'rec-009',
    situation:
      'A 604MB audio file is still in processing when the log ends. The record is usable because its claim came from the typed text.',
    requirement:
      'Show that a job is still running, not that an upload broke. The record must stay readable while its media is unavailable, and the contributor must not be told to try again.',
    severity: 'must',
  },
  {
    id: 'open-flag-on-a-published-record',
    stateId: 't3',
    subject: 'rec-005',
    situation:
      'A published record with four months of transcripts, translations, and claims built on it carries an open flag saying part of it was never the contributor\'s to give.',
    requirement:
      'The flag is not a dispute and must not render as one. It says nothing about whether the account is accurate. Nothing in the model resolves this, so a consumer must not imply that the record has been reviewed and cleared.',
    severity: 'must',
  },
  {
    id: 'standing-is-counts-not-a-score',
    stateId: 't3',
    situation:
      'Every contributor has a standing entry made only of counts: records, claims, corroborations, disputes raised, disputes that proposed an alternative, affirmations, translations, transcripts, flags.',
    requirement:
      'Do not add these up. There is no score in this data and putting one in an interface invents one. A person\'s account of their own family must never render with a rating beside it. Showing individual counts where they explain something is fine; combining them is a research decision that has not been made.',
    severity: 'must',
  },
  {
    id: 'contributor-who-authors-nothing',
    stateId: 't3',
    subject: 'c-robert',
    situation:
      'Robert Mendive has submitted no records and written no claims. He has raised two disputes, both proposing a specific alternative rather than only objecting, given two affirmations, and raised one flag.',
    requirement:
      'Any measure built on how much somebody has authored scores him zero, and he is one of the more useful people in this record. Whatever the intelligence layer builds has to survive this case, and any interface that ranks or lists contributors must not treat an empty authorship count as an empty contribution.',
    severity: 'must',
  },
  {
    id: 'a-claim-may-say-nothing-about-when',
    stateId: 't3',
    subject: 'cl-fronton',
    situation:
      'Five of the ten claims carry no era, because they make no assertion about time. cl-fronton describes how a space was used and never says when.',
    requirement:
      'Absent is a real answer and must not render as "unknown period" or sort to the end of a timeline as though it were undated data. A claim with no era is not missing information; it is a claim about something other than time. Any filter by period must say plainly that it is excluding these rather than silently dropping them.',
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
  'A record with two transcripts of the same audio that disagree about what was said.',
  'The same file uploaded by two contributors, so the checksums collide and it is one source rather than two.',
  'A record whose media processing failed outright, rather than still running.',
  'A record nobody has read any claims out of yet.',
  'A flag that has been upheld, and whatever is supposed to happen next.',
  'A contributor who has been vouched for by somebody trusted and has contributed nothing. There is no vouching in the model, so this cannot be represented at all.',
  'Two contributors whose standing counts are identical but whose contributions are obviously not equivalent.',
] as const;
