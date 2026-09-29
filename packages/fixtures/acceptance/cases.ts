/**
 * A short label for each situation the record can be in.
 *
 * The reasoning is not here. It is in `packages/fixtures/README.md`, under
 * "What your interface has to handle", because it is prose and prose belongs in
 * a document rather than in a typed array pretending to be data.
 *
 * What is here is the minimum needed to show the right criteria next to the
 * right components on the /dev page: which snapshot exhibits the situation,
 * which claim or record to look at, and one line on what has to be true.
 *
 * These are direction, not specification. They say what must not happen. How
 * your interface satisfies them is your design, and most of what you build will
 * be things this list says nothing about.
 */

export type Severity = 'must' | 'should';

export interface AcceptanceCriterion {
  id: string;
  /** Which fixture site shows this, by directory name under `fixtures/`. */
  site: string;
  /** Which snapshot shows this. */
  stateId: 't0' | 't1' | 't2' | 't3';
  /** The claim, record or person to look at, when it is about one. */
  subject?: string;
  /** What is true of the data. */
  situation: string;
  /** What your interface has to do about it. */
  requirement: string;
  severity: Severity;
}

export const ACCEPTANCE_CRITERIA: AcceptanceCriterion[] = [
  {
    id: 'record-with-no-claim',
    site: 'corner-shop',
    stateId: 't0',
    subject: 'rec-cs-photo',
    situation: 'One photograph, with a note saying the contributor does not know when it was taken. No claims.',
    requirement: 'Show the record as a complete contribution and an early place, not as empty or broken.',
    severity: 'must',
  },
  {
    id: 'contribution-is-not-authorship',
    site: 'corner-shop',
    stateId: 't1',
    subject: 'cl-cs-shop',
    situation: 'The claim was made by somebody other than the person who handed over the photograph.',
    requirement: 'Credit both, each for what they did.',
    severity: 'must',
  },
  {
    id: 'evidence-is-not-the-source',
    site: 'corner-shop',
    stateId: 't2',
    subject: 'cl-cs-uncle',
    situation: 'An extension whose source is the photograph and whose evidence is an audio clip.',
    requirement: 'Show what the claim is about (the photograph) and what backs it up (the clip) as different things.',
    severity: 'must',
  },
  {
    id: 'same-detail-separate-conversations',
    site: 'corner-shop',
    stateId: 't3',
    subject: 'cl-cs-sign',
    situation: 'A second conversation, from a different record, names the same owner. Nothing links the two.',
    requirement: 'Do not merge them or imply one confirms the other.',
    severity: 'should',
  },
  {
    id: 'sparse-site-is-not-empty-site',
    site: 'example-site',
    stateId: 't0',
    situation: 'Three claims, one contributor, nothing corroborated. Integrity 23.',
    requirement: 'Read as a thin record, not a broken one or an error.',
    severity: 'must',
  },
  {
    id: 'affirmation-without-independence',
    site: 'corner-shop',
    stateId: 't1',
    subject: 'cl-cs-shop',
    situation: 'One affirmation, and nobody has brought a record of their own. Independent records: 0.',
    requirement: 'Never show an agreement count as corroboration.',
    severity: 'must',
  },
  {
    id: 'claim-outside-the-graph',
    site: 'example-site',
    stateId: 't1',
    subject: 'cl-domingo',
    situation: 'A claim nobody has rendered into English. Weight 0, no text, no details.',
    requirement: 'Show it, readable in the original. Do not skip it, crash on it, or sort it last.',
    severity: 'must',
  },
  {
    id: 'one-detail-disputed-others-not',
    site: 'corner-shop',
    stateId: 't2',
    subject: 'cl-cs-shop',
    situation: 'The year is disputed. The place and the owner are not.',
    requirement: 'Contest the year and only the year.',
    severity: 'must',
  },
  {
    id: 'competing-readings-shown-together',
    site: 'corner-shop',
    stateId: 't2',
    subject: 'cl-cs-shop',
    situation: '"c. 1950" from the claim, "1956 or later" from a dispute that cites a directory page.',
    requirement: 'Show both with their reasoning. No winner, nothing hidden, not a vote tally.',
    severity: 'must',
  },
  {
    id: 'rendering-arrives',
    site: 'example-site',
    stateId: 't2',
    subject: 'cl-domingo',
    situation: 'The unrendered claim from t1 now has a rendering. The original is unchanged.',
    requirement: 'Show the change as somebody\'s contribution, and keep the original reachable.',
    severity: 'must',
  },
  {
    id: 'coexisting-renderings',
    site: 'example-site',
    stateId: 't3',
    subject: 'cl-domingo',
    situation: 'Two English renderings, each credited, plus an objection to the first.',
    requirement: 'Neither is authoritative. The disagreement must be visible without speaking the original.',
    severity: 'must',
  },
  {
    id: 'reconciliation-candidate',
    site: 'example-site',
    stateId: 't3',
    subject: 'cl-prelot-both',
    situation: 'A new claim suggests two competing readings were both true. The disputes still stand.',
    requirement: 'Do not present it as settled.',
    severity: 'should',
  },
  {
    id: 'passover-signals-are-not-ratings',
    site: 'example-site',
    stateId: 't3',
    situation: "Counts of sounds_right, dont_know and dont_care.",
    requirement: 'Routing signals, not scores. Never aggregate them, never show them as rejection.',
    severity: 'must',
  },
  {
    id: 'every-claim-traces-to-a-contributor',
    site: 'example-site',
    stateId: 't3',
    situation: 'Every claim has an author, a date and a source type. Every contributor is flagged invented.',
    requirement: 'Any view showing claim text can reach its source. The invented flag stays visible.',
    severity: 'must',
  },
  {
    id: 'one-record-many-claims',
    site: 'example-site',
    stateId: 't0',
    subject: 'rec-001',
    situation: 'One written record with no files. Two claims came out of it.',
    requirement: 'Get from either claim to the record, and from the record to both claims.',
    severity: 'must',
  },
  {
    id: 'record-is-a-bundle-not-a-file-type',
    site: 'example-site',
    stateId: 't2',
    subject: 'rec-005',
    situation: 'One record holding audio, typed text and a note.',
    requirement: 'Do not label a record with a single media type.',
    severity: 'must',
  },
  {
    id: 'transcript-is-not-a-translation',
    site: 'example-site',
    stateId: 't3',
    subject: 'rec-005',
    situation: 'One transcript in the original language, two competing English renderings.',
    requirement: 'Show them as different things. One is what was said, the other is what it means.',
    severity: 'must',
  },
  {
    id: 'embedded-location-contradicts-the-place',
    site: 'example-site',
    stateId: 't1',
    subject: 'rec-003',
    situation: "A photo's GPS lands 55m away in the street, accurate to 65m.",
    requirement: 'Do not move the pin. If both are shown, the difference must not look like a bug.',
    severity: 'must',
  },
  {
    id: 'media-still-processing-is-not-a-failure',
    site: 'example-site',
    stateId: 't3',
    subject: 'rec-009',
    situation: 'A 604MB upload still being processed. The record is readable without it.',
    requirement: 'Show a job running, not a broken upload. Do not tell anyone to try again.',
    severity: 'must',
  },
  {
    id: 'open-flag-on-a-published-record',
    site: 'example-site',
    stateId: 't3',
    subject: 'rec-005',
    situation: 'A published record with months of work on it carries an unresolved consent report.',
    requirement: 'Not a dispute, and not resolved. Do not imply it has been reviewed and cleared.',
    severity: 'must',
  },
  {
    id: 'standing-is-counts-not-a-score',
    site: 'example-site',
    stateId: 't3',
    situation: 'Every contributor has counts of what they have done. No score.',
    requirement: 'Do not add them up. Nobody\'s account of their own family gets a rating beside it.',
    severity: 'must',
  },
  {
    id: 'contributor-who-authors-nothing',
    site: 'example-site',
    stateId: 't3',
    subject: 'c-robert',
    situation: 'No records, no claims, two well-reasoned disputes, two affirmations, one report.',
    requirement: 'An empty authorship count is not an empty contribution.',
    severity: 'must',
  },
];
