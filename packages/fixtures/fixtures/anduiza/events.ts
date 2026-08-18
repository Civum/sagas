/**
 * ANDUIZA HOTEL & FRONTON — contribution event log
 * ================================================
 *
 * THIS CONTENT IS INVENTED. The building, street address, and city are real.
 * Every contributor, family, and remembered event below is fictional and was
 * written to exercise the data model. Nothing here is a record of any real
 * person's testimony and none of it should be cited, displayed publicly, or
 * shown to community members as though it were.
 *
 * Surnames were chosen to be plausibly Basque in form while avoiding the
 * families documented in connection with this building. Any resemblance to
 * real Boise families is unintended.
 *
 * The Euskara sample text is approximate and has NOT been reviewed by a
 * speaker. It must be reviewed before this fixture is shown to anyone outside
 * the development teams.
 *
 * Authored as an append-only log. States are derived, never authored. See
 * ../../src/reduce.ts.
 */

import type { ContributionEvent } from '../../src/events';

const SITE = 'site-anduiza';

export const events: ContributionEvent[] = [
  /* ================================================================ */
  /* STATE t0 — January 2026. One contributor, one family, no          */
  /* corroboration. Everything here is single-source and low weight.   */
  /* ================================================================ */

  {
    id: 'ev-001', at: '2026-01-08T16:02:00Z', actorId: 'system',
    kind: 'site_created',
    siteId: SITE,
    slug: 'anduiza-hotel-fronton',
    name: 'Anduiza Hotel and Fronton',
    aka: ['the fronton', "Anduiza's", 'the handball court', 'the old boarding house'],
    coordinates: [-116.20331, 43.61533],
    address: '620 W Grove St',
    city: 'Boise, Idaho',
  },

  {
    id: 'ev-002', at: '2026-01-08T16:04:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-marisol',
    displayName: 'Marisol Etxeberria',
    lineageId: 'lin-etxeberria',
  },

  {
    id: 'ev-003', at: '2026-01-08T16:22:00Z', actorId: 'c-marisol',
    kind: 'account_submitted',
    claimId: 'cl-boarding',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'The Anduiza building on Grove Street took in Basque sheepherders when they came off the range. ' +
      'My great-grandmother cooked there. She started in 1922, a few years after she came over, and she ' +
      'stayed in that kitchen until the boarding side of it shut down.',
    elements: [
      { id: 'cl-boarding-e-date', kind: 'date', value: '1922', excerpt: 'She started in 1922' },
      { id: 'cl-boarding-e-use', kind: 'event', value: 'boarding house for sheepherders', excerpt: 'took in Basque sheepherders' },
      { id: 'cl-boarding-e-place', kind: 'place', value: '620 W Grove St', excerpt: 'The Anduiza building on Grove Street' },
      { id: 'cl-boarding-e-person', kind: 'person', value: 'great-grandmother, cook', excerpt: 'My great-grandmother cooked there' },
    ],
    era: 'early_immigration_1900_1929',
    topics: ['boarding house', 'sheepherding', 'women\'s work', 'immigration'],
    sourceType: 'family_oral',
  },

  {
    id: 'ev-004', at: '2026-01-08T16:41:00Z', actorId: 'c-marisol',
    kind: 'account_submitted',
    claimId: 'cl-fronton',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'There was a handball court built into the back of the building, behind the sleeping rooms. ' +
      'The men played in the winter when there was no work on the range. My mother said you could ' +
      'hear it through the floor.',
    elements: [
      { id: 'cl-fronton-e-place', kind: 'place', value: 'rear of building', excerpt: 'built into the back of the building' },
      { id: 'cl-fronton-e-use', kind: 'event', value: 'handball court / fronton', excerpt: 'a handball court' },
      { id: 'cl-fronton-e-season', kind: 'event', value: 'winter use', excerpt: 'played in the winter' },
    ],
    era: 'early_immigration_1900_1929',
    topics: ['pilota', 'fronton', 'recreation', 'sheepherding'],
    sourceType: 'family_oral',
  },

  {
    id: 'ev-005', at: '2026-01-09T02:15:00Z', actorId: 'c-marisol',
    kind: 'account_submitted',
    claimId: 'cl-prelot',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'Before the boarding house there was a livery stable on that lot. That is what I was told, ' +
      'though I do not know who ran it or when it went.',
    elements: [
      { id: 'cl-prelot-e-use', kind: 'event', value: 'livery stable', excerpt: 'a livery stable on that lot' },
      { id: 'cl-prelot-e-seq', kind: 'date', value: 'before boarding house', excerpt: 'Before the boarding house' },
    ],
    era: 'pre_1900',
    topics: ['prior use', 'lot history'],
    sourceType: 'family_oral',
  },

  /* ================================================================ */
  /* STATE t1 — March 2026. Corroboration arrives, but note that one   */
  /* of the two new affirmers shares a family line with the original   */
  /* contributor. Volume rises; independence does not. An account is   */
  /* also submitted in Euskara and sits outside the graph.             */
  /* ================================================================ */

  {
    id: 'ev-006', at: '2026-02-14T19:30:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-joseba',
    displayName: 'Joseba Iriondo',
    lineageId: 'lin-iriondo',
  },

  {
    id: 'ev-007', at: '2026-02-14T19:44:00Z', actorId: 'c-joseba',
    kind: 'claim_affirmed',
    affirmationId: 'af-001',
    claimId: 'cl-fronton',
  },

  {
    id: 'ev-008', at: '2026-02-14T20:01:00Z', actorId: 'c-joseba',
    kind: 'claim_extended',
    claimId: 'cl-fronton-floor',
    parentClaimId: 'cl-fronton',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'I played in that court myself as a teenager, so this would be 1963, 1964. By then the boarding ' +
      'was long over and the building was something else, but the court was still there and men still ' +
      'came. The floor was wood and it had a dead spot near the left wall that everybody knew about. ' +
      'You learned to play around it.',
    elements: [
      { id: 'cl-fronton-floor-e-date', kind: 'date', value: '1963-1964', excerpt: 'this would be 1963, 1964' },
      { id: 'cl-fronton-floor-e-mat', kind: 'event', value: 'wood floor', excerpt: 'The floor was wood' },
      { id: 'cl-fronton-floor-e-detail', kind: 'place', value: 'dead spot near left wall', excerpt: 'a dead spot near the left wall' },
    ],
    era: 'postwar_1946_1969',
    topics: ['pilota', 'fronton', 'recreation'],
    sourceType: 'firsthand',
  },

  {
    id: 'ev-009', at: '2026-02-20T15:12:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-ana',
    displayName: 'Ana Etxeberria-Woods',
    lineageId: 'lin-etxeberria', // NOTE: same family line as c-marisol.
  },

  {
    id: 'ev-010', at: '2026-02-20T15:20:00Z', actorId: 'c-ana',
    kind: 'claim_affirmed',
    affirmationId: 'af-002',
    claimId: 'cl-boarding',
  },

  {
    id: 'ev-011', at: '2026-02-20T15:21:00Z', actorId: 'c-ana',
    kind: 'claim_affirmed',
    affirmationId: 'af-003',
    claimId: 'cl-fronton',
  },

  {
    id: 'ev-012', at: '2026-02-20T15:39:00Z', actorId: 'c-ana',
    kind: 'claim_extended',
    claimId: 'cl-boarding-kitchen',
    parentClaimId: 'cl-boarding',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'Marisol and I are cousins and this is the same great-grandmother. What I have that she may not ' +
      'is that the kitchen ran two sittings, because the herders came in at different hours depending ' +
      'on whether they were going out or coming back. My grandmother described washing up twice.',
    elements: [
      { id: 'cl-boarding-kitchen-e-op', kind: 'event', value: 'two meal sittings', excerpt: 'the kitchen ran two sittings' },
      { id: 'cl-boarding-kitchen-e-rel', kind: 'attribution', value: 'same lineage as cl-boarding', excerpt: 'Marisol and I are cousins' },
    ],
    era: 'early_immigration_1900_1929',
    topics: ['boarding house', 'women\'s work', 'daily life'],
    sourceType: 'family_oral',
  },

  {
    id: 'ev-013', at: '2026-03-02T22:10:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-domingo',
    displayName: 'Domingo Sagastume',
    lineageId: 'lin-sagastume',
  },

  /* An account given in Euskara. It is pinned on the map and readable in the
     original. It has no English rendering yet, so it sits outside the claim
     graph — visible, attributed, untouched. It is never deleted. */
  {
    id: 'ev-014', at: '2026-03-02T22:31:00Z', actorId: 'c-domingo',
    kind: 'account_submitted',
    claimId: 'cl-domingo',
    siteId: SITE,
    sourceLanguage: 'eu',
    awaitingTranslation: true,
    sourceLanguageText:
      'Gure aitona hemen bizi izan zen. Neguan pilotan jokatzen zuten atzeko aldean. ' +
      'Guretzat gure etxea zen, ez ostatu bat.',
    text: '', // no rendering exists yet
    elements: [],
    era: 'depression_war_1930_1945',
    topics: ['boarding house', 'pilota', 'family'],
    sourceType: 'family_oral',
  },

  {
    id: 'ev-015', at: '2026-03-05T18:02:00Z', actorId: 'c-joseba',
    kind: 'passover_recorded', passoverId: 'pv-001', claimId: 'cl-boarding', passoverKind: 'sounds_right',
  },
  {
    id: 'ev-016', at: '2026-03-05T18:03:00Z', actorId: 'c-joseba',
    kind: 'passover_recorded', passoverId: 'pv-002', claimId: 'cl-prelot', passoverKind: 'dont_know',
  },
  {
    id: 'ev-017', at: '2026-03-11T17:45:00Z', actorId: 'c-ana',
    kind: 'passover_recorded', passoverId: 'pv-003', claimId: 'cl-prelot', passoverKind: 'dont_know',
  },
  {
    id: 'ev-018', at: '2026-03-11T17:52:00Z', actorId: 'c-domingo',
    kind: 'passover_recorded', passoverId: 'pv-004', claimId: 'cl-fronton', passoverKind: 'sounds_right',
  },

  /* ================================================================ */
  /* STATE t2 — May 2026. A documentary source arrives and contests    */
  /* one element of an otherwise well-supported claim. The Euskara     */
  /* account receives a rendering and enters the graph.                */
  /* ================================================================ */

  {
    id: 'ev-019', at: '2026-04-06T14:00:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-teresa',
    displayName: 'Teresa Goikoetxea',
    institution: 'Basque Museum & Cultural Center',
  },

  {
    id: 'ev-020', at: '2026-04-06T14:35:00Z', actorId: 'c-teresa',
    kind: 'claim_extended',
    claimId: 'cl-register',
    parentClaimId: 'cl-boarding',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'We hold a boarding register from this building. The earliest entries in our copy are from 1914, ' +
      'which is earlier than the date given in the account above. The register does not name kitchen ' +
      'staff, so it neither confirms nor contradicts who was cooking.',
    elements: [
      { id: 'cl-register-e-date', kind: 'date', value: '1914', excerpt: 'The earliest entries in our copy are from 1914' },
      { id: 'cl-register-e-doc', kind: 'attribution', value: 'boarding register, museum holding', excerpt: 'We hold a boarding register' },
      { id: 'cl-register-e-limit', kind: 'attribution', value: 'register omits staff', excerpt: 'The register does not name kitchen staff' },
    ],
    era: 'early_immigration_1900_1929',
    topics: ['boarding house', 'documentary record'],
    sourceType: 'institutional',
  },

  /* The dispute targets ONLY the date element. Place, use, and person on the
     same claim remain undisputed. This is the granular-resolution case. */
  {
    id: 'ev-021', at: '2026-04-06T14:42:00Z', actorId: 'c-teresa',
    kind: 'claim_disputed',
    edgeId: 'dis-001',
    targetClaimId: 'cl-boarding',
    targetElementId: 'cl-boarding-e-date',
    reasoning:
      'The register in our holdings has entries from 1914. The 1922 date may be when this particular ' +
      'cook began rather than when the boarding operation started. Those are different claims and the ' +
      'account may be conflating them.',
    proposedValue: '1914',
  },

  {
    id: 'ev-022', at: '2026-04-11T20:18:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-robert',
    displayName: 'Robert Mendive',
  },

  {
    id: 'ev-023', at: '2026-04-11T20:40:00Z', actorId: 'c-robert',
    kind: 'claim_disputed',
    edgeId: 'dis-002',
    targetClaimId: 'cl-prelot',
    targetElementId: 'cl-prelot-e-use',
    reasoning:
      'City directories for the 1890s list a blacksmith at this address, not a livery. I have not found ' +
      'a livery listed on this lot in any year I checked.',
    proposedValue: 'blacksmith shop',
  },

  {
    id: 'ev-024', at: '2026-04-11T20:55:00Z', actorId: 'c-robert',
    kind: 'claim_affirmed',
    affirmationId: 'af-004',
    claimId: 'cl-fronton',
  },

  {
    id: 'ev-025', at: '2026-04-18T16:05:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-kepa',
    displayName: 'Kepa Larrañaga',
    lineageId: 'lin-larranaga',
  },

  /* The rendering lands. cl-domingo now enters the claim graph. */
  {
    id: 'ev-026', at: '2026-04-18T16:33:00Z', actorId: 'c-kepa',
    kind: 'translation_submitted',
    translationId: 'tr-001',
    claimId: 'cl-domingo',
    targetLanguage: 'en',
    text:
      'Our grandfather lived here. In winter they played pilota at the back. For us it was the boarding ' +
      'house, not a hotel.',
  },

  {
    id: 'ev-027', at: '2026-04-19T15:10:00Z', actorId: 'c-teresa',
    kind: 'claim_affirmed',
    affirmationId: 'af-005',
    claimId: 'cl-fronton',
  },

  {
    id: 'ev-028', at: '2026-04-25T23:41:00Z', actorId: 'c-joseba',
    kind: 'claim_affirmed',
    affirmationId: 'af-006',
    claimId: 'cl-domingo',
  },

  {
    id: 'ev-029', at: '2026-05-02T17:22:00Z', actorId: 'c-ana',
    kind: 'claim_disputed',
    edgeId: 'dis-003',
    targetClaimId: 'cl-boarding',
    targetElementId: 'cl-boarding-e-date',
    reasoning:
      'Our family has always said 1922 and there is a photograph dated that year with her in the ' +
      'kitchen doorway. I am not disputing that the building took boarders earlier. I am saying 1922 ' +
      'is right for her.',
    proposedValue: '1922',
  },

  {
    id: 'ev-030', at: '2026-05-09T14:08:00Z', actorId: 'c-robert',
    kind: 'claim_disputed',
    edgeId: 'dis-004',
    targetClaimId: 'cl-boarding',
    targetElementId: 'cl-boarding-e-date',
    reasoning:
      'A 1916 newspaper notice advertises rooms at this address for herders. That predates 1922 by six ' +
      'years and is independent of the museum register.',
    proposedValue: '1914',
  },

  {
    id: 'ev-031', at: '2026-05-09T14:30:00Z', actorId: 'c-robert',
    kind: 'passover_recorded', passoverId: 'pv-005', claimId: 'cl-fronton-floor', passoverKind: 'dont_know',
  },
  {
    id: 'ev-032', at: '2026-05-14T19:00:00Z', actorId: 'c-kepa',
    kind: 'passover_recorded', passoverId: 'pv-006', claimId: 'cl-boarding', passoverKind: 'sounds_right',
  },
  {
    id: 'ev-033', at: '2026-05-14T19:02:00Z', actorId: 'c-kepa',
    kind: 'passover_recorded', passoverId: 'pv-007', claimId: 'cl-prelot', passoverKind: 'dont_care',
  },

  /* ================================================================ */
  /* STATE t3 — July 2026. A competing rendering of the Euskara        */
  /* account with a dispute about what it loses. A second lineage      */
  /* corroborates the fronton. An extension that could reconcile the   */
  /* livery/blacksmith branch. An unresolved cross-site reference.     */
  /* ================================================================ */

  {
    id: 'ev-034', at: '2026-06-03T21:14:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-itxaso',
    displayName: 'Itxaso Zubieta',
    lineageId: 'lin-zubieta',
  },

  /* A second rendering. It does not replace the first. Both coexist, each
     independently attributed. */
  {
    id: 'ev-035', at: '2026-06-03T21:48:00Z', actorId: 'c-itxaso',
    kind: 'translation_submitted',
    translationId: 'tr-002',
    claimId: 'cl-domingo',
    targetLanguage: 'en',
    text:
      'Our grandfather lived here. In winter they played pilota round the back. To us it was our home, ' +
      'not a lodging house.',
  },

  {
    id: 'ev-036', at: '2026-06-03T21:56:00Z', actorId: 'c-itxaso',
    kind: 'translation_disputed',
    disputeId: 'tdis-001',
    translationId: 'tr-001',
    reasoning:
      'The original says "gure etxea" — our home. The first rendering gives this as "the boarding ' +
      'house", which turns the sentence into a fact about the building when the speaker is saying ' +
      'something about belonging. The contrast he is drawing is home against lodging, not boarding ' +
      'house against hotel.',
  },

  {
    id: 'ev-037', at: '2026-06-08T15:30:00Z', actorId: 'c-domingo',
    kind: 'claim_affirmed',
    affirmationId: 'af-007',
    claimId: 'cl-fronton-floor',
  },

  {
    id: 'ev-038', at: '2026-06-08T15:44:00Z', actorId: 'c-domingo',
    kind: 'claim_extended',
    claimId: 'cl-fronton-deadspot',
    parentClaimId: 'cl-fronton-floor',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'The dead spot was where a drain had been patched over. My uncle said it was there from the start ' +
      'and nobody ever fixed it properly because it would have meant taking up half the floor.',
    elements: [
      { id: 'cl-fronton-deadspot-e-cause', kind: 'event', value: 'patched drain', excerpt: 'where a drain had been patched over' },
    ],
    era: 'postwar_1946_1969',
    topics: ['pilota', 'fronton', 'building fabric'],
    sourceType: 'family_oral',
  },

  {
    id: 'ev-039', at: '2026-06-15T18:20:00Z', actorId: 'c-itxaso',
    kind: 'claim_affirmed',
    affirmationId: 'af-008',
    claimId: 'cl-fronton',
  },

  {
    id: 'ev-040', at: '2026-06-15T18:31:00Z', actorId: 'c-itxaso',
    kind: 'claim_affirmed',
    affirmationId: 'af-009',
    claimId: 'cl-domingo',
  },

  /* An extension that may satisfy the disputeTargets of both branches of the
     livery/blacksmith disagreement — a reconciliation candidate. */
  {
    id: 'ev-041', at: '2026-06-22T16:12:00Z', actorId: 'c-teresa',
    kind: 'claim_extended',
    claimId: 'cl-prelot-both',
    parentClaimId: 'cl-prelot',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'Both may be right. A Sanborn sheet shows a smithy on the corner of this lot and stabling behind ' +
      'it in the same year. People who remember it as a livery and people who find a blacksmith in the ' +
      'directories are describing different parts of the same yard.',
    elements: [
      { id: 'cl-prelot-both-e-use', kind: 'event', value: 'smithy and stabling coexisting', excerpt: 'a smithy on the corner of this lot and stabling behind it' },
      { id: 'cl-prelot-both-e-doc', kind: 'attribution', value: 'Sanborn fire insurance map', excerpt: 'A Sanborn sheet' },
    ],
    era: 'pre_1900',
    topics: ['prior use', 'lot history', 'documentary record'],
    sourceType: 'documentary',
  },

  {
    id: 'ev-042', at: '2026-06-22T16:20:00Z', actorId: 'c-robert',
    kind: 'claim_affirmed',
    affirmationId: 'af-010',
    claimId: 'cl-prelot-both',
  },

  {
    id: 'ev-043', at: '2026-06-22T16:44:00Z', actorId: 'c-marisol',
    kind: 'claim_affirmed',
    affirmationId: 'af-011',
    claimId: 'cl-prelot-both',
  },

  /* A contributor marks a phrase as pointing at another place. No such site
     exists in the archive yet, so the marker is left unresolved rather than
     dropped. */
  {
    id: 'ev-044', at: '2026-07-02T19:05:00Z', actorId: 'c-kepa',
    kind: 'reference_marked',
    edgeId: 'ref-001',
    fromClaimId: 'cl-fronton-floor',
    excerpt: 'men still came',
    resolved: false,
  },

  {
    id: 'ev-045', at: '2026-07-02T19:30:00Z', actorId: 'c-kepa',
    kind: 'claim_extended',
    claimId: 'cl-afterhours',
    parentClaimId: 'cl-fronton-floor',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'The men who came in the sixties were mostly walking over from the Center after supper. It was ' +
      'not a boarding house crowd by then, it was whoever wanted a game.',
    elements: [
      { id: 'cl-afterhours-e-origin', kind: 'place', value: 'the Center', excerpt: 'walking over from the Center' },
      { id: 'cl-afterhours-e-date', kind: 'date', value: '1960s', excerpt: 'The men who came in the sixties' },
    ],
    era: 'postwar_1946_1969',
    topics: ['pilota', 'community', 'recreation'],
    sourceType: 'community_oral',
  },

  {
    id: 'ev-046', at: '2026-07-02T19:33:00Z', actorId: 'c-kepa',
    kind: 'reference_marked',
    edgeId: 'ref-002',
    fromClaimId: 'cl-afterhours',
    excerpt: 'the Center',
    resolved: false,
  },

  {
    id: 'ev-047', at: '2026-07-09T14:50:00Z', actorId: 'c-teresa',
    kind: 'claim_affirmed',
    affirmationId: 'af-012',
    claimId: 'cl-afterhours',
  },

  {
    id: 'ev-048', at: '2026-07-09T15:02:00Z', actorId: 'c-joseba',
    kind: 'claim_affirmed',
    affirmationId: 'af-013',
    claimId: 'cl-afterhours',
  },

  {
    id: 'ev-049', at: '2026-07-14T20:11:00Z', actorId: 'c-itxaso',
    kind: 'passover_recorded', passoverId: 'pv-008', claimId: 'cl-register', passoverKind: 'sounds_right',
  },
  {
    id: 'ev-050', at: '2026-07-14T20:14:00Z', actorId: 'c-domingo',
    kind: 'passover_recorded', passoverId: 'pv-009', claimId: 'cl-prelot-both', passoverKind: 'dont_know',
  },
  {
    id: 'ev-051', at: '2026-07-14T20:16:00Z', actorId: 'c-marisol',
    kind: 'passover_recorded', passoverId: 'pv-010', claimId: 'cl-fronton-deadspot', passoverKind: 'sounds_right',
  },
  {
    id: 'ev-052', at: '2026-07-21T18:40:00Z', actorId: 'c-robert',
    kind: 'passover_recorded', passoverId: 'pv-011', claimId: 'cl-domingo', passoverKind: 'dont_know',
  },
];

/** The four instants states are cut at. Labels are shown in the version timeline. */
export const stateCuts = [
  { stateId: 't0', label: 'Single account, no corroboration', asOf: '2026-01-31T23:59:59Z' },
  { stateId: 't1', label: 'Family corroboration and an untranslated account', asOf: '2026-03-31T23:59:59Z' },
  { stateId: 't2', label: 'Documentary source contests a date; rendering arrives', asOf: '2026-05-31T23:59:59Z' },
  { stateId: 't3', label: 'Competing renderings, reconciliation candidate, active dispute', asOf: '2026-07-31T23:59:59Z' },
];
